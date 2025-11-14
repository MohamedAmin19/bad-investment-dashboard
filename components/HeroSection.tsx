import Link from "next/link";

type MenuItem = {
  label: string;
  href: string;
};

type HeroSectionProps = {
  title: string;
  menuItems: MenuItem[];
};

export function HeroSection({ title, menuItems }: HeroSectionProps) {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1
        className="text-6xl uppercase tracking-[0.6rem] md:text-7xl text-white"
        style={{ fontFamily: "var(--font-karantina)" }}
      >
        {title}
      </h1>
      <nav
        className="mt-12 flex flex-col items-center gap-5 text-lg font-light text-white"
        style={{ fontFamily: "var(--font-league-spartan)" }}
      >
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="transition-opacity hover:opacity-60"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

