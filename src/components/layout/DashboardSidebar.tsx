"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const menuItems: { name: string; href: string; icon: IconName }[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Scholarship Explorer", href: "/scholarships", icon: "Search" },
  { name: "AI Advisor", href: "/ai-advisor", icon: "Bot" },
  { name: "Roadmap", href: "/roadmap", icon: "Map" },
  { name: "Deadlines", href: "/deadlines", icon: "Clock" },
  { name: "Documents", href: "/documents", icon: "FileText" },
  { name: "Community", href: "/community", icon: "Users" },
  { name: "Settings", href: "/settings", icon: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <TooltipProvider>
      <motion.aside 
        initial={false}
        animate={{ width: sidebarCollapsed ? "5rem" : "16rem" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-screen border-r border-border bg-sidebar text-sidebar-foreground sticky top-0 shrink-0 z-40 overflow-hidden"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2 group overflow-hidden">
            <Icon name="TreePine" className="text-primary group-hover:text-secondary transition-colors shrink-0" size={24} />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-heading font-bold text-lg tracking-tight whitespace-nowrap"
                >
                  ScholarX
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0">
            <Icon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} size={18} />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            
            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                  sidebarCollapsed ? "justify-center" : "justify-start",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon 
                  name={item.icon} 
                  size={20} 
                  className={cn(
                    "shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"
                  )} 
                />
                
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className={cn(
                      "absolute bg-primary rounded-r-full",
                      sidebarCollapsed ? "left-0 top-1/2 -translate-y-1/2 w-1 h-1/2" : "left-0 top-0 bottom-0 w-1"
                    )}
                  />
                )}
              </Link>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.name}>{linkContent}</div>;
          })}
        </nav>

        <div className="p-3 border-t border-border shrink-0">
          <div className={cn("flex items-center px-2 py-2", sidebarCollapsed ? "justify-center" : "gap-3")}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              JD
            </div>
            
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="text-sm font-medium truncate">John Doe</p>
                  <p className="text-xs text-muted-foreground truncate">john@example.com</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
