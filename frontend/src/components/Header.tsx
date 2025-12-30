"use client";

import Link from "next/link";
import { Sparkles, List, Info, Menu, X, Plus } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-white/5 h-16">
      {/* Left side: Logo */}
      <div className="flex-shrink-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" />
          <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            MyDreams
          </span>
        </Link>
      </div>

      {/* Center: Search Bar (Absolute centered) */}
      <div className={clsx(
        "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 transition-all duration-300 pointer-events-none lg:pointer-events-auto",
        isHomePage ? "opacity-0 invisible" : "opacity-100 visible"
      )}>
        <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            </div>
            <input 
            type="text" 
            placeholder="Search dreams..."
            className="w-full bg-secondary/30 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all backdrop-blur-sm pointer-events-auto"
            onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                const query = (e.target as HTMLInputElement).value;
                if (query.trim()) {
                    window.location.href = `/dreams?q=${encodeURIComponent(query)}`;
                }
                }
            }}
            />
        </div>
      </div>

      {/* Right side: Desktop Nav */}
      <nav className="hidden md:flex items-center gap-6 flex-shrink-0">
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
      </nav>


      {/* Mobile Menu Button */}
      <button 
        className="md:hidden z-50 p-2 text-muted-foreground hover:text-foreground"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 p-6 pt-20 flex flex-col gap-4 md:hidden shadow-2xl"
            >
                <Link 
                    href="/" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">+</div>
                    <span className="font-medium">Add Dream</span>
                </Link>
                <Link 
                    href="/dreams" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><List className="w-4 h-4" /></div>
                    <span className="font-medium">My List</span>
                </Link>
                <Link 
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                     <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><Info className="w-4 h-4" /></div>
                    <span className="font-medium">About</span>
                </Link>
            </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
