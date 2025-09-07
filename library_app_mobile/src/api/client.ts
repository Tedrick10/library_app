import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { auth } from '../../firebaseConfig';

const httpLink = new HttpLink({
  uri: 'http://localhost:3000/api/graphql',
});

// Enhanced auth link with better error handling
const authLink = setContext(async (_, { headers }) => {
  const currentUser = auth.currentUser;
  
  if (currentUser) {
    try {
      // Force token refresh to ensure we have a valid token
      const token = await currentUser.getIdToken(true);
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
        },
      };
    } catch (error) {
      console.error('Error getting ID token:', error);
      // Clear invalid token and headers
      await auth.signOut();
      return { headers };
    }
  }
  return { headers };
});

// Enhanced error link with authentication handling
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      console.error(`[GraphQL error]: Message: ${error.message}, Location: ${error.locations}, Path: ${error.path}`);
      
      // Handle authentication errors
      if (error.message === 'Authentication required' || error.extensions?.code === 'UNAUTHENTICATED') {
        // Clear invalid credentials
        auth.signOut().catch(console.error);
        
        // Optionally redirect to login screen
        // You'll need to implement navigation handling here
        console.warn('Authentication required. Redirecting to login...');
      }
    }
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle 401 Unauthorized errors
    // if (networkError.statusCode === 401) {
    //   auth.signOut().catch(console.error);
    //   console.warn('Unauthorized access. Redirecting to login...');
    // }
  }
});

// Optional: Add retry logic for authentication errors
const retryLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const context = operation.getContext();
    const { response: { headers } = {} } = context;
    
    // Check for token expiration header if your API sends one
    if (headers?.get('token-expired') === 'true') {
      console.warn('Token expired, refreshing...');
      // You could implement token refresh logic here
    }
    
    return response;
  });
});

export const client = new ApolloClient({
  link: from([errorLink, retryLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});