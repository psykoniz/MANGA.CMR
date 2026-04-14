'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';

interface VerifyFormData {
  reference: string;
  codeControle: string;
}

interface VerifyResponse {
  valid: boolean;
  type?: string;
  reference?: string;
  emisLe?: string;
  expireLe?: string;
  autorite?: string;
}

export default function VerifyPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<VerifyFormData>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  const onSubmit = async (data: VerifyFormData) => {
    setLoading(true);
    try {
      const response = await axios.get<VerifyResponse>('/api/v1/attestations/verify', {
        params: {
          reference: data.reference,
          codeControle: data.codeControle,
        },
      });
      setResult(response.data);
      if (!response.data.valid) {
        toast.error('Attestation non valide ou expirée');
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification');
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Vérifier une Attestation</h1>
        <p className="text-gray-600 text-center mb-6 text-sm">
          Vérifiez l'authenticité d'une attestation de renonciation
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Référence de l'attestation
            </label>
            <input
              {...register('reference', {
                required: 'Référence requise',
                pattern: { value: /^ATT-/, message: 'Format invalide (ATT-...)' },
              })}
              placeholder="ATT-DOUALA-20250101-00001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.reference && <p className="text-red-600 text-sm mt-1">{errors.reference.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code de contrôle
            </label>
            <input
              {...register('codeControle', {
                required: 'Code requis',
                minLength: { value: 8, message: '8 caractères minimum' },
              })}
              placeholder="XXXXXXXX"
              maxLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase"
            />
            {errors.codeControle && <p className="text-red-600 text-sm mt-1">{errors.codeControle.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{result.valid ? '✓' : '✗'}</span>
              <p className={`font-bold ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                {result.valid ? 'Attestation valide' : 'Attestation non valide ou expirée'}
              </p>
            </div>
            {result.valid && (
              <div className="text-sm space-y-1 text-gray-700">
                <p><strong>Référence:</strong> {result.reference}</p>
                <p><strong>Émise le:</strong> {result.emisLe ? new Date(result.emisLe).toLocaleDateString('fr-FR') : '-'}</p>
                <p><strong>Expire le:</strong> {result.expireLe ? new Date(result.expireLe).toLocaleDateString('fr-FR') : '-'}</p>
                <p><strong>Autorité:</strong> {result.autorite}</p>
              </div>
            )}
          </div>
        )}

        <p className="text-gray-500 text-xs text-center mt-6">
          Maximum 10 vérifications par minute
        </p>
      </div>
    </div>
  );
}
