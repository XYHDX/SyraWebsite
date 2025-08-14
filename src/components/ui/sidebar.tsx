
"use client";

import Link from "next/link";
import { Bot, Settings, Trophy, Users, Newspaper, School, Wand2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_TITLE } from "@/lib/config";

interface SidebarProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export function Sidebar({ isMobile = false, onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

  const NavLink = ({ href, icon: Icon, children }: { href: string; icon: React.ElementType; children: React.ReactNode }) => (
    <Link
      href={href}
      onClick={onLinkClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive(href) && "bg-muted text-primary",
        isMobile && "text-base gap-4"
      )}
    >
      <Icon className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
      {children}
    </Link>
  );

  const platformLinks = (
    <>
      <NavLink href="/community" icon={Newspaper}>Community</NavLink>
      <NavLink href="/competitions" icon={Trophy}>Competitions</NavLink>
      <NavLink href="/schools" icon={School}>Schools</NavLink>
      <NavLink href="/coaches" icon={Users}>Coaches</NavLink>
      <NavLink href="/teams" icon={Users}>Teams</NavLink>
    </>
  );

   const adminLinks = (
     <>
        <NavLink href="/admin" icon={Settings}>Admin Dashboard</NavLink>
        <NavLink href="/ai/generate-post" icon={Wand2}>Post Generator</NavLink>
        <NavLink href="/ai/coach" icon={Bot}>AI Coach</NavLink>
     </>
  );

  const navigationSections = (
    <>
      <div className={cn("my-2", isMobile && "border-t pt-4")}>
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Platform
        </h3>
        <nav className={cn("grid items-start text-sm font-medium", isMobile && "gap-1")}>
            {platformLinks}
        </nav>
      </div>
      <div className={cn("my-2", isMobile && "border-t pt-4")}>
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Admin Tools
        </h3>
        <nav className={cn("grid items-start text-sm font-medium", isMobile && "gap-1")}>
            {adminLinks}
        </nav>
      </div>
    </>
  );

  if (isMobile) {
    return navigationSections;
  }

  return (
    <div className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Bot className="h-6 w-6 text-primary" />
            <span className="">{APP_TITLE}</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          {navigationSections}
        </div>
      </div>
    </div>
  );
}
