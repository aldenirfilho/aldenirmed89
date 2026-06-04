import os
import json

acervo_dir = '05_Biblioteca_IA/acervo'
json_path = '05_Biblioteca_IA/data/biblioteca_catalogo.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', [])
modified = False

for root, _, files in os.walk(acervo_dir):
    for filename in files:
        if ' ' in filename:
            old_filepath = os.path.join(root, filename)
            new_filename = filename.replace(' ', '_')
            new_filepath = os.path.join(root, new_filename)
            
            # Rename physical file
            os.rename(old_filepath, new_filepath)
            print(f"Renomeado: {filename} -> {new_filename}")
            
            # Update JSON references
            for item in items:
                if item.get('filename') == filename:
                    item['filename'] = new_filename
                    item['path'] = item['path'].replace(filename, new_filename)
                    modified = True

if modified:
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("JSON atualizado!")
