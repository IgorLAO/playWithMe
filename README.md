# PlayWithMe

Estúdio de prática de baixo no navegador. React + TypeScript + Vite + Bun, alphaTab, Web Audio/AudioWorklet, Worker, Zustand e IndexedDB.

```bash
bun install
bun run dev
```

O servidor usa **HTTPS por padrão**. Abra `https://localhost:5173` **no mesmo computador da interface USB** em um navegador compatível e aceite o certificado local autoassinado. Pela rede, abra `https://<IP>:5173`, conforme exibido pelo Vite. `bun run dev:https` continua disponível como alias de `bun run dev`. O preview (`bun run build` seguido de `bun run preview`) também usa HTTPS, normalmente em `https://localhost:4173`. Um endereço `http://192.168...` não libera `getUserMedia`. Em produção, use HTTPS com certificado confiável. Se a interface tiver dois canais, escolha Canal 1, Canal 2 ou Automático nas configurações.  A aplicação abre com um exercício alphaTex. Conecte o microfone, inicie a reprodução e toque as notas. A pauta e a tab mudam de cor conforme a avaliação. Use **Walkthrough** para seguir após erros; Strict reinicia após um erro confirmado. Use **Buscar no catálogo** para pesquisar por título ou artista, com busca vetorial local tolerante a acentos e pequenos erros de digitação. O catálogo reúne 40 músicas de pop, punk, mexicana, rock, latina e funk/soul, além de 1.462 partituras CC0. Filtre por estilo ou disponibilidade: partituras abertas podem ser adicionadas diretamente; as músicas comerciais têm links de busca de tablatura e a opção **Importar partitura** (Guitar Pro ou MusicXML/MXL). O arquivo importado fica associado à música na biblioteca local. O acervo OpenScore Lieder é principalmente de voz e piano; ele não fornece automaticamente tablaturas de baixo. Importe MusicXML/MXL ou arquivos Guitar Pro aceitos pelo alphaTab para seus próprios arranjos de baixo. O navegador deve estar em `localhost` ou HTTPS para liberar microfone.

```bash
bun run typecheck
bun run test
bun run build
bun src/audio/benchmark.ts
```

A versão atual é um marco funcional, ainda sem validação física de baixo real. Veja [arquitetura](docs/ARCHITECTURE.md), [pesquisa](docs/RESEARCH.md), [limitações](docs/LIMITATIONS.md) e [pendências](TODO.md).

Detalhes da busca, fontes e atualização do acervo: [catálogo de músicas](docs/CATALOGO.md).
