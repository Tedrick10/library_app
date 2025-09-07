import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    photoURL: String
    createdAt: String!
    updatedAt: String!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    description: String
    coverImage: String
    isbn: String!
    publishedDate: String
    genre: String
    totalCopies: Int!
    availableCopies: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Rental {
    id: ID!
    userId: ID!
    bookId: ID!
    rentedAt: String!
    dueDate: String!
    returnedAt: String
    user: User!
    book: Book!
  }

  type Favorite {
    id: ID!
    userId: ID!
    bookId: ID!
    createdAt: String!
    book: Book!
  }

  type Query {
    me: User
    books(first: Int, after: String): BookConnection!
    book(id: ID!): Book
    myRentals: [Rental!]!
    overdueRentals: [Rental!]!
    myFavorites: [Favorite!]!
  }

  type BookConnection {
    edges: [BookEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type BookEdge {
    node: Book!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type Mutation {
    rentBook(bookId: ID!): Rental!
    returnBook(rentalId: ID!): Rental!
    addFavorite(bookId: ID!): Favorite!
    removeFavorite(favoriteId: ID!): Boolean!
    syncOfflineData(rentals: [RentalInput!], favorites: [FavoriteInput!]): SyncPayload!
  }

  input RentalInput {
    id: ID!
    bookId: ID!
    rentedAt: String!
    dueDate: String!
    returnedAt: String
  }

  input FavoriteInput {
    id: ID!
    bookId: ID!
    createdAt: String!
  }

  type SyncPayload {
    success: Boolean!
    message: String!
  }
`;