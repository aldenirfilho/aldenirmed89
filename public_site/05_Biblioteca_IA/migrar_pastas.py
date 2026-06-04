import os
import shutil

BASE_DIR = os.getcwd()
ACERVO_DIR = os.path.join(BASE_DIR, "05_Biblioteca_IA", "acervo")

# Mapeamento: Pasta Antiga -> Pasta Oficial (Taxonomia)
MIGRATION_MAP = {
    "ventilacao": "vm-sdra",
    "neuro": "neuro-uti",
    "cardio": "cardio-hemodinamica",
    "sepse_choque": "sepse-choque",
    "nefro": "nefro-aki-trs",
    "pocus": "pocus-usg",
    "temi_estudos": "temi-prova",
    "gestao_pessoal": "gestao-ia-produtividade",
    "procedimentos_especiais": "procedimentos-dispositivos",
    "artigos_cientificos": "artigos-cientificos",
    "protocolos_institucionais": "protocolos-institucionais"
}

def migrate():
    print("🚀 Iniciando migração segura de pastas...")
    
    for old_name, new_id in MIGRATION_MAP.items():
        old_path = os.path.join(ACERVO_DIR, old_name)
        new_path = os.path.join(ACERVO_DIR, new_id)
        
        if not os.path.exists(old_path):
            print(f"⏩ Pulando {old_name} (não existe)")
            continue
            
        # Garantir que a pasta nova exista
        if not os.path.exists(new_path):
            os.makedirs(new_path)
            print(f"📁 Criada pasta oficial: {new_id}")
            
        # Mover arquivos
        files = os.listdir(old_path)
        for f in files:
            src = os.path.join(old_path, f)
            dst = os.path.join(new_path, f)
            
            if os.path.isfile(src):
                # Se o destino já existe, não sobrescreve a menos que seja necessário
                if os.path.exists(dst):
                    print(f"⚠️ Conflito: {f} já existe em {new_id}. Pulando.")
                else:
                    shutil.move(src, dst)
                    print(f"✅ Movido: {f} -> {new_id}")
        
        # Tentar remover a pasta antiga se estiver vazia
        try:
            if not os.listdir(old_path):
                os.rmdir(old_path)
                print(f"🗑️ Removida pasta antiga (vazia): {old_name}")
            else:
                print(f"⚠️ Pasta {old_name} não está vazia. Não removida.")
        except Exception as e:
            print(f"❌ Erro ao remover {old_name}: {e}")

if __name__ == "__main__":
    migrate()
