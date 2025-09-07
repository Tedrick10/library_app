import { GraphQLResolveInfo } from 'graphql';
import { PrismaClient } from '@prisma/client';
import client from './redis';

const prisma = new PrismaClient();

// Define types for our models
type User = {
  id: string;
  email: string;
  name?: string | null;
  photoURL?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Book = {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  coverImage?: string | null;
  isbn: string;
  publishedDate?: Date | null;
  genre?: string | null;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
};

type Rental = {
  id: string;
  userId: string;
  bookId: string;
  rentedAt: Date;
  dueDate: Date;
  returnedAt?: Date | null;
  user: User;
  book: Book;
};

type Favorite = {
  id: string;
  userId: string;
  bookId: string;
  createdAt: Date;
  book: Book;
};

type BookEdge = {
  node: Book;
  cursor: string;
};

type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
};

type BookConnection = {
  edges: BookEdge[];
  pageInfo: PageInfo;
  totalCount: number;
};

type RentalInput = {
  id: string;
  bookId: string;
  rentedAt: string;
  dueDate: string;
  returnedAt?: string;
};

type FavoriteInput = {
  id: string;
  bookId: string;
  createdAt: string;
};

type SyncPayload = {
  success: boolean;
  message: string;
};

// Context type
type Context = {
  user?: User;
};

// Resolver functions
export const resolvers = {
  Query: {
    me: async (_: any, __: any, { user }: Context) => {
      if (!user) throw new Error('Authentication required');
      
      // Convert null values to undefined for GraphQL
      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        photoURL: user.photoURL || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    },
    
    books: async (_: any, { first = 10, after }: { first?: number; after?: string }, { user }: Context) => {
      // Check cache first
      const cacheKey = `books:${first}:${after || 'first'}`;
      const cachedData = await client.get(cacheKey);
      
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      // If not in cache, fetch from database
      let skip = 0;
      if (after) {
        skip = parseInt(after) + 1;
      }
      
      const books = await prisma.book.findMany({
        take: first + 1, // Get one extra to check if there's a next page
        skip,
        orderBy: { createdAt: 'desc' },
      });
      
      const hasNextPage = books.length > first;
      const edges = hasNextPage ? books.slice(0, -1) : books;
      
      const result: BookConnection = {
        edges: edges.map((book, index) => ({
          node: {
            id: book.id,
            title: book.title,
            author: book.author,
            description: book.description || undefined,
            coverImage: book.coverImage || undefined,
            isbn: book.isbn,
            publishedDate: book.publishedDate || undefined,
            genre: book.genre || undefined,
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt,
          },
          cursor: (skip + index).toString(),
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage: skip > 0,
          startCursor: skip > 0 ? skip.toString() : undefined,
          endCursor: (skip + edges.length - 1).toString(),
        },
        totalCount: await prisma.book.count(),
      };
      
      // Cache the result using the new Redis API
      await client.set(cacheKey, JSON.stringify(result), { EX: 3600 }); // Cache for 1 hour
      
      return result;
    },
    
    book: async (_: any, { id }: { id: string }, { user }: Context) => {
      // Check cache first
      const cacheKey = `book:${id}`;
      const cachedData = await client.get(cacheKey);
      
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      // If not in cache, fetch from database
      const book = await prisma.book.findUnique({
        where: { id },
      });
      
      if (!book) {
        throw new Error('Book not found');
      }
      
      // Convert null values to undefined for GraphQL
      const transformedBook = {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description || undefined,
        coverImage: book.coverImage || undefined,
        isbn: book.isbn,
        publishedDate: book.publishedDate || undefined,
        genre: book.genre || undefined,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      };
      
      // Cache the result using the new Redis API
      await client.set(cacheKey, JSON.stringify(transformedBook), { EX: 3600 }); // Cache for 1 hour
      
      return transformedBook;
    },
    
    myRentals: async (_: any, __: any, { user }: Context) => {
      if (!user) throw new Error('Authentication required');
      
      const rentals = await prisma.rental.findMany({
        where: { userId: user.id },
        include: {
          user: true,
          book: true,
        },
        orderBy: { rentedAt: 'desc' },
      });
      
      // Convert null values to undefined for GraphQL
      return rentals.map(rental => ({
        ...rental,
        book: {
          ...rental.book,
          description: rental.book.description || undefined,
          coverImage: rental.book.coverImage || undefined,
          publishedDate: rental.book.publishedDate || undefined,
          genre: rental.book.genre || undefined,
        }
      }));
    },
    
    overdueRentals: async (_: any, __: any, { user }: Context) => {
      if (!user) throw new Error('Authentication required');
      
      const rentals = await prisma.rental.findMany({
        where: {
          userId: user.id,
          dueDate: { lt: new Date() },
          returnedAt: null,
        },
        include: {
          user: true,
          book: true,
        },
      });
      
      // Convert null values to undefined for GraphQL
      return rentals.map(rental => ({
        ...rental,
        book: {
          ...rental.book,
          description: rental.book.description || undefined,
          coverImage: rental.book.coverImage || undefined,
          publishedDate: rental.book.publishedDate || undefined,
          genre: rental.book.genre || undefined,
        }
      }));
    },
    
    myFavorites: async (_: any, __: any, { user }: Context) => {
      if (!user) throw new Error('Authentication required');
      
      const favorites = await prisma.favorite.findMany({
        where: { userId: user.id },
        include: {
          book: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      // Convert null values to undefined for GraphQL
      return favorites.map(favorite => ({
        ...favorite,
        book: {
          ...favorite.book,
          description: favorite.book.description || undefined,
          coverImage: favorite.book.coverImage || undefined,
          publishedDate: favorite.book.publishedDate || undefined,
          genre: favorite.book.genre || undefined,
        }
      }));
    }
  },
  
  Mutation: {
    rentBook: async (_: any, { bookId }: { bookId: string }, { user }: Context) => {
      if (!user) throw new Error('Authentication required');
      
      // Check if book exists and is available
      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });
      
      if (!book) {
        throw new Error('Book not found');
      }
      
      if (book.availableCopies <= 0) {
        throw new Error('Book is not available for rent');
      }
      
      // Check if user already has an active rental for this book
      const existingRental = await prisma.rental.findFirst({
        where: {
          userId: user.id,
          bookId,
          returnedAt: null,
        },
      });
      
      if (existingRental) {
        throw new Error('You already have an active rental for this book');
      }
      
      // Create rental
      const rentedAt = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now
      
      const rental = await prisma.rental.create({
        data: {
          userId: user.id,
          bookId,
          rentedAt,
          dueDate,
        },
        include: {
          user: true,
          book: true,
        },
      });
      
      // Update book available copies
      await prisma.book.update({
        where: { id: bookId },
        data: {
          availableCopies: {
            decrement: 1,
          },
          updatedAt: new Date(),
        },
      });
      
      // Invalidate cache for this book
      await client.del(`book:${bookId}`);
      
      // Convert null values to undefined for GraphQL
      return {
        ...rental,
        book: {
          ...rental.book,
          description: rental.book.description || undefined,
          coverImage: rental.book.coverImage || undefined,
          publishedDate: rental.book.publishedDate || undefined,
          genre: rental.book.genre || undefined,
        }
      };
    },
    
    returnBook: async (_: any, { rentalId }: { rentalId: string }, { user }: Context) => {
      if (!user) throw new Error('Authentication required');
      
      const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: {
          book: true,
        },
      });
      
      if (!rental) {
        throw new Error('Rental not found');
      }
      
      if (rental.userId !== user.id) {
        throw new Error('You are not authorized to return this book');
      }
      
      if (rental.returnedAt) {
        throw new Error('Book has already been returned');
      }
      
      // Update rental
      const updatedRental = await prisma.rental.update({
        where: { id: rentalId },
        data: {
          returnedAt: new Date(),
        },
        include: {
          user: true,
          book: true,
        },
      });
      
      // Update book available copies
      await prisma.book.update({
        where: { id: rental.bookId },
        data: {
          availableCopies: {
            increment: 1,
          },
          updatedAt: new Date(),
        },
      });
      
      // Invalidate cache for this book
      await client.del(`book:${rental.bookId}`);
      
      // Convert null values to undefined for GraphQL
      return {
        ...updatedRental,
        book: {
          ...updatedRental.book,
          description: updatedRental.book.description || undefined,
          coverImage: updatedRental.book.coverImage || undefined,
          publishedDate: updatedRental.book.publishedDate || undefined,
          genre: updatedRental.book.genre || undefined,
        }
      };
    },
    
    addFavorite: async (_: any, { bookId }: { bookId: string }, { user }: Context) => {
      if (!user) throw new Error('Authentication required');
      
      // Check if book exists
      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });
      
      if (!book) {
        throw new Error('Book not found');
      }
      
      // Check if already favorited
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId,
          },
        },
      });
      
      if (existingFavorite) {
        throw new Error('Book is already in your favorites');
      }
      
      // Add favorite
      const favorite = await prisma.favorite.create({
        data: {
          userId: user.id,
          bookId,
        },
        include: {
          book: true,
        },
      });
      
      // Convert null values to undefined for GraphQL
      return {
        ...favorite,
        book: {
          ...favorite.book,
          description: favorite.book.description || undefined,
          coverImage: favorite.book.coverImage || undefined,
          publishedDate: favorite.book.publishedDate || undefined,
          genre: favorite.book.genre || undefined,
        }
      };
    },
    
    removeFavorite: async (_: any, { favoriteId }: { favoriteId: string }, { user }: Context) => {
      if (!user) throw new Error('Authentication required');
      
      const favorite = await prisma.favorite.findUnique({
        where: { id: favoriteId },
      });
      
      if (!favorite) {
        throw new Error('Favorite not found');
      }
      
      if (favorite.userId !== user.id) {
        throw new Error('You are not authorized to remove this favorite');
      }
      
      await prisma.favorite.delete({
        where: { id: favoriteId },
      });
      
      return true;
    },
    
    syncOfflineData: async (_: any, { rentals, favorites }: { rentals: RentalInput[]; favorites: FavoriteInput[] }, { user }: Context) => {
      if (!user) throw new Error('Authentication required');
      
      // Sync rentals
      for (const rental of rentals) {
        // Check if rental already exists
        const existingRental = await prisma.rental.findUnique({
          where: { id: rental.id },
        });
        
        if (!existingRental) {
          // Create new rental
          await prisma.rental.create({
            data: {
              id: rental.id,
              userId: user.id,
              bookId: rental.bookId,
              rentedAt: new Date(rental.rentedAt),
              dueDate: new Date(rental.dueDate),
              returnedAt: rental.returnedAt ? new Date(rental.returnedAt) : null,
            },
          });
          
          // Update book available copies if not returned
          if (!rental.returnedAt) {
            await prisma.book.update({
              where: { id: rental.bookId },
              data: {
                availableCopies: {
                  decrement: 1,
                },
                updatedAt: new Date(),
              },
            });
            
            // Invalidate cache for this book
            await client.del(`book:${rental.bookId}`);
          }
        } else {
          // Update existing rental
          await prisma.rental.update({
            where: { id: rental.id },
            data: {
              returnedAt: rental.returnedAt ? new Date(rental.returnedAt) : null,
            },
          });
          
          // If rental was returned offline, update book available copies
          if (rental.returnedAt && !existingRental.returnedAt) {
            await prisma.book.update({
              where: { id: rental.bookId },
              data: {
                availableCopies: {
                  increment: 1,
                },
                updatedAt: new Date(),
              },
            });
            
            // Invalidate cache for this book
            await client.del(`book:${rental.bookId}`);
          }
        }
      }
      
      // Sync favorites
      for (const favorite of favorites) {
        // Check if favorite already exists
        const existingFavorite = await prisma.favorite.findUnique({
          where: { id: favorite.id },
        });
        
        if (!existingFavorite) {
          // Create new favorite
          await prisma.favorite.create({
            data: {
              id: favorite.id,
              userId: user.id,
              bookId: favorite.bookId,
              createdAt: new Date(favorite.createdAt),
            },
          });
        }
      }
      
      return {
        success: true,
        message: 'Offline data synced successfully',
      };
    }
  }
};