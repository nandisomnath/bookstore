
'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import BookSearchForm from '@/components/book/BookSearchForm';
import BookCard from '@/components/book/BookCard';
import type { Book } from '@/types/book';
import { searchBooks, type PaginatedBookResults } from '@/lib/book-api';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const RESULTS_PER_PAGE = 20;

function HomePageContent() {
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
    
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (page > 1) params.set('p', page.toString());
    // Update URL without re-triggering a full navigation, searchParams will update
    router.push(`/?${params.toString()}`, { scroll: false });

    try {
      const results: PaginatedBookResults = await searchBooks(query, page, RESULTS_PER_PAGE);
      setSearchResults(results.books);
      setTotalResults(results.numFound);
      setCurrentQuery(query); // Reflects the query for which data was fetched
      setCurrentPage(results.currentPage); // Reflects the page for which data was fetched
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

    // Condition to fetch:
    // 1. URL query/page is different from current state's query/page (after a fetch).
    // 2. OR: URL has a query, but we have no results and are not loading (e.g. direct navigation or refresh with query).
    // 3. OR: URL has no query, we have no current query (initial state), no results, and not loading (initial load of `/` for default).
    const needsFetchDueToParamChange = queryFromUrl !== currentQuery || pageFromUrl !== currentPage;
    const needsFetchForInitialQueryLoad = queryFromUrl && searchResults.length === 0 && !isLoading && !error;
    const needsFetchForInitialDefaultLoad = !queryFromUrl && !currentQuery && searchResults.length === 0 && !isLoading && !error;

    if (needsFetchDueToParamChange) {
        fetchBooks(queryFromUrl, pageFromUrl);
    } else if (needsFetchForInitialQueryLoad) {
        fetchBooks(queryFromUrl, pageFromUrl);
    } else if (needsFetchForInitialDefaultLoad) {
        fetchBooks('', 1); // Fetch default "popular" books
    }
  }, [searchParams, currentQuery, currentPage, searchResults.length, isLoading, error, fetchBooks]);


  const handleSearchSubmit = (query: string) => {
    // When a new search is submitted, go to page 1
    // fetchBooks will update the URL, triggering useEffect if needed,
    // but we directly call it to initiate the fetch.
    fetchBooks(query, 1); 
  };

  const handlePageChange = (newPage: number) => {
    // fetchBooks will update the URL.
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
       {!isLoading && !error && searchResults.length === 0 && !currentQuery && ( 
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">Start by searching for a book, author, or ISBN.</p>
        </div>
      )}
    </div>
  );
}

export default function HomePageContainer() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl text-muted-foreground">Loading search interface...</p>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
