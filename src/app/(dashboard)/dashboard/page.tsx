import Link from "next/link";

const cards = [
  { title: "Salary", value: "$4,200", description: "Net take-home pay for the current period." },
  { title: "Fixed expenses", value: "$1,300", description: "Rent, bills, subscriptions, and recurring costs." },
  { title: "Savings goal", value: "$850", description: "Amount set aside for your next objective." },
  { title: "Available cash", value: "$2,100", description: "What remains after commitments and savings." },
];

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl dark:bg-slate-900/60 sm:p-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-violet-600/10 blur-[100px]" />
        
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400 ring-1 ring-cyan-400/20">
              Overview
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Your Finance Hub</h2>
            <p className="max-w-2xl text-lg text-slate-400">
              Personalized insights and proactive advice for your current salary cycle.
            </p>
          </div>
          <Link 
            href="/expenses" 
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:scale-105 hover:bg-cyan-300 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Add an expense
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </span>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article 
            key={card.title} 
            className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 p-8 transition-all hover:border-cyan-500/30 hover:bg-slate-900/60 dark:bg-slate-950/40"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500 transition-colors group-hover:text-cyan-400/70">
              {card.title}
            </p>
            <p className="mt-4 text-4xl font-black tracking-tighter text-slate-50">
              {card.value}
            </p>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-400">
              {card.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
