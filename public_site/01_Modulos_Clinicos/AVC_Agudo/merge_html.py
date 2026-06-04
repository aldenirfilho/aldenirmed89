import os

def merge_files(html_path, css_path, js_path, output_path):
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        with open(css_path, 'r', encoding='utf-8') as f:
            css_content = f.read()
            
        with open(js_path, 'r', encoding='utf-8') as f:
            js_content = f.read()

        # Inserir o CSS
        html_content = html_content.replace(
            '<link rel="stylesheet" href="styles.css">',
            f'<style>\n{css_content}\n</style>'
        )
        
        # Inserir o JS
        html_content = html_content.replace(
            '<script src="app.js"></script>',
            f'<script>\n{js_content}\n</script>'
        )
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        print(f"✅ Arquivo mesclado com sucesso! Salvo em: {output_path}")
    except Exception as e:
        print(f"⚠️ Erro ao mesclar arquivos: {e}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    merge_files(
        os.path.join(current_dir, "index.html"),
        os.path.join(current_dir, "styles.css"),
        os.path.join(current_dir, "app.js"),
        os.path.join(current_dir, "AVC_App_Unico.html")
    )
