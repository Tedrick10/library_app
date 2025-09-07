import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { useQuery } from '@apollo/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BOOKS_QUERY } from '../api/fragments';
import BookCard from '../components/BookCard';
import Loading from '../components/Loading';

type RootStackParamList = {
  BookDetail: { bookId: string };
};

type BookCatalogNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookDetail'>;

interface BookCatalogProps {
  navigation: BookCatalogNavigationProp;
}

const BookCatalog: React.FC<BookCatalogProps> = ({ navigation }) => {
  const [loadingMore, setLoadingMore] = useState(false);
  const { data, fetchMore, networkStatus } = useQuery(BOOKS_QUERY, {
    variables: { first: 10 },
    notifyOnNetworkStatusChange: true,
  });

  const handleLoadMore = () => {
    if (data?.books.pageInfo.hasNextPage && !loadingMore) {
      setLoadingMore(true);
      fetchMore({
        variables: {
          after: data.books.pageInfo.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          return {
            books: {
              ...fetchMoreResult.books,
              edges: [
                ...prev.books.edges,
                ...fetchMoreResult.books.edges,
              ],
            },
          };
        },
      }).finally(() => setLoadingMore(false));
    }
  };

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  if (networkStatus === 1) {
    return <Loading fullScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data?.books.edges || []}
        renderItem={({ item }) => <BookCard book={item.node} onPress={handleBookPress} />}
        keyExtractor={(item) => item.node.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => loadingMore ? <Loading /> : null}
      />
    </View>
  );
};

export default BookCatalog;