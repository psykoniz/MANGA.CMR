'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const FRAIS = 5000;
const MONTANT_DEMO = 50000000;

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const declarationId = searchParams.get('id');

  const [stage, setStage] = useState<'provider' | 'confirm' | 'processing' | 'success'>('provider');
  const [provider, setProvider] = useState<'MTN' | 'ORANGE' | null>(null);
  const [phone, setPhone] = useState('');

  const total = MONTANT_DEMO + FRAIS;
  const formatXAF = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

  const startPayment = async () => {
    setStage('processing');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/init`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ declarationId, amount: total, provider, phoneNumber: phone }),
      });
    } catch { /* demo mode */ }
    setTimeout(() => setStage('success'), 2200);
  };

  const PROVIDERS = [
    { id: 'MTN' as const, name: 'MTN Mobile Money', color: '#FFCC00', bg: '#FFFBEB', prefixes: ['65', '67', '68'] },
    { id: 'ORANGE' as const, name: 'Orange Money', color: '#FF6600', bg: '#FFF7F0', prefixes: ['69', '655', '698'] },
  ];

  return (
    <div style={{ padding: '32px 40px', maxWidth: 560, margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-forest)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Finalisation</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Paiement du dossier</h1>
      </div>

      {/* Résumé */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EDE9', padding: '20px 24px', marginBottom: 20, boxShadow: 'var(--shadow-card)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-slate)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Résumé du paiement</div>
        {[['Montant déclaré', formatXAF(MONTANT_DEMO)], ['Frais de dossier', formatXAF(FRAIS)]].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--color-slate)' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>{value}</span>
          </div>
        ))}
        <div style={{ height: 1, background: '#F0F4F2', margin: '12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>Total à payer</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-forest)' }}>{formatXAF(total)}</span>
        </div>
      </div>

      {/* ── STAGE: PROVIDER ── */}
      {stage === 'provider' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 14 }}>Choisissez votre opérateur</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {PROVIDERS.map(p => (
              <button key={p.id} onClick={() => { setProvider(p.id); setStage('confirm'); }} style={{ padding: '20px 16px', borderRadius: 14, border: '2px solid #E8EDE9', background: '#fff', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = p.color; (e.currentTarget as HTMLElement).style.background = p.bg; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8EDE9'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: p.color, marginBottom: 6, letterSpacing: '-0.02em' }}>{p.id}</div>
                <div style={{ fontSize: 11, color: 'var(--color-slate)' }}>{p.name}</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Préfixes: {p.prefixes.join(', ')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STAGE: CONFIRM ── */}
      {stage === 'confirm' && provider && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EDE9', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px 14px', borderRadius: 10, background: PROVIDERS.find(p => p.id === provider)?.bg }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: PROVIDERS.find(p => p.id === provider)?.color }}>{provider}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)' }}>{PROVIDERS.find(p => p.id === provider)?.name}</div>
              <button onClick={() => { setProvider(null); setStage('provider'); }} style={{ fontSize: 11, color: 'var(--color-forest)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)' }}>
                Changer d'opérateur
              </button>
            </div>
          </div>

          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-slate)', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Numéro {provider} Mobile Money</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+237 6XX XXX XXX" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E8EDE9', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
          <p style={{ fontSize: 11, color: 'var(--color-slate)', marginBottom: 20 }}>Vous recevrez une demande de confirmation USSD sur ce numéro</p>

          <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 3 }}>⚠️ Mode démonstration</div>
            <div style={{ fontSize: 11, color: '#92400E' }}>Le paiement est simulé. En production, vous recevrez une notification USSD réelle.</div>
          </div>

          <button onClick={startPayment} disabled={!phone} style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: phone ? 'var(--color-forest)' : '#E8EDE9', color: phone ? '#fff' : 'var(--color-slate)', fontSize: 14, fontWeight: 700, cursor: phone ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)' }}>
            💳 Payer {formatXAF(total)}
          </button>
        </div>
      )}

      {/* ── STAGE: PROCESSING ── */}
      {stage === 'processing' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EDE9', padding: '48px 24px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: 56, height: 56, border: '3px solid var(--color-forest)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.9s linear infinite' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 8 }}>Traitement en cours...</div>
          <div style={{ fontSize: 13, color: 'var(--color-slate)' }}>Confirmation de paiement {provider} en attente</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── STAGE: SUCCESS ── */}
      {stage === 'success' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #D1FAE5', padding: '40px 32px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✅</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#059669', marginBottom: 10 }}>Paiement confirmé!</h2>
          <p style={{ fontSize: 14, color: 'var(--color-slate)', marginBottom: 24, lineHeight: 1.7 }}>
            Votre dossier a été soumis et est en attente d'instruction. Vous serez notifié par SMS sous 48h ouvrables.
          </p>

          <div style={{ padding: '14px 18px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0', marginBottom: 24, textAlign: 'left' }}>
            {[['Référence transaction', `TXN-${Date.now().toString().slice(-8)}`], ['Montant payé', formatXAF(total)], ['Opérateur', provider || ''], ['Date', new Date().toLocaleDateString('fr-FR')]].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#16A34A' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#065F46', fontFamily: label === 'Référence transaction' ? 'monospace' : 'inherit' }}>{value}</span>
              </div>
            ))}
          </div>

          <button onClick={() => router.push('/declare')} style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: 'var(--color-forest)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Retour aux déclarations
          </button>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-slate)' }}>Chargement...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
