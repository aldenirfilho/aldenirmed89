#!/usr/bin/env python3
"""Gera quatro tabelas A4 paisagem sem substituir o guia completo A6."""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Table, TableStyle
from build_antimicrobial_pocket import fonts, normal

ROOT=Path(__file__).resolve().parents[1]
MODULE=ROOT/'01_Modulos_Clinicos/Infectologia_Critica/resistencia-antimicrobianos'
DATA=MODULE/'data/resumo_tabelas_2026-11-03.json'
OUTPUT=MODULE/'documentos/Resumo_Antimicrobianos_UTI_Tabelas_2026-11-03_v1.pdf'
PUBLIC='https://aldenirfilho.github.io/aldenirmed89/01_Modulos_Clinicos/Infectologia_Critica/resistencia-antimicrobianos/'
COMPLETE=PUBLIC+'documentos/Guia_Bolso_Antimicrobianos_UTI_2026-11-03_v1.pdf'
W,H=landscape(A4)
M=22
WIDTH=W-2*M
NAVY=colors.HexColor('#102c42')
MUTED=colors.HexColor('#405b6e')
COLORS={'Antibióticos':'#155a89','Antifúngicos':'#08796d','Antivirais':'#6a408d'}


def para(text,size=10,color=NAVY,bold=False):
    return Paragraph(text,ParagraphStyle('p',fontName='PocketBold' if bold else 'Pocket',fontSize=size,leading=size*1.2,textColor=color,spaceAfter=0))


def text(c,html,x,y,width,size=10,color=NAVY,bold=False):
    p=para(html,size,color,bold);_,h=p.wrap(width,H);p.drawOn(c,x,y-h);return y-h


def esc(value):return escape(normal(value))


def source_links(record):
    return 'Fontes: '+' '.join(f'<link href="{escape(s["url"], {chr(34):"&quot;"})}"><u>[{i+1}]</u></link>' for i,s in enumerate(record['fontes']))


def make_table(section,by_id,size):
    head=[para('MEDICAMENTO / FONTES',10,colors.white,True),
          para('DOSE ADULTA DE REFERÊNCIA',10,colors.white,True),
          para('AJUSTE RENAL / PONTO DE ATENÇÃO',10,colors.white,True)]
    rows=[head]
    for key in section['ids']:
        item=by_id[key]
        name=[para(esc(item['nome']),size,NAVY,True),para(source_links(item),8.2,MUTED)]
        renal=esc(item['renal'])+' <b>Atenção:</b> '+esc(item['alerta'])
        rows.append([name,para(esc(item['dose']),size),para(renal,size)])
    table=Table(rows,colWidths=[164,235,WIDTH-399],hAlign='LEFT')
    accent=colors.HexColor(COLORS[section['grupo']])
    table.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),accent),('VALIGN',(0,0),(-1,-1),'TOP'),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f0f5f8')]),
        ('BOX',(0,0),(-1,-1),.6,colors.HexColor('#adbfcc')),
        ('LINEBELOW',(0,0),(-1,0),.7,accent),
        ('INNERGRID',(0,1),(-1,-1),.35,colors.HexColor('#c4d2dc')),
        ('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),
        ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
    ]))
    return table


def build(data_path,output):
    fonts();data=json.loads(data_path.read_text());records=data['farmacos']
    assert len(records)==26 and len(data['secoes'])==4
    by_id={r['id']:r for r in records};assert len(by_id)==26
    assert [len(s['ids']) for s in data['secoes']]==[8,8,6,4]
    assert sorted(key for s in data['secoes'] for key in s['ids'])==sorted(by_id)
    output.parent.mkdir(parents=True,exist_ok=True)
    c=canvas.Canvas(str(output),pagesize=(W,H),pageCompression=1,invariant=1)
    c.setTitle('Resumo em tabelas - antimicrobianos adultos na UTI - AldenirMed89 - 03/11/2026')
    c.setAuthor('AldenirMed89 - síntese educacional com revisão médica pendente')
    c.setSubject('Quatro tabelas de doses e função renal; complemento do guia A6 de 47 páginas.')
    used=[]
    for index,section in enumerate(data['secoes'],1):
        accent=colors.HexColor(COLORS[section['grupo']])
        c.setFillColor(colors.white);c.rect(0,0,W,H,fill=1,stroke=0)
        c.setFillColor(accent);c.rect(0,H-25,W,25,fill=1,stroke=0)
        c.setFillColor(colors.white);c.setFont('PocketBold',9)
        c.drawString(M,H-16,'ALDENIRMED89 | RESUMO PARA O PLANTÃO')
        c.setFont('Pocket',8.5);c.drawRightString(W-M,H-16,'Adultos | v1.0 | 03/11/2026')
        c.bookmarkPage(section['id']);c.addOutlineEntry(section['titulo'],section['id'],0)
        text(c,esc(section['titulo']),M,H-35,WIDTH,15,NAVY,True)
        text(c,'Doses basais com função renal preservada, salvo indicação expressa. A indicação, a via e o esquema-base definem o ajuste.',M,H-57,WIDTH,9.2,MUTED)
        c.setFillColor(colors.HexColor('#fff2d7'));c.roundRect(M,H-84,WIDTH,16,3,fill=1,stroke=0)
        text(c,'<b>Prévia educacional • revisão médica humana pendente.</b> Não usar tabelas de DRC como dose automática em HD, CRRT ou lesão renal aguda.',M+6,H-70,WIDTH-12,8.8,colors.HexColor('#62420c'))
        top=H-94
        bottom=65
        table=None
        for size in [11.0,10.5,10.0,9.5,9.2]:
            candidate=make_table(section,by_id,size)
            _,height=candidate.wrap(WIDTH,H)
            if height<=top-bottom:
                table=candidate;used.append(size);break
        if table is None:raise ValueError('Tabela excede quatro páginas com fonte clínica legível: '+section['id'])
        table.drawOn(c,M,top-height)
        c.setStrokeColor(colors.HexColor('#c4d2dc'));c.line(M,54,W-M,54)
        text(c,'ClCr em mL/min, salvo unidade indicada na linha. Dose em mg/kg: conferir peso de cálculo/obesidade. TDM = níveis séricos; AUC = exposição em 24 h.',M,49,WIDTH,8.0,MUTED)
        text(c,'Ferramenta educacional/de apoio à decisão. Não substitui o julgamento clínico, os protocolos institucionais ou a avaliação médica individual.',M,36,WIDTH,8.0,MUTED)
        text(c,f'<link href="{COMPLETE}"><u>Guia completo: indicações, interações e monitorização (47 p)</u></link>  |  <link href="{PUBLIC}"><u>Catálogo</u></link>  |  <link href="{PUBLIC}data/resumo_tabelas_2026-11-03.json"><u>Fontes editáveis</u></link>  |  Conferência: 03/11/2026',M,22,WIDTH-75,8.0,MUTED)
        c.setFont('PocketBold',8.5);c.setFillColor(accent);c.drawRightString(W-M,12,f'{index}/4')
        c.showPage()
    c.save()
    from pypdf import PdfReader
    assert len(PdfReader(str(output)).pages)==4
    original=MODULE/'data/guia_bolso_2026-11-03.json'
    meta={'schemaVersion':'antimicrobial-shift-tables-download-v1','title':'Resumo em tabelas - antimicrobianos adultos na UTI','version':'1.0','editionDate':'2026-11-03','format':'PDF A4 paisagem','pages':4,'drugs':26,'groupCounts':{'Antibióticos':16,'Antifúngicos':6,'Antivirais':4},'href':'documentos/'+output.name,'data':'data/'+data_path.name,'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'minimumClinicalFontPt':min(used),'clinicalReviewStatus':'pending','sourceData':'data/'+original.name,'sourceDataSha256':hashlib.sha256(original.read_bytes()).hexdigest()}
    (MODULE/'data/resumo_tabelas_download.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({**meta,'pageFonts':used},ensure_ascii=False))


if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--data',type=Path,default=DATA);ap.add_argument('--output',type=Path,default=OUTPUT)
    args=ap.parse_args();build(args.data,args.output)
