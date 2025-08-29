import React, { useState } from "react";

export default function VisitorForm({ imageBase64 }) {
  const [visitorNom, setVisitorNom] = useState("");
  const [visitorPrenom, setVisitorPrenom] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPurpose, setVisitorPurpose] = useState("");
  const [visitorContact, setVisitorContact] = useState("");

  const registerVisitor = async () => {
    if (!visitorNom || !visitorPrenom || !visitorEmail) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const payload = {
      firstName: visitorPrenom,
      lastName: visitorNom,
      email: visitorEmail,
      photo: imageBase64, 
      purpose: visitorPurpose,
      contact: visitorContact,
    };

    try {
      const res = await fetch("http://localhost:3000/register-visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("Visiteur enregistré avec succès !");
        // Reset
        setVisitorNom("");
        setVisitorPrenom("");
        setVisitorEmail("");
        setVisitorPurpose("");
        setVisitorContact("");
      } else {
        alert("Erreur lors de l'enregistrement.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Échec de l'envoi. Vérifiez la connexion backend.");
    }
  };

  return (
    <div className="visitor-form bg-gray-100 p-4 rounded-md mt-4 max-w-screen-sm mx-auto pointer-events-auto">
      <h2 className="text-lg font-bold mb-2">Enregistrement Visiteur</h2>
      <input
        placeholder="Nom"
        className="border p-2 rounded-md w-full mb-2"
        value={visitorNom}
        onChange={(e) => setVisitorNom(e.target.value)}
        required
      />
      <input
        placeholder="Prénom"
        className="border p-2 rounded-md w-full mb-2"
        value={visitorPrenom}
        onChange={(e) => setVisitorPrenom(e.target.value)}
        required
      />
      <input
        placeholder="Email"
        type="email"
        className="border p-2 rounded-md w-full mb-2"
        value={visitorEmail}
        onChange={(e) => setVisitorEmail(e.target.value)}
        required
      />
      <input
        placeholder="Objet de la visite"
        className="border p-2 rounded-md w-full mb-2"
        value={visitorPurpose}
        onChange={(e) => setVisitorPurpose(e.target.value)}
      />
      <input
        placeholder="Personne à contacter"
        className="border p-2 rounded-md w-full mb-2"
        value={visitorContact}
        onChange={(e) => setVisitorContact(e.target.value)}
      />
      <button
        className="border border-green-500 text-green-500 p-2 rounded-md w-full mt-2"
        onClick={registerVisitor}
      >
        ✅ Valider
      </button>
    </div>
  );
}
