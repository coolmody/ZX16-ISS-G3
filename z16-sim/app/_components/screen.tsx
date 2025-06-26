"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Power } from "lucide-react";

export default function Screen({ className }: { className?: string }) {
  return (
    <div className={cn(className, "flex flex-col items-center justify-center")}>
      <h1 className="text-white text-2xl mb-4">Screen</h1>
      <div className="border-gray-600 border-3 w-[320px] h-[240px] box-content bg-black"></div>
      <div className="flex flex-row items-end justify-end w-full">
        <Button className="curor-pointer bg-transparent hover:bg-transparent">
          <Power className="text-green-400" />
        </Button>
      </div>
    </div>
  );
}
