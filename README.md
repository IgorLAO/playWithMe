# PlayWithMe

Estúdio de prática de baixo no navegador. React + TypeScript + Vite + Bun, alphaTab, Web Audio/AudioWorklet, Worker, Zustand e IndexedDB.

```bash
bun install
bun run dev
```

Abra `http://localhost:5173` **no mesmo computador da interface USB** em um navegador compatível. Se acessar pelo IP da rede ou por outro dispositivo, inicie `bun run dev:https` e abra a URL `https://<IP>:5173` exibida pelo Vite (aceite o certificado local de desenvolvimento). Um endereço `http://192.168...` não libera `getUserMedia`. Em produção, use HTTPS com certificado confiável. Se a interface tiver dois canais, escolha Canal 1, Canal 2 ou Automático nas configurações.  A aplicação abre com um exercício alphaTex. Conecte o microfone, inicie a reprodução e toque as notas. A pauta e a tab mudam de cor conforme a avaliação. Use **Walkthrough** para seguir após erros; Strict reinicia após um erro confirmado. Use **Buscar no catálogo aberto** para pesquisar 1.462 partituras CC0 por título ou compositor, adicionar um MXL e praticá-lo depois pela biblioteca local. O acervo OpenScore Lieder é principalmente de voz e piano; ele não fornece automaticamente tablaturas de baixo. Importe MusicXML/MXL ou arquivos Guitar Pro aceitos pelo alphaTab para seus próprios arranjos de baixo. O navegador deve estar em `localhost` ou HTTPS para liberar microfone.

```bash
bun run typecheck
bun run test
bun run build
bun src/audio/benchmark.ts
```

A versão atual é um marco funcional, ainda sem validação física de baixo real. Veja [arquitetura](docs/ARCHITECTURE.md), [pesquisa](docs/RESEARCH.md), [limitações](docs/LIMITATIONS.md) e [pendências](TODO.md).
