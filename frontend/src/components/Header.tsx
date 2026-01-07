"use client";

import { usePathname } from "next/navigation";
import { Logo, SearchBar, DesktopNav, MobileNav } from "./navigation";

export function Header() {
  const pathname = usePathname();
  const shouldHideSearch =
    pathname === "/" || pathname === "/about" || pathname === "/connect";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-white/5 h-16">
      <Logo />
      <SearchBar isHidden={shouldHideSearch} />
      <DesktopNav />
      <MobileNav />
    </header>
  );
}
