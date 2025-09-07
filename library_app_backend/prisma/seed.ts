import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Create sample books
  const books = [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '9780743273565',
      publishedDate: new Date('1925-04-10'),
      genre: 'Classic',
      totalCopies: 5,
      availableCopies: 5,
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '9780061120084',
      publishedDate: new Date('1960-07-11'),
      genre: 'Fiction',
      totalCopies: 3,
      availableCopies: 3,
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '9780451524935',
      publishedDate: new Date('1949-06-08'),
      genre: 'Dystopian',
      totalCopies: 4,
      availableCopies: 4,
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      isbn: '9781503290563',
      publishedDate: new Date('1813-01-28'),
      genre: 'Romance',
      totalCopies: 2,
      availableCopies: 2,
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      isbn: '9780547928227',
      publishedDate: new Date('1937-09-21'),
      genre: 'Fantasy',
      totalCopies: 6,
      availableCopies: 6,
    },
    {
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      isbn: '9780316769488',
      publishedDate: new Date('1951-07-16'),
      genre: 'Coming-of-age',
      totalCopies: 3,
      availableCopies: 3,
    },
    {
      title: 'Brave New World',
      author: 'Aldous Huxley',
      isbn: '9780060850524',
      publishedDate: new Date('1932-08-30'),
      genre: 'Dystopian',
      totalCopies: 4,
      availableCopies: 4,
    },
  ];

  // Create books and store them with their IDs
  const createdBooks = [];
  for (const book of books) {
    const createdBook = await prisma.book.create({
      data: book,
    });
    createdBooks.push(createdBook);
  }

  // Create a sample user for testing
  const user = await prisma.user.create({
    data: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  // Create overdue rentals using the actual book IDs
  const overdueRentals = [
    {
      userId: user.id,
      bookId: createdBooks.find(b => b.isbn === '9780316769488')?.id || '', // The Catcher in the Rye
      rentedAt: new Date('2024-01-01'),
      dueDate: new Date('2024-01-15'), // Past due date
    },
    {
      userId: user.id,
      bookId: createdBooks.find(b => b.isbn === '9780060850524')?.id || '', // Brave New World
      rentedAt: new Date('2024-01-10'),
      dueDate: new Date('2024-01-20'), // Past due date
    },
  ];

  // Create overdue rentals
  for (const rental of overdueRentals) {
    if (rental.bookId) {
      await prisma.rental.create({
        data: rental,
      });
    }
  }

  // Update book available copies for the rented books
  await prisma.book.update({
    where: { isbn: '9780316769488' },
    data: { availableCopies: 2 }, // Decremented by 1
  });

  await prisma.book.update({
    where: { isbn: '9780060850524' },
    data: { availableCopies: 3 }, // Decremented by 1
  });

  // Create some favorites using the actual book IDs
  const favorites = [
    {
      userId: user.id,
      bookId: createdBooks.find(b => b.isbn === '9780451524935')?.id || '', // 1984
    },
    {
      userId: user.id,
      bookId: createdBooks.find(b => b.isbn === '9780547928227')?.id || '', // The Hobbit
    },
    {
      userId: user.id,
      bookId: createdBooks.find(b => b.isbn === '9780316769488')?.id || '', // The Catcher in the Rye
    },
  ];

  // Create favorites
  for (const favorite of favorites) {
    if (favorite.bookId) {
      await prisma.favorite.create({
        data: favorite,
      });
    }
  }

  console.log('Database seeded successfully!');
  console.log('- Created 7 books');
  console.log('- Created 1 test user');
  console.log('- Created 4 rentals (2 overdue)');
  console.log('- Created 3 favorites');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });