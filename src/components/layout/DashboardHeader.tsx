"use client";

import { useEffect } from "react";

import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { NotificationDropdown } from "@/components/shared/NotificationDropdown";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { signOut } from "@/app/auth/actions";

export function DashboardHeader() {
  const { toggleSearchPalette } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const initUser = async () => {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    if (!user) {
      initUser();
    }
  }, [user, setUser]);

  const handleLogout = async () => {
    await signOut();
  };

  const userInitial = user?.user_metadata?.first_name?.[0] || user?.email?.[0] || "S";
  const userName = user?.user_metadata ? `${user.user_metadata.first_name || ""} ${user.user_metadata.last_name || ""}`.trim() : "Scholar";
  const userEmail = user?.email || "scholar@scholarx.dev";

  return (
    <header className="hidden lg:flex h-16 border-b border-border items-center justify-between px-8 sticky top-0 bg-background/80 backdrop-blur z-30">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSearchPalette}
          className="relative w-96 flex items-center h-10 px-4 rounded-full bg-muted/50 border border-transparent hover:border-border hover:bg-muted/80 transition-all text-muted-foreground group"
        >
          <Icon name="Search" className="text-muted-foreground group-hover:text-foreground transition-colors mr-2" size={16} />
          <span className="text-sm flex-1 text-left">Search scholarships, documents...</span>
          <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationDropdown />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative h-8 w-8 rounded-full ml-2 bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase hover:bg-primary/30 transition-all focus:outline-none">
              {userInitial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex w-full items-center cursor-pointer">
                <Icon name="User" className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex w-full items-center cursor-pointer">
                <Icon name="Settings" className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <Icon name="LogOut" className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
