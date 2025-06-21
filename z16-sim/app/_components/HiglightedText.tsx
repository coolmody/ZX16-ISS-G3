"use client";
import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  content: string;
  className?: string;
  [key: string]: any;
};
const keywords: Record<string, string> = {
  error: "text-red-500",
  success: "text-green-500",
  warning: "text-yellow-500",
};

export default function HighlightedText({
  className,
  content,
  ...props
}: Props) {
  return (
    <div
      className={cn(
        "whitespace-pre-wrap break-words flex-col items-start justify-start overflow-y-auto rounded-md border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:border-input/30 dark:bg-input/30 dark:text-muted-foreground dark:placeholder:text-muted-foreground",
        className
      )}
      {...props}
    >
      {content.split("\n").map((line, lineIndex) => (
        <div key={lineIndex}>
          <span className="text-gray-500 mr-4 opacity-60 p-2">
            {lineIndex + 1}
          </span>

          {line.split(" ").map((word, wordIndex) => {
            const cleanWord = word.toLowerCase().replace(/[^a-z]/gi, "");
            const colorClass = keywords[cleanWord] || "text-white";
            return (
              <span key={wordIndex} className={`${colorClass} mr-1 `}>
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
