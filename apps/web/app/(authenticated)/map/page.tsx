'use client';
import dynamic from 'next/dynamic';

const PreemptionMap = dynamic(() => import('@/components/PreemptionMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 520, borderRadius: 16, background: 'rgba(0,122,94,0.08)', border: '1px solid rgba(0,122,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--color-forest)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      <span style={{ fontSize: 13, color: 'var(--color-slate)', fontFamily: 'var(--font-body)' }}>Chargement de la carte...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

const ZONE_STATS = [
  { label: 'Zones actives', value: '4', icon: '📍', desc: 'Centre-Ville, Akwa, Bonamoussadi, Deido' },
  { label: 'Surface totale', value: '~12 km²', icon: '📐', desc: 'Périmètre de préemption municipal' },
  { label: 'Biens référencés', value: '2 847', icon: '🏘️', desc: 'Propriétés dans les zones' },
  { label: 'Droit de préemption', value: '90 jours', icon: '⏱️', desc: 'Délai légal d\'exercice' },
];

export default function MapPage() {
  return (
    <div style={{ padding: '32px 40px', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-forest)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Géographie foncière</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Zones de préemption
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-slate)', lineHeight: 1.7, maxWidth: 540 }}>
          Cartographie des zones où la Ville de Douala dispose d'un droit de préemption sur les transactions immobilières. Toute déclaration d'aliénation dans ces périmètres déclenche automatiquement la procédure PREDEM.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {ZONE_STATS.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #E8EDE9', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-slate)', marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.4 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EDE9', padding: 4, boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        <PreemptionMap />
      </div>

      {/* Info footer */}
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #E8EDE9' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-forest)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Base légale</div>
          <div style={{ fontSize: 12, color: 'var(--color-slate)', lineHeight: 1.7 }}>
            Loi n° 80-22 du 14 juillet 1980 portant répression des atteintes à la propriété foncière et domaniale au Cameroun.
            Délibération du Conseil Municipal de Douala — Plan de délimitation des zones de préemption 2024-2030.
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #E8EDE9' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-forest)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Données PostGIS</div>
          <div style={{ fontSize: 12, color: 'var(--color-slate)', lineHeight: 1.7 }}>
            Les périmètres sont stockés en géométrie PostGIS (SRID 4326). La vérification de localisation d'un bien s'effectue via <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#F3F4F6', padding: '1px 4px', borderRadius: 4 }}>ST_Contains(zone.geom, bien.localisation)</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
