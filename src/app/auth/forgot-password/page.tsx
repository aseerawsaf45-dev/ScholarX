"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { createClient } from "@/utils/supabase/client";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) {
      setError(error.message);
    } else {
      setIsSubmitted(true);
    }
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full text-center">
        <h1 className="text-3xl font-heading font-bold mb-2 tracking-tight">Check your email</h1>
        <p className="text-muted-foreground mb-8">
          We sent a password reset link to your email.
        </p>
        <Button variant="premium" className="w-full h-12 text-base font-semibold" asChild>
          <Link href="/auth/login">Return to login</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full">
      <h1 className="text-3xl font-heading font-bold mb-2 tracking-tight">Forgot password?</h1>
      <p className="text-muted-foreground mb-8">No worries, we&apos;ll send you reset instructions.</p>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email address</label>
          <Input {...register("email")} type="email" placeholder="you@example.com" className="h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button variant="premium" type="submit" disabled={isLoading} className="w-full h-12 text-base mt-6 font-semibold">
          {isLoading ? "Sending..." : "Reset password"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
