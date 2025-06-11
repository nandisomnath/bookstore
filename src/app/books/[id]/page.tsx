'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Book } from '@/types/book';
import { getBookById, getRecommendedBooks } from '@/lib/book-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import BookCard from '@/components/book/BookCard';
import BookSummary from '@/components/book/BookSummary';
import { useWishlist } from '@/hooks/useWishlist';
import { ArrowLeft, Heart, Loader2, Star, Users, BookOpen as BookIcon, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function BookDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToWishlist, removeFromWishlist, isInWishlist, isLoaded } = useWishlist();

  useEffect(() => {
    if (id) {
      const fetchBookData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [bookData, recBooksData] = await Promise.all([
            getBookById(id),
            getRecommendedBooks(id),
          ]);
          
          if (!bookData) {
            setError("Book not found.");
          } else {
            setBook(bookData);
          }
          setRecommendedBooks(recBooksData);

        } catch (e) {
          console.error("Failed to fetch book details:", e);
          setError("Failed to load book details. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchBookData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-xl text-muted-foreground">Loading book details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <p className="text-destructive text-xl">{error}</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Go back to Home</Link>
        </Button>
      </div>
    );
  }

  if (!book) {
    return ( // Should be covered by error state, but as a fallback
      <div className="container mx-auto p-4 md:p-8 text-center">
        <p className="text-muted-foreground text-xl">Book data could not be loaded.</p>
         <Button asChild variant="link" className="mt-4">
          <Link href="/">Go back to Home</Link>
        </Button>
      </div>
    );
  }

  const isBookInWishlist = isInWishlist(book.id);

  const handleWishlistToggle = () => {
    if (isBookInWishlist) {
      removeFromWishlist(book.id);
    } else {
      addToWishlist(book);
    }
  };
  
  const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | number }) => {
    if (!value) return null;
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Icon className="h-4 w-4 mr-2 text-primary" />
        <strong>{label}:</strong><span className="ml-1">{value}</span>
      </div>
    );
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Link>
      </Button>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-1">
          <Card className="overflow-hidden shadow-xl rounded-lg">
            <Image
              src={book.coverImage || 'https://placehold.co/400x600.png'}
              alt={`Cover of ${book.title}`}
              width={400}
              height={600}
              className="w-full h-auto object-contain"
              priority
              data-ai-hint={book.dataAiHint || "book cover"}
            />
          </Card>
          {isLoaded && (
            <Button 
              onClick={handleWishlistToggle} 
              className="w-full mt-4"
              variant={isBookInWishlist ? "destructive" : "default"}
              size="lg"
            >
              <Heart className={cn("mr-2 h-5 w-5", isBookInWishlist && "fill-current")} />
              {isBookInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
          )}
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl sm:text-4xl font-headline mb-2 text-primary">{book.title}</h1>
          <p className="text-lg sm:text-xl text-foreground mb-4">
            By <span className="font-medium">{book.authors.join(', ')}</span>
          </p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
            {book.averageRating && <InfoItem icon={Star} label="Rating" value={`${book.averageRating}/5${book.ratingsCount ? ` (${book.ratingsCount} ratings)` : ''}`} />}
            {book.pageCount && <InfoItem icon={BookIcon} label="Pages" value={book.pageCount} />}
            {book.publishedDate && <InfoItem icon={CalendarDays} label="Published" value={book.publishedDate} />}
          </div>
          
          {book.categories && book.categories.length > 0 && (
            <div className="mb-6">
              {book.categories.map(category => (
                <Badge key={category} variant="secondary" className="mr-2 mb-2">{category}</Badge>
              ))}
            </div>
          )}

          <Card className="mb-6 shadow-md rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 leading-relaxed">{book.description || "No description available."}</p>
            </CardContent>
          </Card>
          
          <BookSummary bookDescription={book.description || ""} bookTitle={book.title} />

          { (book.previewLink || book.infoLink) && 
            <div className="mt-6 space-x-4">
              {book.previewLink && <Button asChild><Link href={book.previewLink} target="_blank" rel="noopener noreferrer">Preview</Link></Button>}
              {book.infoLink && <Button variant="outline" asChild><Link href={book.infoLink} target="_blank" rel="noopener noreferrer">More Info</Link></Button>}
            </div>
          }
        </div>
      </div>

      {recommendedBooks.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-3xl font-headline mb-6 text-foreground">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedBooks.map((recBook) => (
              <BookCard key={recBook.id} book={recBook} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
