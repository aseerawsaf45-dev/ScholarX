"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { signOut } from "@/app/auth/actions";

const links = [
  { href: "#features", label: "Features" },
  { href: "#scholarships", label: "Scholarships" },
  { href: "#community", label: "Community" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-background/80 backdrop-blur-md border-border shadow-soft" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Icon name="TreePine" className="text-primary group-hover:text-secondary transition-colors" size={28} />
          <span className="font-heading font-bold text-xl tracking-tight">ScholarX</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => { signOut(); }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button variant="premium" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" aria-label="Open Menu" />}>
            <Icon name="Menu" />
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col">
            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
            <div className="flex items-center gap-2 mb-8">
              <Icon name="TreePine" className="text-primary" size={28} />
              <span className="font-heading font-bold text-xl">ScholarX</span>
            </div>
            <nav className="flex flex-col gap-4 flex-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-border"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-4 mt-auto">
              {user ? (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { signOut(); }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button variant="premium" className="w-full" asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
