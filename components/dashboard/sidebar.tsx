"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, PawPrint } from "lucide-react";
import { navItems } from "@/lib/nav";
import { cn } from "cn";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <button
        aria-label="Collapse navigation"
        className="absolute -right-4 top-7 z-10 grid size-8 place-items-center rounded-full border border-sidebar-border bg-sidebar text-muted-foreground shadow-sm"
      >
        <ChevronLeft className="size-4" />
      </button>
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <PawPrint className="size-5 shrink-0 text-primary" />
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
          Wolf Materials
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-4">
        <div className="mb-2 flex items-center gap-2 px-2 text-xs font-bold tracking-tight text-sidebar-foreground">
          <ChevronDown className="size-3.5" /> TENDER 2026
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-10 items-center gap-3 rounded-sm px-2.5 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent font-semibold text-sidebar-accent-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-4.5 shrink-0 text-sidebar-foreground/55",
                  isActive && "text-sidebar-accent-foreground",
                )}
              />
              {item.label}
              {/* {item.label === "Overview" && (
                <span className="ml-auto rounded-sm bg-[#301e18] px-1.5 py-0.5 text-xs font-semibold text-red-500">
                  Demo
                </span>
              )} */}
              {/* {item.label === "Supply Chain" && (
                <span className="ml-auto rounded-sm bg-[#302e17] px-1.5 py-0.5 text-xs font-semibold text-amber-500">
                  New
                </span>
              )} */}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
