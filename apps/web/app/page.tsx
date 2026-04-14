import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-green-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">SmartFoncier Africa</h1>
          <p className="text-2xl text-green-100 mb-8">Ville de Douala, Cameroun</p>
          <p className="text-lg text-green-50 mb-12 max-w-2xl mx-auto">
            Plateforme numérique de gestion des déclarations d'aliénation immobilière,
            du droit de préemption urbain et des attestations foncières sécurisées.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/declaration"
              className="bg-secondary hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition"
            >
              Déposer une déclaration
            </Link>
            <Link
              href="/verifier"
              className="bg-white hover:bg-gray-100 text-primary font-bold py-3 px-8 rounded-lg transition"
            >
              Vérifier une attestation
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Nos Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2">Traitement 48h</h3>
              <p className="text-gray-600 text-sm">Traitement rapide et automatisé</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="font-bold text-lg mb-2">100% en Ligne</h3>
              <p className="text-gray-600 text-sm">Accessible depuis n'importe où</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-lg mb-2">Attestation Sécurisée</h3>
              <p className="text-gray-600 text-sm">Documents authentifiés avec QR Code</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="font-bold text-lg mb-2">Vérification Publique</h3>
              <p className="text-gray-600 text-sm">Vérifiez l'authenticité facilement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <p>Ville de Douala © 2025 | PREDEM v1.0</p>
          <p className="text-gray-400 text-sm mt-2">Plateforme SmartFoncier Africa</p>
        </div>
      </footer>
    </div>
  );
}
