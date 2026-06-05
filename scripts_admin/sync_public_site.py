#!/usr/bin/env python3
import os
import shutil
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_SITE = os.path.join(ROOT_DIR, "public_site")

# Pastas e arquivos principais para sincronizar
SYNC_TARGETS = [
    "assets",
    "css",
    "data",
    "imagens",
    "js",
    "01_Modulos_Clinicos",
    "02_Banco_Questoes_TEMI",
    "03_Calculadoras_UTI",
    "04_Ebooks_Intensiva_Clinica",
    "05_Biblioteca_IA",
    "06_Card_Feed_Medico",
    "07_Estudos_Markdown",
    "07_Questoes_Comentadas",
    "08_Transcricoes",
    "09_POCUS_Hub",
    "10_DESAFIOS",
    "11_MNEMONICOS",
    "admin",
    "desafios",
    "les-autoanticorpos",
    "questoes",
    "index.html",
    "logo_concept_3_book_1778036997285.png",
    "ANTIGRAVITY_AUDIT_MAP.md"
]

def sync_all():
    print("🚀 Iniciando sincronização para public_site/...")
    
    # Criar diretório public_site se não existir
    os.makedirs(PUBLIC_SITE, exist_ok=True)
    
    for item in SYNC_TARGETS:
        src = os.path.join(ROOT_DIR, item)
        dst = os.path.join(PUBLIC_SITE, item)
        
        if not os.path.exists(src):
            print(f"⚠️ Aviso: {item} não encontrado na raiz.")
            continue
            
        print(f"Sincronizando: {item} -> public_site/")
        
        try:
            if os.path.isdir(src):
                # Se for diretório, copiar árvore
                shutil.copytree(src, dst, dirs_exist_ok=True)
            else:
                # Se for arquivo, copiar direto
                shutil.copy2(src, dst)
        except Exception as e:
            print(f"❌ Erro ao sincronizar {item}: {e}")

    # Adicionar carimbo de tempo para auditoria
    stamp_path = os.path.join(PUBLIC_SITE, "_last_sync.txt")
    with open(stamp_path, "w") as f:
        f.write(f"Última sincronização local: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    print("\n✅ Sincronização concluída com sucesso! 🛡️")

if __name__ == "__main__":
    sync_all()
