# Identidade AldenirMed89 — A Orbital

## Conceito oficial

Um **A em ascensão** atravessa sua própria órbita: conhecimento clínico
convertido em missão. O ponto âmbar representa o próximo objetivo e reforça a
orientação por foco.

## Regras visuais

- Fundo azul-marinho profundo.
- Monograma `A` branco, formado por duas asas delta ascendentes.
- Uma órbita ciano aberta e um único nó circular âmbar.
- Sem cruz, sinal de adição, livro, ECG, coração, caduceu ou símbolo hospitalar.
- Sem texto incorporado ao símbolo.
- A silhueta precisa permanecer reconhecível entre 16 e 1024 px.

## Fonte canônica

`antigravity-a-orbital-master.png` é o mestre PNG de 1024 × 1024 px. Os
favicons, ícones PWA, Apple Touch Icons e o ícone Windows devem sempre ser
derivados desse arquivo.

O arquivo foi gerado com a ferramenta integrada de criação de imagens a partir
de um prompt de marca aeroespacial minimalista: monograma A/delta, órbita ciano
aberta, nó âmbar, fundo navy, alto contraste e proibição explícita de símbolos
médicos.

## Variações disponíveis

- `antigravity-a-orbital-mono-light.png`: símbolo branco com transparência para
  fundos escuros, impressão invertida e gravação.
- `antigravity-a-orbital-mono-dark.png`: símbolo navy com transparência para
  fundos claros, documentos e materiais monocromáticos.
- `aldenirmed89-social-card.png`: cartão oficial de compartilhamento em
  1200 × 630 px, com selo cósmico autoral, órbitas, pulso clínico e o título
  “ALDENIRMED89 — Medicina Intensiva · Plantão · TEMI”.
- `antigravity-social-card.png`: cartão legado preservado apenas para histórico
  e compatibilidade; não é mais usado nos metadados públicos.

As versões monocromáticas mantêm o `A`, a órbita e o nó como uma única
silhueta. Não introduzir cores extras, contornos médicos ou fundos incorporados.
O script `scripts_admin/build_orbital_brand_assets.swift` regenera as duas
versões monocromáticas e normaliza o cartão social legado para 1200 × 630 px.
O cartão AldenirMed89 é um ativo autoral independente e não deve ser
sobrescrito pelo gerador legado.

## Compatibilidade

Os nomes públicos antigos são preservados para não quebrar atalhos e instalações
existentes. O service worker precisa avançar de versão sempre que os ícones
forem substituídos.
