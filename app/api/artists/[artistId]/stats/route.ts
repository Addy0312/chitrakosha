import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { artistId: string } }
) {
  try {
    const { artistId } = params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is the artist or an admin
    if (session.user.id !== artistId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify user is an artist
    const user = await prisma.user.findUnique({
      where: { id: artistId },
      select: { isArtist: true },
    });

    if (!user?.isArtist) {
      return NextResponse.json({ error: 'User is not an artist' }, { status: 403 });
    }

    // Get basic artwork statistics
    const totalArtworks = await prisma.artwork.count({
      where: { artistId },
    });

    const artworksByStatus = await prisma.artwork.groupBy({
      by: ['status'],
      where: { artistId },
      _count: { id: true },
    });

    // Get sales statistics
    const soldArtworks = await prisma.artwork.findMany({
      where: {
        artistId,
        status: 'SOLD',
      },
      include: {
        order: true,
      },
    });

    const totalSales = soldArtworks.length;
    const totalEarnings = soldArtworks.reduce((sum, artwork) => sum + artwork.price, 0);
    const averageSalePrice = totalSales > 0 ? totalEarnings / totalSales : 0;

    // Get recent sales (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = await prisma.artwork.count({
      where: {
        artistId,
        status: 'SOLD',
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get monthly sales data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await prisma.artwork.findMany({
      where: {
        artistId,
        status: 'SOLD',
        updatedAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        price: true,
        updatedAt: true,
      },
    });

    // Group sales by month
    const salesByMonth = monthlySales.reduce((acc, sale) => {
      const month = sale.updatedAt.toISOString().slice(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = { count: 0, earnings: 0 };
      }
      acc[month].count += 1;
      acc[month].earnings += sale.price;
      return acc;
    }, {} as Record<string, { count: number; earnings: number }>);

    // Get top-selling artworks
    const topArtworks = await prisma.artwork.findMany({
      where: {
        artistId,
        status: 'SOLD',
      },
      orderBy: {
        price: 'desc',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        price: true,
        imageUrl: true,
        updatedAt: true,
      },
    });

    // Format status counts
    const statusCounts = {
      FOR_SALE: 0,
      IN_AUCTION: 0,
      SOLD: 0,
    };

    artworksByStatus.forEach(item => {
      statusCounts[item.status as keyof typeof statusCounts] = item._count.id;
    });

    const stats = {
      overview: {
        totalArtworks,
        totalSales,
        totalEarnings,
        averageSalePrice,
        recentSales,
      },
      artworksByStatus: statusCounts,
      salesByMonth,
      topArtworks,
      performance: {
        conversionRate: totalArtworks > 0 ? (totalSales / totalArtworks) * 100 : 0,
        averageTimeToSell: 0, // Could be calculated if we track listing dates
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[GET_ARTIST_STATS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch artist statistics' }, { status: 500 });
  }
}