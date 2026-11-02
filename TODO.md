# Próximas etapas

1. Testar B0/E1 em baixo real com DI e microfone, medir erro de oitava, latência ponta a ponta e falsos ataques; comparar YIN, MPM, HPS e autocorrelação com o mesmo corpus.
2. Completar avaliação de duração, pausas, notas repetidas sem silêncio, ties/articulações e score following com variações de tempo.
3. Implementar importação MIDI com conversão para eventos e renderização; manter PDF experimental separado.
4. Completar Wait-for-Note com acompanhamento virtual segmentado, count-in e controles por trilha.
5. Acrescentar âncoras múltiplas e tratamento robusto de buffering/seek no YouTube.
6. Adicionar sessões, favoritos, fontes licenciadas específicas de baixo e resumo histórico de progresso.
7. Validar acessibilidade, responsividade e testes E2E com interface de áudio real.

## Identidade visual — oficina de 1945

- [x] Substituir o visual SaaS por um sistema editorial minimalista: papel, tinta preta, vermelho industrial e divisórias retas.
- [x] Refinar a marca com lettering geométrico original em SVG a partir das referências de cabeçalhos editoriais.
- [x] Criar marca tipográfica própria e instalar fontes locais com suas licenças; sem personagens ou fotografias de fundo.
- [x] Manter a partitura limpa e dominante, com título no cabeçalho editorial, estados em oliva/vermelho e legendas textuais.
- [x] Redesenhar afinador, transporte, biblioteca, catálogo, configurações e mensagens no mesmo sistema visual.
- [x] Garantir foco visível, acesso por teclado à partitura e importação, contenção/restauração de foco no catálogo e movimento reduzido.
- [x] Verificar desktop e telas de 390/320 px, executar regressões de áudio/reprodução/importação e build de produção.
- [ ] Validar a leitura durante uma sessão longa com baixo real, incluindo sinal incerto, mudança de notas e uso dos controles em celular.
- [ ] Fazer uma auditoria ampliada com leitores de tela; os testes atuais cobrem teclado e comportamento básico de foco.
