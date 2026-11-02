# Catálogo de músicas

O catálogo tem dois tipos explícitos de entrada:

- **1.462 partituras abertas:** OpenScore Lieder, CC0. O botão Adicionar baixa o MXL e o armazena na biblioteca. São arranjos de voz/piano; não há garantia de trilha de baixo.
- **40 referências musicais:** pop, punk, mexicana, rock, latina e funk/soul, incluindo lançamentos recentes e clássicos desses estilos. Não contêm transcrições nem áudio no manifesto. **Buscar e baixar** consulta Guitar Pro Tabs no servidor, procura correspondência de título/artista e baixa um arquivo Guitar Pro compatível. A operação ocorre dentro do app e salva o arquivo na biblioteca local, associado à música. A fonte pode não ter arquivos para todos os títulos. Quando nenhuma partitura é encontrada, o catálogo informa o problema e permite tentar novamente.

O download automático valida o arquivo com o parser do alphaTab antes de adicioná-lo. Arquivos vazios, inválidos ou formatos incompatíveis são rejeitados. O conteúdo e o título exibidos na partitura continuam sendo os do arquivo baixado; título/artista do catálogo identificam o item da biblioteca.

## Download automático

O endpoint `GET /api/catalog/:id/score` aceita IDs conhecidos do catálogo moderno. O servidor consulta a fonte, verifica título/artista, limita tamanho e tempo de download e valida o arquivo com alphaTab. Entre as versões compatíveis, prioriza uma com instrumento MIDI de baixo. Caso o arquivo não tenha baixo identificado, o app abre a primeira trilha e avisa.

A seleção da trilha de baixo é salva junto do arquivo e restaurada ao reabrir pela biblioteca. O app só confirma o salvamento depois da conclusão da transação do IndexedDB. Reabrir uma partitura já salva não faz outro download.

O plugin em `server/catalog-plugin.ts` instala o endpoint em `bun run dev` e `bun run preview`. Uma hospedagem apenas da pasta `dist` precisa de um serviço backend equivalente; o navegador informa quando recebe HTML no lugar da resposta do serviço. A fonte pode mudar, ficar indisponível ou não ter a música solicitada. O app não contorna login ou bloqueios da fonte.

## Busca vetorial

`src/library/vector-search.ts` constrói vetores esparsos TF-IDF com palavras e trigramas de caracteres. Os vetores são normalizados e ordenados por similaridade de cosseno. Título e artista têm maior peso que estilo e álbum/coleção. Acentos, pontuação e caixa são normalizados. Quando há resultados que contêm todos os termos, eles têm preferência; aproximações por caracteres são usadas como fallback. Uma verificação de cobertura dos termos evita devolver músicas sem relação com a consulta.

O índice fica em memória e é reutilizado por catálogo. A busca na lista do catálogo não envia consultas para serviços externos, não usa chaves, não baixa modelos e funciona sem internet depois que os módulos do catálogo foram carregados. Não há banco vetorial externo. É busca vetorial **lexical**, não busca semântica com embeddings neurais.

Exemplos: `espreso sabrina`, `sabrna carpentr`, `cafe tacvba`, `peso pluma ella`, `musica mexicana`. Os filtros de estilo e disponibilidade operam sobre os resultados. Os estilos são categorias editoriais amplas, não uma taxonomia automática.

## Fontes e atualização

Os metadados modernos foram verificados pela API de lookup do Apple iTunes. Cada entrada de `src/library/modern-catalog.json` inclui a URL de origem (`sourceUrl`). Por exemplo: [Manchild](https://music.apple.com/us/song/1819377511), [American Idiot](https://music.apple.com/us/song/1161539471), [NUEVA VIDA](https://music.apple.com/us/song/1694413074) e [BAILE INoLVIDABLE](https://music.apple.com/us/song/1787022842).

`scripts/modern-catalog-seeds.json` fixa artista, título, categoria e ID da faixa. Para atualizar os metadados:

```bash
node scripts/generate-modern-catalog.mjs
```

O script verifica a correspondência de título/artista, rejeita IDs duplicados e só substitui o manifesto após validar todas as entradas. Ele não baixa partituras, letras ou áudio. Para ampliar a seleção, acrescente entradas verificadas ao arquivo de seeds. O catálogo é uma seleção estática; não se atualiza automaticamente com lançamentos.

O manifesto aberto permanece separado em `src/library/catalog.json`, gerado por `scripts/generate-catalog.mjs`, com URLs fixadas em uma revisão do [OpenScore Lieder](https://github.com/OpenScore/Lieder). Atualizar esse manifesto não remove as referências modernas.

## Testes

Testes unitários cobrem busca por título/artista, acentos, erros de digitação, colaboradores, estilo, resultados vazios, preferência por correspondências exatas e download pelo servidor, correspondência de artista/título e rejeição de redirecionamentos externos. Os testes de navegador exercitam filtros, busca aproximada, download automático, seleção da trilha de baixo, persistência após recarga e mensagens de indisponibilidade. O endpoint é simulado com um exercício original do projeto em Guitar Pro; o download MXL usa uma fixture CC0. Os testes não dependem de transcrições comerciais ou da disponibilidade da fonte externa.
