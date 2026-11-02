import { importer, exporter, Settings } from '@coderline/alphatab';
import { DEMO_TEX } from '../../src/music/score';
// Original project exercise, never a commercial song transcription.
export function createTestGp() {
  const reader = new importer.AlphaTexImporter();
  reader.initFromString(DEMO_TEX, new Settings());
  return new exporter.Gp7Exporter().export(reader.readScore());
}

export function createTestGpWithBassTrack() {
  const reader = new importer.AlphaTexImporter();
  const exercise = DEMO_TEX.replace(
    '\\track "Baixo elétrico"',
    '\\track "Guitarra"',
  ).replace('\\instrument 34', '\\instrument 25');
  const bassPart = String.raw`\track "Baixo elétrico" \instrument 34 \tuning G2 D2 A1 E1 \clef F4 0.4.1`;
  reader.initFromString(`${exercise} ${bassPart}`, new Settings());
  return new exporter.Gp7Exporter().export(reader.readScore());
}
