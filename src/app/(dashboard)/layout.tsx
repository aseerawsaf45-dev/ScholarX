"use client";


import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur z-40">
          <div className="flex items-center gap-2">
            <Icon name="TreePine" className="text-primary" size={24} />
            <span className="font-heading font-bold text-lg">ScholarX</span>
          </div>
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Icon name="Menu" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              {/* Reuse sidebar content or render DashboardSidebar logic here */}
              <div className="p-4">Menu Content</div>
            </SheetContent>
          </Sheet>
        </header>

        <DashboardHeader />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
