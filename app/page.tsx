import Image from "next/image";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  const menuItems = [
    { label: "Join Us", href: "/join-us" },
    { label: "Updates", href: "/updates" },
    { label: "Contact Us", href: "/contact-us" },
    { label: "Submit Music", href: "/submit-music" },
    { label: "Tour", href: "/tour" },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background-image.png"
          alt="Concert background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Hero Section */}
      <HeroSection title="BADINVSTMENT" menuItems={menuItems} />
    </div>
  );
}
