'use client';

import { useEffect, useState } from 'react';

interface Declaration {
  id: string;
  reference: string;
  declarantUserId: string;
  montantDeclare: number;
  status: string;
  submittedAt: string;
  documents?: Array<{ id: string; type: string; ocrScore: number }>;
}

export default function BackofficePage() {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState('SUBMITTED');

  useEffect(() => {
    fetchDeclarations();
  }, [filterStatus]);

  const fetchDeclarations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/declarations?status=${filterStatus}`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setDeclarations(data.data || []);
      }
    } catch (error) {
      console.error('Erreur fetch declarations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (
    declarationId: string,
    decision: 'VALIDATE' | 'REJECT'
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/declarations/${declarationId}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            decision,
            comment: `Décision: ${decision}`,
          }),
        }
      );

      if (response.ok) {
        alert(`Déclaration ${decision === 'VALIDATE' ? 'validée' : 'rejetée'}`);
        setSelectedDeclaration(null);
        fetchDeclarations();
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Backoffice - Révision Déclarations</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { status: 'SUBMITTED', label: 'À Réviser', color: 'bg-blue-100' },
          { status: 'IN_REVIEW', label: 'En Révision', color: 'bg-yellow-100' },
          { status: 'VALIDATED', label: 'Validées', color: 'bg-green-100' },
        ].map((item) => (
          <div key={item.status} className={`${item.color} p-4 rounded-lg`}>
            <h3 className="font-medium">{item.label}</h3>
            <p className="text-2xl font-bold">
              {declarations.filter((d) => d.status === item.status).length}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-8">
        {/* List */}
        <div className="flex-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-4">Déclarations en Attente</h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="SUBMITTED">À Réviser</option>
              <option value="IN_REVIEW">En Révision</option>
              <option value="VALIDATED">Validées</option>
            </select>
          </div>

          {isLoading ? (
            <div className="p-4 text-center">Chargement...</div>
          ) : (
            <div className="divide-y">
              {declarations.map((decl) => (
                <div
                  key={decl.id}
                  onClick={() => setSelectedDeclaration(decl)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedDeclaration?.id === decl.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{decl.reference}</p>
                      <p className="text-sm text-gray-600">
                        {(decl.montantDeclare / 1000000).toFixed(1)}M XAF
                      </p>
                    </div>
                    <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                      {decl.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        {selectedDeclaration && (
          <div className="flex-1 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">{selectedDeclaration.reference}</h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Montant Déclaré</p>
                <p className="text-2xl font-bold">
                  {(selectedDeclaration.montantDeclare / 1000000).toFixed(1)}M XAF
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">{selectedDeclaration.status}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Documents</p>
                {selectedDeclaration.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="mt-2 p-3 bg-gray-50 rounded flex justify-between items-center"
                  >
                    <span className="text-sm">{doc.type}</span>
                    <span className="text-sm font-bold text-primary">
                      {doc.ocrScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedDeclaration.status === 'SUBMITTED' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(selectedDeclaration.id, 'VALIDATE')}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Valider
                </button>
                <button
                  onClick={() => handleReview(selectedDeclaration.id, 'REJECT')}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                  Rejeter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
