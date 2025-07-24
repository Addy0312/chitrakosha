"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import dynamic from "next/dynamic";

const PaymentHistory = dynamic(() => import("./payment-history"), { ssr: false });

interface Order {
  id: string;
  amount: number;
  status: string;
  paymentId: string;
  createdAt: string;
  artwork: {
    id: string;
    title: string;
    imageUrl: string;
    price: number;
    artist: { id: string; name: string };
  };
}

export default function OrderHistoryPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchOrders();
    // eslint-disable-next-line
  }, [status]);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading orders...</div>;
  }
  if (error) {
    return <div className="container mx-auto px-4 py-16 text-center text-destructive">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">Order History</h2>
      {orders.length === 0 ? (
        <div className="text-muted-foreground text-center py-16">No orders found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orders.map(order => (
            <Card key={order.id} className="hover:shadow-card transition-all duration-300">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img src={order.artwork.imageUrl} alt={order.artwork.title} className="w-full h-48 object-cover" />
                  <Badge className="absolute top-4 left-4 bg-gradient-saffron">{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-lg mb-2">{order.artwork.title}</CardTitle>
                <p className="text-muted-foreground mb-2">by {order.artwork.artist.name}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">₹{order.amount.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">Payment ID: {order.paymentId}</div>
                <Link href={`/artwork/${order.artwork.id}`} className="text-primary underline text-sm">View Artwork</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <PaymentHistory />
    </div>
  );
}
