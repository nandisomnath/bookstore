'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { summarizeBook } from '@/ai/flows/summarize-book'; // Ensure this path is correct

interface BookSummaryProps {
  bookDescription: string;
  bookTitle: string;
}

export default function BookSummary({ bookDescription, bookTitle }: BookSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const result = await summarizeBook({ bookDescription });
      setSummary(result.summary);
    } catch (e) {
      console.error("Error generating summary:", e);
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-headline">AI Book Summary</CardTitle>
        <Button onClick={handleGenerateSummary} disabled={isLoading} size="sm" variant="outline">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {summary ? 'Regenerate' : 'Generate'} Summary
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Generating summary for "{bookTitle}"...</p>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {summary && !isLoading && (
          <div className="prose prose-sm max-w-none text-foreground">
            <p>{summary}</p>
          </div>
        )}
        {!summary && !isLoading && !error && (
          <p className="text-sm text-muted-foreground">Click the button to generate an AI-powered summary of this book.</p>
        )}
      </CardContent>
    </Card>
  );
}
