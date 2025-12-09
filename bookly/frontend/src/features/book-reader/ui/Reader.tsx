import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { motion } from 'framer-motion';

// API
import { 
  getBookForReading, 
  getReadingProgress, 
  updateReadingProgress 
} from '../../api/reader-api';

// Components
import { tg } from '../../../shared/lib/telegram-app';
import TelegramBackButton from '../../../widgets/TelegramBackButton/TelegramBackButton';
import SettingsModal from './SettingsModal';

// Types
import { Book } from '../../../../entities/book/model/types';

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Reader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  
  const documentRef = useRef<HTMLDivElement>(null);

  // Fetch book and progress data
  const { data: book, isLoading: bookLoading } = useQuery<Book>({
    queryKey: ['book', bookId],
    queryFn: () => getBookForReading(bookId!),
    enabled: !!bookId,
  });

  const { data: progress } = useQuery({
    queryKey: ['reading-progress', bookId],
    queryFn: () => getReadingProgress(bookId!),
    enabled: !!bookId,
  });

  // Update page number when progress changes
  useEffect(() => {
    if (progress && progress.currentPage) {
      setPageNumber(progress.currentPage);
    }
  }, [progress]);

  // Mutation for updating reading progress
  const updateProgressMutation = useMutation({
    mutationFn: ({ bookId, currentPage, progress }: { bookId: string, currentPage: number, progress: number }) => 
      updateReadingProgress(bookId, currentPage, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', bookId] });
    },
  });

  // Debounced progress update
  useEffect(() => {
    if (!numPages || !bookId) return;

    const progress = numPages > 0 ? (pageNumber / numPages) * 100 : 0;

    const timeoutId = setTimeout(() => {
      updateProgressMutation.mutate({
        bookId,
        currentPage: pageNumber,
        progress,
      });
    }, 1000); // Update progress after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [pageNumber, bookId, numPages, updateProgressMutation]);

  // Handle PDF load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  // Navigation functions
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  // Handle swipe for mobile navigation
  const handleTouchStart = useRef(0);
  const handleTouchMove = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleTouchMove.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!handleTouchStart.current || !handleTouchMove.current) return;

    const diff = handleTouchStart.current - handleTouchMove.current;

    // If the difference is significant, navigate
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - next page
        goToNextPage();
      } else {
        // Swipe right - previous page
        goToPrevPage();
      }
    }
  };

  // Apply theme
  useEffect(() => {
    if (documentRef.current) {
      documentRef.current.className = '';
      switch (theme) {
        case 'dark':
          documentRef.current.classList.add('dark-theme');
          break;
        case 'sepia':
          documentRef.current.classList.add('sepia-theme');
          break;
        default:
          documentRef.current.classList.add('light-theme');
      }
    }
  }, [theme]);

  if (bookLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-light dark:bg-bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark mx-auto"></div>
          <p className="mt-4 text-text-primary-light dark:text-text-primary-dark">Загрузка книги...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-primary-light dark:text-text-primary-dark"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <TelegramBackButton />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 backdrop-blur-md bg-white/80 dark:bg-bg-dark/80 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-light dark:text-primary-dark"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </button>
          
          <h1 className="text-sm font-medium truncate max-w-[60%]">
            {book?.title}
          </h1>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-primary-light dark:text-primary-dark"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* PDF Viewer */}
      <div 
        ref={documentRef}
        className="pt-16 pb-20 h-[calc(100vh-8rem)] flex items-center justify-center bg-bg-light dark:bg-bg-dark"
        style={{ 
          fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : 
                     fontFamily === 'mono' ? 'Monaco, monospace' : 'Arial, sans-serif'
        }}
      >
        {book?.contentUrl && (
          <Document
            file={book.contentUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-text-primary-light dark:text-text-primary-dark">Загрузка документа...</div>}
            error={<div className="text-red-500">Ошибка загрузки документа</div>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              width={documentRef.current ? documentRef.current.clientWidth * 0.8 : 500}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg rounded"
            />
          </Document>
        )}
      </div>

      {/* Footer with navigation and progress */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className={`p-2 rounded-full ${pageNumber <= 1 ? 'text-gray-400' : 'text-primary-light dark:text-primary-dark'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="text-text-primary-light dark:text-text-primary-dark">
              Страница {pageNumber} из {numPages}
            </span>
            
            <button 
              onClick={goToNextPage}
              disabled={numPages ? pageNumber >= numPages : true}
              className={`p-2 rounded-full ${(numPages ? pageNumber >= numPages : true) ? 'text-gray-400' : 'text-primary-light dark:text-primary-dark'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-primary-light dark:bg-primary-dark h-1.5 rounded-full" 
              style={{ width: `${numPages ? (pageNumber / numPages) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          scale={scale}
          setScale={setScale}
          theme={theme}
          setTheme={setTheme}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
        />
      )}
    </div>
  );
};

export default Reader;