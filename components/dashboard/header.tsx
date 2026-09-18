"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Info, PawPrint } from "lucide-react";
import { navItems } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "cn";
export function DashboardHeader() {
  const pathname = usePathname();
  void pathname;

  return (
    <header className="flex h-10 shrink-0 items-center gap-4 border-b border-[#31514a] bg-[#14352f] px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-14 items-center gap-2 border-b px-4">
              <PawPrint className="size-5" />
              <span className="font-heading text-sm font-semibold">
                Wolf Materials
              </span>
            </div>
            <nav className="flex flex-col gap-0.5 p-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-accent hover:text-accent-foreground",
                      isActive &&
                        "bg-accent font-medium text-accent-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <Info className="size-5 shrink-0 rounded-full bg-cyan-500 p-1 text-[#12332e]" />
        <span className="text-xs text-foreground">
          Wolf Materials Lab · Synthetic commercial data · No sign-in · AI and
          voice simulated by default
        </span>
      </div>
    </header>
  );
}
