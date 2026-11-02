# Mapa visual dos projetos 360X

Edição: 02/11/2026 — refinamento de navegação preparado para revisão.

[Abrir o mapa no AldenirMed](https://aldenirfilho.github.io/aldenirmed89/ecossistema/mapa.html).

## Como explorar

1. Entre em **Mapa 360X**, no menu da página inicial, ou em **Explorar mapa visual**, no Universo 360X.
2. Escolha uma área ou busque o nome e o assunto de um projeto.
3. Selecione um projeto para ler sua apresentação, ver afinidades e abrir o destino.
4. Use **Lista** para leitura linear, os controles de ampliação para ajustar o mapa e **Visão geral** para recomeçar.
5. O link **Catálogo** mantém o acesso às iniciativas históricas e às dez raízes do ecossistema.

O tema acompanha a preferência visual do AldenirMed. Os links diretos permanecem disponíveis na própria página quando o mapa interativo não carregar. Depois de uma instalação bem-sucedida do modo offline, a navegação local do mapa fica disponível sem conexão; a abertura de sites externos depende de internet.

## Trilhas temáticas e leitura acessível

As seis trilhas oferecem de quatro a sete etapas: **Clínica e UTI**, **Ciência e natureza**, **Vida, memória e decisões**, **Cultura e imaginação**, **Cidadania e propostas** e **Transparência e escolhas**. Cobrem todos os 35 projetos, sem obrigar ordem de estudo ou conclusão.

Use **Explorar etapas** para filtrar o mapa e abrir o percurso. Clique em uma etapa ou em **Anterior/Próximo** para continuar; **Voltar a todos os projetos** restaura o diretório completo. O link copiado de uma etapa preserva a trilha e a visualização. Cada cartão oferece também as etapas com links diretos, inclusive sem JavaScript.

**Ampliar texto** e **Alto contraste** utilizam as preferências locais compartilhadas do AldenirMed. A ampliação respeita o tamanho padrão do navegador; a lista oferece leitura ampliada equivalente ao diagrama. Preferências continuam funcionando durante a sessão quando o armazenamento está indisponível.

No mapa: **Tab** percorre os pontos; **setas** mudam de ponto; **Enter/Espaço** seleciona; **+/-** amplia; **0** enquadra tudo. Quando o fundo do mapa tem foco, as setas movem a vista. O ponto focado permanece enquadrado após ampliar.

A coleção **Sereno 360X** reúne 35 novas capas de projetos e seis de trilhas, em SVG local sem recursos externos. As coleções anteriores permanecem preservadas.

## Revisão dos links

Em 02/11/2026, os 35 endereços responderam HTTP 200 a consultas GET anônimas: 34 destinos diretos e uma ponte HTML. **Antigravity** é um endereço histórico que encaminha ao AldenirMed89. As evidências por projeto registram horário, título, URL final e hash da amostra; preservam-se as evidências anteriores.

É uma verificação pontual de disponibilidade HTTP, sem certificação funcional ou clínica. Para repetir sem alterar o catálogo: `python3 scripts_admin/audit_360x_links.py --output /tmp/links-360x.json`.

## O que as conexões significam

As linhas contínuas mostram a área do projeto. As linhas tracejadas mostram **afinidades temáticas editoriais** entre conteúdos. A apresentação de cada relação explica essa proximidade. Essas conexões não afirmam integração de sistemas, compartilhamento de dados nem parceria institucional.

O mapa utiliza os 35 destinos do diretório público desta edição. Projetos sem site público confirmado continuam acessíveis como registros no catálogo histórico. RespiraSense ICU é apresentado como documentação de um protótipo, e Life Archive como demonstração com dados sintéticos.

## Manutenção

- **Nomes, descrições e URLs:** `ecossistema/data/sites-360x.json`.
- **Áreas, rótulos e relações do mapa:** `ecossistema/data/mapa-conexoes.json`.
- **Trilhas por ID e ordem de exploração:** `ecossistema/data/trilhas-360x.json`.
- **Renderização dos cartões sem JavaScript:** `python3 scripts_admin/build_360x_trails.py` (ou `--check`).
- **Gerador das capas Sereno:** `python3 scripts_admin/generate_360x_sereno_covers.py`.
- **Catálogo histórico:** `ecossistema/data/catalog.json`.
- **Página e interface:** `ecossistema/mapa.html` e `ecossistema/assets/mapa*`.

Ao acrescentar um destino público, mantenha a lista de links HTML equivalente ao diretório e confira as relações pelos IDs existentes. Alterações públicas também passam pelo registro editorial e pelas verificações de publicação do repositório. A revisão técnica da navegação não certifica o conteúdo dos sites de destino.
