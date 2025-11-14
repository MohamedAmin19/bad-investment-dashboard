import Link from "next/link";

export function BackButton() {
  return (
    <Link
      href="/"
      className="flex items-center gap-4 text-sm uppercase tracking-[0.2rem] text-white/60 transition-opacity hover:opacity-70"
      style={{ fontFamily: "var(--font-league-spartan)" }}
    >
      <span className="text-lg leading-none">←</span>
      Back
    </Link>
  );
}

