import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dummyBooks } from '../data/dummyBooks';

interface User {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  availableCopies: number;
}

interface StoreState {
  user: User | null;
  books: Book[];
  favorites: string[]; // Store book IDs instead of full objects
  theme: 'light' | 'dark';
  setUser: (user: User | null) => void;
  setBooks: (books: Book[]) => void;
  addFavorite: (bookId: string) => void;
  removeFavorite: (bookId: string) => void;
  toggleTheme: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      books: dummyBooks, // Initialize with dummy books
      favorites: ['1', '3'], // Initialize with some favorites
      theme: 'light',
      
      setUser: (user) => set({ user }),
      setBooks: (books) => set({ books }),
      addFavorite: (bookId) => 
        set((state) => ({ favorites: [...state.favorites, bookId] })),
      removeFavorite: (bookId) =>
        set((state) => ({ favorites: state.favorites.filter(id => id !== bookId) })),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'library-storage',
      partialize: (state) => ({ favorites: state.favorites, theme: state.theme }),
    }
  )
);