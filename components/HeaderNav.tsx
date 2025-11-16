"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
};

type HeaderNavProps = {
  brand?: string;
  className?: string;
};

const menuItems: NavItem[] = [
  { label: "Artists", href: "/artists" },
  { label: "Join Us", href: "/join-us" },
  { label: "Updates", href: "/updates" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Submit Music", href: "/submit-music" },
  { label: "Tour", href: "/tour" },
  { label: "Store", href: "/store" },
  { label: "Orders", href: "/orders" },
];

export function HeaderNav({ brand = "BadInvestment", className }: HeaderNavProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    router.push("/login");
  };

  return (
    <header
      className={`flex items-center justify-between gap-6 text-white ${
        className ?? ""
      }`}
    >
      <Link
        href="/"
        className="text-3xl uppercase tracking-[0.5rem]"
        style={{ fontFamily: "var(--font-karantina)" }}
      >
        {brand}
      </Link>
      <nav
        className="flex items-center gap-6 text-base"
        style={{ fontFamily: "var(--font-league-spartan)" }}
      >
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="transition-opacity hover:opacity-70"
          >
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600/20 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}


