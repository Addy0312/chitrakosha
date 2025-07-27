'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  Search,
  Heart,
} from 'lucide-react';
import { CartIcon } from './cart-icon';
import { ModeToggle } from '@/components/mode-toggle';
import { useSession, signOut } from 'next-auth/react';
import { NotificationDropdown } from '@/components/notifications';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="bg-card shadow-card sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-saffron rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">च</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Chitrakosha</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/explore" className="text-foreground hover:text-primary transition-colors">Explore</Link>
            <Link href="/sell-art" className="text-foreground hover:text-primary transition-colors">Sell Art</Link>
            <Link href="/commission" className="text-foreground hover:text-primary transition-colors">Commission</Link>
            <Link href="/auctions" className="text-foreground hover:text-primary transition-colors">Auctions</Link>
            <Link href="/community" className="text-foreground hover:text-primary transition-colors">Community</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
            <CartIcon />
            {session ? (
              <>
                {/* Notification dropdown for authenticated users */}
                <NotificationDropdown />
                <Button variant="outline" asChild>
                  <Link href={`/profile/${session.user?.id}`}>Profile</Link>
                </Button>
                <Button onClick={() => signOut()}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button className="bg-gradient-saffron hover:opacity-90" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
              <Link href="/explore" className="text-foreground hover:text-primary transition-colors">Explore</Link>
              <Link href="/sell-art" className="text-foreground hover:text-primary transition-colors">Sell Art</Link>
              <Link href="/commission" className="text-foreground hover:text-primary transition-colors">Commission</Link>
              <Link href="/auctions" className="text-foreground hover:text-primary transition-colors">Auctions</Link>
              <Link href="/community" className="text-foreground hover:text-primary transition-colors">Community</Link>
              {session && (
                <div className="flex items-center justify-start gap-2 pt-2 pb-2">
                  <NotificationDropdown />
                  <span className="text-sm text-muted-foreground">Notifications</span>
                </div>
              )}
              <div className="flex space-x-2 pt-4">
                {session ? (
                  <>
                    <Button variant="outline" asChild className="flex-1">
                      <Link href={`/profile/${session.user?.id}`}>Profile</Link>
                    </Button>
                    <Button onClick={() => signOut()} className="flex-1">Logout</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button className="flex-1 bg-gradient-saffron hover:opacity-90" asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
