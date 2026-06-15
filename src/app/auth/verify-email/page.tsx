"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
        <Icon name="Mail" size={32} />
      </div>
      <h1 className="text-3xl font-heading font-bold mb-2 tracking-tight">Check your email</h1>
      <p className="text-muted-foreground mb-8">
        We sent a verification link to <span className="font-medium text-foreground">{email || "your email"}</span>. 
        Please click the link to verify your account and start growing your legacy.
      </p>

      <div className="space-y-4">
        <Link href="/auth/login" className="w-full">
          <Button variant="premium" className="w-full h-12 text-base font-semibold">Return to login</Button>
        </Link>
        <p className="text-sm text-muted-foreground mt-8">
          Didn&apos;t receive the email?{" "}
          <button className="text-primary font-medium hover:underline">
            Click to resend
          </button>
        </p>
      </div>
    </motion.div>
  );
}
