'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User { email: string; role: string; fullname?: string; }

const navItems = [
  { href: '/declare', icon: '📄', label: 'Déclarer' },
  { href: '/backoffice', icon: '⚙️', label: 'Backoffice', roles: ['INSTRUCTEUR', 'SUPERVISEUR', 'ADMIN_METIER', 'ADMIN_TECHNIQUE'] },
  { href: '/map', icon: '🗺️', label: 'Zones préemption' },
  { href: '/verifier', icon: '🔍', label: 'Vérifier', public: true },
];

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: 'include' });
        if (res.ok) { setUser(await res.json()); return; }
        router.push('/login');
      } catch {
        // API indisponible — mode démo, accès direct sans auth
        setUser({ email: 'demo@predem.cm', role: 'DECLARANT', fullname: 'Mode Démo' });
      }
      finally { setIsLoading(false); }
    };
    checkAuth();
  }, [router]);

  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    router.push('/');
  };

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-mist)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--color-forest)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-slate)' }}>Chargement...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const visibleNav = navItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-mist)', fontFamily: 'var(--font-body)' }}>
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240, flexShrink: 0, background: 'var(--color-ink)',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏛️</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>PREDEM</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SmartFoncier</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {visibleNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 10, textDecoration: 'none', transition: 'all 0.15s',
                background: active ? 'rgba(0,122,94,0.25)' : 'transparent',
                border: `1px solid ${active ? 'rgba(0,122,94,0.4)' : 'transparent'}`,
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--color-forest-light)' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {(user.fullname || user.email)[0].toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullname || user.email}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{user.role}</div>
              </div>
            </div>
          )}
          <button onClick={logout} style={{
            width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer',
            textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
            ↩ Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
