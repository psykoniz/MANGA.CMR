'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const declarationSchema = z.object({
  declarantType: z.enum(['PERSONNE_PHYSIQUE', 'PERSONNE_MORALE']),
  montantDeclare: z.coerce.number().positive('Montant requis'),
  bienDesignation: z.string().min(3),
  bienSurface: z.coerce.number().positive(),
  bienLieu: z.string().min(3),
  documentType: z.enum(['IDENTITY_PROOF', 'PROPERTY_DEED', 'SURVEY_PLAN']),
  phoneNumber: z.string().regex(/^\+237\d{9}$/, 'Numéro téléphone invalide'),
});

type DeclarationFormData = z.infer<typeof declarationSchema>;

export default function DeclarePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ocrResults, setOcrResults] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DeclarationFormData>({
    resolver: zodResolver(declarationSchema),
  });

  const onSubmit = async (data: DeclarationFormData) => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Create declaration
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/declarations`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              declarantType: data.declarantType,
              montantDeclare: data.montantDeclare,
            }),
          }
        );

        if (!response.ok) throw new Error('Erreur création déclaration');

        const declaration = await response.json();
        router.push(`/declarations/${declaration.id}/payment`);
      } catch (error) {
        alert('Erreur: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'IDENTITY_PROOF');

      // Mock OCR results for demo
      setOcrResults({
        status: 'DONE',
        globalScore: 85,
        fields: {
          identity_number: 'CM123456789',
          names: 'JEAN NKOMO',
          date_of_birth: '1985-03-15',
        },
      });
    } catch (error) {
      alert('Erreur upload: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Nouvelle Déclaration</h1>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 text-center pb-2 border-b-2 ${
                step === s ? 'border-primary' : 'border-gray-200'
              }`}
            >
              <div
                className={`inline-block w-8 h-8 rounded-full flex items-center justify-center ${
                  s <= step
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              <p className="text-xs mt-1">
                {s === 1 ? 'Déclarant' : s === 2 ? 'Bien' : 'Documents'}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Declarant Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Type Déclarant</label>
                <select
                  {...register('declarantType')}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="PERSONNE_PHYSIQUE">Personne Physique</option>
                  <option value="PERSONNE_MORALE">Personne Morale</option>
                </select>
                {errors.declarantType && (
                  <p className="text-red-500 text-sm">{errors.declarantType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Montant Déclaré (XAF)</label>
                <input
                  type="number"
                  {...register('montantDeclare')}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Ex: 50000000"
                />
                {errors.montantDeclare && (
                  <p className="text-red-500 text-sm">{errors.montantDeclare.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Téléphone</label>
                <input
                  type="tel"
                  {...register('phoneNumber')}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="+237XXXXXXXXX"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Property Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Désignation Bien</label>
                <input
                  type="text"
                  {...register('bienDesignation')}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Ex: Terrain - Akwa"
                />
                {errors.bienDesignation && (
                  <p className="text-red-500 text-sm">{errors.bienDesignation.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Surface (m²)</label>
                <input
                  type="number"
                  {...register('bienSurface')}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Ex: 2500"
                />
                {errors.bienSurface && (
                  <p className="text-red-500 text-sm">{errors.bienSurface.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Localisation</label>
                <input
                  type="text"
                  {...register('bienLieu')}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Ex: Rue Nationale, Akwa, Douala"
                />
                {errors.bienLieu && (
                  <p className="text-red-500 text-sm">{errors.bienLieu.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-2">PDF ou image JPG/PNG</p>
              </div>

              {uploadedFile && (
                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-medium">{uploadedFile.name}</p>
                  {ocrResults && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Score OCR:</span>
                        <span className="font-bold text-primary">
                          {ocrResults.globalScore}%
                        </span>
                      </div>
                      <div className="text-sm bg-white p-2 rounded">
                        {Object.entries(ocrResults.fields).map(([key, value]) => (
                          <p key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isLoading ? 'Traitement...' : step === 3 ? 'Soumettre' : 'Suivant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
