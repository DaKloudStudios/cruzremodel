import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "How does the process start?",
      answer: "It starts with booking a free phone consultation (call or text (669) 251-7670). After that, we schedule an on-site appointment to define the scope of work, followed by finalizing permits, materials, and the start date."
    },
    {
      question: "What are your hours of operation?",
      answer: "We are open Monday through Friday, 9am to 5pm. We are also available on Saturdays (Open 24 hours) for inquiries or scheduled work, and closed on Sundays."
    },
    {
      question: "What areas do you serve?",
      answer: "We serve the Bay Area, specifically Santa Clara County, Alameda County, and San Mateo County."
    },
    {
      question: "Are you licensed and insured?",
      answer: "Yes, we are a licensed contractor (LIC#1111609), fully insured, and bonded."
    },
    {
      question: "Do you offer warranties?",
      answer: "Yes, warranties are provided for our work. The specific length and coverage depend on the project type."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-transparent relative">
       {/* Decorative Side Element */}
       <div className="absolute left-0 top-20 w-1 h-32 bg-gradient-to-b from-gold-400 to-transparent opacity-60"></div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-gold-700 font-bold tracking-widest uppercase text-sm mb-3 block">Common Questions</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-navy-900">Everything You Need to Know</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <RevealOnScroll key={index} delay={index * 100}>
              <div 
                className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                  openIndex === index 
                    ? 'border-gold-500/50 bg-white shadow-lg' 
                    : 'border-gray-200 bg-white/50 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className={`font-serif text-xl font-bold transition-colors ${
                    openIndex === index ? 'text-navy-900' : 'text-gray-700'
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded-full border transition-all duration-300 ${
                    openIndex === index 
                      ? 'bg-gold-400 border-gold-400 text-white rotate-180' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openIndex === index ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 pt-0 text-navy-800 leading-relaxed border-t border-transparent font-medium text-lg">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};