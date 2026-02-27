"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/[0.06]",
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-4", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonRadioPlayer() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-3">
      {/* Status bar skeleton */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Station dial skeleton */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
        <div className="flex items-center gap-2 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-lg shrink-0" />
          ))}
        </div>
      </div>

      {/* Main player skeleton */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 lg:p-7">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Vinyl placeholder */}
          <Skeleton className="w-48 h-48 rounded-full shrink-0" />
          {/* Now playing info */}
          <div className="flex-1 w-full space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-2 w-full mt-4" />
          </div>
        </div>

        {/* Visualizer placeholder */}
        <div className="mt-5 flex items-end gap-1 h-16 justify-center">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-2 rounded-t animate-pulse bg-white/[0.06]"
              style={{ height: `${(i % 5) * 10 + 15}%` }}
            />
          ))}
        </div>

        {/* Controls skeleton */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/[0.04]">
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-24 h-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}
