

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Building2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface School {
  id: string;
  name: string;
  location: string;
  description: string;
  studentCount: number;
  coachCount: number;
  status: string;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        // For now, use mock data since we haven't migrated schools to Prisma yet
        const mockSchools: School[] = [
          {
            id: '1',
            name: 'Damascus High School for Innovation',
            location: 'Damascus, Syria',
            description: 'A leading institution focused on robotics and technology education. Offers comprehensive programs in VEX robotics, Arduino programming, and team competitions.',
            studentCount: 150,
            coachCount: 8,
            status: 'Active'
          },
          {
            id: '2',
            name: 'Aleppo University Robotics Department',
            location: 'Aleppo, Syria',
            description: 'University-level robotics program with advanced courses in artificial intelligence, machine learning, and autonomous systems.',
            studentCount: 75,
            coachCount: 12,
            status: 'Active'
          },
          {
            id: '3',
            name: 'Homs Technical Institute',
            location: 'Homs, Syria',
            description: 'Technical institute specializing in practical robotics applications, industrial automation, and mechatronics.',
            studentCount: 90,
            coachCount: 6,
            status: 'Active'
          }
        ];
        
        setSchools(mockSchools);
        setFilteredSchools(mockSchools);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const filtered = schools.filter(school =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSchools(filtered);
  }, [searchTerm, schools]);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-10 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Participating Schools</h1>
        <p className="text-muted-foreground">Discover robotics programs across Syria</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools by name, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{school.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {school.location}
                  </CardDescription>
                </div>
                <Badge variant={school.status === 'Active' ? 'default' : 'secondary'}>
                  {school.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {school.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{school.studentCount} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{school.coachCount} coaches</span>
                </div>
              </div>
              
              <Link href={`/schools/${school.id}`}>
                <Button className="w-full" size="sm">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No schools found matching your search.</p>
        </div>
      )}
    </div>
  );
}
