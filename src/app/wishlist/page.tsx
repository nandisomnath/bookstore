'use client';

import BookCard from '@/components/book/BookCard';
import { useWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart, Search } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, isLoaded } = useWishlist();

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <p className="text-lg text-muted-foreground">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-4xl font-headline mb-4 sm:mb-0 text-primary flex items-center">
          <Heart className="w-10 h-10 mr-3 fill-accent text-accent" />
          My Wishlist
        </h1>
        <Button asChild variant="outline">
          <Link href="/" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find More Books
          </Link>
        </Button>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-2">Your wishlist is empty.</p>
          <p className="text-muted-foreground mb-6">Add books you want to read later!</p>
          <Button asChild>
            <Link href="/">Discover Books</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
