
'use client';

import { useState, useEffect, useCallback } from 'react';
import BookSearchForm from '@/components/book/BookSearchForm';
import BookCard from '@/components/book/BookCard';
import type { Book } from '@/types/book';
import { searchBooks } from '@/lib/book-api';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const RESULTS_PER_PAGE = 20;

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchBooks = useCallback(async (query: string, page: number) => {
    setIsLoading(true);
    setError(null);
    
    // Update URL
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (page > 1) params.set('p', page.toString());
    router.push(`/?${params.toString()}`, { scroll: false });

    try {
      const results = await searchBooks(query, page, RESULTS_PER_PAGE);
      setSearchResults(results.books);
      setTotalResults(results.numFound);
      setCurrentQuery(query);
      setCurrentPage(results.currentPage);
    } catch (e) {
      console.error("Search failed:", e);
      setError("Failed to fetch books. Please try again later.");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    const pageFromUrl = parseInt(searchParams.get('p') || '1', 10);

    // Fetch books if query or page changed, or on initial load with a query
    if (queryFromUrl !== currentQuery || pageFromUrl !== currentPage || (queryFromUrl && searchResults.length === 0 && !isLoading) ) {
       if (queryFromUrl || searchResults.length === 0 && !isLoading && !currentQuery) { // Load if query exists, or if it's the initial load without a query (to show default)
         fetchBooks(queryFromUrl, pageFromUrl);
       } else if (!queryFromUrl && !currentQuery && !isLoading) { // Initial load, no query in URL, show default "popular"
         fetchBooks('', 1);
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, fetchBooks]); // currentQuery, currentPage, searchResults.length, isLoading removed to rely on searchParams and fetchBooks callback


  const handleSearchSubmit = (query: string) => {
    fetchBooks(query, 1); // Always go to page 1 for a new search
  };

  const handlePageChange = (newPage: number) => {
    fetchBooks(currentQuery, newPage);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-headline mb-4 text-primary">
          Discover Your Next Read
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Explore a vast collection of books. Search by title, author, or ISBN to find exactly what you're looking for.
        </p>
        <BookSearchForm onSearch={handleSearchSubmit} initialQuery={currentQuery} isLoading={isLoading} />
      </section>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Loading books...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-destructive text-lg">{error}</p>
        </div>
      )}

      {!isLoading && !error && searchResults.length > 0 && (
        <>
          <section>
            <h2 className="text-3xl font-headline mb-6 text-foreground">
              {currentQuery ? `Search Results for "${currentQuery}"` : "Popular Books"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-12">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <span className="text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {!isLoading && !error && searchResults.length === 0 && currentQuery && (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No books found for "{currentQuery}". Try a different search!</p>
        </div>
      )}
       {!isLoading && !error && searchResults.length === 0 && !currentQuery && !isLoading && ( // Added !isLoading to prevent flash of this message
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">Start by searching for a book, author, or ISBN.</p>
        </div>
      )}
    </div>
  );
}
