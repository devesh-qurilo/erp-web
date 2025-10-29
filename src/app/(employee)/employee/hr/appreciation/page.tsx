'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Award, Calendar, Search, User, Plus } from 'lucide-react';
import Link from 'next/link';

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
  const [filteredAppreciations, setFilteredAppreciations] = useState<Appreciation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppreciations() {
      try {
        // Replace 'YOUR_AUTH_TOKEN' with the actual token, e.g., from environment variables, auth context, or local storage
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/hr/appreciations/employee', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch appreciations');
        }

        setAppreciations(result);
        setFilteredAppreciations(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to load appreciations');
        setLoading(false);
      }
    }

    fetchAppreciations();
  }, []);

  useEffect(() => {
    const filtered = appreciations.filter(
      (appreciation) =>
        appreciation.givenToEmployeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appreciation.awardTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appreciation.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAppreciations(filtered);
  }, [searchTerm, appreciations]);

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

  const handleAddAppreciation = () => {
    // TODO: Implement add appreciation functionality (e.g., open modal, navigate to form page)
    console.log('Add appreciation clicked');
    // Example: window.location.href = '/hr/appreciations/new';
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                <Award className="h-10 w-10 text-primary" />
                Employee Appreciations
              </h1>
              <p className="text-muted-foreground text-lg">Celebrating outstanding achievements and contributions</p>
            </div>
          
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, award, or summary..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* TODO: Add filter dropdown (e.g., by date range, award type) */}
            <div className="flex-0">
              <Button variant="outline" size="sm">
                Filters
              </Button>
            </div>
          </div>
        </div>

        {filteredAppreciations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {searchTerm ? 'No appreciations match your search.' : 'No appreciations found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Award</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppreciations.map((appreciation) => (
                  <TableRow key={appreciation.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={appreciation.photoUrl || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitials(appreciation.givenToEmployeeName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{appreciation.givenToEmployeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            <User className="h-3 w-3 inline mr-1" />
                            {appreciation.givenToEmployeeId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Award className="h-3 w-3 mr-1" />
                        {appreciation.awardTitle}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(appreciation.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-md">
                      <span className="line-clamp-2">{appreciation.summary}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}