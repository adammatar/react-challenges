import { useState, useEffect } from 'react';
import { Query, QuerySnapshot, onSnapshot, Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

interface UseFirestoreQueryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

interface UseFirestoreQueryResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  retrying: boolean;
  retry: () => void;
}

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any): any => {
  if (!data) return data;
  
  if (data instanceof Timestamp) {
    return data.toDate();
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item));
  }
  
  if (typeof data === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertTimestamps(value);
    }
    return converted;
  }
  
  return data;
};

export function useFirestoreQuery<T>(
  query: Query,
  options: UseFirestoreQueryOptions = {}
): UseFirestoreQueryResult<T> {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const setupQuery = () => {
    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      query,
      {
        next: (snapshot: QuerySnapshot) => {
          try {
            const docs = snapshot.docs.map(doc => {
              const data = doc.data();
              // Convert any Firestore timestamps to Date objects
              const convertedData = convertTimestamps(data);
              return {
                id: doc.id,
                ...convertedData,
              };
            }) as T[];
            setData(docs);
            setLoading(false);
            setError(null);
            setRetrying(false);
            setRetryCount(0);
          } catch (err) {
            console.error('Error processing Firestore data:', err);
            setError(err instanceof Error ? err : new Error('Failed to process data'));
            setLoading(false);
          }
        },
        error: (err: Error) => {
          console.error('Firestore query error:', err);
          setError(err);
          setLoading(false);

          // Check if error is due to missing index
          if (err.message.includes('requires an index')) {
            toast.error('Building database index. This may take a few minutes...', {
              autoClose: false,
            });
          } else if (retryCount < maxRetries) {
            setRetrying(true);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              setupQuery();
            }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          } else {
            toast.error('Failed to load data. Please try again later.');
          }
        },
      }
    );

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = setupQuery();
    return () => unsubscribe();
  }, [query]);

  const retry = () => {
    setRetryCount(0);
    setupQuery();
  };

  return { data, loading, error, retrying, retry };
}

export default useFirestoreQuery; 