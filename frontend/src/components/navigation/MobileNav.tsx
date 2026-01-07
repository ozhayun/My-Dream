"use client";

import { useState } from "react";
import Link from "next/link";
import { List, Info, Menu, X, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Hide search on certain pages
  const shouldHideSearch =
    pathname === "/" || pathname === "/about" || pathname === "/connect";

  const closeMenu = () => setIsOpen(false);

  const handleMobileSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!isSignedIn) {
        router.push("/connect");
        return;
      }
      if (searchQuery.trim()) {
        setIsSearchOpen(false);
        setSearchQuery("");
        window.location.href = `/dreams?q=${encodeURIComponent(searchQuery)}`;
      }
    }
  };

  return (
    <>
      {/* Mobile Header Controls */}
      <div className="md:hidden flex items-center gap-2 z-50">
        {/* Mobile Search Button - Only show when search is allowed */}
        {!shouldHideSearch && (
          <button
            className="p-2 text-foreground/70 hover:text-foreground transition-colors"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label={isSearchOpen ? "Close search" : "Open search"}
          >
            <Search className="w-5 h-5" />
          </button>
        )}
        <SignedOut>
          <Link
            href="/connect"
            className="text-sm font-medium px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
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
        <button
          className="p-2 text-foreground/70 hover:text-foreground transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Search Input */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 p-4 md:hidden z-40"
          >
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search dreams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleMobileSearch}
                className="w-full bg-secondary/30 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all backdrop-blur-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 p-6 pt-20 flex flex-col gap-4 md:hidden shadow-2xl"
          >
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                +
              </div>
              <span className="font-medium">Add Dream</span>
            </Link>
            <SignedIn>
              <Link
                href="/dreams"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <List className="w-4 h-4" />
                </div>
                <span className="font-medium">My List</span>
              </Link>
            </SignedIn>
            <Link
              href="/about"
              onClick={closeMenu}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Info className="w-4 h-4" />
              </div>
              <span className="font-medium">About</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

