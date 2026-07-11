import { useTranslation } from '../hooks/useTranslation'
import { ContactCard, HighlightCard, InfoSection, PageHero } from './_pageKit'

/* 签名视觉：开发者字母徽标 + 环绕光点 */
function AboutVisual() {
  return (
    <div className="relative mx-auto h-40 w-40">
      <div className="absolute inset-0 rounded-full bg-gradient-brand opacity-30 blur-2xl animate-[pulse-soft_3s_ease-in-out_infinite]" />
      <div className="absolute inset-3 rounded-full glass-card grid place-items-center shadow-glow">
        <span className="font-display text-5xl font-extrabold text-gradient-brand">SC</span>
      </div>
      <div className="absolute inset-0 rounded-full border border-dashed border-brand-300/50 animate-[spin_18s_linear_infinite]" />
      <span className="absolute right-3 top-3 h-3 w-3 rounded-full bg-accent-400 shadow-glow" />
      <span className="absolute bottom-5 left-2 h-2 w-2 rounded-full bg-brand-400 shadow-glow" />
    </div>
  )
}

export default function AboutPage() {
  const { t } = useTranslation()
  return (
    <>
      <PageHero
        eyebrow={t('page.about.eyebrow')}
        titleLead={t('page.about.hero_title_lead')}
        titleAccent={t('page.about.hero_title_accent')}
        subtitle={t('page.about.hero_sub')}
      >
        <AboutVisual />
      </PageHero>

      <div className="space-y-5">
        <InfoSection accent="violet" title={t('page.about.why_title')}>
          {t('page.about.why_body')}
        </InfoSection>

        <InfoSection accent="cyan" title={t('page.about.tech_title')}>
          {t('page.about.tech_body')}
        </InfoSection>

        <InfoSection accent="brand" title={t('page.about.free_title')}>
          {t('page.about.free_body')}
        </InfoSection>

        <HighlightCard
          eyebrow={t('page.about.highlight_eyebrow')}
          title={t('page.about.open_title')}
          accent="brand"
          icon={
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          }
        >
          {t('page.about.open_body')}
        </HighlightCard>

        <InfoSection accent="emerald" title={t('page.about.roadmap_title')}>
          {t('page.about.roadmap_body')}
        </InfoSection>

        <ContactCard title={t('page.about.contact_title')} subtitle={t('page.about.contact_body')} />
      </div>
    </>
  )
}
