
import type { Book } from '@/types/book';

const OPEN_LIBRARY_API_BASE_URL = 'https://openlibrary.org';
const OPEN_LIBRARY_COVERS_BASE_URL = 'https://covers.openlibrary.org';

// Helper function to generate data-ai-hint from categories/subjects
const generateDataAiHint = (subjects?: string[]): string => {
  if (subjects && subjects.length > 0) {
    // Take first few subjects, clean them up, and join
    return subjects
      .slice(0, 2)
      .map(s => s.toLowerCase().split(' ').slice(0,2).join(' ')) // take first two words of subject
      .join(' ')
      .replace(/[^a-z0-9\s]/gi, '') // remove special chars
      .trim();
  }
  return "book cover";
};

// Helper function to transform Open Library search doc to our Book type
const transformOpenLibraryDocToBook = (doc: any): Book => {
  const workId = doc.key?.replace('/works/', '');
  let coverImage = 'https://placehold.co/400x600.png';
  if (doc.cover_i) {
    coverImage = `${OPEN_LIBRARY_COVERS_BASE_URL}/b/id/${doc.cover_i}-L.jpg`;
  } else if (doc.isbn && doc.isbn.length > 0) {
    coverImage = `${OPEN_LIBRARY_COVERS_BASE_URL}/b/isbn/${doc.isbn[0]}-L.jpg`;
  }

  const categories = doc.subject?.slice(0, 5) || [];

  return {
    id: workId,
    title: doc.title || 'Title Unknown',
    authors: doc.author_name || ['Author Unknown'],
    description: doc.first_sentence?.[0] || doc.description || 'No description available.',
    coverImage: coverImage,
    isbn: doc.isbn?.[0], // Take the first ISBN
    publishedDate: doc.first_publish_year?.toString(),
    pageCount: doc.number_of_pages_median,
    categories: categories,
    averageRating: undefined, // Open Library search doesn't provide ratings
    ratingsCount: undefined,
    previewLink: undefined, // Open Library has different linking structure
    infoLink: workId ? `${OPEN_LIBRARY_API_BASE_URL}/works/${workId}` : undefined,
    dataAiHint: generateDataAiHint(categories),
  };
};

// Helper function to transform Open Library work details to our Book type
const transformOpenLibraryWorkToBook = async (workId: string, workData: any, authorNames: string[]): Promise<Book> => {
  let coverImage = 'https://placehold.co/400x600.png';
  if (workData.covers && workData.covers.length > 0 && workData.covers[0] !== -1) {
    coverImage = `${OPEN_LIBRARY_COVERS_BASE_URL}/b/id/${workData.covers[0]}-L.jpg`;
  }
  // Note: ISBN and pageCount are typically on editions, not works.
  // Description can be an object or string
  let description = 'No description available.';
  if (typeof workData.description === 'string') {
    description = workData.description;
  } else if (workData.description?.value) {
    description = workData.description.value;
  }
  
  const categories = workData.subjects?.slice(0, 5) || [];

  return {
    id: workId,
    title: workData.title || 'Title Unknown',
    authors: authorNames.length > 0 ? authorNames : ['Author Unknown'],
    description: description,
    coverImage: coverImage,
    isbn: undefined, // Work level doesn't usually have a single ISBN
    publishedDate: workData.first_publish_date || workData.created?.value?.substring(0,4), // created.value is ISO string
    pageCount: undefined, // Work level doesn't usually have page count
    categories: categories,
    averageRating: undefined,
    ratingsCount: undefined,
    previewLink: undefined,
    infoLink: `${OPEN_LIBRARY_API_BASE_URL}/works/${workId}`,
    dataAiHint: generateDataAiHint(categories),
  };
};

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query) {
    query = "popular fiction"; // Default search for Open Library
  }
  // Request specific fields to keep response size manageable
  const fields = "key,title,author_name,first_publish_year,isbn,cover_i,subject,first_sentence";
  const url = `${OPEN_LIBRARY_API_BASE_URL}/search.json?q=${encodeURIComponent(query)}&fields=${fields}&limit=20`;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Open Library API error (searchBooks):', response.status, await response.text());
      throw new Error('Failed to fetch books from Open Library API');
    }
    const data = await response.json();
    return data.docs ? data.docs.map(transformOpenLibraryDocToBook) : [];
  } catch (error) {
    console.error('Error searching books (Open Library):', error);
    return []; 
  }
}

export async function getBookById(workId: string): Promise<Book | null> {
  const workUrl = `${OPEN_LIBRARY_API_BASE_URL}/works/${workId}.json`;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 300)); 
    const workResponse = await fetch(workUrl);
    if (!workResponse.ok) {
      if (workResponse.status === 404) return null; 
      console.error('Open Library API error (getBookById - work):', workResponse.status, await workResponse.text());
      throw new Error(`Failed to fetch book work data with id ${workId}`);
    }
    const workData = await workResponse.json();

    let authorNames: string[] = [];
    if (workData.authors && workData.authors.length > 0) {
      const authorPromises = workData.authors.map(async (authorRef: any) => {
        if (authorRef.author && authorRef.author.key) {
          const authorUrl = `${OPEN_LIBRARY_API_BASE_URL}${authorRef.author.key}.json`;
          const authorResponse = await fetch(authorUrl);
          if (authorResponse.ok) {
            const authorData = await authorResponse.json();
            return authorData.name || authorData.personal_name;
          }
        }
        return null;
      });
      authorNames = (await Promise.all(authorPromises)).filter(name => name !== null) as string[];
    }
    
    return workData ? await transformOpenLibraryWorkToBook(workId, workData, authorNames) : null;
  } catch (error) {
    console.error(`Error fetching book by ID ${workId} (Open Library):`, error);
    return null;
  }
}

export async function getRecommendedBooks(currentBookId?: string): Promise<Book[]> {
  let query = "top books"; // Default recommendation query for Open Library
  let currentBookSubjects: string[] = [];

  if (currentBookId) {
    const currentBook = await getBookById(currentBookId); // This now returns a Book from OpenLibrary
    if (currentBook && currentBook.categories && currentBook.categories.length > 0) {
      currentBookSubjects = currentBook.categories;
      // Use the first category/subject of the current book for recommendations if available
      query = `subject:"${currentBook.categories[0]}"`;
    }
  }
  
  // Re-use searchBooks for recommendations based on subject
  // The fields requested ensure we get enough data for BookCard
  const fields = "key,title,author_name,first_publish_year,isbn,cover_i,subject,first_sentence";
  const url = `${OPEN_LIBRARY_API_BASE_URL}/search.json?q=${encodeURIComponent(query)}&fields=${fields}&limit=9`;

  try {
    await new Promise(resolve => setTimeout(resolve, 400)); 
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Open Library API error (recommendations):', response.status, await response.text());
      throw new Error('Failed to fetch recommended books');
    }
    const data = await response.json();
    let books = data.docs ? data.docs.map(transformOpenLibraryDocToBook) : [];
    
    if (currentBookId) {
      books = books.filter((book: Book) => book.id !== currentBookId);
    }
     // Simple relevance boost for books sharing more subjects with the current book
    if (currentBookId && currentBookSubjects.length > 0) {
      books.sort((a, b) => {
        const aSharedSubjects = a.categories?.filter(cat => currentBookSubjects.includes(cat)).length || 0;
        const bSharedSubjects = b.categories?.filter(cat => currentBookSubjects.includes(cat)).length || 0;
        return bSharedSubjects - aSharedSubjects;
      });
    }
    return books.slice(0, 3); 
  } catch (error) {
    console.error('Error fetching recommended books (Open Library):', error);
    return [];
  }
}
