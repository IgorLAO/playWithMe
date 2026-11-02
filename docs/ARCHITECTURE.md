# Arquitetura

React/TypeScript e Zustand mantêm apenas estado de interface. `audio/` captura 8192 amostras em AudioWorklet e envia por transferência a `pitch.worker.ts`; React recebe frequência/confiança já filtradas. `music/score.ts` converte o modelo alphaTab em eventos próprios com IDs, MIDI, tempo, compasso, voz, posição de corda/traste e ticks. `practice/` avalia eventos por tempo da partitura; `notation/` aplica cores aos modelos de nota da pauta e tab. `playback/transport.ts` unifica comandos ao player alphaTab e ao vídeo, usando a posição do alphaTab como relógio no modo virtual.

`library/` persiste arquivos no IndexedDB. O catálogo OpenScore Lieder usa um índice estático gerado da árvore do repositório em uma revisão fixa; a busca é local, sem chamadas à API do GitHub durante a pesquisa, e o MXL é baixado sob demanda. O índice é carregado somente ao abrir o diálogo. Para garantir que partituras mais longas apareçam no contêiner com scroll próprio, o alphaTab renderiza sem carregamento visual parcial. `youtube/` encapsula o IFrame API e a conversão entre tempo de partitura e vídeo. `components/` contém fretboard, afinador e vídeo. O som virtual vem da síntese SoundFont do alphaTab (SONiVOX empacotado). A partitura demo é alphaTex estruturado, não dados falsos de microfone.

A avaliação usa `PENDING → ACTIVE → CORRECT/INCORRECT/MISSED`, tolerância de início, cents e confirmação temporal de erro. Cada evento tem ID próprio. Alterações de estado aplicam verde/vermelho/âmbar na nota real da pauta e tablatura; eventos futuros permanecem cinza. Strict reinicia após erro confirmado; Walkthrough continua; Wait-for-Note só avança após um novo ataque detectado.

## Comandos

`bun install`, `bun run dev`, `bun run typecheck`, `bun run test`, `bun run build`. Os assets de fonte musical e SF2 são copiados pelo plugin Vite do alphaTab.
