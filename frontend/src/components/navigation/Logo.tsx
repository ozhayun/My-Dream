"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Logo() {
  return (
    <div className="shrink-0 z-50">
      <Link href="/" className="flex items-center gap-2 group">
        <Sparkles className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" />
        <span className="font-semibold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          MyDreams
        </span>
      </Link>
    </div>
  );
}

