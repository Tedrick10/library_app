import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BookCard from '../components/BookCard';
import Loading from '../components/Loading';
import { getBooks } from '../api/dummyDataService';

type RootStackParamList = {
  BookDetail: { bookId: string };
};
type BookCatalogNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookDetail'>;

interface BookCatalogProps {
  navigation: BookCatalogNavigationProp;
}

const BookCatalog: React.FC<BookCatalogProps> = ({ navigation }) => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await getBooks();
        setBooks(response.books.edges.map(edge => edge.node));
      } catch (err) {
        setError('Failed to load books');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  if (loading) return <Loading fullScreen />;
  if (error) return <View><Text>{error}</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={books}
        renderItem={({ item }) => <BookCard book={item} onPress={handleBookPress} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default BookCatalog;