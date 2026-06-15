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
import { signup } from "../actions";

const signupSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("password", data.password);
    
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full">
      <h1 className="text-3xl font-heading font-bold mb-2 tracking-tight">Plant your seed</h1>
      <p className="text-muted-foreground mb-8">Create an account and start your journey.</p>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First name</label>
            <Input {...register("firstName")} placeholder="John" className="h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Last name</label>
            <Input {...register("lastName")} placeholder="Doe" className="h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email address</label>
          <Input {...register("email")} type="email" placeholder="you@example.com" className="h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input {...register("password")} type="password" placeholder="••••••••" className="h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm Password</label>
          <Input {...register("confirmPassword")} type="password" placeholder="••••••••" className="h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button variant="premium" type="submit" disabled={isLoading} className="w-full h-12 text-base mt-6 font-semibold">
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
