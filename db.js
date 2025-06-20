/**
 * ✅ Importing `openDB` from the idb library (a modern wrapper around IndexedDB)
 * This makes working with IndexedDB much easier using async/await style
 * Loaded directly from a CDN using native ES Module import (no install needed)
 */
import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

// 🏦 Open (or upgrade) the database
export const dbPromise = openDB('expenseAppDB', 1, {
  upgrade(db, oldVersion, newVersion, transaction) {
    console.log(`⚙️ Upgrading DB from version ${oldVersion} to ${newVersion}`);

    // 🔹 Initial version setup (v1)
    if (oldVersion < 1) {
      // 🛠 Create settings store (key-value)
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // 💰 Create expenses store with autoIncrement ID and index by date
      if (!db.objectStoreNames.contains('expenses')) {
        const expenseStore = db.createObjectStore('expenses', {
          keyPath: 'id',
          autoIncrement: true,
        });
        expenseStore.createIndex('by-date', 'date');
      }
    }

    // 🔄 Future upgrades can be handled here
    // Example: add 'budgets' store in version 2
    // if (oldVersion < 2) {
    //   db.createObjectStore('budgets', { keyPath: 'id', autoIncrement: true });
    // }

    // Example: add 'by-category' index to expenses in version 3
    // if (oldVersion < 3) {
    //   const expenseStore = transaction.objectStore('expenses');
    //   expenseStore.createIndex('by-category', 'category');
    // }
  }
});

// -----------------------------
// ⚙️ SETTINGS STORE FUNCTIONS
// -----------------------------

// Save any setting (like username, theme)
export async function saveSetting(key, value) {
    const db = await dbPromise;

    if (value === null || value === undefined) {
        await db.delete('settings', key);
    } else {
        await db.put('settings', { key, value });
    }
}

// Load a setting (returns { key, value } or undefined)
export async function loadSetting(key) {
    const db = await dbPromise;
    return await db.get('settings', key);
}

// -----------------------------
// 💰 EXPENSES STORE FUNCTIONS
// -----------------------------

// Add a new expense
export async function addExpense(expense) {
  const db = await dbPromise;
  await db.add('expenses', {
    ...expense,
    createdAt: expense.createdAt || new Date().toISOString() 
    //Automatically includes createdAt timestamp if it’s not already set
  });
}


// Get latest 10 expenses, sorted by date descending
export async function getRecentExpenses() {
    const db = await dbPromise;
    const tx = db.transaction('expenses');
    const store = tx.objectStore('expenses');
    const index = store.index('by-date');

    // Get all expenses sorted by date (newest first)
    const expenses = await index.getAll(undefined, 1000); // max 1000
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    return expenses.slice(0, 10);
}

// Optional: Clear all expenses (for reset)
export async function clearExpenses() {
    const db = await dbPromise;
    await db.clear('expenses');
}

// Optional: Clear all settings (for reset)
export async function clearSettings() {
    const db = await dbPromise;
    await db.clear('settings');
}