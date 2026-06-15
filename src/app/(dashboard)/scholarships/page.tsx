"use client";

import { FiltersSidebar } from "@/components/scholarships/explorer/FiltersSidebar";
import { ScholarshipGrid } from "@/components/scholarships/explorer/ScholarshipGrid";
import { useScholarshipFilterStore } from "@/store/scholarshipFilterStore";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useDebounce } from "@/hooks/useDebounce"; // Need to create this
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function ScholarshipExplorerPage() {
  const { searchQuery, setSearchQuery, sortOption, setSortOption } = useScholarshipFilterStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] overflow-hidden -m-4 sm:-m-8">
      {/* Top Header / Search Bar area */}
      <div className="flex-none p-4 sm:p-8 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center max-w-7xl mx-auto w-full">
          <div className="relative w-full max-w-md">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search scholarships, universities, countries..." 
              className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Filter Trigger */}
            <Sheet>
              <SheetTrigger
              render={
                <Button variant="outline" className="lg:hidden shrink-0 h-12 px-4 rounded-xl">
                  <Icon name="SlidersHorizontal" size={16} className="mr-2" />
                  Filters
                </Button>
              }
            />
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto pt-10">
                <FiltersSidebar />
              </SheetContent>
            </Sheet>

            <select 
              className="h-12 w-full sm:w-48 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="best_match">Best Match</option>
              <option value="newest">Newest</option>
              <option value="deadline">Deadline Soon</option>
              <option value="most_saved">Most Saved</option>
              <option value="most_viewed">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex max-w-7xl mx-auto w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-none overflow-y-auto p-8 border-r border-border/50 custom-scrollbar">
          <FiltersSidebar />
        </aside>

        {/* Results Grid */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <ScholarshipGrid />
        </main>
      </div>
    </div>
  );
}
