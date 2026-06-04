import json
import os
import glob

# Configurações
CATALOG_PATH = '05_Biblioteca_IA/data/biblioteca_catalogo.json'
INBOX_DIR = '05_Biblioteca_IA/inbox/'

def cleanup():
    if not os.path.exists(CATALOG_PATH):
        print(f"❌ Erro: Catálogo não encontrado em {CATALOG_PATH}")
        return

    # 1. Ler arquivos referenciados no catálogo
    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    referenced_files = set()
    for item in data.get('items', []):
        # Normalizar caminhos (remover 'inbox/' prefixo se existir para comparação)
        path = item.get('path', '')
        if path.startswith('inbox/'):
            path = path[6:]
        referenced_files.add(path)

    # 2. Listar arquivos físicos no inbox
    physical_files = []
    for ext in ['*.pdf', '*.docx', '*.doc', '*.md', '*.txt']:
        files = glob.glob(os.path.join(INBOX_DIR, ext))
        physical_files.extend([os.path.basename(f) for f in files])

    # 3. Identificar órfãos (arquivos no HD mas não no Catálogo)
    orphans = [f for f in physical_files if f not in referenced_files]

    if not orphans:
        print("✅ Tudo limpo! Nenhum arquivo órfão encontrado no Inbox.")
        return

    print(f"⚠️ Encontrados {len(orphans)} arquivos no Inbox que NÃO estão catalogados:")
    for f in orphans:
        print(f"  - {f}")

    confirm = input("\n🔥 Deseja MOVER esses arquivos para uma pasta de backup (lixo)? (s/n): ")
    
    if confirm.lower() == 's':
        trash_dir = os.path.join(INBOX_DIR, '_lixo_')
        if not os.path.exists(trash_dir):
            os.makedirs(trash_dir)
        
        for f in orphans:
            src = os.path.join(INBOX_DIR, f)
            dst = os.path.join(trash_dir, f)
            os.rename(src, dst)
            print(f"  ✅ Movido: {f}")
        
        print(f"\n🚀 Concluído! Arquivos movidos para {trash_dir}")
    else:
        print("❌ Operação cancelada.")

if __name__ == "__main__":
    cleanup()
