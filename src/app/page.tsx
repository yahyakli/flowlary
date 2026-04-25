import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { 
  Banknote, 
  Receipt, 
  Target, 
  Sparkles, 
  ShieldCheck, 
  Globe 
} from "lucide-react";

const features = [
  {
    title: "Salary Management",
    description: "Built for your actual pay cycle, whether it's monthly, bi-weekly, or custom.",
    icon: <Banknote className="size-6 text-cyan-500" />
  },
  {
    title: "Expense Control",
    description: "Categorize fixed bills and track variable daily spending with ease.",
    icon: <Receipt className="size-6 text-emerald-500" />
  },
  {
    title: "Savings Goals",
    description: "Visualize your progress toward big dreams with multi-objective tracking.",
    icon: <Target className="size-6 text-violet-500" />
  },
  {
    title: "AI Financial Health",
    description: "Get a 0-100 health score and smart insights powered by advanced AI.",
    icon: <Sparkles className="size-6 text-amber-500" />
  },
  {
    title: "Privacy First",
    description: "No bank account linking required. Your data remains fully under your control.",
    icon: <ShieldCheck className="size-6 text-blue-500" />
  },
  {
    title: "Currency Flex",
    description: "Manage finances in any currency with localized formatting for global use.",
    icon: <Globe className="size-6 text-pink-500" />
  },
];

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-50 selection:bg-cyan-500/30 dark:bg-slate-950">
      {/* Dynamic Background Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-cyan-500/10 blur-[120px] dark:bg-cyan-400/5" />
        <div className="absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-400/5" />
        <div className="absolute bottom-[0%] left-[20%] h-[35%] w-[35%] rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-400/5" />
        <div className="absolute -bottom-[10%] -right-[5%] h-[45%] w-[45%] rounded-full bg-orange-500/10 blur-[120px] dark:bg-orange-400/5" />
      </div>

      <div className="relative mx-auto w-[90%] max-w-[1600px] px-6 py-24 sm:px-10">
        <section className="flex flex-col items-center text-center">
          <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 ring-1 ring-inset ring-cyan-500/20 dark:text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
              The AI-Powered Budgeting Workspace
            </span>
          </div>
          
          <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-tight text-slate-900 dark:text-white sm:text-7xl">
            Tame your <span className="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">spending</span>, master your salary.
          </h1>
          
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-slate-600 dark:text-slate-400">
            Privacy-first personal finance for people who want clarity, not complexity. 
            Flowlary helps you plan every cent without ever linking a bank account.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-slate-950 px-10 text-base font-bold text-white shadow-2xl shadow-slate-950/20 transition-all hover:scale-105 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Get Started for Free
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-10 text-base font-bold text-slate-950 transition-all hover:border-cyan-500/30 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:hover:bg-slate-900"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mt-32 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200/50 bg-white p-8 shadow-xl shadow-slate-950/5 transition-all hover:border-cyan-500/30 hover:shadow-cyan-500/5 dark:border-white/5 dark:bg-slate-900/40 dark:shadow-none"
            >
              <div className="flex flex-col gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 transition-transform group-hover:scale-110 group-hover:rotate-3 dark:bg-slate-950">
                  {feature.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
        
        {/* Social Proof / Footer area */}
        <div className="mt-32 flex flex-col items-center border-t border-slate-200/60 pt-16 dark:border-white/10">
          <p className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            Trusted by zero-debt enthusiasts worldwide
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-x-12 gap-y-8 px-4">
            <span className="cursor-default text-2xl font-black tracking-tighter text-slate-900 opacity-70 transition-all duration-300 hover:scale-110 hover:opacity-100 hover:text-cyan-600 dark:text-white dark:opacity-70 dark:hover:opacity-100 dark:hover:text-cyan-400">
              CURR<span className="text-cyan-500">€</span>NCY
            </span>
            <span className="cursor-default text-2xl font-black tracking-tighter text-slate-900 opacity-70 transition-all duration-300 hover:scale-110 hover:opacity-100 hover:text-emerald-600 dark:text-white dark:opacity-70 dark:hover:opacity-100 dark:hover:text-emerald-400">
              SALARY<span className="text-emerald-500">.</span>IO
            </span>
            <span className="cursor-default text-2xl font-black tracking-tighter text-slate-900 opacity-70 transition-all duration-300 hover:scale-110 hover:opacity-100 hover:text-violet-600 dark:text-white dark:opacity-70 dark:hover:opacity-100 dark:hover:text-violet-400">
              PLANNER<span className="text-violet-500">+</span>
            </span>
          </div>
          
          <div className="mt-20 text-center">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-600">
              © 2026 Flowlary. All rights reserved. Precise budgeting for a clearer tomorrow.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
