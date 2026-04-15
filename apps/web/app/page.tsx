'use client';
import Link from 'next/link';

const features = [
  { icon: '📄', title: 'Déclaration Digitale', desc: 'Déposez vos dossiers en ligne en 5 étapes guidées. Fini les files d\'attente.' },
  { icon: '🔍', title: 'OCR Automatique', desc: 'Extraction intelligente des données de vos documents avec score de confiance.' },
  { icon: '🗺️', title: 'Zones de Préemption', desc: 'Vérification instantanée si votre bien est en zone de préemption municipale.' },
  { icon: '📱', title: 'Mobile Money', desc: 'Réglez les frais via MTN ou Orange Money. Simple, rapide, sécurisé.' },
  { icon: '✅', title: 'Attestation Certifiée', desc: 'Recevez une attestation officielle avec QR code anti-fraude de la Ville.' },
  { icon: '⚡', title: 'Traitement en 48h', desc: 'Moteur d\'approbation automatique intelligent. Délai garanti 48h ouvrables.' },
];

const steps = [
  { num: '01', label: 'Créez votre dossier', desc: 'Renseignez les informations du bien et du déclarant' },
  { num: '02', label: 'Uploadez vos pièces', desc: 'Titre foncier, CNI, plans — analysés par OCR en temps réel' },
  { num: '03', label: 'Payez les frais', desc: 'MTN ou Orange Money en moins de 30 secondes' },
  { num: '04', label: 'Recevez l\'attestation', desc: 'Document officiel certifié par la Ville de Douala' },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(15,31,26,0.96)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏛️</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>PREDEM</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SmartFoncier Douala</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="/verifier" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, textDecoration: 'none' }}>Vérifier attestation</Link>
            <Link href="/login" style={{ background: 'var(--color-forest)', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 64,
        background: 'linear-gradient(135deg, #0F1F1A 0%, #1E3329 50%, #005C47 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -120, right: -120, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,122,94,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,160,0,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,160,0,0.12)', border: '1px solid rgba(232,160,0,0.25)', borderRadius: 100, padding: '6px 14px', marginBottom: 28 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-gold)', display: 'inline-block' }} />
                <span style={{ color: 'var(--color-gold)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ville de Douala — Service Officiel</span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 60px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
                La propriété foncière{' '}
                <em style={{ fontStyle: 'italic', background: 'linear-gradient(135deg, #E8A000, #FFB830)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  simplifiée
                </em>
                {' '}à Douala
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 17, lineHeight: 1.75, marginBottom: 40, maxWidth: 460 }}>
                Déclarez vos aliénations immobilières, obtenez vos attestations officielles
                et vérifiez les zones de préemption — entièrement en ligne.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
                <Link href="/declare" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--color-gold)', color: 'var(--color-ink)', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 24px rgba(232,160,0,0.3)' }}>
                  Déposer un dossier →
                </Link>
                <Link href="/verifier" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1.5px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.8)', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                  Vérifier une attestation
                </Link>
              </div>

              <div style={{ display: 'flex', gap: 36 }}>
                {[['2 000+', 'Dossiers traités'], ['48h', 'Délai moyen'], ['99.2%', 'Satisfaction']].map(([val, label]) => (
                  <div key={label}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#fff' }}>{val}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attestation preview card */}
            <div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 28, backdropFilter: 'blur(12px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Attestation récente</span>
                  <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>✓ Validée</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>Référence</div>
                <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#fff', marginBottom: 18, letterSpacing: '0.04em' }}>ATT-DOUALA-20260414-00047</div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 18 }} />
                {[['Bien', 'Parcelle F123456 — Akwa'], ['Montant', '50 000 000 XAF'], ['Émise le', '14 Avril 2026'], ['Expire le', '13 Juillet 2026']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 11 }}>
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{k}</span>
                    <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop: 18, padding: '11px 14px', background: 'rgba(0,122,94,0.18)', borderRadius: 10, border: '1px solid rgba(0,122,94,0.28)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>Autorité émettrice</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>🏛️ Ville de Douala — Direction Foncière</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ÉTAPES ── */}
      <section style={{ padding: '96px 24px', background: 'var(--color-cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-forest)', textTransform: 'uppercase', marginBottom: 12 }}>Comment ça marche</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.03em' }}>4 étapes simples</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ position: 'relative' }}>
                {i < 3 && <div style={{ position: 'absolute', top: 22, left: 'calc(100% - 8px)', width: 'calc(100% - 16px)', height: 1, background: 'var(--color-forest)', opacity: 0.15, zIndex: 0 }} />}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#fff' }}>{step.num}</div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-ink)', marginBottom: 8 }}>{step.label}</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-slate)', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '96px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.03em' }}>Tout pour votre dossier foncier</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} style={{ padding: '24px', borderRadius: 14, border: '1px solid #EEF2F0', background: '#FAFCFB', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 8px 32px rgba(0,122,94,0.09)'; el.style.borderColor = 'rgba(0,122,94,0.2)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = 'none'; el.style.borderColor = '#EEF2F0'; }}>
                <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--color-slate)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, var(--color-ink) 0%, var(--color-forest-deep) 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Prêt à déclarer votre bien ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 32, lineHeight: 1.75 }}>
            Créez votre compte et déposez votre premier dossier en moins de 10 minutes.
          </p>
          <Link href="/declare" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--color-gold)', color: 'var(--color-ink)', padding: '15px 34px', borderRadius: 11, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 24px rgba(232,160,0,0.3)' }}>
            Commencer maintenant →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--color-ink)', padding: '40px 24px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>PREDEM</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>© 2026 Ville de Douala. Tous droits réservés.</div>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <Link href="/verifier" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Vérifier</Link>
            <a href="#" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Mentions légales</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
