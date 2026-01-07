"use client";

import { clsx } from "clsx";
import { Search } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  isHidden?: boolean;
}

export function SearchBar({ isHidden = false }: SearchBarProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!isSignedIn) {
        // Redirect to connect if not authenticated
        e.preventDefault();
        router.push("/connect");
        return;
      }
      const query = (e.target as HTMLInputElement).value;
      if (query.trim()) {
        window.location.href = `/dreams?q=${encodeURIComponent(query)}`;
      }
    }
  };

  return (
    <div
      className={clsx(
        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 transition-all duration-300 pointer-events-none lg:pointer-events-auto",
        isHidden ? "opacity-0 invisible" : "opacity-100 visible"
      )}
    >
      <div className="relative w-full">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search dreams..."
          className="w-full bg-secondary/30 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all backdrop-blur-sm pointer-events-auto"
          onKeyDown={handleSearch}
        />
      </div>
    </div>
  );
}

