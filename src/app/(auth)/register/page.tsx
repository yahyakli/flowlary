"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result?.error || "Registration failed");
        return;
      }

      toast.success("Account created successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Unable to register. Please try again.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-16 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-500/10" />
      <div className="pointer-events-none absolute left-1/2 bottom-10 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia-500/10" />
      <div className="pointer-events-none absolute left-10 top-44 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-400/10" />
      <div className="pointer-events-none absolute right-16 bottom-28 h-52 w-52 rounded-full bg-orange-400/15 blur-3xl dark:bg-orange-400/10" />
      <div className="pointer-events-none absolute left-[60%] top-[20%] h-32 w-32 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-400/10" />

      <div className="relative mx-auto flex w-full max-w-lg flex-col gap-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.5)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 opacity-80" />
          <div className="relative space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">
                Create account
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Secure sign-up with effortless setup.
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Get started with the smartest salary planner, spending tracker, and savings dashboard built for modern budgets.
                </p>
              </div>
            </div>

            <Card className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-slate-100/80 p-6 shadow-xl shadow-slate-950/10 backdrop-blur dark:border-slate-700 dark:bg-slate-950/90 dark:shadow-slate-950/20">
              <CardContent className="grid gap-5">
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
                  <div className="grid gap-3 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-950/5 dark:border-slate-700 dark:bg-slate-900/95">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Full name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      autoComplete="name"
                      {...register("name")}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-950 shadow-sm transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    />
                    {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
                  </div>

                  <div className="grid gap-3 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-950/5 dark:border-slate-700 dark:bg-slate-900/95">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...register("email")}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-950 shadow-sm transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    />
                    {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
                  </div>

                  <div className="grid gap-3 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-950/5 dark:border-slate-700 dark:bg-slate-900/95">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      {...register("password")}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-950 shadow-sm transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Use at least 8 characters and avoid common patterns.
                    </p>
                    {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
                  </div>

                  <div className="grid gap-3 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-950/5 dark:border-slate-700 dark:bg-slate-900/95">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Confirm password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      {...register("confirmPassword")}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-950 shadow-sm transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    />
                    {errors.confirmPassword ? (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-4 text-base font-semibold text-slate-100 dark:text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] hover:shadow-cyan-500/30"
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="mt-4 rounded-3xl border border-slate-200/70 bg-slate-50/90 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-400">
              <p className="font-medium text-slate-900 dark:text-slate-100">Fast setup</p>
              <p className="mt-2">Easily save your progress, stay secure, and jump into your dashboard without bank linking.</p>
              <p className="mt-4">
                Already registered?{' '}
                <Link href="/login" className="font-semibold text-cyan-600 transition hover:text-cyan-500 dark:text-cyan-300">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
