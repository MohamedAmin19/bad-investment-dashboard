import Link from "next/link";

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
];

export function HeaderNav({ brand = "BadInvestment", className }: HeaderNavProps) {
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
      </nav>
    </header>
  );
}


