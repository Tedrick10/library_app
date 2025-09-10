import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import Loading from '../components/Loading';
import { getOverdueRentals } from '../api/dummyDataService';

const OverdueBooks: React.FC = () => {
  const [overdueBooks, setOverdueBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverdueBooks = async () => {
      try {
        const response = await getOverdueRentals();
        setOverdueBooks(response.overdueRentals);
      } catch (err) {
        setError('Failed to load overdue books');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueBooks();
  }, []);

  if (loading) return <Loading fullScreen />;
  if (error) return <View><Text>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={overdueBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.book.title}</Title>
              <Paragraph>by {item.book.author}</Paragraph>
              <Paragraph style={styles.dueDate}>
                Due: {new Date(item.dueDate).toLocaleDateString()}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Title style={styles.emptyText}>No overdue books</Title>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { marginBottom: 10 },
  dueDate: { color: 'red', marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 50 },
});

export default OverdueBooks;