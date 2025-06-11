
export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  coverImage: string;
  isbn?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  previewLink?: string;
  infoLink?: string;
  dataAiHint?: string; // For AI image hint generation
}
