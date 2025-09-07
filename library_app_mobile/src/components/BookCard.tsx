import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Avatar } from 'react-native-paper';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  availableCopies: number;
}

interface BookCardProps {
  book: Book;
  onPress: (bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(book.id)}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Avatar.Image 
            size={60} 
            source={{ uri: book.coverImage || 'https://via.placeholder.com/60' }} 
          />
          <View style={styles.info}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
            <Text style={styles.status}>
              {book.availableCopies > 0 ? 'Available' : 'Rented Out'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    marginLeft: 15,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  author: {
    color: 'gray',
  },
  status: {
    marginTop: 5,
    color: 'green',
  },
});

export default BookCard;