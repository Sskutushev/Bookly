import { useInfiniteQuery } from '@tanstack/react-query';
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

interface BooksResponse {
  books: Book[];
  total: number;
  currentPage: number;
  totalPages: number;
}

const fetchBooks = async ({ pageParam = 1, genre, search }: { pageParam?: number; genre?: string; search?: string }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Filter mock books based on search and genre
  let filteredBooks = [...mockBooks];

  if (search) {
    filteredBooks = filteredBooks.filter(book =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (genre) {
    filteredBooks = filteredBooks.filter(book =>
      book.genres?.some(g => g.name.toLowerCase() === genre.toLowerCase())
    );
  }

  // Pagination
  const start = (pageParam - 1) * 12;
  const end = start + 12;
  const books = filteredBooks.slice(start, end);

  const response: BooksResponse = {
    books,
    total: filteredBooks.length,
    currentPage: pageParam,
    totalPages: Math.ceil(filteredBooks.length / 12)
  };

  return response;
};

export const useBooks = (genre?: string, search?: string) => {
  return useInfiniteQuery({
    queryKey: ['books', genre, search],
    queryFn: ({ pageParam }) => fetchBooks({ pageParam, genre, search }),
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};