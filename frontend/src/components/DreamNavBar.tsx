"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, CalendarDays, KanbanSquare, ListChecks } from "lucide-react";

const NAV_ITEMS = [
    { href: "/dreams", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dreams/timeline", label: "Timeline", icon: CalendarDays },
    { href: "/dreams/board", label: "Board", icon: KanbanSquare },
    { href: "/dreams/status", label: "Status", icon: ListChecks },
];

export function DreamNavBar() {
    const pathname = usePathname();

    const activeItem = NAV_ITEMS.find(item => 
        item.exact ? pathname === item.href : pathname.startsWith(item.href)
    );

    return (
        <div className="flex flex-col gap-6 mb-8">
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
                 <div>
                     <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                         {activeItem?.label || "My Dreams"}
                     </h1>
                     <p className="text-muted-foreground mt-1">Manage your life goals.</p>
                 </div>

                 <div className="flex justify-center md:justify-end w-full md:w-auto overflow-x-auto">
                    <div className="flex p-1 bg-secondary/30 backdrop-blur-md rounded-xl border border-white/5 w-fit">
                         {NAV_ITEMS.map(item => {
                         const Icon = item.icon;
                         const isActive = item.exact 
                            ? pathname === item.href 
                            : pathname.startsWith(item.href);

                         return (
                             <Link
                                 key={item.href}
                                 href={item.href}
                                 className={clsx(
                                     "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                     isActive 
                                         ? "bg-primary text-primary-foreground shadow-lg" 
                                         : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                 )}
                             >
                                <Icon className="w-4 h-4" />
                                <span className={clsx("hidden sm:inline", isActive && "inline")}>{item.label}</span>
                             </Link>
                         )
                     })}
                 </div>
                 </div>
             </div>
        </div>
    );
}
