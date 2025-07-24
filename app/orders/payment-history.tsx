import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function PaymentHistory() {
  const session = await getServerSession();
  if (!session?.user?.id) return <div className="p-8">Please log in to view your payment history.</div>;
  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  if (!orders.length) return <div className="p-8">No payments found.</div>;
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Payment History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle>Order #{order.id.slice(-6)}</CardTitle>
              <Badge className="mb-2 w-fit">{order.status}</Badge>
            </CardHeader>
            <CardContent>
              <div>Amount: ₹{(order.amount / 1).toLocaleString('en-IN')}</div>
              <div>Payment ID: {order.paymentId || 'N/A'}</div>
              <div>Date: {new Date(order.createdAt).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
