"use client";

import { cn } from "@/lib/utils";

export default function Screen({ className }: { className?: string }) {
  return (
    <div className={cn(className, "flex flex-col items-center justify-center")}>
      <div className="border-gray-600 border-3 w-[320px] h-[240px] box-content bg-black"></div>
    </div>
  );
}
