import { AdultsBand } from "@/components/AdultsBand";
import { ClinicJsonLd } from "@/components/ClinicJsonLd";
import { ContactCta } from "@/components/ContactCta";
import { Faq } from "@/components/Faq";
import { Hero } from "@/components/Hero";
import { InsideCentre } from "@/components/InsideCentre";
import { Milestones } from "@/components/Milestones";
import { Services } from "@/components/Services";
import { SessionSteps } from "@/components/SessionSteps";
import { StartTiles } from "@/components/StartTiles";
import { Team } from "@/components/Team";
import { VisitUs } from "@/components/VisitUs";

export default function Home() {
  return (
    <main>
      <ClinicJsonLd />
      <Hero />
      <StartTiles />
      <Milestones />
      <Services />
      <SessionSteps />
      <Team />
      <InsideCentre />
      <AdultsBand />
      <Faq />
      <ContactCta />
      <VisitUs />
    </main>
  );
}
