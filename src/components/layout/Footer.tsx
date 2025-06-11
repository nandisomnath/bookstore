export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-6 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} BiblioFind. All rights reserved.</p>
        <p className="mt-1">Discover your next favorite book with us.</p>
      </div>
    </footer>
  );
}
