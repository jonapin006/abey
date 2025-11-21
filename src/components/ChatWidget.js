import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import '../styles/chatWidget.css';

const N8N_WEBHOOK_URL = 'https://n8n.runzippy.com/webhook/c04b14ff-d59e-4ccc-86b2-81eb97afd8ce';

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { text: input, sender: "yo" };
    setMessages([...messages, userMsg]);
    setInput("");
    
    try {
      const resp = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user.email,
          message: input
        }),
      });
      const data = await resp.json();
      const botReply = Array.isArray(data) ? data[0]?.reply : (data.reply || "Respuesta recibida");
      setMessages((msgs) => [...msgs, { text: botReply, sender: "bot" }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { text: "No se pudo conectar con N8N", sender: "error" }]);
    }
  };

  if (!user) return null;

  return (
    <div className={`chat-widget${open ? ' open' : ''}`}>
      {!open && (
        <button className="chat-widget-btn" onClick={() => setOpen(true)}>
          💬 Chat
        </button>
      )}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            Chat Soporte Abey
            <button className="close-btn" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="chat-body">
            {messages.map((msg, i) =>
              <div key={i} className={`chat-msg ${msg.sender}`}>
                {msg.sender === 'bot' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>
          <form className="chat-input" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              autoFocus
            />
            <button type="submit">Enviar</button>
          </form>
        </div>
      )}
    </div>
  );
}
