import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useStore } from '../state/store';
import { getBook, rentBook, returnBook } from '../api/dummyDataService';
import Loading from '../components/Loading';

type RootStackParamList = {
  BookDetail: { bookId: string };
};
type BookDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookDetail'>;

interface BookDetailProps {
  route: {
    params: {
      bookId: string;
    };
  };
}

const BookDetail: React.FC<BookDetailProps> = ({ route }) => {
  const { bookId } = route.params;
  const navigation = useNavigation<BookDetailNavigationProp>();
  
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renting, setRenting] = useState(false);
  const [returning, setReturning] = useState(false);
  
  const user = useStore((state) => state.user);
  const favorites = useStore((state) => state.favorites);
  const addFavorite = useStore((state) => state.addFavorite);
  const removeFavorite = useStore((state) => state.removeFavorite);
  const isFavorite = bookId ? favorites.includes(bookId) : false;

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await getBook(bookId);
        setBook(response.book);
      } catch (err) {
        setError('Failed to load book details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  useEffect(() => {
    if (book?.title) {
      navigation.setOptions({ title: book.title });
    }
  }, [navigation, book?.title]);

  const handleRent = async () => {
    if (!book) return;
    
    setRenting(true);
    try {
      await rentBook(book.id);
      // Update local book state
      setBook((prev: any) => ({
        ...prev!,
        availableCopies: prev!.availableCopies - 1
      }));
      Alert.alert('Success', 'Book rented successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to rent book');
    } finally {
      setRenting(false);
    }
  };

  const handleReturn = async () => {
    if (!book) return;
    
    setReturning(true);
    try {
      // In a real app, you would need the rental ID
      // For demo, we'll just simulate returning the book
      await returnBook('dummy-rental-id');
      // Update local book state
      setBook((prev: any) => ({
        ...prev!,
        availableCopies: prev!.availableCopies + 1
      }));
      Alert.alert('Success', 'Book returned successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to return book');
    } finally {
      setReturning(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!bookId) return;
    
    if (isFavorite) {
      removeFavorite(bookId);
      Alert.alert('Removed', 'Book removed from favorites');
    } else {
      addFavorite(bookId);
      Alert.alert('Added', 'Book added to favorites');
    }
  };

  if (loading) return <Loading fullScreen />;
  if (error || !book) return <View><Text>{error || 'Book not found'}</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Cover source={{ uri: book.coverImage || 'https://via.placeholder.com/400' }} />
        <Card.Content>
          <Title>{book.title || 'Unknown Title'}</Title>
          <Paragraph>by {book.author || 'Unknown Author'}</Paragraph>
          <Paragraph style={styles.description}>
            {book.description || 'No description available'}
          </Paragraph>
          
          <Paragraph style={styles.copies}>
            Available: {book.availableCopies ?? 0} of {book.totalCopies ?? 0}
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          {book.availableCopies > 0 ? (
            <Button 
              mode="contained" 
              onPress={handleRent}
              loading={renting}
              disabled={renting}
            >
              Rent Book
            </Button>
          ) : (
            <Button 
              mode="contained" 
              onPress={handleReturn}
              loading={returning}
              disabled={returning}
            >
              Return Book
            </Button>
          )}
          
          <Button 
            mode={isFavorite ? "contained" : "outlined"} 
            onPress={handleToggleFavorite}
            icon={isFavorite ? "heart" : "heart-outline"}
          >
            {isFavorite ? 'Remove Favorite' : 'Add Favorite'}
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  description: {
    marginTop: 10,
    marginBottom: 10,
  },
  copies: {
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default BookDetail;