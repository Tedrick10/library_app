import * as SQLite from 'expo-sqlite';

// Use openDatabaseSync for synchronous operations
const db = SQLite.openDatabaseSync('library.db');

export const initDB = () => {
  // Create the sync_queue table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mutation TEXT NOT NULL,
      variables TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);
};

export const addToQueue = (mutation: string, variables: any) => {
  // Add items to the sync queue
  db.execSync(`
    INSERT INTO sync_queue (mutation, variables, timestamp) 
    VALUES ('${mutation}', '${JSON.stringify(variables)}', ${Date.now()});
  `);
};

export const processQueue = async (client: any) => {
  return new Promise((resolve, reject) => {
    try {
      // Get all items from the queue
      const result = db.getAllSync('SELECT * FROM sync_queue ORDER BY timestamp ASC;');
      const items = result;
      
      if (items.length === 0) {
        resolve(null);
        return;
      }

      // Process each item sequentially
      const processItem = async (index: number) => {
        if (index >= items.length) {
          // Clear queue after processing
          db.execSync('DELETE FROM sync_queue;');
          resolve(null);
          return;
        }

        const item = items[index];
        const { mutation, variables } : any = item;
        
        try {
          switch (mutation) {
            case 'RENT_BOOK':
              await client.mutate({
                mutation: require('../api/fragments').RENT_BOOK,
                variables: JSON.parse(variables),
              });
              break;
            case 'RETURN_BOOK':
              await client.mutate({
                mutation: require('../api/fragments').RETURN_BOOK,
                variables: JSON.parse(variables),
              });
              break;
            // Add other mutations as needed
          }
          
          // Move to next item
          processItem(index + 1);
        } catch (error) {
          console.error('Sync error:', error);
          reject(error);
        }
      };

      processItem(0);
    } catch (error) {
      reject(error);
    }
  });
};