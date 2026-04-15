'use client';
import { useEffect, useState } from 'react';

interface Declaration { id: string; reference: string; declarantUserId: string; montantDeclare: number; status: string; submittedAt: string; }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; }> = {
  DRAFT: { label: 'Brouillon', color: '#6B7280', bg: '#F3F4F6' },
  PENDING_PAYMENT: { label: 'Paiement', color: '#D97706', bg: '#FEF3C7' },
  SUBMITTED: { label: 'Soumis', color: '#2563EB', bg: '#EFF6FF' },
  IN_REVIEW: { label: 'En révision', color: '#7C3AED', bg: '#F5F3FF' },
  VALIDATED: { label: 'Validé', color: '#059669', bg: '#ECFDF5' },
  REJECTED: { label: 'Rejeté', color: '#DC2626', bg: '#FEF2F2' },
  ATTESTATION_ISSUED: { label: 'Attestation émise', color: '#047857', bg: '#D1FAE5' },
};

const DEMO_DECLARATIONS: Declaration[] = [
  { id: '1', reference: 'DEC-DOUALA-20260414-00001', declarantUserId: 'u1', montantDeclare: 50000000, status: 'SUBMITTED', submittedAt: '2026-04-13T09:00:00Z' },
  { id: '2', reference: 'DEC-DOUALA-20260413-00002', declarantUserId: 'u2', montantDeclare: 150000000, status: 'IN_REVIEW', submittedAt: '2026-04-12T14:30:00Z' },
  { id: '3', reference: 'DEC-DOUALA-20260410-00003', declarantUserId: 'u1', montantDeclare: 75000000, status: 'VALIDATED', submittedAt: '2026-04-10T11:00:00Z' },
  { id: '4', reference: 'DEC-DOUALA-20260409-00004', declarantUserId: 'u3', montantDeclare: 25000000, status: 'SUBMITTED', submittedAt: '2026-04-09T16:00:00Z' },
];

const STATS = [
  { label: 'À réviser', value: 2, icon: '📥', color: '#2563EB' },
  { label: 'En instruction', value: 1, icon: '⚙️', color: '#7C3AED' },
  { label: 'Validées', value: 1, icon: '✅', color: '#059669' },
  { label: 'Ce mois', value: 4, icon: '📊', color: '#D97706' },
];

export default function BackofficePage() {
  const [declarations, setDeclarations] = useState<Declaration[]>(DEMO_DECLARATIONS);
  const [selected, setSelected] = useState<Declaration | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/declarations?status=${filter !== 'ALL' ? filter : ''}`, { credentials: 'include' });
        if (res.ok) { const data = await res.json(); if (data.data?.length) setDeclarations(data.data); }
      } catch { /* use demo data */ }
    };
    fetchData();
  }, [filter]);

  const handleReview = async (decision: 'VALIDATE' | 'REJECT') => {
    if (!selected) return;
    setIsLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/declarations/${selected.id}/review`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comment: reviewNote }),
      });
      setDeclarations(prev => prev.map(d => d.id === selected.id ? { ...d, status: decision === 'VALIDATE' ? 'VALIDATED' : 'REJECTED' } : d));
      setSelected(null);
      setReviewNote('');
    } finally { setIsLoading(false); }
  };

  const filtered = filter === 'ALL' ? declarations : declarations.filter(d => d.status === filter);
  const formatAmount = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

  return (
    <div style={{ padding: '32px 40px', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-forest)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Espace instructeur</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>Tableau de bord</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {STATS.map(stat => (
          <div key={stat.label} style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #E8EDE9', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{stat.icon}</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: stat.color }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--color-slate)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '340px 1fr' : '1fr', gap: 20 }}>
        {/* List */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EDE9', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          {/* Filter tabs */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F4F2', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['ALL', 'Tout'], ['SUBMITTED', 'À réviser'], ['IN_REVIEW', 'En cours'], ['VALIDATED', 'Validé']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: filter === val ? 'var(--color-ink)' : '#F0F4F2', color: filter === val ? '#fff' : 'var(--color-slate)', fontFamily: 'var(--font-body)' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Items */}
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {filtered.map(decl => {
              const cfg = STATUS_CONFIG[decl.status] || STATUS_CONFIG.DRAFT;
              const isActive = selected?.id === decl.id;
              return (
                <div key={decl.id} onClick={() => setSelected(isActive ? null : decl)} style={{ padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid #F5F7F6', background: isActive ? 'var(--color-forest-50)' : 'transparent', borderLeft: `3px solid ${isActive ? 'var(--color-forest)' : 'transparent'}`, transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'monospace' }}>{decl.reference}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-slate)' }}>{formatAmount(decl.montantDeclare)} XAF</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{formatDate(decl.submittedAt)}</span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-slate)', fontSize: 13 }}>
                Aucune déclaration pour ce filtre
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EDE9', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            {/* Detail header */}
            <div style={{ padding: '20px 28px', borderBottom: '1px solid #F0F4F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-slate)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Dossier</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'monospace' }}>{selected.reference}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E8EDE9', background: '#F8FBFA', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ padding: '24px 28px' }}>
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                {[
                  ['Montant déclaré', `${formatAmount(selected.montantDeclare)} XAF`],
                  ['Statut actuel', STATUS_CONFIG[selected.status]?.label || selected.status],
                  ['Soumis le', formatDate(selected.submittedAt)],
                  ['Délai SLA', '48h ouvrables'],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: '14px 16px', background: '#F8FBFA', borderRadius: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-slate)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* OCR Score demo */}
              <div style={{ marginBottom: 24, padding: '16px', background: '#F8FBFA', borderRadius: 12, border: '1px solid #E8EDE9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score OCR global</span>
                  <span style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-forest)' }}>87%</span>
                </div>
                <div style={{ height: 6, background: '#E8EDE9', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '87%', background: 'var(--color-forest)', borderRadius: 100 }} />
                </div>
              </div>

              {/* Review actions */}
              {(selected.status === 'SUBMITTED' || selected.status === 'IN_REVIEW') && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-slate)', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Note de révision</label>
                  <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={3} placeholder="Commentaire pour le déclarant..." style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E8EDE9', fontSize: 13, fontFamily: 'var(--font-body)', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button onClick={() => handleReview('REJECT')} disabled={isLoading} style={{ padding: '11px', borderRadius: 10, border: '1.5px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
                      ✕ Rejeter
                    </button>
                    <button onClick={() => handleReview('VALIDATE')} disabled={isLoading} style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'var(--color-forest)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
                      {isLoading ? '⏳...' : '✓ Valider'}
                    </button>
                  </div>
                </div>
              )}

              {selected.status === 'VALIDATED' && (
                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(5,150,105,0.06)', borderRadius: 12, border: '1px solid rgba(5,150,105,0.15)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#059669', marginBottom: 4 }}>Déclaration validée</div>
                  <div style={{ fontSize: 12, color: 'var(--color-slate)' }}>L'attestation a été générée automatiquement</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
