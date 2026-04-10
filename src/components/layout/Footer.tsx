import Image from "next/image"
import Link from "next/link"

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/expenses", label: "Expenses" },
  { href: "/goals", label: "Goals" },
  { href: "/debts", label: "Debts" },
  { href: "/settings", label: "Settings" },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100/50 py-12 backdrop-blur-xl transition-colors duration-300 dark:border-white/5 dark:bg-[#020617]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 text-slate-700 sm:grid-cols-3 sm:px-10 dark:text-slate-300">
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            <Image src="/logo.png" alt="Flowlary" width={24} height={24} />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-500 dark:text-cyan-300">Flowlary</p>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
            Build a better budget with salary-first planning, smart AI insights, and private manual tracking.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-900 dark:text-slate-100">Product</p>
          <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-400">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-slate-900 dark:hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3 md:relative">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-900 dark:text-slate-100">Get in touch</p>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">Need help? Reach out at hello@flowlary.com.</p>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 md:-bottom-1 md:absolute">© {new Date().getFullYear()} Flowlary. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
