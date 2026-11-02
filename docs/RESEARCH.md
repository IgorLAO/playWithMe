# Pesquisa técnica — PlayWithMe

Verificado em 1º de novembro de 2026. Licenças e atividade consultadas nos repositórios e na API pública do GitHub. "Ativo" indica somente alterações recentes, não garante qualidade ou suporte.

| Projeto | Recursos e qualidade observada | Licença / manutenção | Decisão e limites |
|---|---|---|---|
| [alphaTab](https://github.com/CoderLine/alphaTab) | Guitar Pro, MusicXML, alphaTex, pauta/tab, SoundFont e player; API tipada, Web Workers e AudioWorklet; documentação detalhada | MPL-2.0, ativo | Usado para importação, render e áudio. Seu modelo não deve ser a única fonte da lógica de avaliação. |
| [tablatures/tablatures](https://github.com/tablatures/tablatures) | Player/PWA com alphaTab, vídeo e loops; referência de UX e sincronização | MPL-2.0, ativo | Referência; código não copiado. Agregação de fontes exige revisão de direitos e API. |
| [guitar-audio-kit](https://github.com/kretoffer/guitar-audio-kit) | TypeScript, autocorrelação, RMS, acordes, afinações e testes | MIT, ativo | Boa referência. Janela padrão 4096 amostras e autocorrelação não demonstram robustez para B0; não adotado sem benchmark específico. |
| [note-and-chord-detector](https://github.com/whythochat/note-and-chord-detector) | MPM, análise espectral e filtragem; app estático claro | MIT, ativo | Inspira o filtro de estabilidade; detector de acordes não atende avaliação monofônica da linha de baixo. |
| [OpenSheetMusicDisplay](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay) | MusicXML e pauta excelentes, baseada em VexFlow | BSD-3-Clause, ativo | Alternativa para partituras sem tab; alphaTab cobre melhor tab, importação GP e player no mesmo motor. |
| [PitchDetect](https://github.com/cwilso/PitchDetect) | Demonstração didática de autocorrelação no navegador | MIT, última alteração observada em 2022 | Não é pipeline de produção para B0/latência. |
| [chordbook/tuner](https://github.com/chordbook/tuner) | Afinador Web Audio apoiado em pitchy | GPL-3.0, última alteração observada em 2024 | Licença copyleft e falta de validação específica para B0 impedem integração direta. |
| [fretwork](https://github.com/bubiche/fretwork) | Editor/transcrição de guitarra com pipeline de áudio para tablatura | MIT, ativo | Referência de transcrição offline; não substitui avaliação ao vivo. |
| [Basic Pitch](https://github.com/spotify/basic-pitch) | Transcrição automática baseada em rede neural | Apache-2.0, última alteração observada em 2025 | Adequado a importação experimental, não ao caminho de baixa latência por nota. |
| [aubio](https://github.com/aubio/aubio) | DSP nativo: pitch e onsets | GPL-3.0, ativo | WASM é possível, mas licença/integracão e custo requerem estudo. |
| [FluidSynth](https://github.com/FluidSynth/fluidsynth) | Síntese SF2 madura | LGPL-2.1, ativo | AlphaTab já fornece síntese SF2 no navegador; sem nova dependência. |
| [Matchmaker](https://github.com/pymatchmaker/matchmaker) | Alinhamento de música/performance e score following em Python | Apache-2.0, ativo | Referência para possível alinhamento DTW/online; sem integração browser neste marco. |

## Detector escolhido

[YIN](https://pubmed.ncbi.nlm.nih.gov/12002874/) usa diferença temporal normalizada. O [MPM](https://github.com/whythochat/note-and-chord-detector) usa função de diferença normalizada com seleção de picos. Autocorrelação simples pode favorecer um harmônico; FFT/HPS precisam de resolução baixa em B0 e podem sofrer com fundamental fraca. Rastreamento probabilístico reduz saltos, mas acrescenta atraso e complexidade. A versão atual usa uma variante YIN com seleção do primeiro mínimo confiável, janela de 8192 amostras, salto 2048, gate RMS e duas leituras estáveis. Processa em Worker após captura no AudioWorklet.

Benchmark sintético local (`bun src/audio/benchmark.ts`, 48 kHz, fundamental 0,15 + 2º harmônico 0,18; 20 repetições idênticas):

| Nota | Acertos dentro de 35 cents | Tempo médio por quadro |
|---|---:|---:|
| B0 | 20/20 | 3,57 ms |
| E1 | 20/20 | 3,25 ms |
| A1 | 20/20 | 3,23 ms |
| D2 | 20/20 | 3,27 ms |
| G2 | 20/20 | 3,28 ms |
| G3 | 20/20 | 3,86 ms |

Isto mede computação em uma máquina e sinais determinísticos, **não** precisão nem latência ponta a ponta com baixo real. A janela de 8192 amostras leva 171 ms a 48 kHz, com cerca de 85 ms de atraso no centro, além de I/O e estabilização. Não houve benchmark comparativo justo entre os cinco algoritmos; essa etapa permanece aberta.

## Fontes legais e sincronização

Partituras de usuário e obras em domínio público podem ser importadas localmente. O [OpenScore Lieder](https://github.com/OpenScore/Lieder) publica o corpus sob [CC0 1.0](https://github.com/OpenScore/Lieder/blob/main/LICENSE.txt). A revisão `38c5db510224d9facdc4b08d741fc788cfb58ea8` contém 1.462 arquivos MXL em `scores/`; o app gera um índice de título/compositor/coleção e baixa arquivos diretamente do GitHub somente após a escolha do usuário. A coleção é majoritariamente de voz e piano, sem partitura específica de baixo. Não existe extração automática de notas de uma URL YouTube. A integração usa o [IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) e alinhamento manual; `seekTo` e estados de buffering são aproximados. Para alinhamento automático futuro, [pesquisa de score following com CQT/DTW](https://arxiv.org/abs/2205.03247) e [Matchmaker](https://github.com/pymatchmaker/matchmaker) são pontos de partida, com avaliação de licença e latência antes da adoção.
