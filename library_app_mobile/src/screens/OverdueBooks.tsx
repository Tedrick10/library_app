import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client';
import { Card, Title, Paragraph, useTheme } from 'react-native-paper';
import { OVERDUE_RENTALS_QUERY } from '../api/fragments';
import Loading from '../components/Loading';

const OverdueBooks: React.FC = () => {
  const { data, loading } = useQuery(OVERDUE_RENTALS_QUERY);
  const theme = useTheme();

  if (loading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.overdueRentals || []}
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
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    marginBottom: 10,
  },
  dueDate: {
    color: 'red',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
  },
});

export default OverdueBooks;