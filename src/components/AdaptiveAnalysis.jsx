// src/components/AdaptiveAnalysis.jsx
import React, { useState } from 'react';
import axios from 'axios';

export const AdaptiveAnalysis = ({ data }) => {
  const [visitorName, setVisitorName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeVisitor = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/intelligence/analyze', {
        name: visitorName,
      });
      setResult(response.data.analysis);    
   
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Erreur lors de l'analyse du visiteur"
      );
    } finally {
      setLoading(false);
    }

  };
     console.log("Données reçues par AdaptiveAnalysis :", data);
 if (!data) return null;
return (
  <div className="bg-white shadow-md p-4 rounded-xl mt-4 max-w-xl mx-auto border-l-4 border-blue-500 animate-fadeIn">
    <h3 className="text-xl font-bold text-blue-600 mb-2">🔎 Analyse Adaptative</h3>
    <ul className="space-y-1 text-gray-700">
      <li><strong>But fréquent :</strong> {data.frequentPurpose}</li>
      <li><strong>Contact fréquent :</strong> {data.frequentContact}</li>
      <li><strong>Langue préférée :</strong> {data.preferredLanguage}</li>
      <li><strong>Conseil :</strong> {data.insights}</li>
    </ul>
  </div>
);


};
