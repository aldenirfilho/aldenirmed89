# Revisão técnica da Semiologia — 16/09/2026

Base: `df1d5a37cbecfda52ba18535278b55daa8ff06a1`, versão da `main` que inclui as atualizações da biblioteca e da importação privada de visitas. A revisão preserva esses trabalhos, a organização da seção e o logotipo aeroespacial original.

## Correções

- Links do atlas com `?modulo=Neurologica` ou `?modulo=Cardiovascular` agora usam a página salva quando não há conexão, mesmo sem visita prévia à combinação exata do filtro. Somente páginas estáticas conhecidas compartilham a chave de cache; versões de arquivos e rotas desconhecidas permanecem distintas.
- A navegação por `Atlas/` também faz parte do conjunto offline.
- Falhas ao gravar uma nova resposta no cache, por exemplo por falta de espaço, não impedem receber a página, imagem ou manifesto disponível pela rede. O salvamento inicial das aulas e dos áudios continua exigindo conclusão integral antes de indicar disponibilidade offline.
- O cache da seção passa de v3 para v4, sem remover os caches do portal ou do aplicativo neurológico.
- O aviso offline esclarece que guardar imagens depende de abertura com conexão e de espaço disponível.
- A documentação da seção inclui o módulo abdominal e distingue os dois atlas, os tutores guiados e as limitações das imagens.
- O teste de navegação cardiovascular acompanha o texto atual do aviso offline. O teste da importação privada compara diretórios resolvidos, evitando falha indevida entre `/var` e `/private/var` no macOS.

## Validação local

- 607 testes Python aprovados, sem testes ignorados após gerar os previews.
- Regressão reproduzida antes da correção para o atlas filtrado offline; testes cobrem consultas não visitadas, rotas desconhecidas, versões de arquivos, falta de espaço, áudio por intervalo e isolamento dos caches.
- Chrome: 30 áudios reproduzidos, 20 casos cardiovasculares, reprodução offline, exportação/importação e armazenamento bloqueado.
- Chrome: módulo abdominal em desktop e celular, temas, busca com acentos, links diretos, tutores, respostas comentadas, revisão espaçada, progresso, teclado e navegação offline. Os dois filtros do atlas abrem offline.
- Integração das 20 imagens neurológicas e das 20 cardiovasculares, sem erros JavaScript ou rolagem horizontal em 390 px.
- Ícones e manifesto aeroespaciais conferidos no artefato montado, incluindo decodificação do ícone de 512 px.
- 171 verificações de manifests, 161 rotas/fontes e 818 caminhos válidos.
- Artefato público: 1.441 arquivos, 625,3 MiB; 623 arquivos de texto verificados pelo controle editorial, sem ocorrências. A biblioteca gerou 189 previews.

## Limite da revisão

Esta é uma revisão técnica e editorial de publicação. Não equivale a homologação médica humana. Os conteúdos clínicos e as ilustrações sintéticas permanecem educativos e em revisão médica. As ressalvas de A04 (identificação de erro) e A15 (preparo e realinhamento) foram preservadas. Os quatro tutores abdominais são roteiros locais, não agentes de diagnóstico ou conversas com IA em tempo real.

## Publicação e reversão

O fluxo de publicação é PR, verificações do GitHub, integração na `main`, deploy do GitHub Pages e conferência direta dos arquivos públicos. O histórico da PR identifica os commits exatos. Uma eventual reversão deve reverter o commit desta revisão em nova PR e publicar novamente, mantendo os dados de estudo locais e as versões anteriores no Git.
