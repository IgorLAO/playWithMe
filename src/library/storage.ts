export type LibraryItem={id:string;title:string;artist:string;format:string;data:ArrayBuffer;favorite:boolean;youtubeUrl?:string;offsetMs?:number;lastOpened:number};
const DB='playwithme-library';const STORE='scores';
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>req.result.createObjectStore(STORE,{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function tx<T>(mode:IDBTransactionMode,action:(store:IDBObjectStore,done:(v:T)=>void)=>void):Promise<T>{const db=await openDb();return new Promise((resolve,reject)=>{const transaction=db.transaction(STORE,mode);action(transaction.objectStore(STORE),resolve);transaction.onerror=()=>reject(transaction.error);transaction.oncomplete=()=>db.close();});}
export const library={
 list:()=>tx<LibraryItem[]>('readonly',(s,done)=>{const r=s.getAll();r.onsuccess=()=>done(r.result.sort((a,b)=>b.lastOpened-a.lastOpened));}),
 save:(item:LibraryItem)=>tx<void>('readwrite',(s,done)=>{s.put(item);done();}),
 remove:(id:string)=>tx<void>('readwrite',(s,done)=>{s.delete(id);done();}),
};
