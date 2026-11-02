export type LibraryItem = {
  id: string;
  title: string;
  artist: string;
  format: string;
  data: ArrayBuffer;
  favorite: boolean;
  sourceUrl?: string;
  preferredTrack?: number;
  youtubeUrl?: string;
  offsetMs?: number;
  lastOpened: number;
};

const DB = 'playwithme-library';
const STORE = 'scores';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore, done: (value: T) => void) => void,
): Promise<T> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let result: T;

    // Only report success after the transaction has committed to disk.
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error('Não foi possível atualizar a biblioteca.'));
    };

    try {
      action(tx.objectStore(STORE), (value) => {
        result = value;
      });
    } catch (error) {
      tx.abort();
      reject(error);
    }
  });
}

export const library = {
  list: () =>
    transaction<LibraryItem[]>('readonly', (store, done) => {
      const request = store.getAll();
      request.onsuccess = () => {
        done(request.result.sort((a, b) => b.lastOpened - a.lastOpened));
      };
    }),
  save: (item: LibraryItem) =>
    transaction<void>('readwrite', (store, done) => {
      store.put(item);
      done();
    }),
  remove: (id: string) =>
    transaction<void>('readwrite', (store, done) => {
      store.delete(id);
      done();
    }),
};
