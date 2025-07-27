
"use client";

import { useState, useEffect, Suspense, lazy } from 'react';
import CommissionRequestForm from './components/commission-request-form';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { DynamicImage } from '@/components/ui/dynamic-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Filter, ArrowRight } from 'lucide-react';

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 32, seconds: 45 });
  const [cart, setCart] = useState<any[]>([]);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  function handleAddToCart(artwork: any) {
    if (cart.some(item => item.id === artwork.id)) {
      setCartMessage('Artwork already in cart');
      setTimeout(() => setCartMessage(null), 1500);
      return;
    }
    setCart([...cart, artwork]);
    setCartMessage('Added to cart!');
    setTimeout(() => setCartMessage(null), 1500);
  }

  // Mock data
  const artworks = [
    {
      id: "1",
      title: "Sunset Over Mumbai",
      artist: "Priya Sharma",
      price: "₹15,000",
      image: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop",
      category: "Painting",
      liked: false
    },
    {
      id: "2",
      title: "Digital Dreams",
      artist: "Arjun Patel",
      price: "₹8,500",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
      category: "Illustration",
      liked: true
    },
    {
      id: "3",
      title: "Street Life Delhi",
      artist: "Kavya Reddy",
      price: "₹12,000",
      image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop",
      category: "Photography",
      liked: false
    },
    {
      id: "4",
      title: "Traditional Patterns",
      artist: "Ravi Kumar",
      price: "₹20,000",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      category: "Painting",
      liked: true
    },
    {
      id: "5",
      title: "Modern Minimalism",
      artist: "Sneha Gupta",
      price: "₹18,500",
      image: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop",
      category: "Illustration",
      liked: false
    },
    {
      id: "6",
      title: "Nature's Beauty",
      artist: "Amit Singh",
      price: "₹9,000",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      category: "Photography",
      liked: true
    }
  ];

  const auctions = [
    {
      id: 1,
      title: "Rajasthani Heritage",
      artist: "Meera Joshi",
      currentBid: "₹45,000",
      reservePrice: "₹50,000",
      image: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop",
      timeLeft: "2d 14h 32m"
    },
    {
      id: 2,
      title: "Contemporary Vision",
      artist: "Vikram Malhotra",
      currentBid: "₹32,000",
      reservePrice: "₹40,000",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
      timeLeft: "1d 8h 15m"
    },
    {
      id: 3,
      title: "Urban Landscapes",
      artist: "Pooja Nair",
      currentBid: "₹28,000",
      reservePrice: "₹35,000",
      image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop",
      timeLeft: "3d 2h 45m"
    }
  ];

  const filters = ['All', 'Painting', 'Illustration', 'Photography'];

  const filteredArtworks = activeFilter === 'All' 
    ? artworks 
    : artworks.filter(artwork => artwork.category === activeFilter);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => ({
        ...prev,
        seconds: prev.seconds > 0 ? prev.seconds - 1 : 59
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const AuctionSection = lazy(() => import('./_AuctionSection'));

  return (
    <ErrorBoundary>
      <>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-warm overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Discover Extraordinary Art on{' '}
              <span className="bg-gradient-saffron bg-clip-text text-transparent">
                Chitrakosha
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Buy, sell, auction or commission artworks from creative minds across India.
            </p>
            <Button 
              asChild
              size="lg" 
              className="bg-gradient-saffron hover:opacity-90 shadow-warm text-lg px-8 py-6"
            >
              <a href="/explore">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-saffron/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl"></div>
      </section>

      {/* Artworks for Sale Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Artworks for Sale</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collection of original artworks from talented artists across India
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                onClick={() => setActiveFilter(filter)}
                className={activeFilter === filter ? "bg-gradient-saffron" : ""}
              >
                <Filter className="w-4 h-4 mr-2" />
                {filter}
              </Button>
            ))}
          </div>

          {/* Artworks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtworks.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full" />
              ))
            ) : (
              filteredArtworks.map((artwork) => (
                <Card key={artwork.id} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <a href={`/artwork/${artwork.id}`}> 
                        <DynamicImage
                          src={artwork.image}
                          alt={artwork.title}
                          width={400}
                          height={192}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-white/80 hover:bg-white"
                          >
                            {/* <Heart className={`w-4 h-4 ${artwork.liked ? 'fill-red-500 text-red-500' : ''}`} /> */}
                          </Button>
                        </div>
                        <Badge className="absolute top-4 left-4 bg-gradient-saffron z-10">
                          {artwork.category}
                        </Badge>
                      </a>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-lg mb-2">{artwork.title}</CardTitle>
                    <p className="text-muted-foreground mb-4">by {artwork.artist}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-foreground">{artwork.price}</span>
                      <Button size="sm" className="bg-gradient-saffron hover:opacity-90" onClick={() => handleAddToCart(artwork)}>
                        Add to Cart
                      </Button>
      {/* Cart feedback message */}
      {cartMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {cartMessage}
        </div>
      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Commission Artwork Section */}
      <section className="py-16 bg-gradient-purple relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-6">
              Hire artists to bring your ideas to life
            </h3>
            <p className="text-white/90 text-lg mb-8">
              Connect with skilled artists who can create custom artwork tailored to your vision and specifications
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-purple"
              onClick={() => setShowCommissionModal(true)}
            >
              Request Commission
            </Button>
            {showCommissionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
                  <button className="absolute top-2 right-2 text-2xl" onClick={() => setShowCommissionModal(false)}>&times;</button>
                  <h2 className="text-2xl font-bold mb-4">Request a Commission</h2>
                  <CommissionRequestForm onSuccess={() => setShowCommissionModal(false)} />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-20 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
      </section>

      {/* Featured Auctions Section (code split) */}
      <Suspense fallback={<div className="py-16 bg-background"><div className="container mx-auto px-4"><Skeleton className="h-72 w-full mb-4" /><Skeleton className="h-72 w-full mb-4" /><Skeleton className="h-72 w-full" /></div></div>}>
        <AuctionSection auctions={auctions} />
      </Suspense>

      {/* Join the Community Section */}
      <section className="py-16 bg-gradient-warm">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Users className="w-16 h-16 mx-auto mb-6 text-foreground" />
            <h3 className="text-4xl font-bold text-foreground mb-6">
              Join the Community
            </h3>
            <p className="text-muted-foreground text-lg mb-8">
              Connect, collaborate, and grow with fellow art lovers. Share your journey, get inspired, and discover new opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/community">
                <Button 
                  size="lg" 
                  className="bg-gradient-saffron hover:opacity-90 shadow-warm w-full sm:w-auto"
                >
                  Join Now
                </Button>
              </a>
              <a href="/community">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
      </>
    </ErrorBoundary>
  );
}
