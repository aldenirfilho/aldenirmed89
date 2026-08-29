# Identidade AldenirMed89 — Laranja Mecânica

## Conceito oficial

O **A arcano-orbital** reúne três trajetórias laranja-fogo em movimento. Onze
pontos de brasa formam um campo tático ao redor da marca: uma metáfora visual
para troca coordenada de funções, ocupação inteligente dos espaços e trabalho
em rede.

A referência histórica é o Futebol Total da seleção neerlandesa de 1974. A
identidade é uma homenagem conceitual autoral, sem afiliação esportiva oficial
e sem copiar escudo, uniforme, bandeira, jogadores ou marcas de terceiros.

## Regras visuais

- Fundo preto profundo.
- Monograma `A` reconhecível, formado por três faixas laranja e âmbar.
- Órbitas finas e onze pontos de brasa como elementos secundários.
- Sem bola, escudo, bandeira, uniforme ou símbolos oficiais neerlandeses.
- Sem cruz, sinal de adição, livro, ECG, coração, caduceu ou símbolo hospitalar.
- Sem texto incorporado ao símbolo quadrado.
- O `A` central precisa continuar reconhecível entre 16 e 1024 px.
- Brilhos decorativos não podem substituir contraste, foco ou texto legível.

## Fontes canônicas

- `aldenirmed89-total-orange-master.png`: mestre quadrado em 1024 × 1024 px.
- `aldenirmed89-total-orange-social-card.png`: cartão social em 1200 × 630 px.
- `aldenirmed89-total-orange-mono-light.png`: marca clara com transparência.
- `aldenirmed89-total-orange-mono-dark.png`: marca escura com transparência.

O mestre foi criado com a ferramenta integrada de geração de imagens a partir
de um briefing autoral: `A` entrelaçado, laranja-fogo, onze brasas, geometria
arcana e orbital, alto contraste e proibição explícita de símbolos médicos ou
identidades esportivas oficiais.

## Compatibilidade

Os nomes técnicos antigos continuam disponíveis para não quebrar atalhos,
instalações e páginas existentes. Eles apontam para a identidade atual:

- `antigravity-a-orbital-master.png`;
- `antigravity-a-orbital-mono-light.png`;
- `antigravity-a-orbital-mono-dark.png`;
- `aldenirmed89-social-card.png`.

O cartão social recebeu um novo nome público para reduzir o risco de redes
sociais continuarem exibindo a imagem anterior em cache.

## Regeneração

No macOS, o script abaixo deriva mestre, ícones web/PWA, Apple Touch Icons,
marcas monocromáticas e cartão social:

```bash
swift scripts_admin/build_total_orange_brand_assets.swift \
  /caminho/logo-gerado.png \
  /caminho/raiz-do-repositorio
```

O favicon e o ícone do Windows usam sete tamanhos (16–256 px) e são empacotados
pelo script `scripts_admin/build_multires_ico.py`.

Sempre avance a versão do service worker quando substituir qualquer ícone.
