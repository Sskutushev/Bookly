import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api';
import { Book } from '../ui/BookCard/BookCard';

// Mock data for testing
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Ретроградная Венера',
    author: 'Сара Джио',
    coverUrl: '/covers/ретрограная.jpg',
    description: 'В новом романе "Ретроградная Венера" Сара Джио создает захватывающую историю любви, в которую она вплетает элементы астрологии и мистики. В центре сюжета – женщина, чья жизнь меняется после встречи с загадочным мужчиной, появление которого совпадает с ретроградным движением Венеры.',
    price: 149,
    isFree: false,
    isPurchased: false, // Not purchased by default
    genres: [
      { id: '1', name: 'Роман' },
      { id: '2', name: 'Мистика' },
      { id: '3', name: 'Астрология' },
    ],
    pageCount: 320,
  },
  {
    id: '2',
    title: 'Королёк – птичка певчая',
    author: 'Гюнтекин Р. Н.',
    coverUrl: '/covers/певчих.jpg',
    description: 'История любви в условиях социальной нестабильности. Роман "Королёк – птичка певчая" рассказывает о людях, чьи судьбы переплетаются в сложные времена. Это история о том, как любовь способна преодолевать любые преграды и как важно сохранять человечность в любых обстоятельствах.',
    price: 0,
    isFree: true,
    isPurchased: true, // Free books are considered purchased
    genres: [
      { id: '4', name: 'Роман' },
      { id: '5', name: 'Драма' },
      { id: '6', name: 'Историческая проза' },
    ],
    pageCount: 450,
  }
];

const fetchBook = async (bookId: string) => {
  const foundBook = mockBooks.find(book => book.id === bookId);
  if (foundBook) {
    // Add a slight delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return foundBook;
  }

  // If not found in mock data, try actual API
  try {
    const { data } = await api.get<Book>(`/books/${bookId}`);
    return data;
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

export const useBook = (bookId: string) => {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: () => fetchBook(bookId),
    enabled: !!bookId, // Only run the query if bookId is not null
  });
};