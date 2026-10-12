import { SiteHeader } from "@/app/components/layout/SiteHeader";
import { Faq } from "@/app/components/landing/Faq";
import { Features } from "@/app/components/landing/Features";
import { FinalCta } from "@/app/components/landing/FinalCta";
import { Hero } from "@/app/components/landing/Hero";
import { HowItWorks } from "@/app/components/landing/HowItWorks";
import { SiteFooter } from "@/app/components/landing/SiteFooter";
import { Stats } from "@/app/components/landing/Stats";
import { Testimonials } from "@/app/components/landing/Testimonials";
import { ButtonLink } from "@/app/components/ui/Button";
import { ArrowRightIcon } from "@/app/components/ui/icons";

const NAV = [
  { href: "#funktionen", label: "Funktionen" },
  { href: "#so-gehts", label: "Ablauf" },
  { href: "#faq", label: "FAQ" },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        nav={NAV}
        actions={
          <ButtonLink href="/onboarding" size="sm" trailingIcon={<ArrowRightIcon size={16} />}>
            <span className="max-sm:hidden">Plan erstellen</span>
            <span className="sm:hidden">Start</span>
          </ButtonLink>
        }
      />

      <main id="main" className="flex-1">
        <Hero />
        <div className="space-y-24 pb-20 sm:space-y-28 sm:pb-28">
          <Stats />
          <Features />
          <HowItWorks />
          <Testimonials />
          <Faq />
          <FinalCta />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
