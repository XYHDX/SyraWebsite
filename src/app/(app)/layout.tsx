
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { LogOut, Moon, Settings, Sun, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { HeaderNav } from "./HeaderNav";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bot } from "lucide-react";
import { APP_TITLE } from "@/lib/config";
import { Sidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          setUser(userData);
          
          if (window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/') {
            router.push(userData.role === 'Admin' ? '/admin' : '/dashboard');
          }
        } else {
          router.push('/login');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (loading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Bot className="w-16 h-16 animate-pulse text-primary" />
                <p className="text-muted-foreground">Loading Academy...</p>
            </div>
        </div>
    );
  }
  
  if (!user) {
    return null; 
  }

  const isAdmin = user.role === 'Admin';

  return (
    <div className="flex min-h-screen w-full flex-col">
       {isAdmin && <Sidebar />}
       <div className={cn(isAdmin && "md:pl-64")}>
        <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 z-50">
            <div className="flex items-center gap-2">
                {/* Mobile Menu & Logo */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64">
                        <SheetHeader>
                            <SheetTitle>{APP_TITLE}</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4">
                            <HeaderNav onNavigate={closeMobileMenu} />
                        </div>
                    </SheetContent>
                </Sheet>
                
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    <span className="font-bold">{APP_TITLE}</span>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatars/01.png" alt={user.name || user.email} />
                                <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard">
                                <UserIcon className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>

        <main className="flex-1">
            {children}
        </main>
       </div>
    </div>
  );
}
