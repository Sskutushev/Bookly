import React, { useState, useMemo } from 'react';
import { useMyBooks } from '../../features/my-books/api/use-my-books';
import { MyBookCard } from '../../entities/book/ui/MyBookCard/MyBookCard';
import { haptic } from '../../shared/lib/haptic';
import { useNavigate } from 'react-router-dom';

type Tab = 'All' | 'Reading' | 'Finished' | 'Purchased';

const MyBooksPage = () => {
  const { data: books, isLoading, error } = useMyBooks();
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const navigate = useNavigate();

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    switch (activeTab) {
      case 'Reading':
        return books.filter(b => b.status === 'reading');
      case 'Finished':
        return books.filter(b => b.status === 'finished');
      case 'Purchased':
        return books.filter(b => b.isPurchased && b.status !== 'finished' && b.status !== 'reading');
      case 'All':
      default:
        return books;
    }
  }, [books, activeTab]);

  const handleTabClick = (tab: Tab) => {
    haptic.selection();
    setActiveTab(tab);
  };
  
  const handleBookClick = (bookId: string) => {
    haptic.medium();
    navigate(`/reader/${bookId}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-4 text-center">Loading your books...</div>;
    }

    if (error) {
      return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
    }

    if (filteredBooks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-64">
                <span className="text-6xl mb-4">📖</span>
                <h2 className="text-xl font-semibold">No books in this section</h2>
                <p className="text-gray-500">Your purchased and read books will appear here.</p>
            </div>
        );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
        {filteredBooks.map(book => (
          <MyBookCard key={book.id} book={book} onClick={() => handleBookClick(book.id)} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📚 My Books</h1>
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {(['All', 'Reading', 'Finished', 'Purchased'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      {renderContent()}
    </div>
  );
};

export default MyBooksPage;
