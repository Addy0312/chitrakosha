'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Define types
interface ArtistApplication {
  id: string;
  userId: string;
  artistName: string;
  portfolioUrl: string | null;
  bio: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  metadata?: {
    artStyle: string;
    yearsOfExperience: string;
    portfolioSamples: string[];
  };
}

export default function ArtistApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ArtistApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState<ArtistApplication | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/admin/artist-applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load artist applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter applications based on active tab
  const filteredApplications = applications.filter(app => {
    if (activeTab === 'pending') return app.status === 'PENDING';
    if (activeTab === 'approved') return app.status === 'APPROVED';
    if (activeTab === 'rejected') return app.status === 'REJECTED';
    return true;
  });

  // Handle application approval
  const handleApprove = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      const response = await fetch(`/api/admin/artist-applications/${applicationId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve application');
      }

      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: 'APPROVED' } : app
      ));
      
      toast.success('Artist application approved');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle application rejection
  const handleReject = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      const response = await fetch(`/api/admin/artist-applications/${applicationId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject application');
      }

      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: 'REJECTED' } : app
      ));
      
      toast.success('Artist application rejected');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // View application details
  const viewApplication = (application: ArtistApplication) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get experience level text
  const getExperienceText = (code: string) => {
    const experiences: Record<string, string> = {
      'beginner': 'Beginner (0-2 years)',
      'intermediate': 'Intermediate (3-5 years)',
      'experienced': 'Experienced (6-10 years)',
      'professional': 'Professional (10+ years)',
    };
    return experiences[code] || code;
  };

  // Get art style text
  const getArtStyleText = (code: string) => {
    const styles: Record<string, string> = {
      'traditional': 'Traditional Indian Art',
      'contemporary': 'Contemporary',
      'abstract': 'Abstract',
      'digital': 'Digital Art',
      'photography': 'Photography',
      'sculpture': 'Sculpture',
      'mixed-media': 'Mixed Media',
      'other': 'Other',
    };
    return styles[code] || code;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Artist Applications</CardTitle>
          <CardDescription>
            Review and manage artist applications for the Chitrakosha marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {activeTab} applications found.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-4 md:p-6 flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium">{application.artistName}</h3>
                          {getStatusBadge(application.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {application.user.name || application.user.email} • Applied on {formatDate(application.createdAt)}
                        </p>
                        <p className="line-clamp-2 text-sm mb-4">{application.bio}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => viewApplication(application)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                      {application.status === 'PENDING' && (
                        <div className="flex md:flex-col justify-end gap-2 p-4 md:p-6 bg-muted/20">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleApprove(application.id)}
                            disabled={processingId === application.id}
                          >
                            {processingId === application.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleReject(application.id)}
                            disabled={processingId === application.id}
                          >
                            {processingId === application.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Application Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Artist Application Details</DialogTitle>
            <DialogDescription>
              Review the complete application information
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedApplication && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-shrink-0">
                    {selectedApplication.user.image ? (
                      <div className="relative h-24 w-24 rounded-full overflow-hidden">
                        <Image 
                          src={selectedApplication.user.image} 
                          alt={selectedApplication.artistName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-2xl font-medium">
                          {selectedApplication.artistName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-semibold">{selectedApplication.artistName}</h2>
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                    <p className="text-muted-foreground">
                      {selectedApplication.user.email}
                    </p>
                    <p className="text-sm mt-1">
                      Applied on {formatDate(selectedApplication.createdAt)}
                    </p>
                    
                    {selectedApplication.metadata && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">
                          {getArtStyleText(selectedApplication.metadata.artStyle)}
                        </Badge>
                        <Badge variant="secondary">
                          {getExperienceText(selectedApplication.metadata.yearsOfExperience)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Artist Bio</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedApplication.bio}</p>
                </div>
                
                {selectedApplication.portfolioUrl && (
                  <div>
                    <h3 className="font-medium mb-2">Portfolio URL</h3>
                    <a 
                      href={selectedApplication.portfolioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {selectedApplication.portfolioUrl}
                    </a>
                  </div>
                )}
                
                {selectedApplication.metadata?.portfolioSamples && (
                  <div>
                    <h3 className="font-medium mb-2">Portfolio Samples</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedApplication.metadata.portfolioSamples.map((sample, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                          <Image 
                            src={sample} 
                            alt={`Portfolio sample ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          
          {selectedApplication && selectedApplication.status === 'PENDING' && (
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="default"
                onClick={() => handleApprove(selectedApplication.id)}
                disabled={processingId === selectedApplication.id}
              >
                {processingId === selectedApplication.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve Application
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleReject(selectedApplication.id)}
                disabled={processingId === selectedApplication.id}
              >
                {processingId === selectedApplication.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject Application
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}