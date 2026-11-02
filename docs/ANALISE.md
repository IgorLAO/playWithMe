# Análise do projeto

Revisão do fluxo de áudio, avaliação, reprodução, partitura e testes em 02/11/2026.

## Problemas corrigidos

- **Feedback pouco explícito:** a indicação principal era a cor da nota; a mensagem de erro só aparecia com reinício automático. Agora há um aviso junto à partitura, com ícone, texto, nota esperada, nota detectada e compasso, além de contorno vermelho. O aviso usa uma região acessível e respeita a preferência de movimento reduzido. No modo de espera permanece até a correção; nos demais modos, o texto fica por até 3,5 segundos, ou até um acerto/reinício.
- **Falsos erros por acumulação de tempo:** o avaliador compartilhava a janela de confirmação entre eventos e não a interrompia quando recebia uma altura correta sem ataque. A janela agora pertence à nota atual e é interrompida por altura correta ou ausência de sinal válido. O timestamp zero também é aceito.
- **Modo de espera bloqueado depois de errar:** uma nota marcada como incorreta deixava de ser candidata à avaliação. Agora pode ser corrigida com um novo ataque. O contador representa o estado final das notas, não o total histórico de tentativas.
- **Fonte incorreta no reinício automático:** o transporte criado no caminho de erro usava o padrão virtual. Agora a fábrica aplica a fonte e o offset selecionados. O retorno à reprodução atualiza também o estado da interface.
- **Reinício agendado depois de uma ação manual:** reiniciar, buscar uma posição, usar play/pause, mudar de modo/fonte/configuração de reinício ou carregar outra partitura agora cancela o temporizador pendente.
- **Entrada no modo de espera com áudio ainda tocando:** o botão agora pausa o transporte antes da troca.

## Problemas que permanecem

1. **Alta — repetir trechos não reavalia notas concluídas.** `src/App.tsx`, funções `seek` e configuração de A–B: mudar a posição não reinicializa os estados do avaliador. `PracticeEvaluator` ignora notas já corretas/incorretas fora do modo de espera. Voltar na linha do tempo mantém resultados antigos; A–B configura `playbackRange`, mas não habilita explicitamente repetição no player. É necessário definir o reset por trecho e ligar a repetição do transporte.
2. **Alta — ataques repetidos podem ser perdidos.** `src/audio/MicrophoneEngine.ts`, callback do worker: o ataque depende da mudança do MIDI arredondado ou de voltar de um frame inválido. Duas palhetadas na mesma altura, sem silêncio detectado, podem virar um único ataque, embora o avaliador exija um ataque novo. Falta um detector de ataque por envelope/transiente e validação com instrumento real.
3. **Média — estatísticas dependem da chegada de áudio.** `src/App.tsx`, `handleFrame`: a avaliação só avança por frames do microfone. Reproduzir sem microfone deixa as contagens sem atualização, inclusive as notas perdidas. A finalização da reprodução também não executa uma avaliação final independente do áudio.
4. **Média — arranjos complexos excedem o modelo atual.** `src/music/score.ts` considera apenas o primeiro pentagrama da trilha e calcula o tempo por compasso; o avaliador processa uma nota por vez. Acordes, repetições e mudanças de andamento internas precisam de tratamento próprio para manter a avaliação alinhada à reprodução.

## Validação

- TypeScript sem erros.
- 23 testes unitários aprovados, incluindo regressões de confirmação, silêncio, troca de nota e recuperação em modo de espera.
- 4 testes de navegador aprovados em Chromium, incluindo avaliação de erro com frames determinísticos, exibição das duas notas e limpeza ao reiniciar.
- Build de produção aprovado; permanece o aviso de tamanho do bundle do alphaTab.
- O teste de interface injeta frames/estado controlados. Não substitui validação do reconhecimento com baixo físico nem valida a reprodução real do YouTube.
