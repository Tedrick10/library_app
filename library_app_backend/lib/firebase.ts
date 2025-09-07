import admin from 'firebase-admin';
import { prisma } from './prisma'; 

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;

export const verifyToken = async (token: string) => {
  if (!token) return null;
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userRecord = await auth.getUser(decodedToken.uid);
    
    // Get user data from database
    let user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
    });
    
    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          id: decodedToken.uid,
          email: userRecord.email || '',
          name: userRecord.displayName || '',
          photoURL: userRecord.photoURL || '',
        },
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};