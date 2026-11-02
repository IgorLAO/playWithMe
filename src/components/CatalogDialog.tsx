import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  catalog,
  catalogArtist,
  catalogSearch,
  genres,
  type CatalogEntry,
  type Genre,
} from '../library/catalog';
export function CatalogDialog({
  onClose,
  onAdd,
  addedIds,
}: {
  onClose: () => void;
  onAdd: (entry: CatalogEntry) => Promise<void>;
  addedIds: Set<string>;
}) {
  const [query, setQuery] = useState(''),
    [limit, setLimit] = useState(30),
    [busy, setBusy] = useState<string | null>(null),
    [error, setError] = useState('');
  const [genre, setGenre] = useState<Genre | ''>(''),
    [availability, setAvailability] = useState('all');
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current
      ?.querySelector<HTMLInputElement>(
        'input[aria-label="Buscar no catálogo"]',
      )
      ?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  function trapFocus(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const elements = Array.from(
      dialog.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled),a[href],input:not([hidden]),select,[tabindex="0"]',
      ) ?? [],
    ).filter((e) => e.getClientRects().length > 0);
    const first = elements[0],
      last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  const deferred = useDeferredValue(query);
  const results = useMemo(
    () =>
      catalogSearch(deferred).filter(
        (e) =>
          (!genre || e.genre === genre) &&
          (availability === 'all' || e.kind === availability),
      ),
    [deferred, genre, availability],
  );
  async function add(entry: CatalogEntry) {
    setBusy(entry.id);
    setError('');
    try {
      await onAdd(entry);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível adicionar a partitura',
      );
    } finally {
      setBusy(null);
    }
  }
  return (
    <div
      className="catalog-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialog}
        className="catalog-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Catálogo de partituras"
        onKeyDown={trapFocus}
      >
        <header className="catalog-header">
          <div>
            <span className="eyebrow">02 / ARQUIVO MUSICAL</span>
            <h2>Selecione sua partitura</h2>
            <p>
              {catalog.referenceCount} músicas de pop, punk, mexicana e outros
              estilos com busca automática de partitura, além de{' '}
              {catalog.scoreCount.toLocaleString('pt-BR')} partituras abertas.
              Busque por música ou artista, mesmo com pequenos erros de
              digitação.
            </p>
          </div>
          <button
            className="catalog-close"
            aria-label="Fechar catálogo"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className="catalog-search">
          <span>⌕</span>
          <input
            aria-label="Buscar no catálogo"
            placeholder="Música ou artista: Espresso, Green Day, Peso Pluma…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(30);
            }}
          />
          <b>{results.length.toLocaleString('pt-BR')} resultados</b>
        </div>
        <div className="catalog-filters">
          <label>
            Estilo
            <select
              aria-label="Estilo"
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value as Genre | '');
                setLimit(30);
              }}
            >
              <option value="">Todos os estilos</option>
              {genres.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label>
            Partitura
            <select
              aria-label="Partitura"
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value);
                setLimit(30);
              }}
            >
              <option value="all">Todas as músicas</option>
              <option value="score">Download disponível</option>
              <option value="reference">Busca automática</option>
            </select>
          </label>
          <small>Ordenadas por relevância</small>
        </div>

        {error && (
          <p className="catalog-error" role="alert">
            {error}
          </p>
        )}
        <div className="catalog-results">
          {results.slice(0, limit).map((entry) => (
            <div className="catalog-row" key={entry.id}>
              <div className="catalog-art" aria-hidden="true">
                ♫
              </div>
              <div className="catalog-copy">
                <strong>{entry.title}</strong>
                <span>{catalogArtist(entry)}</span>
                <small className="catalog-badge">
                  {entry.genre} ·{' '}
                  {entry.kind === 'score'
                    ? 'MXL disponível · CC0'
                    : 'Busca e download automáticos'}
                </small>
              </div>
              <div className="catalog-row-actions">
                <button
                  onClick={() => void add(entry)}
                  disabled={busy !== null || addedIds.has(entry.id)}
                >
                  {busy === entry.id
                    ? 'Baixando...'
                    : addedIds.has(entry.id)
                      ? 'Adicionada'
                      : entry.kind === 'score'
                        ? 'Adicionar'
                        : 'Buscar e baixar'}
                </button>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <div className="catalog-empty">
              Nenhuma música encontrada. Tente outro título, artista ou estilo.
            </div>
          )}
          {limit < results.length && (
            <button
              className="catalog-more"
              onClick={() => setLimit(limit + 30)}
            >
              Mostrar mais 30
            </button>
          )}
        </div>
        <footer className="catalog-footer">
          <span>
            O app busca, baixa e salva a partitura na biblioteca. A
            disponibilidade varia por música. Fontes: Guitar Pro Tabs (arranjos
            da comunidade para estudo pessoal) e{' '}
            <a href={catalog.repository} target="_blank" rel="noreferrer">
              OpenScore Lieder
            </a>{' '}
            (CC0, voz e piano).
          </span>
        </footer>
      </section>
    </div>
  );
}
