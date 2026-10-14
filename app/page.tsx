import type { Metadata } from 'next';
import { PublishedBooksHome } from '@/components/sections/PublishedBooksHome';
import { ThesisPathways } from '@/components/sections/ThesisPathways';
import { InstitutionMarquee } from '@/components/sections/InstitutionMarquee';
import { IndexingMarquee } from '@/components/sections/IndexingMarquee';
import { Hero } from '@/components/sections/Hero';
import {
  ServicesEcosystem,
  AboutPreview,
  ConsultationCta,
} from '@/components/sections/HomeSections';
import { ResearchTeaser } from '@/components/sections/ResearchTeaser';
import { ResourceCards } from '@/components/sections/ResourceCards';
import { EducationUpdates } from '@/components/sections/EducationUpdates';
import { WhyScholarsChoose } from '@/components/sections/WhyScholarsChoose';
import { homeFaqs, institutions } from '@/lib/content';
import { faqSchema, servicesSchema } from '@/lib/schema';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      {/* Order follows the brief: the four core services are the first thing
          below the hero, then the reasons to trust us, then the four areas in
          narrative form, then process, reviews, FAQ and the closing CTA. */}
      <Hero />
      <ServicesEcosystem />
      <AboutPreview />
      <ResearchTeaser />
      <ThesisPathways />
      <EducationUpdates />
      <ResourceCards />
      <WhyScholarsChoose />
      <PublishedBooksHome />
      <IndexingMarquee />
      {/* Same component and data as the Research & Thesis page; only the
          anchor id and intro line differ. */}
      <InstitutionMarquee
        id="home-institutions"
        subtitle={institutions.homeSubtitle}
        bordered
      />
      <ConsultationCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([...servicesSchema(), faqSchema(homeFaqs)]),
        }}
      />
    </>
  );
}
