'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface FormData { email: string; password: string; }

const DEMO_USERS = [
  { role: 'DECLARANT', email: 'declarant@test.cm', password: 'Test123!', label: 'Déclarant', icon: '👤', color: '#007A5E', dest: '/declare' },
  { role: 'INSTRUCTEUR', email: 'instructeur@test.cm', password: 'Test123!', label: 'Instructeur', icon: '⚙️', color: '#2563EB', dest: '/backoffice' },
  { role: 'ADMIN', email: 'admin@test.cm', password: 'Test123!', label: 'Administrateur', icon: '🛡️', color: '#7C3AED', dest: '/backoffice' },
];

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const fillDemo = (user: typeof DEMO_USERS[0]) => {
    setValue('email', user.email);
    setValue('password', user.password);
    setActiveDemo(user.role);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const demo = DEMO_USERS.find(u => u.email === data.email);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/auth/login`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        toast.success('Connexion réussie');
        const dest = json.user?.role === 'INSTRUCTEUR' || json.user?.role === 'ADMIN_METIER' ? '/backoffice' : '/declare';
        router.push(dest);
        return;
      }
    } catch { /* demo fallback */ }
    // Demo mode — API indisponible, connexion simulée
    if (demo) {
      toast.success('Mode démo — connexion simulée');
      setTimeout(() => router.push(demo.dest), 800);
    } else {
      toast.error('Identifiants incorrects');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0F1F1A 0%, #1E3329 50%, #005C47 100%)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' }}>
      {/* Nav */}
      <nav style={{ padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏛️</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>PREDEM</span>
        </Link>
        <Link href="/verifier" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
          Vérifier une attestation →
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>
              Connexion
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              Accédez à votre espace PREDEM
            </p>
          </div>

          {/* Demo credential cards */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10, textAlign: 'center' }}>
              Accès rapide — mode démo
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {DEMO_USERS.map(u => (
                <button key={u.role} onClick={() => fillDemo(u)} style={{
                  padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${activeDemo === u.role ? u.color : 'rgba(255,255,255,0.1)'}`,
                  background: activeDemo === u.role ? `${u.color}22` : 'rgba(255,255,255,0.04)',
                  color: '#fff', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{u.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: activeDemo === u.role ? '#fff' : 'rgba(255,255,255,0.7)' }}>{u.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 28, backdropFilter: 'blur(12px)' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Adresse e-mail
                </label>
                <input {...register('email', { required: 'Email requis' })}
                  type="email" placeholder="votre@email.cm"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`, background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }} />
                {errors.email && <p style={{ color: '#FCA5A5', fontSize: 11, marginTop: 5 }}>{errors.email.message}</p>}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Mot de passe
                </label>
                <input {...register('password', { required: 'Mot de passe requis' })}
                  type="password" placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${errors.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`, background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }} />
                {errors.password && <p style={{ color: '#FCA5A5', fontSize: 11, marginTop: 5 }}>{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: loading ? 'rgba(232,160,0,0.5)' : 'var(--color-gold)',
                color: loading ? 'rgba(255,255,255,0.6)' : '#0F1F1A',
                fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}>
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(15,31,26,0.3)', borderTopColor: '#0F1F1A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Connexion...
                  </>
                ) : 'Se connecter →'}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </form>
          </div>

          {/* Demo note */}
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(232,160,0,0.08)', border: '1px solid rgba(232,160,0,0.2)' }}>
            <div style={{ fontSize: 11, color: 'rgba(232,160,0,0.9)', fontWeight: 700, marginBottom: 3 }}>Mode démonstration</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
              Mot de passe universel démo : <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>Test123!</span>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 20 }}>
            Service public · <Link href="/" style={{ color: 'rgba(0,166,126,0.7)', textDecoration: 'none' }}>Retour à l'accueil</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
