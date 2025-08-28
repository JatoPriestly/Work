
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface MyDB extends DBSchema {
  employees: {
    key: string;
    value: any;
  };
  qrcodes: {
    key: string;
    value: any;
  };
  records: {
    key: number;
    value: any;
    indexes: { timestamp: number };
  };
}

let dbPromise: Promise<IDBPDatabase<MyDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<MyDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MyDB>('JongoEAuthDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('employees')) {
          db.createObjectStore('employees', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('qrcodes')) {
          db.createObjectStore('qrcodes', { keyPath: 'code' });
        }
        if (!db.objectStoreNames.contains('records')) {
          const recordsStore = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
          recordsStore.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}
