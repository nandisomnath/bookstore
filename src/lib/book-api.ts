import type { Book } from '@/types/book';

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    authors: ['F. Scott Fitzgerald'],
    description: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover, Daisy Buchanan.',
    coverImage: 'https://placehold.co/400x600.png',
    isbn: '9780743273565',
    publishedDate: '1925',
    pageCount: 180,
    categories: ['Classic Literature', 'Fiction'],
    averageRating: 4.5,
    infoLink: '#',
    dataAiHint: "classic novel"
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    authors: ['Harper Lee'],
    description: 'To Kill a Mockingbird is a novel by Harper Lee published in 1960. It was immediately successful, winning the Pulitzer Prize, and has become a classic of modern American literature. The plot and characters are loosely based on Lee\'s observations of her family, her neighbors and an event that occurred near her hometown of Monroeville, Alabama, in 1936, when she was ten.',
    coverImage: 'https://placehold.co/400x600.png',
    isbn: '9780061120084',
    publishedDate: '1960',
    pageCount: 324,
    categories: ['Classic Literature', 'Fiction'],
    averageRating: 4.8,
    infoLink: '#',
    dataAiHint: "american literature"
  },
  {
    id: '3',
    title: '1984',
    authors: ['George Orwell'],
    description: 'Nineteen Eighty-Four: A Novel, often published as 1984, is a dystopian social science fiction novel by English novelist George Orwell. It was published on 8 June 1949 by Secker & Warburg as Orwell\'s ninth and final book completed in his lifetime. Thematically, Nineteen Eighty-Four centres on the consequences of totalitarianism, mass surveillance, and repressive regimentation of persons and behaviours within society.',
    coverImage: 'https://placehold.co/400x600.png',
    isbn: '9780451524935',
    publishedDate: '1949',
    pageCount: 328,
    categories: ['Dystopian', 'Science Fiction'],
    averageRating: 4.7,
    infoLink: '#',
    dataAiHint: "dystopian future"
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    authors: ['Jane Austen'],
    description: 'Pride and Prejudice is an 1813 romantic novel of manners written by Jane Austen. The novel follows the character development of Elizabeth Bennet, the dynamic protagonist of the book who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.',
    coverImage: 'https://placehold.co/400x600.png',
    isbn: '9780141439518',
    publishedDate: '1813',
    pageCount: 432,
    categories: ['Classic Literature', 'Romance'],
    averageRating: 4.6,
    infoLink: '#',
    dataAiHint: "romantic novel"
  },
  {
    id: '5',
    title: 'The Hobbit',
    authors: ['J.R.R. Tolkien'],
    description: 'The Hobbit, or There and Back Again is a children\'s fantasy novel by English author J. R. R. Tolkien. It was published on 21 September 1937 to wide critical acclaim, being nominated for the Carnegie Medal and awarded a prize from the New York Herald Tribune for juvenile fiction. The book remains popular and is recognized as a classic in children\'s literature.',
    coverImage: 'https://placehold.co/400x600.png',
    isbn: '9780547928227',
    publishedDate: '1937',
    pageCount: 310,
    categories: ['Fantasy', 'Children\'s Literature'],
    averageRating: 4.9,
    infoLink: '#',
    dataAiHint: "fantasy adventure"
  },
  {
    id: '6',
    title: 'Sapiens: A Brief History of Humankind',
    authors: ['Yuval Noah Harari'],
    description: 'Sapiens: A Brief History of Humankind is a book by Yuval Noah Harari, first published in Hebrew in Israel in 2011 based on a series of lectures Harari taught at The Hebrew University of Jerusalem, and in English in 2014. The book surveys the history of humankind from the evolution of archaic human species in the Stone Age up to the twenty-first century, focusing on Homo sapiens.',
    coverImage: 'https://placehold.co/400x600.png',
    isbn: '9780062316097',
    publishedDate: '2014',
    pageCount: 464,
    categories: ['History', 'Non-fiction'],
    averageRating: 4.8,
    infoLink: '#',
    dataAiHint: "human history"
  }
];

export async function searchBooks(query: string): Promise<Book[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  if (!query) return mockBooks.slice(0,4); // Return a few if query is empty for initial display
  const lowerCaseQuery = query.toLowerCase();
  return mockBooks.filter(book =>
    book.title.toLowerCase().includes(lowerCaseQuery) ||
    book.authors.some(author => author.toLowerCase().includes(lowerCaseQuery)) ||
    (book.isbn && book.isbn.includes(lowerCaseQuery))
  );
}

export async function getBookById(id: string): Promise<Book | null> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  const book = mockBooks.find(b => b.id === id);
  return book || null;
}

export async function getRecommendedBooks(currentBookId?: string): Promise<Book[]> {
  await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
  // Simple recommendation: return a few books, excluding the current one
  return mockBooks.filter(book => book.id !== currentBookId).slice(0, 3);
}
