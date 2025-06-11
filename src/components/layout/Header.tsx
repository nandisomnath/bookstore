
'use client';

import Link from 'next/link';
import { BookOpen, Home, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-2xl font-headline text-primary hover:text-primary/80 transition-colors">
            <BookOpen className="h-7 w-7" />
            BiblioFind
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <nav className="flex items-center space-x-1 sm:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent",
                    pathname === item.href ? "text-accent font-semibold" : "text-foreground/80"
                  )}
                >
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
