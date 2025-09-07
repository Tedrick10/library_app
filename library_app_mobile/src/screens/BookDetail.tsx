import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Title, Paragraph, Button, Avatar } from 'react-native-paper';
import { BOOK_QUERY, RENT_BOOK, RETURN_BOOK, ADD_FAVORITE, REMOVE_FAVORITE } from '../api/fragments';
import { useStore } from '../state/store';
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
  const { data, loading, error } = useQuery(BOOK_QUERY, { 
    variables: { id: bookId },
    skip: !bookId
  });
  
  const [rentBook] = useMutation(RENT_BOOK);
  const [returnBook] = useMutation(RETURN_BOOK);
  const [addFavorite] = useMutation(ADD_FAVORITE);
  const [removeFavorite] = useMutation(REMOVE_FAVORITE);
  
  const user = useStore((state) => state.user);
  const favorites = useStore((state) => state.favorites);
  const addFavoriteLocal = useStore((state) => state.addFavorite);
  const removeFavoriteLocal = useStore((state) => state.removeFavorite);
  const isFavorite = bookId ? favorites.includes(bookId) : false;

  const handleRent = () => {
    if (!bookId) return;
    rentBook({ variables: { bookId: bookId } });
  };

  const handleReturn = () => {
    if (!bookId) return;
    returnBook({ variables: { rentalId: bookId } });
  };

  const handleToggleFavorite = () => {
    if (!bookId) return;
    
    if (isFavorite) {
      removeFavorite({ variables: { favoriteId: bookId } });
      removeFavoriteLocal(bookId);
    } else {
      addFavorite({ variables: { bookId: bookId }});
      addFavoriteLocal(bookId);
    }
  };

  useEffect(() => {
    if (data?.book?.title) {
      navigation.setOptions({ title: data.book.title });
    }
  }, [navigation, data?.book?.title]);

  if (loading) return <Loading fullScreen />;
  
  if (error) {
    return (
      <View style={styles.container}>
        <Title>Error loading book details</Title>
      </View>
    );
  }
  
  if (!data?.book) {
    return (
      <View style={styles.container}>
        <Title>Book not found</Title>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Cover source={{ uri: data.book.coverImage || 'https://via.placeholder.com/400' }} />
        <Card.Content>
          <Title>{data.book.title || 'Unknown Title'}</Title>
          <Paragraph>by {data.book.author || 'Unknown Author'}</Paragraph>
          <Paragraph style={styles.description}>
            {data.book.description || 'No description available'}
          </Paragraph>
          
          <Paragraph style={styles.copies}>
            Available: {data.book.availableCopies ?? 0} of {data.book.totalCopies ?? 0}
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          {data.book.availableCopies && data.book.availableCopies > 0 ? (
            <Button mode="contained" onPress={handleRent}>Rent Book</Button>
          ) : (
            <Button mode="contained" onPress={handleReturn}>Return Book</Button>
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