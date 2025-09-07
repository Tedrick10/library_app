import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/lib/schema';
import { resolvers } from '@/lib/graphql';
import { verifyToken } from '@/lib/firebase';
import { IncomingHttpHeaders } from 'http';

// Define our User type explicitly
type User = {
  id: string;
  email: string;
  name?: string;  // Changed from string | null to string | undefined
  photoURL?: string;  // Changed from string | null to string | undefined
  createdAt: Date;
  updatedAt: Date;
};

// Define our Context type explicitly
interface Context {
  user?: User;
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (request): Promise<Context> => {
    try {
      // Safely extract the token
      let token = '';
      
      if (request && typeof request === 'object' && 'headers' in request && request.headers) {
        const headers = request.headers as IncomingHttpHeaders;
        const authHeader = headers.authorization;
        
        if (typeof authHeader === 'string') {
          token = authHeader;
        } else if (Array.isArray(authHeader)) {
          token = authHeader[0];
        }
      }
      
      if (token) {
        const user = await verifyToken(token);
        
        // Transform the user object to convert null to undefined
        if (user) {
          const transformedUser: User = {
            id: user.id,
            email: user.email,
            name: user.name !== null ? user.name : undefined,  // Convert null to undefined
            photoURL: user.photoURL !== null ? user.photoURL : undefined,  // Convert null to undefined
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
          
          return { user: transformedUser };
        }
      }
    } catch (error) {
      console.error('Error in context function:', error);
    }
    
    return { user: undefined };
  },
});

export const GET = handler;
export const POST = handler;