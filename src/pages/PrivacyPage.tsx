import { useTranslation } from '../hooks/useTranslation'
import { ContactCard, HighlightCard, InfoSection, PageHero } from './_pageKit'

/* 签名视觉：护盾包裹「你的设备」，并配「不上云」徽标 —— 点明本地处理主旨 */
function PrivacyVisual() {
  return (
    <div className="relative mx-auto h-44 w-44">
      <div className="absolute inset-0 rounded-full bg-gradient-brand opacity-30 blur-2xl animate-[spin_22s_linear_infinite]" />
      <svg viewBox="0 0 120 120" className="relative h-full w-full drop-shadow-[0_10px_30px_rgba(124,58,237,.28)]">
        <defs>
          <linearGradient id="pGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="55%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <path
          d="M60 10 L103 25 V58 C103 88 83 104 60 113 C37 104 17 88 17 58 V25 Z"
          fill="url(#pGrad)"
          fillOpacity="0.14"
          stroke="url(#pGrad)"
          strokeWidth="3"
        />
        <rect x="42" y="44" width="36" height="26" rx="4" fill="none" stroke="url(#pGrad)" strokeWidth="3" />
        <line x1="60" y1="70" x2="60" y2="76" stroke="url(#pGrad)" strokeWidth="3" />
        <line x1="50" y1="78" x2="70" y2="78" stroke="url(#pGrad)" strokeWidth="3" strokeLinecap="round" />
        <rect x="53" y="80" width="14" height="11" rx="2.5" fill="url(#pGrad)" />
        <path d="M56 80 v-3 a4 4 0 0 1 8 0 v3" fill="none" stroke="url(#pGrad)" strokeWidth="2.5" />
      </svg>
      <div className="absolute -right-1 -top-1 grid h-11 w-11 place-items-center rounded-full bg-white shadow-glow ring-1 ring-slate-200">
        <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 19a4.5 4.5 0 001.3-8.83A6 6 0 006.34 9.2 4 4 0 007 17h10.5z" />
          <path strokeLinecap="round" d="M3 3l18 18" />
        </svg>
      </div>
    </div>
  )
}

export default function PrivacyPage() {
  const { t } = useTranslation()
  return (
    <>
      <PageHero
        eyebrow={t('page.privacy.eyebrow')}
        titleLead={t('page.privacy.hero_title_lead')}
        titleAccent={t('page.privacy.hero_title_accent')}
        subtitle={t('page.privacy.hero_sub')}
      >
        <PrivacyVisual />
      </PageHero>

      <div className="space-y-5">
        <HighlightCard
          eyebrow={t('page.privacy.highlight_eyebrow')}
          title={t('page.privacy.local_title')}
          accent="brand"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
            </svg>
          }
        >
          {t('page.privacy.local_body')}
        </HighlightCard>

        <InfoSection accent="cyan" title={t('page.privacy.data_title')}>
          {t('page.privacy.data_body')}
        </InfoSection>

        <InfoSection accent="violet" title={t('page.privacy.model_title')}>
          {t('page.privacy.model_body')}
        </InfoSection>

        <InfoSection accent="cyan" title={t('page.privacy.permissions_title')}>
          {t('page.privacy.permissions_body')}
        </InfoSection>

        <InfoSection accent="violet" title={t('page.privacy.cookie_title')}>
          {t('page.privacy.cookie_body')}
        </InfoSection>

        <InfoSection accent="cyan" title={t('page.privacy.analytics_title')}>
          {t('page.privacy.analytics_body')}
        </InfoSection>

        <InfoSection accent="emerald" title={t('page.privacy.retention_title')}>
          {t('page.privacy.retention_body')}
        </InfoSection>

        <ContactCard title={t('page.about.contact_title')} subtitle={t('page.privacy.contact_body')} />
      </div>
    </>
  )
}
