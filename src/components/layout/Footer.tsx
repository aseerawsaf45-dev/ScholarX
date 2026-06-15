import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Icon name="TreePine" className="text-primary group-hover:text-secondary transition-colors" size={28} />
              <span className="font-heading font-bold text-xl tracking-tight">ScholarX</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Grow Beyond Borders. Discover scholarships, evaluate eligibility, and build a winning application journey with AI guidance.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#scholarships" className="text-sm text-muted-foreground hover:text-primary transition-colors">Scholarships</Link></li>
              <li><Link href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Community</h4>
            <ul className="space-y-3">
              <li><Link href="/community" className="text-sm text-muted-foreground hover:text-primary transition-colors">Forums</Link></li>
              <li><Link href="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">Events</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ScholarX. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Twitter
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              GitHub
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
