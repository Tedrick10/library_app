import { gql } from '@apollo/client';

export const BOOKS_QUERY = gql`
  query Books($first: Int, $after: String) {
    books(first: $first, after: $after) {
      edges {
        node {
          id
          title
          author
          coverImage
          availableCopies
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const BOOK_QUERY = gql`
  query Book($id: ID!) {
    book(id: $id) {
      id
      title
      author
      description
      coverImage
      availableCopies
      totalCopies
    }
  }
`;

export const OVERDUE_RENTALS_QUERY = gql`
  query OverdueRentals {
    overdueRentals {
      id
      book {
        id
        title
        author
        coverImage
      }
      dueDate
    }
  }
`;

export const MY_RENTALS_QUERY = gql`
  query MyRentals {
    myRentals {
      id
      book {
        id
        title
        author
        coverImage
      }
      rentedAt
      dueDate
      returnedAt
    }
  }
`;

export const MY_FAVORITES_QUERY = gql`
  query MyFavorites {
    myFavorites {
      id
      book {
        id
        title
        author
        coverImage
      }
    }
  }
`;

export const RENT_BOOK = gql`
  mutation RentBook($bookId: ID!) {
    rentBook(bookId: $bookId) {
      id
      book {
        id
        availableCopies
      }
      dueDate
    }
  }
`;

export const RETURN_BOOK = gql`
  mutation ReturnBook($rentalId: ID!) {
    returnBook(rentalId: $rentalId) {
      id
      book {
        id
        availableCopies
      }
      returnedAt
    }
  }
`;

export const ADD_FAVORITE = gql`
  mutation AddFavorite($bookId: ID!) {
    addFavorite(bookId: $bookId) {
      id
      book {
        id
      }
    }
  }
`;

export const REMOVE_FAVORITE = gql`
  mutation RemoveFavorite($favoriteId: ID!) {
    removeFavorite(favoriteId: $favoriteId)
  }
`;