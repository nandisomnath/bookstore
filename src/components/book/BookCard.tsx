'use client';

import type { Book } from '@/types/book';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Eye } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoaded } = useWishlist();
  const isBookInWishlist = isInWishlist(book.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if button inside Link
    e.stopPropagation();
    if (isBookInWishlist) {
      removeFromWishlist(book.id);
    } else {
      addToWishlist(book);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full_group_hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <Link href={`/books/${book.id}`} className="flex flex-col h-full">
        <CardHeader className="p-0 relative">
          <Image
            src={book.coverImage || 'https://placehold.co/400x600.png'}
            alt={book.title}
            width={400}
            height={600}
            className="w-full h-64 object-cover group-hover:opacity-90 transition-opacity"
            data-ai-hint={book.dataAiHint || "book cover"}
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-headline leading-tight mb-1 h-12 overflow-hidden group-hover:text-primary transition-colors">
            {book.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground h-10 overflow-hidden">
            {book.authors.join(', ')}
          </p>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center border-t">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/books/${book.id}`} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View
            </Link>
          </Button>
          {isLoaded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWishlistToggle}
              aria-label={isBookInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "hover:bg-accent/10",
                isBookInWishlist ? "text-accent" : "text-muted-foreground hover:text-accent"
              )}
            >
              <Heart className={cn("h-5 w-5", isBookInWishlist && "fill-current")} />
            </Button>
          )}
        </CardFooter>
      </Link>
    </Card>
  );
}
