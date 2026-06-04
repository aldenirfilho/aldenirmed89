import os
import json
import datetime

# Configurações de Caminhos
BASE_DIR = os.getcwd()
ACERVO_DIR = os.path.join(BASE_DIR, "05_Biblioteca_IA", "acervo")
CATALOGO_PATH = os.path.join(BASE_DIR, "05_Biblioteca_IA", "data", "biblioteca_catalogo.json")

# Mapeamento de Pastas para Temas (Taxonomia Oficial)
THEME_MAP = {
    "vm-sdra": "vm-sdra",
    "neuro-uti": "neuro-uti",
    "cardio-hemodinamica": "cardio-hemodinamica",
    "sepse-choque": "sepse-choque",
    "nefro-aki-trs": "nefro-aki-trs",
    "pocus-usg": "pocus-usg",
    "temi-prova": "temi-prova",
    "gestao-ia-produtividade": "gestao-ia-produtividade",
    "protocolos-institucionais": "protocolos-institucionais",
    "artigos-cientificos": "artigos-cientificos",
    "procedimentos-dispositivos": "procedimentos-dispositivos",
    "uti-geral": "uti-geral",
    "infectologia": "infectologia",
    "endocrino-metabolico": "endocrino-metabolico",
    "disturbios-eletroliticos": "disturbios-eletroliticos",
    "gastro-hepatologia": "gastro-hepatologia",
    "reumatologia": "reumatologia",
    "hematologia": "hematologia",
    "emergencias-clinicas": "emergencias-clinicas",
    "farmaco-doses": "farmaco-doses",
    "morte-cerebral-doacao": "morte-cerebral-doacao",
    "sedacao-analgesia": "sedacao-analgesia",
    "psiquiatria": "psiquiatria",
    "clinica-medica": "clinica-medica",
    "juridico-financeiro": "juridico-financeiro",
    "familia-paciente": "familia-paciente"
}

def get_tipo(filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext == '.pdf': return 'pdf'
    if ext in ['.doc', '.docx']: return 'word'
    if ext == '.md': return 'text'
    if ext in ['.xls', '.xlsx', '.csv', '.tsv']: return 'data'
    return 'file'

def clean_id(filename):
    return os.path.splitext(filename)[0].lower().replace(' ', '-').replace('_', '-')

def run_faxina():
    # Carregar catálogo atual para preservar metadados
    old_items = {}
    if os.path.exists(CATALOGO_PATH):
        try:
            with open(CATALOGO_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for item in data.get('items', []):
                    old_items[item['filename']] = item
        except:
            pass

    new_items = []
    stats = {}

    # Escanear pastas do acervo
    if os.path.exists(ACERVO_DIR):
        for folder in os.listdir(ACERVO_DIR):
            folder_path = os.path.join(ACERVO_DIR, folder)
            if not os.path.isdir(folder_path): continue
            
            theme = THEME_MAP.get(folder, folder)
            stats[theme] = 0
            
            for filename in os.listdir(folder_path):
                if filename.startswith('.'): continue
                
                stats[theme] += 1
                file_path = os.path.join("acervo", folder, filename)
                
                # Tentar recuperar dados antigos
                old = old_items.get(filename, {})
                
                item = {
                    "id": old.get("id") or clean_id(filename),
                    "title": old.get("title") or filename.replace('_', ' ').replace('.pdf','').replace('.docx','').replace('.md',''),
                    "filename": filename,
                    "theme": theme,
                    "tipo": get_tipo(filename),
                    "tags": old.get("tags") or [theme, "automático"],
                    "status": "catalogado",
                    "path": file_path,
                    "resumo": old.get("resumo") or f"Documento sobre {theme} catalogado automaticamente.",
                    "ia_origem": old.get("ia_origem") or "Antigravity",
                    "data": old.get("data") or "2026-05",
                    "createdAt": old.get("createdAt") or datetime.datetime.now().isoformat() + "Z"
                }
                new_items.append(item)

    # Adicionar o que sobrou no inbox como "revisar"
    inbox_dir = os.path.join(BASE_DIR, "05_Biblioteca_IA", "inbox")
    if os.path.exists(inbox_dir):
        stats["inbox-revisar"] = 0
        for filename in os.listdir(inbox_dir):
            if filename.startswith('.') or filename == "README.md": continue
            stats["inbox-revisar"] += 1
            item = {
                "id": clean_id(filename),
                "title": filename,
                "filename": filename,
                "theme": "inbox-revisar",
                "tipo": get_tipo(filename),
                "tags": ["revisar"],
                "status": "pendente",
                "path": os.path.join("inbox", filename),
                "resumo": "Aguardando classificação manual.",
                "ia_origem": "Sistema",
                "data": "2026-05",
                "createdAt": datetime.datetime.now().isoformat() + "Z"
            }
            new_items.append(item)

    # Montar novo JSON
    manifest = {
        "updatedAt": datetime.date.today().isoformat(),
        "project": "Biblioteca IA — Enciclopédia Médica Intensiva",
        "totalFiles": len(new_items),
        "stats": stats,
        "items": sorted(new_items, key=lambda x: x['theme'])
    }

    with open(CATALOGO_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"✅ Faxina concluída! {len(new_items)} arquivos catalogados.")

if __name__ == "__main__":
    run_faxina()
