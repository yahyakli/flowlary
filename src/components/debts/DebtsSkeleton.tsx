"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DebtsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
        >
          <div className="mb-6 flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="ml-auto h-5 w-28" />
              <Skeleton className="ml-auto h-3 w-20" />
            </div>
          </div>
          <div className="mb-6 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
