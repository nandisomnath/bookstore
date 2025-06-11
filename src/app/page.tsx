'use client';

import { useState, useEffect, useCallback } from 'react';
import BookSearchForm from '@/components/book/BookSearchForm';
import BookCard from '@/components/book/BookCard';
import type { Book } from '@/types/book';
import { searchBooks } from '@/lib/book-api';
import { Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState(initialQuery);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(query);
    router.push(query ? `/?q=${encodeURIComponent(query)}` : '/');
    try {
      const results = await searchBooks(query);
      setSearchResults(results);
    } catch (e) {
      console.error("Search failed:", e);
      setError("Failed to fetch books. Please try again later.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Load initial results if query exists or to show default books
     if (initialQuery || searchResults.length === 0) { // Load if query or no books initially
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]); // Removed handleSearch from deps to avoid loop on initial load logic

  return (
    <div className="container mx-auto p-4 md:p-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-headline mb-4 text-primary">
          Discover Your Next Read
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Explore a vast collection of books. Search by title, author, or ISBN to find exactly what you're looking for.
        </p>
        <BookSearchForm onSearch={handleSearch} initialQuery={currentQuery} isLoading={isLoading} />
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
