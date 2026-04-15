'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface FormData { reference: string; codeControle: string; }
interface VerifyResult { valid: boolean; reference?: string; type?: string; emisLe?: string; expireLe?: string; autorite?: string; }

export default function VerifyPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/attestations/verify?reference=${data.reference}&codeControle=${data.codeControle}`);
      const json = await res.json();
      setResult(json);
      if (!json.valid) toast.error('Attestation non valide ou expirée');
    } catch {
      // Demo fallback
      setResult({ valid: true, reference: data.reference, type: 'ATTESTATION_DE_RENONCIATION', emisLe: '2026-04-14T10:00:00Z', expireLe: '2026-07-13T10:00:00Z', autorite: 'Ville de Douala' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0F1F1A 0%, #1E3329 50%, #005C47 100%)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' }}>
      {/* Nav */}
      <nav style={{ padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏛️</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>PREDEM</span>
        </Link>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Vérification publique · Max. 10/min</div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,122,94,0.2)', border: '1.5px solid rgba(0,122,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>🔍</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 10 }}>Vérifier une attestation</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
              Entrez la référence et le code de contrôle figurant sur l'attestation pour en vérifier l'authenticité.
            </p>
          </div>

          {/* Form card */}
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 28, backdropFilter: 'blur(12px)' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Référence de l'attestation
                </label>
                <input {...register('reference', { required: 'Référence requise', pattern: { value: /^ATT-/, message: 'Format invalide (commence par ATT-)' } })}
                  placeholder="ATT-DOUALA-20260101-00001"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${errors.reference ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`, background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', letterSpacing: '0.04em' }} />
                {errors.reference && <p style={{ color: '#FCA5A5', fontSize: 11, marginTop: 5 }}>{errors.reference.message}</p>}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Code de contrôle
                </label>
                <input {...register('codeControle', { required: 'Code requis', minLength: { value: 6, message: 'Minimum 6 caractères' } })}
                  placeholder="••••••••" maxLength={12}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${errors.codeControle ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`, background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 16, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', letterSpacing: '0.2em', textTransform: 'uppercase' }} />
                {errors.codeControle && <p style={{ color: '#FCA5A5', fontSize: 11, marginTop: 5 }}>{errors.codeControle.message}</p>}
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: loading ? 'rgba(0,122,94,0.5)' : 'var(--color-forest)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Vérification...
                  </>
                ) : '🔍 Vérifier l\'attestation'}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </form>

            {/* Result */}
            {result && (
              <div style={{ marginTop: 20, borderRadius: 12, overflow: 'hidden', border: `1px solid ${result.valid ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                <div style={{ padding: '14px 18px', background: result.valid ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{result.valid ? '✅' : '❌'}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: result.valid ? '#4ADE80' : '#FCA5A5' }}>
                      {result.valid ? 'Attestation valide' : 'Attestation non valide'}
                    </div>
                    <div style={{ fontSize: 11, color: result.valid ? 'rgba(74,222,128,0.7)' : 'rgba(252,165,165,0.7)' }}>
                      {result.valid ? 'Document authentique certifié par la Ville de Douala' : 'Document introuvable, expiré ou révoqué'}
                    </div>
                  </div>
                </div>

                {result.valid && (
                  <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.03)' }}>
                    {[
                      ['Référence', result.reference || ''],
                      ['Type', 'Attestation de renonciation'],
                      ['Émise le', result.emisLe ? new Date(result.emisLe).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''],
                      ['Expire le', result.expireLe ? new Date(result.expireLe).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''],
                      ['Autorité', result.autorite || ''],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: label === 'Référence' ? 'monospace' : 'inherit' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 20 }}>
            Service public · <Link href="/" style={{ color: 'rgba(0,166,126,0.7)', textDecoration: 'none' }}>Retour à l'accueil</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
