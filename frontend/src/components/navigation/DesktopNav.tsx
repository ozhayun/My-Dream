"use client";

import Link from "next/link";
import { List, Info, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6 shrink-0">
      <Link
        href="/"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Dream
      </Link>
      <Link
        href="/dreams"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        onClick={(e) => {
          if (window.location.search || pathname === "/dreams") {
            e.preventDefault();
            window.location.href = "/dreams";
          }
        }}
      >
        <List className="w-4 h-4" /> My List
      </Link>
      <Link
        href="/about"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
      >
        <Info className="w-4 h-4" /> About
      </Link>

      {/* Auth Buttons */}
      <SignedOut>
        <SignInButton mode="modal">
          <button className="text-sm font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </SignedIn>
    </nav>
  );
}

