"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { navItems } from "@/lib/nav";
import { cn } from "cn";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative hidden w-[280px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <button
        aria-label="Collapse navigation"
        className="absolute -right-4 top-7 z-10 grid size-8 place-items-center rounded-full border border-sidebar-border bg-sidebar text-muted-foreground shadow-sm"
      >
        <ChevronLeft className="size-4" />
      </button>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-16">
        <div className="mb-3 flex items-center gap-2 px-2 text-[13px] font-bold tracking-tight text-sidebar-foreground">
          <ChevronDown className="size-4" /> TENDER 2026
        </div>
        {navItems.slice(0, 10).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-14 items-center gap-4 rounded-sm px-3 py-3 text-[16px] font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent font-semibold text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-6 shrink-0 text-sidebar-foreground/55" />
              {item.label}
              {item.label === "Overview" && (
                <span className="ml-auto rounded-sm bg-[#301e18] px-2 py-1 text-[13px] font-semibold text-red-500">
                  Demo
                </span>
              )}
              {item.label === "Supply Chain" && (
                <span className="ml-auto rounded-sm bg-[#302e17] px-2 py-1 text-[13px] font-semibold text-amber-500">
                  New
                </span>
              )}
            </Link>
          );
        })}
        <div className="mb-3 mt-7 px-2 text-[13px] font-bold tracking-tight text-sidebar-foreground/55">
          ENABLEMENT
        </div>
        {navItems.slice(10).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 items-center gap-4 rounded-sm px-3 py-3 text-[16px] font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent font-semibold text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-6 shrink-0 text-sidebar-foreground/55" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
