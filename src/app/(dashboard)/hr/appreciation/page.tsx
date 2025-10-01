'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar, User } from 'lucide-react';

interface Appreciation {
  id: number;
  awardId: number;
  awardTitle: string;
  givenToEmployeeId: string;
  givenToEmployeeName: string;
  date: string;
  summary: string;
  photoUrl: string | null;
  photoFileId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export default function AppreciationPage() {
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppreciations() {
      try {
        // Replace 'YOUR_AUTH_TOKEN' with the actual token, e.g., from environment variables, auth context, or local storage
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/hr/appreciations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch appreciations');
        }

        setAppreciations(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to load appreciations');
        setLoading(false);
      }
    }

    fetchAppreciations();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading appreciations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Award className="h-10 w-10 text-primary" />
            Employee Appreciations
          </h1>
          <p className="text-muted-foreground text-lg">Celebrating outstanding achievements and contributions</p>
        </div>

        {appreciations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No appreciations found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appreciations.map((appreciation) => (
              <Card key={appreciation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {appreciation.photoUrl && (
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    <img
                      src={appreciation.photoUrl || '/placeholder.svg'}
                      alt={`${appreciation.givenToEmployeeName} appreciation`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={appreciation.photoUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(appreciation.givenToEmployeeName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{appreciation.givenToEmployeeName}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3" />
                          {appreciation.givenToEmployeeId}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <Badge variant="secondary" className="mb-3">
                      <Award className="h-3 w-3 mr-1" />
                      {appreciation.awardTitle}
                    </Badge>
                    <p className="text-foreground leading-relaxed">{appreciation.summary}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(appreciation.date)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}