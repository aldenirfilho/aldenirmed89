#!/usr/bin/env python3
"""Gera o guia A6 a partir das fichas editoriais; requer reportlab e pypdf."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlparse
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A6
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / '01_Modulos_Clinicos/Infectologia_Critica/resistencia-antimicrobianos'
DEFAULT_DATA = MODULE / 'data/guia_bolso_2026-11-03.json'
DEFAULT_PDF = MODULE / 'documentos/Guia_Bolso_Antimicrobianos_UTI_2026-11-03_v1.pdf'
PUBLIC_MODULE = 'https://aldenirfilho.github.io/aldenirmed89/01_Modulos_Clinicos/Infectologia_Critica/resistencia-antimicrobianos/'
W, H = A6
M = 19
BODY_W = W - 2 * M
NAVY = colors.HexColor('#102c42')
MUTED = colors.HexColor('#4c6273')
PALETTE = {'Antibióticos': '#155a89', 'Antifúngicos': '#08796d', 'Antivirais': '#6a408d'}
FIELDS = [('indicacoes', 'INDICAÇÕES'), ('dose', 'DOSE / ADMINISTRAÇÃO'),
          ('renal', 'RIM / DIÁLISE'), ('interacoes', 'INTERAÇÕES'),
          ('monitorizacao', 'MONITORIZAÇÃO'), ('alerta', 'NÃO ESQUECER')]


def normal(text):
    return str(text).replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', ' - ').replace('\u202f', ' ').replace('\u00a0', ' ')


def fonts():
    pairs = [
        ('/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf'),
        ('/System/Library/Fonts/Supplemental/Arial.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'),
    ]
    import reportlab
    folder = Path(reportlab.__file__).parent / 'fonts'
    pairs.append((str(folder / 'Vera.ttf'), str(folder / 'VeraBd.ttf')))
    for regular, bold in pairs:
        if Path(regular).exists() and Path(bold).exists():
            pdfmetrics.registerFont(TTFont('Pocket', regular))
            pdfmetrics.registerFont(TTFont('PocketBold', bold))
            pdfmetrics.registerFontFamily('Pocket', normal='Pocket', bold='PocketBold', italic='Pocket', boldItalic='PocketBold')
            return
    raise RuntimeError('Fonte Unicode não localizada; instale DejaVu Sans.')


def paragraph(html, size=9.2, color=NAVY, leading=None):
    return Paragraph(html, ParagraphStyle('p', fontName='Pocket', fontSize=size,
        leading=leading or size * 1.23, textColor=color, alignment=TA_LEFT, spaceAfter=0))


def measured(html, size, width=BODY_W):
    p = paragraph(html, size)
    return p, p.wrap(width, H)[1]


def draw_text(c, html, y, size=9.2, x=M, width=BODY_W, color=NAVY):
    p = paragraph(html, size, color)
    _, height = p.wrap(width, H)
    if y - height < 34:
        raise ValueError(f'Texto excede a área A6: y={y:.1f}, altura={height:.1f}, início={html[:80]}')
    p.drawOn(c, x, y - height)
    return y - height


def source_label(source):
    title = source['titulo']
    host = urlparse(source['url']).hostname or ''
    prefix = ('UCSF' if 'ucsf' in host else 'NIH' if 'nih.gov' in host and 'dailymed' not in host
              else 'DailyMed / bula' if 'dailymed' in host else 'IDSA' if 'idsociety' in host
              else 'CDC' if 'cdc.gov' in host else title[:45])
    return prefix


def source_html(drug):
    links = []
    for source in drug['fontes']:
        label = source_label(source)
        if label in [x[0] for x in links]:
            label += ' (' + source['titulo'][:23] + ')'
        links.append((label, source['url']))
    return 'FONTES: ' + ' | '.join('<link href="' + escape(u, {'"':'&quot;'}) + '"><u>' + escape(t) + '</u></link>' for t,u in links)


def field_html(drug, key, label):
    return '<b>' + label + '</b> ' + escape(normal(drug[key]))


def card_layout(drug):
    # Nunca reduzir o texto clínico abaixo de 8,8 pt para fazê-lo caber.
    name_size = 15 if len(drug['nome']) < 45 else 13.5
    title_height = measured('<b>'+escape(normal(drug['nome']))+'</b>',name_size)[1]
    body_limit = H - 40 - title_height - 10 - 34 - 2
    for size in (9.5, 9.2, 9.0, 8.8):
        fields = [(key, label, *measured(field_html(drug, key, label), size)) for key,label in FIELDS]
        source_height = measured(source_html(drug), 7.1)[1] + 7
        needed = sum(f[3] + 6 for f in fields) + source_height
        if needed <= body_limit:
            return size, [FIELDS]
    # Fichas longas continuam em página própria; dose e unidade não são cortadas.
    chunks, current, height = [], [], 0
    for key,label in FIELDS:
        h = measured(field_html(drug, key, label), 9.2)[1] + 6
        if h > body_limit - 28:
            raise ValueError(f'Campo grande demais para A6: {drug["id"]}/{key}')
        if current and height + h > body_limit - 28:
            chunks.append(current); current=[]; height=0
        current.append((key,label)); height += h
    if current: chunks.append(current)
    return 9.2, chunks


class Guide:
    def __init__(self, output, data, plans):
        self.data, self.plans = data, plans
        self.c = canvas.Canvas(str(output), pagesize=A6, pageCompression=1, invariant=1)
        self.c.setTitle('Guia de bolso - antimicrobianos adultos na UTI - AldenirMed89 - 03/11/2026')
        self.c.setAuthor('AldenirMed89 - síntese educacional com revisão médica pendente')
        self.c.setSubject('Indicações, doses, função renal, interações e monitorização; uso adulto educacional.')
        self.page=0
        self.drug_pages={}
        # 6 páginas iniciais: capa, uso, rim, segurança e dois índices.
        n=7
        for drug in data['farmacos']:
            self.drug_pages[drug['id']]=n
            n += len(plans[drug['id']][1])
        self.total=n  # inclui uma página final de fontes/limites

    def start(self, title, group='Guia de bolso', bookmark=None):
        self.page += 1
        c=self.c
        c.setFillColor(colors.white); c.rect(0,0,W,H,fill=1,stroke=0)
        accent=colors.HexColor(PALETTE.get(group, '#155a89'))
        c.setFillColor(accent); c.rect(0,H-27,W,27,fill=1,stroke=0)
        c.setFont('PocketBold',8); c.setFillColor(colors.white)
        c.drawString(M,H-16,'ALDENIRMED89  |  '+group.upper())
        c.setFont('Pocket',6.6);c.setFillColor(MUTED)
        c.drawString(M,20,'Educacional. Revisão médica humana pendente.')
        c.drawString(M,10,'v1.0 | 03/11/2026')
        c.drawRightString(W-M,10,f'{self.page}/{self.total}')
        if self.page>1:
            c.linkRect('', 'indice_ab', (W-86,18,W-M,28), relative=0, thickness=0)
            c.setFont('Pocket',6.6); c.drawRightString(W-M,20,'Voltar ao índice')
        c.setStrokeColor(colors.HexColor('#d1dde5'));c.line(M,31,W-M,31)
        if bookmark:
            c.bookmarkPage(bookmark)
            c.addOutlineEntry(title,bookmark,level=0,closed=False)
        return H-40

    def finish(self):
        self.c.showPage()

    def title(self, text,y,size=17):
        return draw_text(self.c,'<b>'+escape(normal(text))+'</b>',y,size)-10

    def intro(self):
        c=self.c
        y=self.start('Antimicrobianos na UTI',bookmark='capa')
        y=draw_text(c,'GUIA DE BOLSO',y,9.5,color=MUTED)-15
        y=self.title('Antimicrobianos\nna UTI'.replace('\n',' '),y,23)
        y=draw_text(c,'<b>ANTIBIÓTICOS • ANTIFÚNGICOS<br/>ANTIVIRAIS</b>',y,10.5)-12
        count=len(self.data['farmacos'])
        y=draw_text(c,f'<b>{count} fichas para adultos</b><br/>Indicação • dose • rim • interações • monitorização',y,10)-16
        y=draw_text(c,'<b>PRÉVIA EDUCACIONAL</b><br/>Revisão médica humana formal pendente. Conferência documental de fontes em 03/11/2026.',y,9.5)-13
        y=draw_text(c,'Ferramenta educacional/de apoio à decisão. Não substitui o julgamento clínico, os protocolos institucionais ou a avaliação médica individual.',y,9.5)-10
        y=draw_text(c,'Formato A6 (105 × 148 mm). Índice clicável e marcadores. Fichas longas têm continuação identificada. Sem preços ou dados de pacientes.',y,9.2)-10
        draw_text(c,'<link href="'+PUBLIC_MODULE+'"><u>Abrir catálogo e atualizações no AldenirMed89</u></link>',y,8.5)
        self.finish()

        y=self.start('Antes de usar',bookmark='uso');y=self.title('Checagem em 30 segundos',y)
        items=[
            ('1. Contexto', 'Adultos. Confirmar infecção, foco, gravidade, alergias, culturas, resistência e possibilidade de controle do foco. A indicação vem antes da dose.'),
            ('2. Dose e apresentação', 'Dose basal pressupõe função renal preservada, salvo indicação expressa. Verificar via, diluição, velocidade, peso de cálculo e componentes de associações.'),
            ('3. Rim e suporte', 'As tabelas de função renal estável não equivalem a dose na lesão renal aguda, HD, diálise prolongada, CRRT ou ECMO. Identificar a modalidade antes de aplicar a ficha.'),
            ('4. Ataque e reavaliação', 'Evitar atrasar tratamento urgente. Ataque e manutenção têm objetivos diferentes; não reduzir automaticamente a dose inicial apenas por uma creatinina isolada. Reavaliar indicação, resposta, foco, culturas, dose e toxicidade diariamente.'),
        ]
        for label,body in items:
            y=draw_text(c,'<b>'+label+'</b><br/>'+body,y,9.6)-12
        draw_text(c,'<b>Limite:</b> o guia não define tratamento empírico universal, duração de todas as síndromes ou dose em pediatria, gestação, obesidade extrema e suporte extracorpóreo complexo.',y,9.2)
        self.finish()

        y=self.start('Função renal',bookmark='rim');y=self.title('A variável certa importa',y)
        blocks=[
            ('ClCr não é eGFR', 'A ficha identifica a variável do ajuste. ClCr usualmente se refere à estimativa Cockcroft-Gault (mL/min). Algumas bulas usam eGFR indexada a 1,73 m²; não trocar métodos sem conferir a referência.'),
            ('Creatinina instável', 'Na lesão renal aguda ou recuperação, estimativas podem atrasar a função real. Considerar diurese, tendência, depuração medida quando viável e níveis séricos. Recalcular após mudanças de suporte.'),
            ('HD intermitente', 'Confirmar alto/baixo fluxo, calendário, última/próxima sessão e dose após a sessão. Não aplicar o intervalo pós-HD a dias ou modalidades diferentes sem conferir.'),
            ('CRRT', 'Registrar modalidade, efluente em mL/kg/h ou L/h, interrupções, função residual e filtro. Os exemplos UCSF pressupõem CVVHD cerca de 2 L/h e TFG residual <10 mL/min; não são esquema universal.'),
        ]
        for label,body in blocks:y=draw_text(c,'<b>'+label+'</b><br/>'+body,y,9.35)-11
        draw_text(c,'<b>Foscarnet:</b> o nomograma usa mL/min/kg, e não mL/min. <b>TDM</b> = monitorização de níveis séricos; individualizar com farmácia clínica/infectologia.',y,9.2)
        self.finish()

        y=self.start('Segurança',bookmark='seguranca');y=self.title('Erros que mudam desfecho',y)
        blocks=[
            ('Confundir componentes', 'Doses de associações podem representar a soma ou um componente. Na ampicilina-sulbactam, distinguir gramas totais e gramas de sulbactam. TMP-SMX é calculado pelo TMP.'),
            ('Usar uma formulação pela outra', 'Anfotericina B lipossomal e desoxicolato não são intercambiáveis mg a mg. Posaconazol suspensão, comprimido de liberação retardada e IV têm esquemas distintos.'),
            ('Perder toxicidade precoce', 'Rim/diurese; K e Mg; hemograma; enzimas hepáticas; QTc quando pertinente. Nova confusão, mioclonia ou convulsão exigem pensar em neurotoxicidade e acúmulo.'),
            ('Tratar colonização ou vírus sem indicação', 'Antimicrobiano exige contexto clínico. Culturas e PCR devem ser interpretadas com sítio e síndrome. Profilaxia e tratamento de infecção ativa não são a mesma dose.'),
        ]
        for label,body in blocks:y=draw_text(c,'<b>'+label+'</b><br/>'+body,y,9.4)-12
        draw_text(c,'<b>Vancomicina:</b> AUC24/MIC 400-600 é alvo para infecção invasiva por MRSA, assumindo MIC de 1 mg/L; não transformar vale 15-20 isolado em alvo universal.',y,9.2)
        self.finish()

    def index(self, groups, bookmark, title):
        y=self.start(title,bookmark=bookmark);y=self.title(title,y,18)
        for group in groups:
            y=draw_text(self.c,'<b>'+group.upper()+'</b>',y,9.2,color=colors.HexColor(PALETTE[group]))-6
            for drug in self.data['farmacos']:
                if drug['grupo']!=group:continue
                name=escape(drug['nome']);p=self.drug_pages[drug['id']]
                html=f'<link href="#{drug["id"]}">{name}</link>'
                item=paragraph(html,9.0);_,height=item.wrap(BODY_W-24,H)
                item.drawOn(self.c,M,y-height)
                self.c.setFont('PocketBold',9);self.c.setFillColor(NAVY)
                self.c.drawRightString(W-M,y-9,str(p))
                y-=max(10.7,height)+0.5
            y-=10
        assert y>33,('Índice excede A6',y)
        self.finish()

    def card(self,drug):
        size,chunks=self.plans[drug['id']]
        for i,fields in enumerate(chunks):
            bookmark=drug['id'] if i==0 else None
            y=self.start(drug['nome'],drug['grupo'],bookmark)
            name=drug['nome'] + (f' - continuação {i+1}/{len(chunks)}' if i else '')
            y=self.title(name,y,15 if len(name)<45 else 13.5)
            if len(chunks)>1 and i==0:
                y=draw_text(self.c,f'<b>Ficha em {len(chunks)} páginas. Continue antes de aplicar.</b>',y,8.3,color=MUTED)-7
            for key,label in fields:
                y=draw_text(self.c,field_html(drug,key,label),y,size)-6
                if y<34:raise ValueError(f'Texto ultrapassou a página: {drug["nome"]}/{key}/{y}')
            if i==len(chunks)-1:
                y-=1
                y=draw_text(self.c,source_html(drug),y,7.1,color=MUTED)
                if y<34:raise ValueError(f'Fontes ultrapassaram a página: {drug["nome"]}/{y}')
            self.finish()

    def end(self):
        y=self.start('Fontes e limites',bookmark='fontes');y=self.title('Rastreabilidade e atualização',y)
        y=draw_text(self.c,'Cada ficha contém links para a diretriz, protocolo institucional ou bula que a fundamenta. Consultas documentais: 03/11/2026. O ano de uma diretriz é diferente da data de consulta.',y,9.3)-12
        main=[
            ('IDSA AMR 2026','https://www.idsociety.org/practice-guideline/amr-guidance/','Resistência Gram-negativa; conferir mecanismo, susceptibilidade e limites de indicação.'),
            ('UCSF IDMP','https://idmp.ucsf.edu/adult-antimicrobial-dosing-non-dialysis','Dose adulta e função renal. Protocolo institucional; não é norma universal.'),
            ('UCSF diálise','https://idmp.ucsf.edu/antimicrobial-dosing-intermittent-continuous-hemodialysis','HD e CVVHD: respeitar parâmetros e função residual.'),
            ('NIH - infecções oportunistas','https://clinicalinfo.hiv.gov/en/guidelines','Tabelas renais e infecções oportunistas; populações específicas.'),
            ('DailyMed / FDA','https://dailymed.nlm.nih.gov/','Bulas por fármaco: método renal, componentes, infusão e interações.'),
        ]
        for title,url,body in main:
            y=draw_text(self.c,f'<b><link href="{url}"><u>{title}</u></link></b> - {body}',y,9.0)-9
        y=draw_text(self.c,'<b>Conferência assistida por IA não equivale a revisão clínica humana.</b> O guia permanece em revisão médica. Bulas brasileiras, registro, disponibilidade, estabilidade e protocolos do serviço devem ser conferidos antes da aplicação.',y,9.2)-12
        y=draw_text(self.c,'<link href="'+PUBLIC_MODULE+'data/guia_bolso_2026-11-03.json"><u>Dados editáveis, referências específicas e notas desta edição</u></link>',y,9.0)
        self.finish()
        assert self.page==self.total,(self.page,self.total)
        self.c.save()


def build(data_path, output):
    fonts()
    data=json.loads(data_path.read_text())
    drugs=data['farmacos']
    assert len(drugs)==40,len(drugs)
    assert len({d['id'] for d in drugs})==len(drugs)
    assert all(all(d.get(k) for k in ['id','nome','grupo','fontes']+[k for k,_ in FIELDS]) for d in drugs)
    assert all(s['url'].startswith('https://') for d in drugs for s in d['fontes'])
    plans={d['id']:card_layout(d) for d in drugs}
    output.parent.mkdir(parents=True,exist_ok=True)
    guide=Guide(output,data,plans)
    guide.intro()
    guide.index(['Antibióticos'],'indice_ab','Índice - antibióticos')
    guide.index(['Antifúngicos','Antivirais'],'indice_af_av','Índice - fungos e vírus')
    for drug in drugs:guide.card(drug)
    guide.end()
    from pypdf import PdfReader
    pdf=PdfReader(str(output))
    assert len(pdf.pages)==guide.total
    digest=hashlib.sha256(output.read_bytes()).hexdigest()
    manifest={'schemaVersion':'antimicrobial-pocket-download-v1','title':'Guia de bolso - antimicrobianos adultos na UTI',
        'version':'1.0','editionDate':'2026-11-03','clinicalReviewStatus':'pending',
        'href':'documentos/'+output.name,'data':'data/'+data_path.name,'format':'PDF A6','pages':len(pdf.pages),
        'drugs':len(drugs),'bytes':output.stat().st_size,'sha256':digest,
        'minimumClinicalFontPt':8.8,'clinicalSafetyNotice':'Ferramenta educacional/de apoio à decisão. Não substitui o julgamento clínico, os protocolos institucionais ou a avaliação médica individual.'}
    (MODULE/'data/guia_bolso_download.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({**manifest,'longCards':{k:len(v[1]) for k,v in plans.items() if len(v[1])>1}},ensure_ascii=False))


if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--data',type=Path,default=DEFAULT_DATA)
    ap.add_argument('--output',type=Path,default=DEFAULT_PDF)
    args=ap.parse_args()
    build(args.data,args.output)
