'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const schema = z.object({
  declarantType: z.enum(['PERSONNE_PHYSIQUE', 'PERSONNE_MORALE']),
  montantDeclare: z.coerce.number().positive('Montant requis'),
  phoneNumber: z.string().regex(/^\+237\d{9}$/, 'Format: +237XXXXXXXXX'),
  bienDesignation: z.string().min(3, 'Désignation requise'),
  bienSurface: z.coerce.number().positive('Surface requise'),
  bienLieu: z.string().min(3, 'Localisation requise'),
});
type FormData = z.infer<typeof schema>;

interface OcrResult { status: string; globalScore: number; fields: Record<string, string>; }

const STEPS = [
  { num: 1, label: 'Déclarant', icon: '👤' },
  { num: 2, label: 'Bien', icon: '🏠' },
  { num: 3, label: 'Documents', icon: '📎' },
  { num: 4, label: 'Paiement', icon: '💳' },
];

export default function DeclarePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [declarationId, setDeclarationId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { declarantType: 'PERSONNE_PHYSIQUE' },
  });

  const nextStep = async () => {
    const fields: (keyof FormData)[][] = [
      ['declarantType', 'montantDeclare', 'phoneNumber'],
      ['bienDesignation', 'bienSurface', 'bienLieu'],
      [],
    ];
    const valid = await trigger(fields[step - 1] as (keyof FormData)[]);
    if (valid) setStep(s => s + 1);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate OCR
    setOcrResult({ status: 'DONE', globalScore: 87, fields: { Nom: 'JEAN NKOMO', Numéro: 'CM123456789', Naissance: '15/03/1985', Expires: '20/04/2030' } });
    setIsLoading(false);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/declarations`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ declarantType: data.declarantType, montantDeclare: data.montantDeclare }),
      });
      if (!res.ok) throw new Error('Erreur création');
      const decl = await res.json();
      setDeclarationId(decl.id);
      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const scoreColor = (score: number) => score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-error)';

  return (
    <div style={{ padding: '32px 40px', maxWidth: 760, margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-forest)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Nouvelle déclaration</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: 4 }}>Déclaration d'aliénation</h1>
        <p style={{ fontSize: 14, color: 'var(--color-slate)' }}>Remplissez les informations en 4 étapes. Durée estimée: 10 minutes.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 40, position: 'relative' }}>
        {STEPS.map((s, i) => {
          const done = step > s.num;
          const active = step === s.num;
          return (
            <div key={s.num} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {i < STEPS.length - 1 && (
                <div style={{ position: 'absolute', top: 18, left: '50%', width: '100%', height: 2, background: done ? 'var(--color-forest)' : '#E2EAE6', transition: 'background 0.3s', zIndex: 0 }} />
              )}
              <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, zIndex: 1, transition: 'all 0.3s', marginBottom: 8, background: done ? 'var(--color-forest)' : active ? 'var(--color-ink)' : '#E2EAE6', color: done || active ? '#fff' : 'var(--color-slate)', boxShadow: active ? '0 0 0 4px rgba(0,122,94,0.15)' : 'none', }}>
                {done ? '✓' : s.icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? 'var(--color-ink)' : done ? 'var(--color-forest)' : 'var(--color-slate)', letterSpacing: '0.02em' }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EDE9', padding: 36, boxShadow: 'var(--shadow-card)' }}>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ── STEP 1: DÉCLARANT ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 24 }}>Informations du déclarant</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-slate)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Type de déclarant</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[['PERSONNE_PHYSIQUE', '👤 Personne Physique'], ['PERSONNE_MORALE', '🏢 Personne Morale']].map(([val, label]) => (
                      <label key={val} style={{ cursor: 'pointer' }}>
                        <input type="radio" {...register('declarantType')} value={val} style={{ display: 'none' }} />
                        <div style={{ padding: '12px 16px', borderRadius: 10, border: `2px solid ${getValues('declarantType') === val ? 'var(--color-forest)' : '#E8EDE9'}`, background: getValues('declarantType') === val ? 'var(--color-forest-50)' : '#fff', transition: 'all 0.2s', fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>
                          {label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-slate)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Montant déclaré (XAF)</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" {...register('montantDeclare')} placeholder="Ex: 50 000 000" style={{ width: '100%', padding: '11px 16px 11px 48px', borderRadius: 10, border: `1.5px solid ${errors.montantDeclare ? 'var(--color-error)' : '#E8EDE9'}`, fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} />
                    <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--color-slate)', fontWeight: 600 }}>XAF</span>
                  </div>
                  {errors.montantDeclare && <p style={{ color: 'var(--color-error)', fontSize: 12, marginTop: 4 }}>{errors.montantDeclare.message}</p>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-slate)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Téléphone Mobile Money</label>
                  <input type="tel" {...register('phoneNumber')} placeholder="+237 6XX XXX XXX" style={{ width: '100%', padding: '11px 16px', borderRadius: 10, border: `1.5px solid ${errors.phoneNumber ? 'var(--color-error)' : '#E8EDE9'}`, fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} />
                  {errors.phoneNumber && <p style={{ color: 'var(--color-error)', fontSize: 12, marginTop: 4 }}>{errors.phoneNumber.message}</p>}
                  <p style={{ fontSize: 11, color: 'var(--color-slate)', marginTop: 4 }}>Utilisé pour le paiement MTN/Orange Money</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: BIEN ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 24 }}>Description du bien immobilier</h2>
              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  { name: 'bienDesignation', label: 'Désignation du bien', placeholder: 'Ex: Terrain — Akwa, Lot F123456', err: errors.bienDesignation },
                  { name: 'bienLieu', label: 'Adresse / Localisation', placeholder: 'Ex: Rue Nationale, Akwa, Douala', err: errors.bienLieu },
                ].map(({ name, label, placeholder, err }) => (
                  <div key={name}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-slate)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</label>
                    <input type="text" {...register(name as keyof FormData)} placeholder={placeholder} style={{ width: '100%', padding: '11px 16px', borderRadius: 10, border: `1.5px solid ${err ? 'var(--color-error)' : '#E8EDE9'}`, fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} />
                    {err && <p style={{ color: 'var(--color-error)', fontSize: 12, marginTop: 4 }}>{err.message}</p>}
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-slate)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Surface cadastrale (m²)</label>
                    <input type="number" {...register('bienSurface')} placeholder="Ex: 2500" style={{ width: '100%', padding: '11px 16px', borderRadius: 10, border: `1.5px solid ${errors.bienSurface ? 'var(--color-error)' : '#E8EDE9'}`, fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }} />
                    {errors.bienSurface && <p style={{ color: 'var(--color-error)', fontSize: 12, marginTop: 4 }}>{errors.bienSurface.message}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-slate)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Arrondissement</label>
                    <select style={{ width: '100%', padding: '11px 16px', borderRadius: 10, border: '1.5px solid #E8EDE9', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', background: '#fff', boxSizing: 'border-box' }}>
                      <option>Centre</option><option>Akwa</option><option>Bonanjo</option><option>Deido</option><option>Logpom</option><option>Bassa</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: DOCUMENTS ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 8 }}>Pièces justificatives</h2>
              <p style={{ fontSize: 13, color: 'var(--color-slate)', marginBottom: 24 }}>Documents requis: Titre foncier, CNI/Passeport, Plan cadastral</p>

              <label style={{ display: 'block', cursor: 'pointer' }}>
                <input type="file" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} />
                <div style={{ border: '2px dashed #C8D8D0', borderRadius: 14, padding: '40px 24px', textAlign: 'center', background: '#F8FBFA', transition: 'all 0.2s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--color-forest)'; el.style.background = 'var(--color-forest-50)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#C8D8D0'; el.style.background = '#F8FBFA'; }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📎</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 4 }}>Glissez vos fichiers ici ou cliquez pour sélectionner</div>
                  <div style={{ fontSize: 12, color: 'var(--color-slate)' }}>PDF, JPG, PNG — max. 10 Mo par fichier</div>
                </div>
              </label>

              {isLoading && (
                <div style={{ marginTop: 20, padding: 20, background: '#F0F4F2', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, border: '2px solid var(--color-forest)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>Analyse OCR en cours...</div>
                    <div style={{ fontSize: 12, color: 'var(--color-slate)' }}>Extraction automatique des données</div>
                  </div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {uploadedFile && ocrResult && !isLoading && (
                <div style={{ marginTop: 20, border: '1px solid #E8EDE9', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', background: '#F8FBFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>📄</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>{uploadedFile.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-slate)' }}>{(uploadedFile.size / 1024).toFixed(0)} Ko</div>
                      </div>
                    </div>
                    <span style={{ background: 'rgba(34,197,94,0.12)', color: '#16A34A', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>✓ Analysé</span>
                  </div>

                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>Score de confiance OCR</span>
                      <span style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, color: scoreColor(ocrResult.globalScore) }}>{ocrResult.globalScore}%</span>
                    </div>
                    <div style={{ height: 8, background: '#E8EDE9', borderRadius: 100, overflow: 'hidden', marginBottom: 20 }}>
                      <div style={{ height: '100%', width: `${ocrResult.globalScore}%`, background: scoreColor(ocrResult.globalScore), borderRadius: 100, transition: 'width 1s ease-out' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {Object.entries(ocrResult.fields).map(([key, value]) => (
                        <div key={key} style={{ padding: '10px 12px', background: '#F8FBFA', borderRadius: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-slate)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>{key}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: CONFIRMATION ── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✅</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 12 }}>Dossier créé avec succès!</h2>
              <p style={{ fontSize: 14, color: 'var(--color-slate)', marginBottom: 32, lineHeight: 1.7 }}>
                Votre déclaration a été enregistrée. Procédez au paiement pour finaliser la soumission.
              </p>
              <button onClick={() => router.push(`/payment?id=${declarationId}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--color-gold)', color: 'var(--color-ink)', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
                💳 Procéder au paiement →
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid #E8EDE9' }}>
              <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} style={{ padding: '10px 20px', borderRadius: 9, border: '1.5px solid #E8EDE9', background: 'transparent', color: 'var(--color-slate)', fontSize: 13, fontWeight: 600, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1, fontFamily: 'var(--font-body)' }}>
                ← Précédent
              </button>
              {step < 3 ? (
                <button type="button" onClick={nextStep} style={{ padding: '10px 24px', borderRadius: 9, background: 'var(--color-forest)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Suivant →
                </button>
              ) : (
                <button type="submit" disabled={isLoading} style={{ padding: '10px 24px', borderRadius: 9, background: 'var(--color-forest)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, fontFamily: 'var(--font-body)' }}>
                  {isLoading ? '⏳ En cours...' : 'Créer le dossier ✓'}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
