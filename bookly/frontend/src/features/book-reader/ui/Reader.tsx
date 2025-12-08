import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { useBookRead } from '../api/use-book-read';
import { useProgressMutation } from '../api/use-progress';
import { useDebounce } from '../../../shared/lib/use-debounce';
import { haptic } from '../../../shared/lib/haptic';

// pdf.js worker configuration
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Reader = () => {
    const { bookId } = useParams<{ bookId: string }>();
    const { data: bookData, isLoading, error } = useBookRead(bookId!);
    const progressMutation = useProgressMutation();

    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [progress, setProgress] = useState<number>(0);

    const debouncedPage = useDebounce(pageNumber, 1000);

    useEffect(() => {
        if (numPages > 0) {
            const currentProgress = Math.round((debouncedPage / numPages) * 100);
            setProgress(currentProgress);
            progressMutation.mutate({ bookId: bookId!, currentPage: debouncedPage, progress: currentProgress });
        }
    }, [debouncedPage, numPages, bookId, progressMutation]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    const goToPrevPage = () => {
        if (pageNumber > 1) {
            haptic.selection();
            setPageNumber(pageNumber - 1);
        }
    };

    const goToNextPage = () => {
        if (pageNumber < numPages) {
            haptic.selection();
            setPageNumber(pageNumber + 1);
        }
    };
    
    if (isLoading) return <div className="p-4 text-center">Loading Book...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Error loading book: {error.message}</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
            <header className="p-2 text-center bg-white dark:bg-gray-800 shadow-md">
                <h1 className="font-bold truncate">{bookData?.title}</h1>
                <p className="text-sm text-gray-500">{pageNumber} of {numPages}</p>
            </header>

            <main className="flex-grow overflow-hidden flex justify-center items-center">
                 <Document
                    file={bookData?.pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={console.error}
                    loading="Loading PDF..."
                >
                    <Page pageNumber={pageNumber} renderTextLayer={false} />
                </Document>
            </main>
            
            <footer className="p-2 bg-white dark:bg-gray-800 shadow-inner">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="px-4 py-2 rounded-lg disabled:opacity-50">
                        Previous
                    </button>
                    <span>Page {pageNumber} of {numPages}</span>
                    <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="px-4 py-2 rounded-lg disabled:opacity-50">
                        Next
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Reader;
