import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  const chat = async (message, language, fixed = false, name = null) => {
    setLoading(true);
    try {
      console.log("Sending chat request with:", { message, language, fixed, name });
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-language": language,
        },
        body: JSON.stringify({ message, language, fixed, name }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      setMessages((oldMessages) => [...oldMessages, ...data.messages]);
    } catch (e) {
      console.error("Erreur chat:", e);
      setMessages((oldMessages) => [
        ...oldMessages,
        {
          content: "Erreur lors de la communication avec le serveur.",
          animation: "sad",
          facialExpression: "sad",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = () => {
    setMessages((oldMessages) => oldMessages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) setMessage(messages[0]);
    else setMessage(null);
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};