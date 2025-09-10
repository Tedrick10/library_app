import { dummyBooks } from '../data/dummyBooks';

// Simulated delay for async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique IDs
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Dummy rentals data
let dummyRentals = [
  {
    id: 'r1',
    book: dummyBooks[0],
    rentedAt: '2025-08-15',
    dueDate: '2025-09-01',
    returnedAt: "",
    userId: 'user1',
  },
  {
    id: 'r2',
    book: dummyBooks[1],
    rentedAt: '2025-08-20',
    dueDate: '2025-09-05',
    returnedAt: "",
    userId: 'user1',
  },
];

// Dummy favorites data
let dummyFavorites = [
  {
    id: 'f1',
    book: dummyBooks[0],
  },
  {
    id: 'f2',
    book: dummyBooks[2],
  },
];

// Book operations
export const getBooks = async (first?: number, after?: string) => {
  await delay(500); // Simulate network delay
  
  let books = [...dummyBooks];
  if (after) {
    const index = books.findIndex(book => book.id === after);
    books = books.slice(index + 1);
  }
  
  if (first) {
    books = books.slice(0, first);
  }
  
  return {
    books: {
      edges: books.map(book => ({
        node: book,
        cursor: book.id,
      })),
      pageInfo: {
        hasNextPage: books.length < dummyBooks.length,
        hasPreviousPage: !!after,
        startCursor: books.length > 0 ? books[0].id : null,
        endCursor: books.length > 0 ? books[books.length - 1].id : null,
      },
      totalCount: dummyBooks.length,
    },
  };
};

export const getBook = async (id: string) => {
  await delay(300);
  const book = dummyBooks.find(b => b.id === id);
  if (!book) throw new Error('Book not found');
  return { book };
};

// Rental operations
export const getOverdueRentals = async () => {
  await delay(400);
  const overdueRentals = dummyRentals.filter(
    rental => !rental.returnedAt && new Date(rental.dueDate) < new Date()
  );
  return { overdueRentals };
};

export const getMyRentals = async () => {
  await delay(400);
  return { myRentals: dummyRentals.filter(r => !r.returnedAt) };
};

export const rentBook = async (bookId: string) => {
  await delay(800);
  
  const book = dummyBooks.find(b => b.id === bookId);
  if (!book) throw new Error('Book not found');
  if (book.availableCopies <= 0) throw new Error('No copies available');
  
  // Update book availability
  book.availableCopies -= 1;
  
  // Create rental
  const rental = {
    id: generateId(),
    book,
    rentedAt: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    returnedAt: "",
    userId: 'user1',
  };
  
  dummyRentals.push(rental);
  return { rentBook: rental };
};

export const returnBook = async (rentalId: string) => {
  await delay(600);
  
  const rentalIndex = dummyRentals.findIndex(r => r.id === rentalId);
  if (rentalIndex === -1) throw new Error('Rental not found');
  
  const rental = dummyRentals[rentalIndex];
  rental.returnedAt = new Date().toISOString().split('T')[0];
  
  // Update book availability
  const book = dummyBooks.find(b => b.id === rental.book.id);
  if (book) book.availableCopies += 1;
  
  return { returnBook: rental };
};

// Favorite operations
export const getMyFavorites = async () => {
  await delay(400);
  return { myFavorites: [...dummyFavorites] };
};

export const addFavorite = async (bookId: string) => {
  await delay(500);
  
  const book = dummyBooks.find(b => b.id === bookId);
  if (!book) throw new Error('Book not found');
  
  // Check if already favorited
  if (dummyFavorites.some(fav => fav.book.id === bookId)) {
    throw new Error('Book already in favorites');
  }
  
  const favorite = {
    id: generateId(),
    book,
  };
  
  dummyFavorites.push(favorite);
  return { addFavorite: favorite };
};

export const removeFavorite = async (favoriteId: string) => {
  await delay(400);
  
  const index = dummyFavorites.findIndex(fav => fav.id === favoriteId);
  if (index === -1) throw new Error('Favorite not found');
  
  dummyFavorites.splice(index, 1);
  return { removeFavorite: true };
};