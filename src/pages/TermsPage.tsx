import { useTranslation } from '../hooks/useTranslation'
import { ContactCard, HighlightCard, InfoSection, PageHero } from './_pageKit'

/* 签名视觉：带印章的条款文档 */
function TermsVisual() {
  return (
    <div className="relative mx-auto h-44 w-40">
      <div className="absolute inset-0 rounded-3xl bg-gradient-brand opacity-25 blur-2xl" />
      <div className="relative h-full w-full rounded-2xl glass-card p-4 shadow-card">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-400" />
          <span className="h-2 w-2 rounded-full bg-accent-400" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
        </div>
        <div className="mt-4 space-y-2">
          <span className="block h-2 w-3/4 rounded-full bg-slate-200" />
          <span className="block h-2 w-full rounded-full bg-slate-200" />
          <span className="block h-2 w-5/6 rounded-full bg-slate-200" />
          <span className="block h-2 w-2/3 rounded-full bg-slate-200" />
        </div>
        <div className="absolute -bottom-3 -right-3 grid h-12 w-12 place-items-center rounded-full bg-gradient-brand text-white shadow-glow">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function TermsPage() {
  const { t } = useTranslation()
  return (
    <>
      <PageHero
        eyebrow={t('page.terms.eyebrow')}
        titleLead={t('page.terms.hero_title_lead')}
        titleAccent={t('page.terms.hero_title_accent')}
        subtitle={t('page.terms.hero_sub')}
      >
        <TermsVisual />
      </PageHero>

      <div className="space-y-5">
        <InfoSection index={1} accent="brand" title={t('page.terms.use_title')}>
          {t('page.terms.use_body')}
        </InfoSection>

        <InfoSection index={2} accent="cyan" title={t('page.terms.eligibility_title')}>
          {t('page.terms.eligibility_body')}
        </InfoSection>

        <InfoSection index={3} accent="violet" title={t('page.terms.resp_title')}>
          {t('page.terms.resp_body')}
        </InfoSection>

        <HighlightCard
          eyebrow={t('page.terms.highlight_eyebrow')}
          title={t('page.terms.disclaimer_title')}
          accent="rose"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M10.34 3.94l-7.06 12.2A1.5 1.5 0 004.62 18.4h14.76a1.5 1.5 0 001.34-2.26l-7.06-12.2a1.5 1.5 0 00-2.62 0z" />
            </svg>
          }
        >
          {t('page.terms.disclaimer_body')}
        </HighlightCard>

        <InfoSection index={4} accent="violet" title={t('page.terms.ip_title')}>
          {t('page.terms.ip_body')}
        </InfoSection>

        <InfoSection index={5} accent="cyan" title={t('page.terms.availability_title')}>
          {t('page.terms.availability_body')}
        </InfoSection>

        <InfoSection index={6} accent="brand" title={t('page.terms.change_title')}>
          {t('page.terms.change_body')}
        </InfoSection>

        <ContactCard title={t('page.about.contact_title')} subtitle={t('page.about.contact_body')} />
      </div>
    </>
  )
}
