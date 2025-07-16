'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function EditUserProfilePage() {
  const params = useParams();
  const userId = params.userId;

  // Mock user data (replace with actual data fetching)
  const user = {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    bio: `This is the bio for user ${userId}.`,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (e.g., update user data in database)
    alert('Profile updated!');
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile: {user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user.name} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email} disabled />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" defaultValue={user.bio} />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">Save Changes</Button>
              <Button variant="outline" asChild>
                <Link href={`/profile/${userId}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
