'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Instagram,
  Twitter,
  Linkedin,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-saffron rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">च</span>
              </div>
              <h4 className="text-xl font-bold text-foreground">Chitrakosha</h4>
            </div>
            <p className="text-muted-foreground">
              India's premier platform for buying, selling, and commissioning original artworks.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-foreground mb-4">Quick Links</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-foreground mb-4">For Artists</h5>
            <ul className="space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Sell Your Art</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Commission Work</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Artist Resources</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-foreground mb-4">Connect</h5>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-saffron/10">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-saffron/10">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-saffron/10">
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Chitrakosha. All rights reserved. Made with ❤️ in India.
          </p>
        </div>
      </div>
    </footer>
  );
}