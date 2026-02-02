"use client";

import { Home, Calendar, ChefHat, BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Plan", href: "/weekly-planning", icon: Calendar },
  { label: "Kitchen", href: "/kitchen", icon: ChefHat },
  { label: "Recipes", href: "/recipes", icon: BookOpen },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "var(--color-card)",
        borderTop: "1px solid var(--color-border)",
        paddingBottom: "var(--safe-area-bottom)",
      }}
    >
      <ul className="flex justify-around items-center max-w-md mx-auto py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Handle exact match for home, prefix match for others
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  color: isActive
                    ? "var(--color-secondary)"
                    : "var(--color-muted)",
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span
                  className="text-xs"
                  style={{ fontWeight: isActive ? 600 : 500 }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
