

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Building2, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import CreateCompetitionForm from "./CreateCompetitionForm";
import CreateSchoolForm from "./CreateSchoolForm";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Competition {
  id: string;
  name: string;
  date: string;
  status: string;
}

interface School {
  id: string;
  name: string;
  location: string;
  status: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        const data = await response.json();
        if (data.user.role !== 'Admin') {
          router.push('/dashboard');
          return;
        }
        
        // Load mock data for now
        setUsers([
          { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Coach', status: 'Active' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Student', status: 'Active' },
        ]);
        
        setCompetitions([
          { id: '1', name: 'VEX Robotics Competition', date: '2024-03-15', status: 'Upcoming' },
          { id: '2', name: 'FIRST Robotics Competition', date: '2024-04-20', status: 'Upcoming' },
        ]);
        
        setSchools([
          { id: '1', name: 'Damascus High School', location: 'Damascus', status: 'Active' },
          { id: '2', name: 'Aleppo University', location: 'Aleppo', status: 'Active' },
        ]);
        
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage academy operations and users</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage academy operations and users</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">Active academy members</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Competitions</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{competitions.length}</div>
                <p className="text-xs text-muted-foreground">Upcoming events</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Schools</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schools.length}</div>
                <p className="text-xs text-muted-foreground">Participating institutions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coaches</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => u.role === 'Coach').length}</div>
                <p className="text-xs text-muted-foreground">Active mentors</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage academy users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitions" className="space-y-6">
          <CreateCompetitionForm />
          
          <Card>
            <CardHeader>
              <CardTitle>Existing Competitions</CardTitle>
              <CardDescription>Manage announced competitions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitions.map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{comp.name}</h3>
                      <p className="text-sm text-muted-foreground">{comp.date}</p>
                    </div>
                    <Badge variant={comp.status === 'Upcoming' ? 'default' : 'secondary'}>
                      {comp.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools" className="space-y-6">
          <CreateSchoolForm />
          
          <Card>
            <CardHeader>
              <CardTitle>Registered Schools</CardTitle>
              <CardDescription>Manage participating institutions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schools.map((school) => (
                  <div key={school.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{school.name}</h3>
                      <p className="text-sm text-muted-foreground">{school.location}</p>
                    </div>
                    <Badge variant={school.status === 'Active' ? 'default' : 'secondary'}>
                      {school.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
