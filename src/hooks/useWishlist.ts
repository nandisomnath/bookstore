'use client';

import type { Book } from '@/types/book';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

const WISHLIST_STORAGE_KEY = 'bibliofind_wishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error("Failed to load wishlist from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  const updateLocalStorage = useCallback((updatedWishlist: Book[]) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updatedWishlist));
    } catch (error) {
      console.error("Failed to save wishlist to localStorage", error);
       toast({
        title: "Error",
        description: "Could not save wishlist changes.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addToWishlist = useCallback((book: Book) => {
    setWishlist(prevWishlist => {
      if (prevWishlist.find(item => item.id === book.id)) {
        return prevWishlist; // Already in wishlist
      }
      const newWishlist = [...prevWishlist, book];
      updateLocalStorage(newWishlist);
      toast({
        title: "Added to Wishlist",
        description: `${book.title} has been added to your wishlist.`,
      });
      return newWishlist;
    });
  }, [updateLocalStorage, toast]);

  const removeFromWishlist = useCallback((bookId: string) => {
    setWishlist(prevWishlist => {
      const bookToRemove = prevWishlist.find(item => item.id === bookId);
      const newWishlist = prevWishlist.filter(item => item.id !== bookId);
      updateLocalStorage(newWishlist);
      if (bookToRemove) {
        toast({
          title: "Removed from Wishlist",
          description: `${bookToRemove.title} has been removed from your wishlist.`,
        });
      }
      return newWishlist;
    });
  }, [updateLocalStorage, toast]);

  const isInWishlist = useCallback((bookId: string) => {
    return wishlist.some(item => item.id === bookId);
  }, [wishlist]);

  return { wishlist, addToWishlist, removeFromWishlist, isInWishlist, isLoaded };
}
