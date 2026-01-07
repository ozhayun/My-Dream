"use client";

import { useState } from "react";
import Link from "next/link";
import { List, Info, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header Controls */}
      <div className="md:hidden flex items-center gap-3 z-50">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-sm font-medium px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
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
        <button
          className="p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

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

