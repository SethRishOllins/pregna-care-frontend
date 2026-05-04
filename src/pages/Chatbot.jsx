import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

// --- FIXED: This picks Render in production and localhost in development ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I am your PregnaCare AI assistant. How can I help you today? You can ask me about your diet, symptoms, or interpret your latest report.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentInput = input;
    const userMsg = { id: Date.now(), type: 'user', text: currentInput };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // --- FIXED: Removed /api prefix to match backend route ---
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      });
      
      const data = await response.json();

      const botMsg = { id: Date.now() + 1, type: 'bot', text: data.reply };
      setMessages(prev => [...prev, botMsg]);
      
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: "Sorry, I lost connection to the server. Please ensure your Render backend is running." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Health Assistant</h1>
          <p className="text-slate-500 text-sm">Powered by Gemini AI Engine</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                  ${msg.type === 'user' ? 'bg-medical-500' : 'bg-indigo-600'}`}>
                  {msg.type === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>

                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                  ${msg.type === 'user' 
                    ? 'bg-white text-slate-800 border border-slate-100 rounded-tr-none' 
                    : 'bg-indigo-600 text-white rounded-tl-none'}`}>
                  {msg.text}
                </div>

              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                 <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-indigo-50 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your health question here..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            disabled={isTyping}
          />
          <button 
            onClick={handleSend}
            disabled={isTyping}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </div>

      </div>
    </div>
  );
};

export default Chatbot;
