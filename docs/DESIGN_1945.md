# PLAYWITHME — The Music Workshop, est. 1945

A identidade usa a linguagem de impressão industrial e composição editorial de meados do século XX. A direção foi simplificada conforme o pedido: sem personagens, fotografias, símbolos políticos ou ilustrações de fundo. O peso visual vem da tipografia, das regras horizontais, da assimetria entre partitura e instrumentos e do lettering geométrico original: hastes maciças, filetes finos e contrafomas abertas. As referências adicionais de jornal alternativo e cartaz industrial entram na marca, sem adicionar cenas ou personagens.

## Sistema

Os tokens de `src/index.css` centralizam a paleta: papel `#E8DCC4`, tinta `#191919`, vermelho `#B52B24`, mostarda `#D6A33A`, oliva `#626747` e azul `#456577`. A superfície da partitura usa papel claro `#F5EDDD`. O grão sutil está no fundo da página, nunca sobre texto, controles ou notação.

A marca é desenhada em SVG no componente `WorkshopWordmark`, com nome acessível e sem depender de fonte externa. Anton dá escala e densidade aos títulos. IBM Plex Mono identifica controles e medidas; Georgia compõe títulos musicais e texto editorial. As duas fontes baixadas são servidas localmente em `public/fonts`, com suas licenças OFL incluídas. Não há chamada a um serviço de fontes durante o uso.

A partitura ocupa a coluna principal. O título/artista aparecem no cabeçalho editorial; sua duplicação no renderizador foi desabilitada, preservando pautas, tablatura, compassos, afinação e demais indicações. O braço do baixo fica imediatamente abaixo da execução. O afinador, o acervo e os ajustes formam a coluna técnica. No celular, a composição vira uma coluna e as opções do transporte podem ser roladas horizontalmente.

O afinador usa um SVG com ponteiro entre −50 e +50 cents; sua leitura é repetida em texto. Sinal incerto recebe mostarda e o rótulo “SINAL INCERTO”. Notas corretas usam oliva, incorretas/perdidas vermelho, pendentes tinta e a nota ativa azul. As legendas e os contadores acompanham as cores. A paleta da notação está em `src/notation/colors.ts`.

## Interação e acessibilidade

- Link inicial para pular diretamente à partitura.
- Foco visível em links, controles e regiões roláveis.
- Partitura e diagrama de trastes acessíveis por teclado, sem encolher a notação para caber em uma tela estreita.
- Botões de reprodução com símbolo, legenda e nome acessível.
- Importação local alcançável pelo teclado.
- Catálogo com foco inicial na busca, ciclo de Tab contido, Escape para fechar e retorno ao acionador.
- `prefers-reduced-motion` desliga a movimentação do ponteiro e o breve efeito de carimbo do erro.
- A textura fica atrás do conteúdo e não captura interação.

O transporte continua fixo durante a leitura, com espaço reservado no fim da página. Áudio, detecção, avaliação, formatos de arquivo, busca vetorial e persistência mantêm seus fluxos existentes. A indicação de tomada é apenas local; esta alteração não adiciona histórico de sessões.

## Validação

A suíte de navegador cobre renderização real da notação, cores de avaliação, microfone simulado, play/pause, importação, persistência, catálogo vetorial, teclado, foco do diálogo, sinal incerto, movimento reduzido e ausência de overflow horizontal em telas pequenas. A inspeção visual usa Chromium em desktop e celular. A validação física com instrumento e a auditoria ampliada com leitor de tela permanecem no TODO.
