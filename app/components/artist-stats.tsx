'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, DollarSign, Package, ShoppingCart, Eye, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ArtistStats {
  overview: {
    totalArtworks: number;
    totalSales: number;
    totalEarnings: number;
    averageSalePrice: number;
    recentSales: number;
  };
  artworksByStatus: {
    FOR_SALE: number;
    IN_AUCTION: number;
    SOLD: number;
  };
  salesByMonth: Record<string, { count: number; earnings: number }>;
  topArtworks: Array<{
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    updatedAt: string;
  }>;
  performance: {
    conversionRate: number;
    averageTimeToSell: number;
  };
}

interface ArtistStatsProps {
  artistId: string;
}

export function ArtistStats({ artistId }: ArtistStatsProps) {
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/artists/${artistId}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error('Error fetching artist stats');
          toast.error('Failed to load statistics');
        }
      } catch (error) {
        console.error('Error fetching artist stats:', error);
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    if (artistId) {
      fetchStats();
    }
  }, [artistId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <p>Loading statistics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Unable to load statistics</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Generate last 6 months for chart
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    last6Months.push({
      month: monthName,
      key: monthKey,
      sales: stats.salesByMonth[monthKey]?.count || 0,
      earnings: stats.salesByMonth[monthKey]?.earnings || 0,
    });
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Artworks</p>
                <p className="text-2xl font-bold">{stats.overview.totalArtworks}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{stats.overview.totalSales}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.overview.totalEarnings)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Sale Price</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.overview.averageSalePrice)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Artwork Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Artwork Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">For Sale</Badge>
                </div>
                <span className="font-semibold">{stats.artworksByStatus.FOR_SALE}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">In Auction</Badge>
                </div>
                <span className="font-semibold">{stats.artworksByStatus.IN_AUCTION}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Sold</Badge>
                </div>
                <span className="font-semibold">{stats.artworksByStatus.SOLD}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Rate</span>
                <span className="font-semibold">{stats.performance.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recent Sales (30 days)</span>
                <span className="font-semibold">{stats.overview.recentSales}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sales Trend (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {last6Months.map((month) => (
              <div key={month.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{month.month}</p>
                  <p className="text-sm text-muted-foreground">{month.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(month.earnings)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Artworks */}
      {stats.topArtworks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Top Selling Artworks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topArtworks.map((artwork) => (
                <div key={artwork.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden">
                    <Image
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{artwork.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Sold on {formatDate(artwork.updatedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(artwork.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}