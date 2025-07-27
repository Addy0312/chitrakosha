"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) setCart(JSON.parse(storedCart));
    }
  }, []);

  function handleRemove(id: number) {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(updated));
    }
  }

  if (cart.length === 0) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Your cart is empty.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">Your Cart</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cart.map(item => (
          <Card key={item.id} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
              <p className="text-muted-foreground mb-4">by {item.artist}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-foreground">{item.price}</span>
                <Button size="sm" variant="destructive" onClick={() => handleRemove(item.id)}>
                  Remove
                </Button>
              </div>
              <Link href={`/artwork/${item.id}`} className="text-primary underline text-sm">View Artwork</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
