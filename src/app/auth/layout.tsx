import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { SplineScene } from "@/components/tree/SplineScene";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Content */}
      <div className="flex flex-col justify-center items-center p-8 bg-background relative z-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-12 group w-fit">
            <Icon name="TreePine" className="text-primary group-hover:text-secondary transition-colors" size={32} />
            <span className="font-heading font-bold text-2xl tracking-tight">ScholarX</span>
          </Link>
          {children}
        </div>
      </div>
      {/* Right side - Spline/Image */}
      <div className="hidden lg:flex bg-primary/5 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-0" />
        <SplineScene scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" className="z-10" />
      </div>
    </div>
  );
}
