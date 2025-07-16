'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function ArtistOnboardingPage() {
  const [artistName, setArtistName] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send data to an API for review
    console.log({
      artistName,
      portfolioUrl,
      bio,
    });
    alert('Artist application submitted! We will review your application shortly.');
    setArtistName('');
    setPortfolioUrl('');
    setBio('');
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Become an Artist on Chitrakosha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="artistName">Artist Name</Label>
              <Input
                id="artistName"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
              <Input
                id="portfolioUrl"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bio">Tell us about yourself and your art</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                required
              />
            </div>
            <Button type="submit">Submit Application</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
