import React, { useState, useEffect, useCallback } from "react";
import { InputWithVoice } from "./InputWithVoice";
import { useChat } from "../hooks/useChat";
import toast from "react-hot-toast";
import { AdaptiveAnalysis } from "./AdaptiveAnalysis";
import InteractiveBuildingPlan from "./InteractiveBuildingPlan";
import QRCode from "qrcode";

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const handleError = (error, errorInfo) => {
      console.error("Error caught by boundary:", error, errorInfo);
      setHasError(true);
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);
  if (hasError) {
    return <h1>Une erreur s'est produite. Veuillez recharger la page.</h1>;
  }
  return children;
};

export const UI = ({ hidden }) => {
  const { chat, loading, message, cameraZoomed, setCameraZoomed } = useChat();
  const [visitorForm, setVisitorForm] = useState(false);
  const [visitorNom, setVisitorNom] = useState("");
  const [visitorPrenom, setVisitorPrenom] = useState("");
  const [visitorPhotoBlob, setVisitorPhotoBlob] = useState(null);
  const [showBadgeLink, setShowBadgeLink] = useState(true);
  const [badgeURL, setBadgeURL] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [purpose, setPurpose] = useState("");
  const [contact, setContact] = useState("");
  const [quickPurposeCheck, setQuickPurposeCheck] = useState(null);
  const [quickPurposeEmail, setQuickPurposeEmail] = useState(null);
  const [visitorLastPurpose, setVisitorLastPurpose] = useState(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [busySlots, setBusySlots] = useState([]);
  const [adaptiveData, setAdaptiveData] = useState(null);
  const [badgeAnnounced, setBadgeAnnounced] = useState(false);
  const [messageGuidance, setMessageGuidance] = useState("");
  const [qrModal, setQrModal] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [recognizedName, setRecognizedName] = useState(null);
  const [recognizedVisitor, setRecognizedVisitor] = useState(null);
  const messages = [
    "👋 Welcome to Prologic",
    "👋 Bienvenue chez Prologic",
    "👋 أهلاً بك في Prologic",
    "👋 Bienvenido a Prologic",
    "👋 Benvenuto su Prologic",
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const openExclusive = (setter) => {
    setVisitorForm(false);
    setQuickPurposeCheck(null);
    setShowAppointmentForm(false);
    setShowCheckoutForm(false);
    setShowGuidanceModal(false);
    setter(true);
  };

  const generateQR = async () => {
    const qrData = `http://localhost:3000/plans?guidance=${encodeURIComponent(
      messageGuidance || ""
    )}`;
    try {
      const qrCode = await QRCode.toDataURL(qrData);
      setQrModal(qrCode);
    } catch (error) {
      console.error("Erreur génération QR:", error);
      toast.error("Erreur lors de la génération du QR code.");
    }
  };

  const handleCheckOut = async () => {
    if (!checkoutEmail) {
      toast.error("Veuillez entrer un email valide pour le check-out.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: checkoutEmail }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      toast.success(data.message);
      await chat(
        selectedLanguage === "en"
          ? "Thank you for your visit! Your check-out has been recorded."
          : selectedLanguage === "ar"
          ? "شكرًا على زيارتك! تم تسجيل خروجك."
          : "Merci de votre visite ! Votre départ a été enregistré.",
        selectedLanguage,
        false,
        recognizedName || visitorNom || null
      );
      setCheckoutEmail("");
      setShowCheckoutForm(false);
      setBadgeURL(null);
      setMessageGuidance("");
      setBadgeAnnounced(false);
      setQrModal(null);
      setAdaptiveData(null);
    } catch (err) {
      toast.error("Erreur lors du check-out : " + err.message);
    }
  };

  const triggerAdaptiveAnalysis = async (visitorEmail) => {
    if (!visitorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail)) {
      console.warn("Skipping adaptive analysis: Invalid or missing email", visitorEmail);
      return;
    }
    try {
      console.log("Attempting adaptive analysis for email:", visitorEmail);
      const res = await fetch("http://localhost:3000/api/intelligence/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: visitorEmail }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      console.log("Analyse adaptative réussie :", data.analysis);
      setAdaptiveData(data.analysis);
      toast.success("Analyse adaptative terminée.");
    } catch (err) {
      console.error("Erreur analyse adaptative :", err);
      toast.error("Erreur lors de l'analyse adaptative : Visiteur non trouvé.");
    }
  };

  const handleFaceRecognitionSuccess = async (recognizedVisitor) => {
    console.log("Received recognizedVisitor:", JSON.stringify(recognizedVisitor, null, 2));
    setRecognizedVisitor(recognizedVisitor);
    const recognizedName = recognizedVisitor.name || recognizedVisitor.email;
    setRecognizedName(recognizedName);
    if (recognizedName) {
      setVisitorEmail(recognizedVisitor.email || "");
      if (
        recognizedVisitor.type === "visitor" &&
        recognizedVisitor.email &&
        recognizedVisitor.email !== "N/A" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recognizedVisitor.email)
      ) {
        await triggerAdaptiveAnalysis(recognizedVisitor.email);
      } else {
        console.log(
          "Skipping adaptive analysis: User is an employee or no valid email provided.",
          { type: recognizedVisitor.type, email: recognizedVisitor.email }
        );
        if (recognizedVisitor.type === "employee") {
          toast.success(`Bienvenue ${recognizedName}, aucun besoin d'analyse adaptative pour les employés.`);
        }
      }
      if (recognizedVisitor.showQuickChoice && recognizedVisitor.lastPurpose) {
        setQuickPurposeEmail(recognizedVisitor.email || recognizedName);
        setVisitorLastPurpose(recognizedVisitor.lastPurpose);
        setQuickPurposeCheck(true);
        await chat(recognizedVisitor.content, selectedLanguage, false, recognizedName);
        if (recognizedVisitor.visitor) {
          setVisitorNom(recognizedVisitor.visitor.lastName || "Non spécifié");
          setVisitorPrenom(recognizedVisitor.visitor.firstName || "Non spécifié");
        }
      } else {
        await chat(recognizedVisitor.content, selectedLanguage, false, recognizedName);
        if (recognizedVisitor.status === "unknown" || recognizedVisitor.status === "no_face") {
          console.log("Setting visitorForm to true for status:", recognizedVisitor.status);
          openExclusive(setVisitorForm);
        }
      }
    } else {
      console.warn("No recognized name or email provided.");
      await chat(recognizedVisitor.content, selectedLanguage, false, null);
      if (recognizedVisitor.showForm || recognizedVisitor.status === "unknown" || recognizedVisitor.status === "no_face") {
        console.log("Setting visitorForm to true for showForm or status:", recognizedVisitor);
        openExclusive(setVisitorForm);
      }
    }
  };

  const startRecognition = useCallback(async () => {
    openExclusive(() => {});
    setBadgeURL(null);
    setMessageGuidance("");
    setBadgeAnnounced(false);
    setQrModal(null);
    setShowGuidanceModal(false);
    setAdaptiveData(null);
    setRecognizedName(null);
    setRecognizedVisitor(null);
  
    toast.loading("scan en cours... ");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );
      setVisitorPhotoBlob(blob);
      const formData = new FormData();
      formData.append("image", blob);
      const response = await fetch("http://localhost:3000/recognize-face", {
        method: "POST",
        body: formData,
        headers: { "x-language": selectedLanguage },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      const result = await response.json();
      console.log(" Données reçues :", result);
      stream.getTracks().forEach((track) => track.stop());
      await handleFaceRecognitionSuccess(result);
      toast.dismiss();
    } catch (error) {
      console.error("Erreur reconnaissance faciale:", error);
      toast.error("Erreur reconnaissance : " + error.message);
    }
  }, [selectedLanguage]);

  const registerVisitor = async () => {
    if (!visitorNom.trim() || !visitorPrenom.trim()) {
      toast.error("Veuillez entrer votre nom et prénom !");
      return;
    }
    if (!visitorPhotoBlob) {
      toast.error("Aucune photo détectée, relancez la reconnaissance.");
      return;
    }
    toast.loading("⏳ Enregistrement du visiteur...");
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result;
      const visitorData = {
        firstName: visitorPrenom,
        lastName: visitorNom,
        email: visitorEmail,
        photo: base64data,
        purpose,
        contact,
        language: selectedLanguage,
      };
      try {
        const response = await fetch("http://localhost:3000/register-visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(visitorData),
        });
        if (!response.ok) throw new Error(`Erreur ${response.status}: ${await response.text()}`);
        const data = await response.json();
        setVisitorEmail(visitorData.email);
        toast.dismiss();
        if (data.success && data.badgeURL && !badgeAnnounced) {
          setBadgeAnnounced(true);
          setBadgeURL(data.badgeURL);
          toast.success("✅ Badge généré avec succès !");
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) =>
              stream.getTracks().forEach((track) => track.stop())
            )
            .catch((err) => console.warn("Pas de caméra active :", err));
          let finalMessage = "";
          let guidanceText = "";
          if (data.location) {
            guidanceText =
              selectedLanguage === "fr"
                ? `Rendez-vous à ${data.location}`
                : selectedLanguage === "en"
                ? `Go to ${data.location}`
                : `اذهب إلى ${data.location}`;
            finalMessage +=
              selectedLanguage === "fr"
                ? `Veuillez suivre le plan pour vous rendre à ${data.location}. `
                : selectedLanguage === "en"
                ? `Please follow the map to go to ${data.location}. `
                : `يرجى اتباع الخريطة للذهاب إلى ${data.location}. `;
          } else if (contact) {
            guidanceText =
              selectedLanguage === "fr"
                ? `Rendez-vous avec ${contact}`
                : selectedLanguage === "en"
                ? `Meet with ${contact}`
                : `القاء ${contact}`;
            finalMessage +=
              selectedLanguage === "fr"
                ? `Vous pouvez maintenant vous diriger vers ${contact} pour votre rendez-vous. `
                : selectedLanguage === "en"
                ? `You can now go to ${contact} for your meeting. `
                : `يمكنك الآن التوجه إلى ${contact} لاجتماعك. `;
          }
          finalMessage +=
            selectedLanguage === "fr"
              ? "Votre badge est prêt. Cliquez ci-dessous pour le télécharger !"
              : selectedLanguage === "en"
              ? "Your badge is ready. Click below to download it!"
              : "بطاقتك جاهزة. انقر أدناه لتحميلها!";
          if (data.guidance) {
            setMessageGuidance(data.guidance);
          } else if (guidanceText) {
            setMessageGuidance(guidanceText);
          }
          await chat(finalMessage, selectedLanguage, true, recognizedName || visitorNom || null);
        }
        setVisitorForm(false);
        setVisitorNom("");
        setVisitorPrenom("");
        setVisitorPhotoBlob(null);
        if (visitorEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail)) {
          await triggerAdaptiveAnalysis(visitorEmail);
        }
      } catch (err) {
        toast.dismiss();
        console.error("Erreur enregistrement visiteur:", err);
        toast.error("Erreur lors de l'enregistrement. Réessayez.");
      }
    };
    reader.readAsDataURL(visitorPhotoBlob);
  };

  const checkAvailability = async () => {
    if (!employeeEmail || !date) {
      toast.error("Merci de renseigner l'email de l'employé et la date.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/appointments/availability?employeeEmail=${encodeURIComponent(
          employeeEmail
        )}&date=${date}`
      );
      if (!response.ok) throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      const data = await response.json();
      setBusySlots(data.busySlots || []);
      toast.success(
        data.busySlots?.length
          ? `Créneaux occupés : ${data.busySlots
              .map(
                ({ start, end }) =>
                  `${new Date(start).toLocaleTimeString()} - ${new Date(
                    end
                  ).toLocaleTimeString()}`
              )
              .join(", ")}`
          : "Aucun créneau occupé ce jour-là ✅"
      );
    } catch (error) {
      toast.error("Erreur lors de la récupération des créneaux.");
    }
  };

  const bookAppointment = async () => {
    if (!employeeEmail || !visitorEmail || !startTime || !endTime) {
      toast.error("Merci de remplir tous les champs pour réserver un RDV.");
      return;
    }
    const startDateTime = new Date(`${date}T${startTime}`).toISOString();
    const endDateTime = new Date(`${date}T${endTime}`).toISOString();
    try {
      const response = await fetch("http://localhost:3000/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail,
          visitorEmail,
          startTime: startDateTime,
          endTime: endDateTime,
        }),
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      const data = await response.json();
      if (data.success) {
        toast.success("✅ RDV réservé avec succès !");
        await chat(
          selectedLanguage === "en"
            ? "Your appointment has been booked. A confirmation email has been sent to you."
            : selectedLanguage === "ar"
            ? "تم حجز موعدك. تم إرسال بريد إلكتروني إليك لتأكيد الحجز."
            : "Votre rendez-vous a été réservé. Un e-mail de confirmation vous a été envoyé.",
          selectedLanguage,
          false,
          recognizedName || visitorNom || null
        );
        if (visitorEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail)) {
          await triggerAdaptiveAnalysis(visitorEmail);
        }
        window.open(data.link, "_blank");
        setShowAppointmentForm(false);
      } else {
        toast.error(
          "La réservation a échoué. Veuillez vérifier les créneaux horaires déjà occupés."
        );
        await chat(
          selectedLanguage === "en"
            ? "There are no available time slots. Please check the schedule first."
            : selectedLanguage === "ar"
            ? "لا توجد أوقات شاغرة. يرجى التحقق من الجدول أولاً."
            : "Il n’y a pas de créneaux disponibles. Veuillez vérifier les horaires d’abord.",
          selectedLanguage,
          false,
          recognizedName || visitorNom || null
        );
      }
    } catch (error) {
      toast.error("Échec lors de la réservation.");
    }
  };

  const handleQuickYes = async () => {
    if (!visitorPhotoBlob || !quickPurposeEmail || !visitorLastPurpose) return;
    setPurpose(visitorLastPurpose);
    openExclusive(setVisitorForm);
    setQuickPurposeCheck(null);
    setQuickPurposeEmail(null);
    setVisitorLastPurpose(null);
  };

  const handleQuickNo = () => {
    setQuickPurposeCheck(null);
    openExclusive(setVisitorForm);
  };

  useEffect(() => {
    console.log("visitorForm state updated:", visitorForm);
  }, [visitorForm]);

  if (hidden) return null;

  return (
    <ErrorBoundary>
      <div className="fixed top-4 right-4 pointer-events-auto z-50">
        <div className="relative inline-block text-left">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="bg-white border border-gray-300 rounded-md px-3 py-1 shadow-md hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-300"
          >
            🌐 {selectedLanguage.toUpperCase()}
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                {["fr", "en", "ar"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowLangMenu(false);
                    }}
                    className={`block w-full text-left px-2 py-0.5 text-sm ${
                      selectedLanguage === lang
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {lang === "fr" && "Français"}
                    {lang === "en" && "English"}
                    {lang === "ar" && "عربي"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="fixed inset-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start bg-black bg-opacity-70 p-4 rounded-lg animate-fadeIn max-w-max">
          <h1 className="font-extrabold text-3xl bg-gradient-to-r from-cyan-400 via-blue-400 to-white bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(6,182,212,0.7)]">
            {messages[index]}
          </h1>
          <p className="text-white text-lg mt-1 font-semibold drop-shadow-md">
            Votre Expert en solutions informatique
          </p>
        </div>
        <div className="w-full flex flex-col items-end justify-center gap-4 pointer-events-auto">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? "🔍 -" : "🔎 +"}
          </button>
          <button
            onClick={startRecognition}
            className="border border-blue-500 text-blue-500 p-2 rounded-md hover:bg-green-50"
          >
            Scanner Visage
          </button>
          <button
            onClick={() => openExclusive(setShowAppointmentForm)}
            className="border border-blue-500 text-blue-500 p-2 rounded-md hover:bg-blue-50"
          >
            {showAppointmentForm ? "Fermer le formulaire RDV" : "Prendre RDV"}
          </button>
          <button
            onClick={() => openExclusive(setShowCheckoutForm)}
            className="border border-red-500 text-red-500 p-2 rounded-md hover:bg-red-50"
          >
            ❌ Check-out
          </button>
        </div>
        {(visitorForm || showAppointmentForm || showCheckoutForm || quickPurposeCheck || showGuidanceModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-auto" onClick={() => openExclusive(() => {})}>
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {showCheckoutForm && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-red-600">Check-out</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium"> Email du visiteur</label>
                      <input
                        type="email"
                        className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                        placeholder="visiteur@example.com"
                        value={checkoutEmail}
                        onChange={(e) => setCheckoutEmail(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleCheckOut}
                      className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 mt-4"
                    >
                      ✅ Valider Check-out
                    </button>
                  </div>
                </>
              )}
              {showAppointmentForm && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-blue-600">
                    📅 Prendre un rendez-vous
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium"> Email de l’employé</label>
                      <input
                        type="email"
                        className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                        placeholder="exemple@Prologic.com"
                        value={employeeEmail}
                        onChange={(e) => setEmployeeEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium"> Date du rendez-vous</label>
                      <input
                        type="date"
                        className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={checkAvailability}
                      className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                    >
                      🔍 Vérifier les créneaux occupés
                    </button>
                    <div>
                      <label className="text-sm font-medium"> Email du visiteur</label>
                      <input
                        type="email"
                        className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                        placeholder="visiteur@example.com"
                        value={visitorEmail}
                        onChange={(e) => setVisitorEmail(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-sm font-medium">🕒 Début</label>
                        <input
                          type="time"
                          className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium">🕓 Fin</label>
                        <input
                          type="time"
                          className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      onClick={bookAppointment}
                      className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 mt-4"
                    >
                      ✅ Réserver le RDV
                    </button>
                    {busySlots.length > 0 && (
                      <div className="bg-yellow-50 p-3 mt-4 rounded-md border border-yellow-300">
                        <h3 className="font-semibold text-yellow-700 mb-2">
                          Créneaux occupés :
                        </h3>
                        <ul className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                          {busySlots.map(({ start, end }, i) => (
                            <li key={i}>
                              📌 {new Date(start).toLocaleTimeString()} -{" "}
                              {new Date(end).toLocaleTimeString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
              {visitorForm && (
                <>
                  <h2 className="text-lg font-bold mb-2">Enregistrement Visiteur</h2>
                  <input
                    placeholder="Nom"
                    className="border p-2 rounded-md w-full mb-2"
                    value={visitorNom}
                    onChange={(e) => setVisitorNom(e.target.value)}
                  />
                  <input
                    placeholder="Prénom"
                    className="border p-2 rounded-md w-full mb-2"
                    value={visitorPrenom}
                    onChange={(e) => setVisitorPrenom(e.target.value)}
                  />
                  <input
                    placeholder="Email"
                    type="email"
                    className="border p-2 rounded-md w-full mb-2"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                  />
                  <input
                    placeholder="Objet de la visite (purpose)"
                    className="border p-2 rounded-md w-full mb-2"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                  <input
                    placeholder="Personne ou service à contacter"
                    className="border p-2 rounded-md w-full mb-2"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                  <button
                    className="border border-green-500 text-green-500 p-2 rounded-md w-full mt-2"
                    onClick={registerVisitor}
                  >
                    ✅ Valider (Check-in)
                  </button>
                </>
              )}
              {quickPurposeCheck && (
                <>
                  <p className="text-lg font-semibold mb-2">
                     Est-ce que vous venez encore pour : <br />
                    <strong className="text-blue-600">{visitorLastPurpose}</strong> ?
                  </p>
                  <div className="flex justify-center gap-4 mt-3">
                    <button
                      onClick={handleQuickYes}
                      disabled={!visitorNom || !visitorPrenom}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✅ Oui
                    </button>
                    <button
                      onClick={handleQuickNo}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 pointer-events-auto"
                    >
                      ❌ Non
                    </button>
                  </div>
                </>
              )}
              {showGuidanceModal && messageGuidance && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      Indications pour vous rendre sur place :
                    </h3>
                    <button
                      onClick={() => setShowGuidanceModal(false)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Fermer
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ErrorBoundary>
                      <InteractiveBuildingPlan
                        guidance={messageGuidance}
                        onRoomClick={(room) => {
                          chat(
                            `Vous avez sélectionné ${room.label}. ${
                              messageGuidance || "Suivez le chemin rouge."
                            }`,
                            selectedLanguage,
                            false,
                            recognizedName || visitorNom || null
                          );
                        }}
                      />
                    </ErrorBoundary>
                  </div>
                  <div className="mt-4 flex justify-center gap-4">
                    <button
                      onClick={() => window.print()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      🖨️ Imprimer le plan
                    </button>
                    <button
                      onClick={generateQR}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      📱 Envoyer via QR
                    </button>
                  </div>
                  {qrModal && (
                    <div className="mt-4 text-center">
                      <img
                        src={qrModal}
                        alt="QR Code"
                        className="mx-auto w-32 h-32"
                      />
                      <button
                        onClick={() => setQrModal(null)}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition block mx-auto"
                      >
                        Fermer QR
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        {badgeURL && (
          <a
            href={badgeURL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block bg-blue-500 text-white p-2 rounded-md text-center pointer-events-auto hover:bg-blue-600"
          >
            📥 Télécharger votre badge
          </a>
        )}
        {messageGuidance && (
          <button
            onClick={() => openExclusive(setShowGuidanceModal)}
            className="bg-blue-500 text-white p-2 rounded-md text-center pointer-events-auto hover:bg-blue-600 mt-4"
          >
            Afficher le Plan de Guidage
          </button>
        )}
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <InputWithVoice
            loading={loading}
            message={message}
            onText={(text) => {
              if (!loading && !message && text.trim() !== "") {
                chat(text, selectedLanguage, false, recognizedName || visitorNom || null);
              }
            }}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};