# Identidade AldenirMed89 — Aeroespacial principal

## Padrão atual

O tema principal voltou a ser uma central de missão aeroespacial: azul profundo,
ciano orbital e âmbar de prioridade. A entrada usa a decolagem de 10 segundos
com áudio local opcional, botão para pular, replay e redução de movimento.

Ativos restaurados do histórico autoral da própria plataforma, sem sobrescrever
os aliases atuais:

- `aldenirmed89-aerospace-launch-card.png`: quadro de decolagem em 1200 × 630 px;
- `aldenirmed89-aerospace-orbital-master.png`: A Orbital em 1024 × 1024 px;
- `../icons/aldenirmed89-aerospace-orbital-192.png`: emblema de replay em 192 × 192 px.

Os modos Bruxa Rústica Moderna e Laranja Mecânica permanecem selecionáveis.
O tema é apenas uma camada visual e não modifica conteúdo clínico.

## Conceito alternativo — Laranja Mecânica

### Detalhes do conceito

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
instalações e páginas existentes. Eles continuam apontando para a identidade
alternativa Laranja Mecânica, preservada por compatibilidade:

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
