"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useUIStore } from "@/store/uiStore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const { searchPaletteOpen, setSearchPaletteOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Handle Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchPaletteOpen(!searchPaletteOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [searchPaletteOpen, setSearchPaletteOpen]);

  const handleSelect = (href: string) => {
    setSearchPaletteOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={searchPaletteOpen} onOpenChange={setSearchPaletteOpen}>
      <DialogContent className="p-0 overflow-hidden shadow-2xl max-w-2xl border-border bg-background sm:rounded-xl">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Icon name="Search" className="text-muted-foreground mr-3" size={20} />
          <input
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {/* Mock Results */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Quick Actions
          </div>
          <button
            onClick={() => handleSelect("/scholarships")}
            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
          >
            <Icon name="Search" size={16} className="text-primary" />
            Find Scholarships
          </button>
          <button
            onClick={() => handleSelect("/roadmap")}
            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
          >
            <Icon name="Map" size={16} className="text-primary" />
            View Roadmap
          </button>
          
          <div className="px-2 py-1.5 mt-2 text-xs font-semibold text-muted-foreground">
            Recent Searches
          </div>
          <button
            onClick={() => handleSelect("/scholarships?q=fulbright")}
            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
          >
            <Icon name="History" size={16} className="text-muted-foreground" />
            Fulbright Scholarship 2027
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
