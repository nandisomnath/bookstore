
import type { Book } from '@/types/book';

const GOOGLE_BOOKS_API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// Helper function to generate data-ai-hint from categories
const generateDataAiHint = (categories?: string[]): string => {
  if (categories && categories.length > 0) {
    return categories.slice(0, 2).join(' ').toLowerCase();
  }
  return "book cover";
};

// Helper function to transform Google Books API item to our Book type
const transformGoogleBook = (item: any): Book => {
  const volumeInfo = item.volumeInfo || {};
  const coverImage = volumeInfo.imageLinks?.thumbnail || 
                     volumeInfo.imageLinks?.smallThumbnail || 
                     'https://placehold.co/400x600.png';
  
  const categories = volumeInfo.categories || [];

  return {
    id: item.id,
    title: volumeInfo.title || 'Title Unknown',
    authors: volumeInfo.authors || ['Author Unknown'],
    description: volumeInfo.description || 'No description available.',
    coverImage: coverImage,
    isbn: volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier ||
          volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier,
    publishedDate: volumeInfo.publishedDate,
    pageCount: volumeInfo.pageCount,
    categories: categories,
    averageRating: volumeInfo.averageRating,
    ratingsCount: volumeInfo.ratingsCount,
    previewLink: volumeInfo.previewLink,
    infoLink: volumeInfo.infoLink,
    dataAiHint: generateDataAiHint(categories),
  };
};

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query) {
    // Fetch some general books if query is empty (e.g., popular fiction)
    query = "popular fiction books";
  }
  
  const url = `${GOOGLE_BOOKS_API_BASE_URL}?q=${encodeURIComponent(query)}&maxResults=20&orderBy=relevance`;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Google Books API error:', response.status, await response.text());
      throw new Error('Failed to fetch books from Google Books API');
    }
    const data = await response.json();
    return data.items ? data.items.map(transformGoogleBook) : [];
  } catch (error) {
    console.error('Error searching books:', error);
    // Fallback to an empty array or could return a predefined set of error books
    return []; 
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  const url = `${GOOGLE_BOOKS_API_BASE_URL}/${id}`;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) return null; // Book not found
      console.error('Google Books API error for getBookById:', response.status, await response.text());
      throw new Error(`Failed to fetch book with id ${id}`);
    }
    const item = await response.json();
    return item ? transformGoogleBook(item) : null;
  } catch (error) {
    console.error(`Error fetching book by ID ${id}:`, error);
    return null;
  }
}

export async function getRecommendedBooks(currentBookId?: string): Promise<Book[]> {
  let query = "bestselling programming books"; // Default recommendation query

  if (currentBookId) {
    const currentBook = await getBookById(currentBookId);
    if (currentBook && currentBook.categories && currentBook.categories.length > 0) {
      // Use the first category of the current book for recommendations
      query = `subject:${encodeURIComponent(currentBook.categories[0])}`;
    }
  }
  
  const url = `${GOOGLE_BOOKS_API_BASE_URL}?q=${encodeURIComponent(query)}&maxResults=9&orderBy=relevance`;

  try {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Google Books API error for recommendations:', response.status, await response.text());
      throw new Error('Failed to fetch recommended books');
    }
    const data = await response.json();
    let books = data.items ? data.items.map(transformGoogleBook) : [];
    if (currentBookId) {
      books = books.filter((book: Book) => book.id !== currentBookId);
    }
    return books.slice(0, 3); // Return up to 3 recommendations
  } catch (error) {
    console.error('Error fetching recommended books:', error);
    return [];
  }
}
