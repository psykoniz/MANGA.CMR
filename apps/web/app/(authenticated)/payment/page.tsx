'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const declarationId = searchParams.get('id');

  const [step, setStep] = useState<'provider' | 'confirm' | 'success'>('provider');
  const [selectedProvider, setSelectedProvider] = useState<'MTN' | 'ORANGE' | null>(
    null
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const FRAIS_DOSSIER = 5000;
  const MONTANT_DECLARATION = 50000000; // Demo amount
  const TOTAL = MONTANT_DECLARATION + FRAIS_DOSSIER;

  const handleProviderSelect = (provider: 'MTN' | 'ORANGE') => {
    setSelectedProvider(provider);
    setStep('confirm');
  };

  const handlePayment = async () => {
    if (!selectedProvider || !phoneNumber) {
      alert('Veuillez sélectionner un provider et entrer un numéro');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/init`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            declarationId,
            amount: TOTAL,
            provider: selectedProvider,
            phoneNumber,
          }),
        }
      );

      if (response.ok) {
        // Demo: Simulate successful payment
        setTimeout(() => {
          setStep('success');
        }, 2000);
      } else {
        alert('Erreur paiement');
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Effectuer le Paiement</h1>

        {/* Summary */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Montant Déclaration</span>
              <span className="font-semibold">
                {(MONTANT_DECLARATION / 1000000).toFixed(1)}M XAF
              </span>
            </div>
            <div className="flex justify-between">
              <span>Frais de Dossier</span>
              <span className="font-semibold">{FRAIS_DOSSIER.toLocaleString()} XAF</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                {(TOTAL / 1000000).toFixed(1)}M XAF
              </span>
            </div>
          </div>
        </div>

        {/* Provider Selection */}
        {step === 'provider' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Sélectionner Provider</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleProviderSelect('MTN')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition"
              >
                <div className="text-3xl font-bold text-orange-500 mb-2">MTN</div>
                <p className="text-sm text-gray-600">MTN Mobile Money</p>
              </button>
              <button
                onClick={() => handleProviderSelect('ORANGE')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition"
              >
                <div className="text-3xl font-bold text-orange-400 mb-2">ORANGE</div>
                <p className="text-sm text-gray-600">Orange Money</p>
              </button>
            </div>
          </div>
        )}

        {/* Confirmation & Payment */}
        {step === 'confirm' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Provider Sélectionné</h2>
              <div className="p-4 bg-blue-50 rounded-lg border border-primary">
                <p className="text-2xl font-bold">{selectedProvider}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Numéro Téléphone {selectedProvider}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+237xxxxxxxxx"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: +237 suivi de 9 chiffres
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm">
              <p className="font-medium mb-2">Mode Développement</p>
              <p>
                Le paiement est simulé en mode démo. En production, vous recevrez une
                demande USSD sur votre téléphone.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep('provider');
                  setSelectedProvider(null);
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Retour
              </button>
              <button
                onClick={handlePayment}
                disabled={!phoneNumber || isLoading}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {isLoading ? 'Traitement...' : 'Payer'}
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Paiement Réussi!
              </h2>
              <p className="text-gray-600 mb-4">
                Votre déclaration a été soumise avec succès pour révision.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm font-medium text-green-900">
                Référence Transaction: TXN-20260414-12345
              </p>
              <p className="text-sm text-green-800 mt-1">
                Montant: {(TOTAL / 1000000).toFixed(1)}M XAF
              </p>
            </div>

            <button
              onClick={() => router.push('/declarations')}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Voir Mes Déclarations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
