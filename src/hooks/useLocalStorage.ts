import { useState, useEffect } from 'react';

interface StorageOptions {
  expiration?: number; // Time in milliseconds
}

interface StorageError extends Error {
  code: string;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: StorageOptions = {}
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  // Get from local storage then
  // parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);
      
      // Check for expiration
      if (parsed.expiration && parsed.expiration < Date.now()) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((prevValue: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      const itemToStore = {
        value: valueToStore,
        expiration: options.expiration ? Date.now() + options.expiration : undefined
      };
      
      window.localStorage.setItem(key, JSON.stringify(itemToStore));
    } catch (error) {
      const storageError = new Error('Failed to save to localStorage') as StorageError;
      storageError.code = 'STORAGE_ERROR';
      console.error(storageError);
    }
  };

  // Clear the value from localStorage
  const clearValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      const storageError = new Error('Failed to clear localStorage') as StorageError;
      storageError.code = 'STORAGE_ERROR';
      console.error(storageError);
    }
  };

  // Listen for storage changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.expiration && parsed.expiration < Date.now()) {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
          } else {
            setStoredValue(parsed.value);
          }
        } catch (error) {
          console.error('Error handling storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
} 