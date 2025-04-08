import React from 'react';

// Challenge template
export const useLocalStorageChallenge = {
  id: 'use-local-storage',
  title: 'useLocalStorage Hook',
  description: 'Create a custom React hook that manages state in localStorage with type safety and expiration support.',
  difficulty: 'beginner',
  points: 150,
  estimatedTime: '45 mins',
  category: 'Hooks',
  requirements: [
    'Handle different data types (string, number, object, array)',
    'Implement type safety with TypeScript',
    'Add expiration support for stored values',
    'Handle storage errors gracefully',
    'Support multiple keys',
    'Add clear functionality'
  ],
  starterCode: `import { useState, useEffect } from 'react';

interface StorageOptions {
  expiration?: number; // in milliseconds
}

interface StorageError {
  message: string;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: StorageOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // TODO: Implement the hook
  return [initialValue, () => {}, () => {}];
}`,
  solution: `import { useState, useEffect } from 'react';

interface StorageOptions {
  expiration?: number; // in milliseconds
}

interface StorageError {
  message: string;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: StorageOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.expiration && parsed.expiration < Date.now()) {
          window.localStorage.removeItem(key);
          return initialValue;
        }
        return parsed.value;
      }
      return initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setStoredValue = (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      const item = {
        value: valueToStore,
        expiration: options.expiration ? Date.now() + options.expiration : undefined
      };
      window.localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  const clearValue = () => {
    try {
      window.localStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const item = e.newValue ? JSON.parse(e.newValue) : null;
          if (item) {
            if (item.expiration && item.expiration < Date.now()) {
              window.localStorage.removeItem(key);
              setValue(initialValue);
            } else {
              setValue(item.value);
            }
          } else {
            setValue(initialValue);
          }
        } catch (error) {
          console.error('Error handling storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [value, setStoredValue, clearValue];
}`,
  testCases: [
    {
      name: 'Persists string value',
      code: `const [value, setValue] = useLocalStorage('test-string', 'initial');
setValue('new value');
if (value !== 'new value') throw new Error('Value not updated');
const stored = JSON.parse(localStorage.getItem('test-string'));
if (stored.value !== 'new value') throw new Error('Value not stored');`
    },
    {
      name: 'Persists number value',
      code: `const [value, setValue] = useLocalStorage('test-number', 0);
setValue(42);
if (value !== 42) throw new Error('Value not updated');
const stored = JSON.parse(localStorage.getItem('test-number'));
if (stored.value !== 42) throw new Error('Value not stored');`
    },
    {
      name: 'Persists object value',
      code: `const [value, setValue] = useLocalStorage('test-object', { count: 0 });
setValue({ count: 1 });
if (value.count !== 1) throw new Error('Value not updated');
const stored = JSON.parse(localStorage.getItem('test-object'));
if (stored.value.count !== 1) throw new Error('Value not stored');`
    },
    {
      name: 'Handles expiration',
      code: `const [value, setValue] = useLocalStorage('test-expire', 'initial', { expiration: 1000 });
setValue('new value');
if (value !== 'new value') throw new Error('Value not updated');
await new Promise(resolve => setTimeout(resolve, 1500));
const stored = localStorage.getItem('test-expire');
if (stored !== null) throw new Error('Value not expired');`
    },
    {
      name: 'Clears value',
      code: `const [value, setValue, clearValue] = useLocalStorage('test-clear', 'initial');
setValue('new value');
clearValue();
if (value !== 'initial') throw new Error('Value not cleared');
const stored = localStorage.getItem('test-clear');
if (stored !== null) throw new Error('Value not removed from storage');`
    }
  ],
  example: {
    usage: `const [name, setName] = useLocalStorage('name', 'John');
const [count, setCount] = useLocalStorage('count', 0, { expiration: 3600000 }); // expires in 1 hour
const [user, setUser] = useLocalStorage('user', { id: 1, name: 'John' });

// Update values
setName('Jane');
setCount(prev => prev + 1);
setUser({ ...user, name: 'Jane' });`,
    expectedOutput: `// Values are persisted in localStorage and can be accessed across page reloads
// The count will expire after 1 hour
// All values are type-safe and can be used with TypeScript`
  }
}; 