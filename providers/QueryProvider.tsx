'use client';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { ReactNode, useState, useEffect } from 'react';
import { get, set, del } from 'idb-keyval';

// Initialize the QueryClient with optimistic caching settings
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Cache for a long time (Infinity) for offline capabilities
                // We will invalidate manually or use specific staleTimes for sensitive data
                staleTime: 1000 * 60 * 60 * 24, // 24 hours
                gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
                retry: 3,
            },
            mutations: {
                networkMode: 'offlineFirst',
            },
        },
    });
}

// Create an async persister using idb-keyval
// Note: TanStack Query Persister interface is slightly different in v5, 
// usually we use `createAsyncStoragePersister` for async storages like IDB.
// However, exact implementation depends on the adapter. 
// For simplicity and robustness, we'll wrap idb-keyval in a compatible interface.

const idbPersister = {
    persistClient: async (client: any) => {
        await set('REACT_QUERY_OFFLINE_CACHE', client);
    },
    restoreClient: async () => {
        return await get('REACT_QUERY_OFFLINE_CACHE');
    },
    removeClient: async () => {
        await del('REACT_QUERY_OFFLINE_CACHE');
    },
} as any; // Type casting for custom persister logic if needed, but standard way below:

// Standard Async Persister for v5
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const persister = createAsyncStoragePersister({
    storage: {
        getItem: async (key) => await get(key),
        setItem: async (key, value) => {
            await set(key, value);
        },
        removeItem: async (key) => await del(key),
    },
});

export default function QueryProvider({ children }: { children: ReactNode }) {
    // Ensure QueryClient is created only once per browser session
    const [queryClient] = useState(() => makeQueryClient());

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
            onSuccess={() => {
                console.log('Query cache restored from IndexedDB');
            }}
        >
            {children}
        </PersistQueryClientProvider>
    );
}
