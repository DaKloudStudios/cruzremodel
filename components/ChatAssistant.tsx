import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- KNOWLEDGE BASE DATA ---
const COMPANY_DATA = `
IDENTITY:
Business Name: Cruz Remodel
Tagline: "Transforming Visions into Dream Spaces in the Bay Area"
Website: https://www.cruzremodel.com
Phone: (669) 251-7670 (Call or Text)

CREDENTIALS:
License: LIC#1111609
Status: Licensed contractor, insured, bonded.

HOURS OF OPERATION:
Monday: 9:00 AM – 5:00 PM
Tuesday: 9:00 AM – 5:00 PM
Wednesday: 9:00 AM – 5:00 PM
Thursday: 9:00 AM – 5:00 PM
Friday: 9:00 AM – 5:00 PM
Saturday: Open 24 hours
Sunday: Closed

SERVICES:
- Kitchen Remodel
- Bathroom Remodel
- Full Remodel / Renovation
- Exterior Remodel / Makeover
- Home Repair
- Designing & Material Selection
- Flooring (Installation and Repair)
- Painting
- Building Additions
- Garage Remodeling
- Bedroom Remodeling
- Common Area Remodeling
- Patio, Porch, Terrace Construction

SERVICE AREA:
Santa Clara County, Alameda County, San Mateo County.
Location: San Jose, CA 95111 (Seven Trees). Serving the Bay Area.

PROCESS ("How it works"):
1. Book a free phone consultation.
2. On-site appointment.
3. Scope of work definition.
4. Finalizing (includes permits if needed, shopping for materials, scheduling start date).

POLICIES:
- Estimates: Free phone consultation for accurate estimates.
- Timeline: Varies by project; estimated during consultation.
- Living in home: Sometimes possible depending on scope; team plans to minimize disruption.
- Warranties: Provided; length varies by project type.
- Design: Assistance with design and material selection is provided.

PAYMENTS:
Accepts Cash and Credit Cards.

REVIEWS:
Rating: 5.0 (Yelp).
Highlights: "Attention to detail", "Good problem solver".
`;

// --- SYSTEM INSTRUCTION ---
// We inject the COMPANY_DATA directly into the prompt here
const SYSTEM_INSTRUCTION = `
You are the professional AI assistant for Cruz Remodel.
Your goal is to answer customer questions based EXCLUSIVELY on the company data provided below.

--- COMPANY DATA START ---
${COMPANY_DATA}
--- COMPANY DATA END ---

INSTRUCTIONS:
1. Search the COMPANY DATA above for the answer.
2. If the answer is found (e.g., hours, license, services), answer politely and concisely in English.
3. If the user asks for specific prices, specific timelines without a project context, or services NOT listed above, you MUST respond with:
   "I don't have that specific information available. You can call or text (669) 251-7670 for the most accurate answer."

EXAMPLES:
User: "What are your hours?"
Assistant: "We are open Monday through Friday from 9am to 5pm. On Saturdays, we are open 24 hours. We are closed on Sundays."

User: "Do you do roofing?"
Assistant: "I don't have that specific information available in my list of primary services. You can call or text (669) 251-7670 for the most accurate answer."
`;

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting
  useEffect(() => {
    if (!initialized) {
      setMessages([{ role: 'model', text: "Hi! I am the Cruz Remodel assistant. How can I help you today?" }]);
      setInitialized(true);
    }
  }, [initialized]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText;
    const newMessages: Message[] = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Limit history to keep focus on current instruction
      const history = newMessages.slice(-6).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 1000,
          temperature: 0.1, 
        },
      });

      const aiText = textResponse.text || "I'm having trouble connecting right now.";

      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
      
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, I'm currently offline. Please call (669) 251-7670." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {isOpen ? (
           <div className="w-[300px] sm:w-[350px] bg-navy-900 border border-gold-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-2 animate-fadeIn backdrop-blur-md">
              
              <div className="bg-navy-800 p-4 border-b border-white/10 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-gold-400 font-serif font-bold text-sm">Cruz AI</span>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                      <X size={18} />
                   </button>
                 </div>
              </div>

              <div className="flex-1 h-[350px] overflow-y-auto p-4 space-y-3 bg-black/20">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-gold-500 text-black font-medium rounded-tr-none' 
                        : 'bg-navy-800 text-gray-100 border border-white/10 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-navy-800 p-3 rounded-xl rounded-tl-none border border-white/10 flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 bg-navy-800 border-t border-white/10 flex gap-2 items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask a question..."
                  className="flex-1 bg-navy-900/50 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                />
                
                <button 
                  onClick={() => handleSend()} 
                  disabled={!inputText.trim() && !isLoading}
                  className={`p-2 rounded-full transition-all duration-300 ${(!inputText.trim() && !isLoading) ? 'bg-navy-700 text-gray-500 cursor-not-allowed opacity-50' : 'bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-lg'}`}
                >
                   {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
           </div>
        ) : null}

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center justify-center w-14 h-14 bg-gradient-to-br from-navy-800 to-navy-900 text-gold-400 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] border border-gold-500/30 hover:scale-110 transition-all duration-300 relative"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={28} className="fill-gold-400/20" />}
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-navy-900 rounded-full"></span>
        </button>
      </div>
    </>
  );
};