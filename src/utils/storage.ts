import type { GraphData } from '../types/index.js';

const STORAGE_KEY = 'neural-knowledge-map-data';
const STORAGE_VERSION = '1.0.0';

export function saveToLocalStorage(neurons: any[], connections: any[]) {
  try {
    const data: GraphData = {
      neurons,
      connections,
      metadata: {
        version: STORAGE_VERSION,
        lastModified: Date.now(),
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function loadFromLocalStorage(): GraphData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: GraphData = JSON.parse(stored);

    // Version check (for future migrations)
    if (data.metadata?.version !== STORAGE_VERSION) {
      console.warn('Data version mismatch, migration may be needed');
    }

    return data;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

export function exportData(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored || '{}';
}

export function importData(jsonString: string): GraphData | null {
  try {
    const data: GraphData = JSON.parse(jsonString);
    localStorage.setItem(STORAGE_KEY, jsonString);
    return data;
  } catch (error) {
    console.error('Failed to import data:', error);
    return null;
  }
}
