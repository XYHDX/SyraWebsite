

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, PlusCircle, Trash2, Edit, Search, Check, X, Loader2, UserPlus, Shield, Newspaper } from "lucide-react";
import { approvePost, getPosts, getUsers, promoteUserToCoach, deleteUser, getCompetitions, deleteCompetition, deletePost, getSchools, deleteSchool, demoteCoach, promoteUserToSchoolAdmin, demoteSchoolAdmin, getTeams, getPendingRegistrations, approveRegistration, denyRegistration, deleteTeam } from "@/lib/firestore";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateCompetitionForm } from "./CreateCompetitionForm";
import { CreateSchoolForm } from "./CreateSchoolForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSearchParams } from "next/navigation";
import withAdminAuth from "@/components/withAdminAuth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


interface User { 
    id: string; 
    name: string; 
    email: string; 
    role: string;
    schoolId?: string;
    schoolName?: string;
}

interface Post {
    id: string;
    author: string;
    content: string;
    status: string;
    createdAt: any;
}

interface Competition {
  id: string;
  name: string;
  description: string;
  date: string | Date;
  status: string;
}

interface School {
    id: string;
    name: string;
    location: string;
    teams: number;
    coach: string;
    about?: string;
}

interface Team {
    id: string;
    name: string;
    schoolName: string;
    coachName: string;
    schoolId: string;
    coachId: string;
}

interface Registration {
    id: string;
    competitionId: string;
    competitionName: string;
    teamName: string;
    coachName: string;
    status: string;
}

function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [isCompetitionFormOpen, setIsCompetitionFormOpen] = useState(false);
    const [isSchoolFormOpen, setIsSchoolFormOpen] = useState(false);
    const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
    const [editingSchool, setEditingSchool] = useState<School | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loadingUserPosts, setLoadingUserPosts] = useState(false);

    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [postSearchTerm, setPostSearchTerm] = useState("");
    const [competitionSearchTerm, setCompetitionSearchTerm] = useState("");
    const [schoolSearchTerm, setSchoolSearchTerm] = useState("");
    const [teamSearchTerm, setTeamSearchTerm] = useState("");
    const [postStatusFilter, setPostStatusFilter] = useState<string>("All");

    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || "users";


    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [usersData, postsData, competitionsData, schoolsData, teamsData, regsData] = await Promise.all([
                getUsers(),
                getPosts("All"), 
                getCompetitions(),
                getSchools(),
                getTeams(),
                getPendingRegistrations()
            ]);
            setUsers(usersData);
            setPosts(postsData as Post[]);
            setCompetitions(competitionsData as Competition[]);
            setSchools(schoolsData as School[]);
            setTeams(teamsData as Team[]);
            setRegistrations(regsData as Registration[]);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
            toast({ variant: "destructive", title: "Failed to load data" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const pendingPostsCount = useMemo(() => {
        return posts.filter(post => post.status === 'Pending').length;
    }, [posts]);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
        );
    }, [users, userSearchTerm]);

    const filteredPosts = useMemo(() => {
        return posts
            .filter(post => postStatusFilter === 'All' || post.status === postStatusFilter)
            .filter(post => 
                post.author.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(postSearchTerm.toLowerCase())
            );
    }, [posts, postStatusFilter, postSearchTerm]);

    const filteredCompetitions = useMemo(() => {
        return competitions.filter(comp =>
            comp.name.toLowerCase().includes(competitionSearchTerm.toLowerCase())
        );
    }, [competitions, competitionSearchTerm]);

    const filteredSchools = useMemo(() => {
        return schools.filter(school =>
            school.name.toLowerCase().includes(schoolSearchTerm.toLowerCase()) ||
            school.location.toLowerCase().includes(schoolSearchTerm.toLowerCase())
        );
    }, [schools, schoolSearchTerm]);

    const filteredTeams = useMemo(() => {
        return teams.filter(team =>
            team.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
            team.schoolName.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
            team.coachName.toLowerCase().includes(teamSearchTerm.toLowerCase())
        );
    }, [teams, teamSearchTerm]);


    const handlePromoteUser = async (userId: string) => {
        try {
            await promoteUserToCoach(userId);
            toast({
                title: "User Promoted!",
                description: "The user now has Coach privileges.",
            });
            fetchData();
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Promotion Failed",
                description: error.message,
            });
        }
    };
    
    const handleDemoteCoach = async (userId: string) => {
        try {
            await demoteCoach(userId);
            toast({
                title: "Coach Demoted",
                description: "The user's role has been set to Student.",
            });
            fetchData();
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Demotion Failed",
                description: error.message,
            });
        }
    };

     const handlePromoteToSchoolAdmin = async (userId: string, schoolId: string, schoolName: string) => {
        try {
            await promoteUserToSchoolAdmin(userId, schoolId, schoolName);
            toast({
                title: "User Promoted!",
                description: `The user is now a School Admin for ${schoolName}.`,
            });
            fetchData();
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Promotion Failed",
                description: error.message,
            });
        }
    };

    const handleDemoteSchoolAdmin = async (userId: string) => {
        try {
            await demoteSchoolAdmin(userId);
            toast({
                title: "School Admin Demoted",
                description: "The user's role has been set to Student.",
            });
            fetchData();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Demotion Failed",
                description: error.message,
            });
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        try {
            await deleteUser(userId, userName);
            setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
            toast({
                title: "User's Firestore Data Removed",
                description: `All data for ${userName} has been removed from the database. IMPORTANT: You must now manually delete this user from the Firebase Authentication console to fully remove their account.`,
                duration: 10000,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Removal Failed",
                description: error.message,
            });
        }
    };

    const handleEditCompetition = (competition: Competition) => {
        setEditingCompetition(competition);
        setIsCompetitionFormOpen(true);
    };

    const handleCreateCompetition = () => {
        setEditingCompetition(null);
        setIsCompetitionFormOpen(true);
    };
    
    const handleDeleteCompetition = async (id: string) => {
        // Optimistic update
        const originalCompetitions = competitions;
        setCompetitions(current => current.filter(c => c.id !== id));
        try {
            await deleteCompetition(id);
            toast({ title: "Competition Deleted" });
            // No need to call fetchData(), UI is already updated
        } catch (error: any) {
             toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
             setCompetitions(originalCompetitions); // Rollback on error
        }
    };
    
    const handleEditSchool = (school: School) => {
        setEditingSchool(school);
        setIsSchoolFormOpen(true);
    };
    
    const handleCreateSchool = () => {
        setEditingSchool(null);
        setIsSchoolFormOpen(true);
    };

    const handleDeleteSchool = async (id: string) => {
        const originalSchools = schools;
        setSchools(current => current.filter(s => s.id !== id));
        try {
            await deleteSchool(id);
            toast({ title: "School Deleted" });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
            setSchools(originalSchools);
        }
    }

    const handleViewUserPosts = async (user: User) => {
        setViewingUser(user);
        setLoadingUserPosts(true);
        setUserPosts([]); // Clear previous posts
        try {
            const posts = await getPosts("All", undefined, user.id);
            setUserPosts(posts as Post[]);
        } catch (error) {
            toast({variant: "destructive", title: "Could not fetch user posts."})
        } finally {
            setLoadingUserPosts(false);
        }
    }
    
    const handleDeleteTeam = async (id: string) => {
        const originalTeams = teams;
        setTeams(current => current.filter(t => t.id !== id));
        try {
            const teamToDelete = teams.find(t => t.id === id);
            if (!teamToDelete) throw new Error("Team not found");
            await deleteTeam(id, teamToDelete.schoolId);
            toast({ title: "Team Deleted" });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
            setTeams(originalTeams);
        }
    }


    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users, posts, and competitions across the platform.</p>
            </div>

            <Tabs defaultValue={initialTab} className="flex flex-col w-full">
                <TabsList className="w-full sm:w-fit self-start">
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="posts">
                        Post Moderation
                        {pendingPostsCount > 0 && <Badge className="ml-2">{pendingPostsCount}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="competitions">Competition Management</TabsTrigger>
                    <TabsTrigger value="schools">School Management</TabsTrigger>
                    <TabsTrigger value="teams">Team Management</TabsTrigger>
                    <TabsTrigger value="registrations">
                        Registrations
                        {registrations.length > 0 && <Badge className="ml-2">{registrations.length}</Badge>}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                            <CardDescription>Promote users to coach or school roles, or remove them.</CardDescription>
                             <div className="relative pt-2">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by name or email..." 
                                    className="pl-8 w-full sm:w-64"
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                />
                             </div>
                        </CardHeader>
                        <CardContent>
                             {loading ? <UserTableSkeleton /> : <UserTable users={filteredUsers} schools={schools} onAction={fetchData} />}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="posts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Community Posts</CardTitle>
                            <CardDescription>Review and approve posts submitted by the community.</CardDescription>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search by author or content..." 
                                        className="pl-8 w-full sm:w-64"
                                        value={postSearchTerm}
                                        onChange={(e) => setPostSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select onValueChange={setPostStatusFilter} defaultValue="All">
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Statuses</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? <PostTableSkeleton /> : <PostTable initialPosts={filteredPosts} onAction={fetchData} />}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="competitions">
                    <Card>
                        <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <CardTitle>Competitions</CardTitle>
                                <CardDescription>Create, edit, and announce new competitions.</CardDescription>
                                <div className="relative pt-2">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search by name..." 
                                        className="pl-8 w-full sm:w-64"
                                        value={competitionSearchTerm}
                                        onChange={(e) => setCompetitionSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                           <Dialog open={isCompetitionFormOpen} onOpenChange={setIsCompetitionFormOpen}>
                             <DialogTrigger asChild>
                                <Button onClick={handleCreateCompetition}><PlusCircle/>New Competition</Button>
                             </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingCompetition ? "Edit Competition" : "Create New Competition"}</DialogTitle>
                                    <DialogDescription>
                                       {editingCompetition ? "Update the details of the existing competition." : "Fill out the form to announce a new competition."}
                                    </DialogDescription>
                                </DialogHeader>
                                <CreateCompetitionForm 
                                    onCompetitionCreated={fetchData} 
                                    editingCompetition={editingCompetition}
                                    onFinished={() => setIsCompetitionFormOpen(false)}
                                />
                             </DialogContent>
                           </Dialog>
                        </CardHeader>
                        <CardContent>
                           {loading ? <CompetitionTableSkeleton/> : <CompetitionTable competitions={filteredCompetitions} onEdit={handleEditCompetition} onDelete={handleDeleteCompetition} />}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="schools">
                     <Card>
                        <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <CardTitle>Schools</CardTitle>
                                <CardDescription>Add, edit, and manage participating schools.</CardDescription>
                                <div className="relative pt-2">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search by school name or location..." 
                                        className="pl-8 w-full sm:w-64"
                                        value={schoolSearchTerm}
                                        onChange={(e) => setSchoolSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Dialog open={isSchoolFormOpen} onOpenChange={setIsSchoolFormOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={handleCreateSchool}><PlusCircle/>New School</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingSchool ? "Edit School" : "Register a New School"}</DialogTitle>
                                        <DialogDescription>
                                            {editingSchool ? "Update the school's information." : "Add a new school to the academy directory."}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <CreateSchoolForm 
                                        onSchoolCreated={fetchData}
                                        editingSchool={editingSchool}
                                        onFinished={() => setIsSchoolFormOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {loading ? <SchoolTableSkeleton /> : <SchoolTable schools={filteredSchools} onEdit={handleEditSchool} onDelete={handleDeleteSchool} />}
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="teams">
                    <Card>
                        <CardHeader>
                            <CardTitle>Teams</CardTitle>
                            <CardDescription>View and manage all registered teams.</CardDescription>
                             <div className="relative pt-2">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by team, school, or coach..." 
                                    className="pl-8 w-full sm:w-64"
                                    value={teamSearchTerm}
                                    onChange={(e) => setTeamSearchTerm(e.target.value)}
                                />
                             </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? <TeamTableSkeleton /> : <TeamTable teams={filteredTeams} onDelete={handleDeleteTeam} />}
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="registrations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Registrations</CardTitle>
                            <CardDescription>Approve or deny team registrations for competitions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? <RegistrationTableSkeleton /> : <RegistrationTable registrations={registrations} onAction={fetchData} />}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            

             <Dialog open={!!viewingUser} onOpenChange={(isOpen) => { if (!isOpen) setViewingUser(null); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Posts by {viewingUser?.name}</DialogTitle>
                        <DialogDescription>A list of all posts submitted by this user.</DialogDescription>
                    </DialogHeader>
                    {loadingUserPosts ? <PostTableSkeleton/> : 
                        <div className="max-h-[60vh] overflow-y-auto">
                            {userPosts.length > 0 ? (
                                <PostTable initialPosts={userPosts} onAction={() => handleViewUserPosts(viewingUser!)} />
                            ): (
                                <p className="text-center text-muted-foreground py-8">This user has not submitted any posts.</p>
                            )}
                        </div>
                    }
                </DialogContent>
            </Dialog>

        </main>
    );
}

function UserTable({ users, schools, onAction }: { users: User[], schools: School[], onAction: () => void }) {
     if (users.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No users found.</div>
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden sm:table-cell">Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                            <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Coach' ? 'default' : user.role === 'School Admin' ? 'secondary' : 'outline'}>{user.role}</Badge>
                            {user.role === 'School Admin' && user.schoolName && <div className="text-xs text-muted-foreground">{user.schoolName}</div>}
                        </TableCell>
                        <TableCell className="text-right">
                            <AdminActionMenu user={user} schools={schools} onAction={onAction} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function PostTable({ initialPosts, onAction }: { initialPosts: Post[], onAction: () => void }) {
    const [posts, setPosts] = useState(initialPosts);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setPosts(initialPosts);
    }, [initialPosts]);

    const handleApprove = async (postId: string) => {
        setApprovingId(postId);
        try {
            await approvePost(postId);
            toast({
                title: "Post Approved!",
                description: "The post is now visible to the community.",
            });
            onAction(); // Re-fetch for consistency
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Approval Failed",
                description: error.message,
            });
        } finally {
            setApprovingId(null);
        }
    };

    const handleDelete = async (postId: string) => {
        const originalPosts = [...posts];
        setPosts(current => current.filter(p => p.id !== postId));
        try {
            await deletePost(postId);
            toast({
                title: "Post Deleted",
                description: "The post has been removed.",
            });
            onAction(); 
        } catch (error: any) {
            setPosts(originalPosts); // Rollback
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: error.message,
            });
        }
    }

    if (posts.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No posts found.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="max-w-[250px] w-1/2">Content</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {posts.map(post => (
                    <TableRow key={post.id}>
                        <TableCell>
                             <p className="text-sm text-muted-foreground truncate">{post.content}</p>
                        </TableCell>
                         <TableCell>
                             <div className="font-medium">{post.author}</div>
                             <div className="text-xs text-muted-foreground">{post.createdAt ? format(post.createdAt.seconds * 1000, "PP") : 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={post.status === 'Approved' ? 'default' : post.status === 'Pending' ? 'outline' : 'destructive'}>
                                {post.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">View</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Post by {post.author}</DialogTitle>
                                        <DialogDescription>
                                          Full content of the post submitted for review.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <p className="py-4 whitespace-pre-wrap">{post.content}</p>
                                </DialogContent>
                            </Dialog>
                             {post.status === 'Pending' && (
                                <Button 
                                    size="sm" 
                                    onClick={() => handleApprove(post.id)}
                                    disabled={approvingId === post.id}
                                >
                                    {approvingId === post.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check />}
                                    Approve
                                </Button>
                             )}
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm"><Trash2 /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the post.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(post.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function CompetitionTable({ competitions, onEdit, onDelete }: { competitions: Competition[], onEdit: (comp: Competition) => void, onDelete: (id: string) => void }) {
    
    if (competitions.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No competitions found.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {competitions.map((comp) => (
                    <TableRow key={comp.id}>
                        <TableCell className="font-medium">{comp.name}</TableCell>
                        <TableCell>{comp.date as string}</TableCell>
                        <TableCell><Badge variant={comp.status === 'Completed' ? 'secondary' : 'default'}>{comp.status}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                             <Button size="sm" variant="outline" onClick={() => onEdit(comp)}><Edit className="mr-2 h-3 w-3" />Edit</Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive"><Trash2 className="mr-2 h-3 w-3" />Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the competition.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(comp.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


function SchoolTable({ schools, onEdit, onDelete }: { schools: School[], onEdit: (school: School) => void, onDelete: (id: string) => void }) {
    if (schools.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No schools found. Register one to get started.</div>
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {schools.map((school) => (
                    <TableRow key={school.id}>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>{school.location}</TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => onEdit(school)}><Edit className="mr-2 h-3 w-3" />Edit</Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive"><Trash2 className="mr-2 h-3 w-3" />Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the school.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(school.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function TeamTable({ teams, onDelete }: { teams: Team[], onDelete: (id: string) => void }) {
    if (teams.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No teams found.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {teams.map((team) => (
                    <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                         <TableCell>
                            <Link href={`/schools/${team.schoolId}`} className="hover:underline">{team.schoolName}</Link>
                        </TableCell>
                        <TableCell>
                             <Link href={`/coaches/${team.coachId}`} className="hover:underline">{team.coachName}</Link>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" asChild><Link href={`/teams/${team.id}`}>View</Link></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive"><Trash2 /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the team "{team.name}". This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(team.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function RegistrationTable({ registrations, onAction }: { registrations: Registration[], onAction: () => void }) {
    const { toast } = useToast();

    const handleApprove = async (reg: Registration) => {
        try {
            await approveRegistration(reg.competitionId, reg.id);
            toast({ title: "Registration Approved!" });
            onAction();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Approval Failed", description: error.message });
        }
    }
    
    const handleDeny = async (reg: Registration) => {
         try {
            await denyRegistration(reg.competitionId, reg.id);
            toast({ title: "Registration Denied" });
            onAction();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Denial Failed", description: error.message });
        }
    }


    if (registrations.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No pending registrations.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Competition</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                        <TableCell className="font-medium">{reg.teamName}</TableCell>
                        <TableCell>{reg.competitionName}</TableCell>
                        <TableCell>{reg.coachName}</TableCell>
                        <TableCell className="text-right space-x-2">
                             <Button size="sm" variant="outline" onClick={() => handleApprove(reg)}><Check className="mr-2 h-3 w-3" />Approve</Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive"><X className="mr-2 h-3 w-3" />Deny</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will deny and remove the registration request for {reg.teamName}.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeny(reg)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function AdminActionMenu({ user, schools, onAction }: { user: User, schools: School[], onAction: () => void}) {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRoleChange = async (action: 'promoteCoach' | 'demoteCoach' | 'promoteSchoolAdmin' | 'demoteSchoolAdmin') => {
        setIsSubmitting(true);
        try {
            switch(action) {
                case 'promoteCoach':
                    await promoteUserToCoach(user.id);
                    toast({ title: "User Promoted!", description: "The user now has Coach privileges." });
                    break;
                case 'demoteCoach':
                    await demoteCoach(user.id);
                    toast({ title: "Coach Demoted", description: "The user's role has been set to Student." });
                    break;
                case 'promoteSchoolAdmin':
                    if (!selectedSchoolId) {
                        toast({ variant: "destructive", title: "Promotion Failed", description: "Please select a school." });
                        setIsSubmitting(false);
                        return;
                    }
                    const school = schools.find(s => s.id === selectedSchoolId);
                    if (!school) {
                         toast({ variant: "destructive", title: "Promotion Failed", description: "Selected school not found." });
                         setIsSubmitting(false);
                         return;
                    }
                    await promoteUserToSchoolAdmin(user.id, selectedSchoolId, school.name);
                    toast({ title: "User Promoted!", description: `The user is now a School Admin for ${school.name}.` });
                    break;
                case 'demoteSchoolAdmin':
                    await demoteSchoolAdmin(user.id);
                    toast({ title: "School Admin Demoted", description: "The user's role has been set to Student." });
                    break;
            }
            onAction();
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Action Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDeleteUser = async () => {
         try {
            await deleteUser(user.id, user.name);
            toast({
                title: "User's Firestore Data Removed",
                description: `All data for ${user.name} has been removed from the database. IMPORTANT: You must now manually delete this user from the Firebase Authentication console to fully remove their account.`,
                duration: 10000,
            });
            onAction();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Removal Failed",
                description: error.message,
            });
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                     <DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
                        <Edit /> Manage Role
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/community?authorId=${user.id}`} className="flex items-center w-full"><Newspaper />View Posts</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                <Trash2 /> Remove User
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to remove {user.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will delete the user's data from the database. To fully remove the user, you must also delete them from the Firebase Authentication console. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteUser}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Role for {user.name}</DialogTitle>
                    <DialogDescription>Current Role: <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Coach' ? 'default' : user.role === 'School Admin' ? 'secondary' : 'outline'}>{user.role}</Badge></DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {user.role === 'Student' && (
                        <div className="space-y-2">
                             <Button onClick={() => handleRoleChange('promoteCoach')} disabled={isSubmitting} className="w-full">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><UserPlus />Promote to Coach</>}
                             </Button>
                             <div className="space-y-2 pt-4">
                                <Label htmlFor="school-select">Promote to School Admin</Label>
                                <div className="flex gap-2">
                                     <Select onValueChange={setSelectedSchoolId} disabled={isSubmitting}>
                                        <SelectTrigger id="school-select">
                                            <SelectValue placeholder="Select a school..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schools.map(school => (
                                                <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={() => handleRoleChange('promoteSchoolAdmin')} disabled={isSubmitting || !selectedSchoolId}>
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Shield />Promote</>}
                                    </Button>
                                </div>
                             </div>
                        </div>
                    )}
                    {user.role === 'Coach' && (
                        <Button variant="destructive" onClick={() => handleRoleChange('demoteCoach')} disabled={isSubmitting} className="w-full">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Demote to Student'}
                        </Button>
                    )}
                    {user.role === 'School Admin' && (
                        <Button variant="destructive" onClick={() => handleRoleChange('demoteSchoolAdmin')} disabled={isSubmitting} className="w-full">
                             {isSubmitting ? <Loader2 className="animate-spin" /> : 'Demote to Student'}
                        </Button>
                    )}
                     {user.role === 'Admin' && (
                        <p className="text-sm text-center text-muted-foreground">Admin roles cannot be changed from this panel.</p>
                     )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

const TableSkeleton = ({ columns, rows = 5 }: { columns: { header: string, className?: string }[], rows?: number }) => (
    <Table>
        <TableHeader>
            <TableRow>
                {columns.map((col, i) => <TableHead key={i} className={col.className}>{col.header}</TableHead>)}
            </TableRow>
        </TableHeader>
        <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i}>
                    {columns.map((col, j) => (
                        <TableCell key={j} className={col.className}>
                            <Skeleton className="h-5 w-full" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

const UserTableSkeleton = () => (
    <TableSkeleton columns={[
        { header: "User" },
        { header: "Role", className: "hidden sm:table-cell" },
        { header: "Actions", className: "text-right" }
    ]} />
);

const PostTableSkeleton = () => (
    <TableSkeleton columns={[
        { header: "Content" },
        { header: "Author" },
        { header: "Status" },
        { header: "Actions", className: "text-right" }
    ]} />
);

const CompetitionTableSkeleton = () => (
    <TableSkeleton columns={[
        { header: "Name" },
        { header: "Date" },
        { header: "Status" },
        { header: "Actions", className: "text-right" }
    ]} />
);

const SchoolTableSkeleton = () => (
    <TableSkeleton columns={[
        { header: "Name" },
        { header: "Location" },
        { header: "Actions", className: "text-right" }
    ]} />
);

const TeamTableSkeleton = () => (
     <TableSkeleton columns={[
        { header: "Team Name" },
        { header: "School" },
        { header: "Coach" },
        { header: "Actions", className: "text-right" }
    ]} />
);

const RegistrationTableSkeleton = () => (
     <TableSkeleton columns={[
        { header: "Team Name" },
        { header: "Competition" },
        { header: "Coach" },
        { header: "Actions", className: "text-right" }
    ]} />
);


export default withAdminAuth(AdminPage);
