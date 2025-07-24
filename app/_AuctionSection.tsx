import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { DynamicImage } from '@/components/ui/dynamic-image';

export default function AuctionSection({ auctions }: { auctions: any[] }) {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Featured Auctions</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bid on exclusive artworks and discover unique pieces from renowned artists
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction) => (
            <Card key={auction.id} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <DynamicImage
                    src={auction.image}
                    alt={auction.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-gradient-purple">
                    <Clock className="w-3 h-3 mr-1" />
                    {auction.timeLeft}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-lg mb-2">{auction.title}</CardTitle>
                <p className="text-muted-foreground mb-4">by {auction.artist}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Bid</span>
                    <span className="font-semibold">{auction.currentBid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reserve Price</span>
                    <span className="font-semibold">{auction.reservePrice}</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-purple hover:opacity-90">
                  Place Bid
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
