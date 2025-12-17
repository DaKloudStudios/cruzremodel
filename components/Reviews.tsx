import React, { useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { Review } from '../types';

// Data adapted for Cruz Remodel context based on typical high-end feedback
const reviewsData: Review[] = [
  { id: 1, name: "Sarah J.", rating: 5, text: "Cruz Remodel transformed our outdated kitchen into a modern masterpiece. The attention to detail in the cabinetry installation was impressive.", category: "Quality", date: "2 days ago" },
  { id: 2, name: "Michael R.", rating: 5, text: "The team was incredible. I had a question about the bathroom tile layout, and they walked me through options immediately. Best contractor experience in the Bay Area.", category: "Service", date: "1 week ago" },
  { id: 3, name: "Elena R.", rating: 5, text: "Worth every penny. The value added to our home with the new addition has been substantial. A true partner in home improvement.", category: "Results", date: "2 weeks ago" },
  { id: 4, name: "David C.", rating: 5, text: "Great execution on our full home remodel. The timeline was respected and the communication was transparent throughout the project.", category: "Service", date: "3 weeks ago" },
  { id: 5, name: "Marcus T.", rating: 5, text: "A rare find in the Bay Area construction industry. Honest, transparent, and skilled. Cruz Remodel actually did what they said they would do.", category: "Quality", date: "1 month ago" },
  { id: 6, name: "Jessica A.", rating: 5, text: "Step 2 of their design process really shines. They handled all the permits and planning so we didn't have to worry.", category: "Service", date: "1 month ago" },
];

export const Reviews: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Quality' | 'Service' | 'Results'>('All');

  const filteredReviews = filter === 'All' 
    ? reviewsData 
    : reviewsData.filter(r => r.category === filter);

  const filters = [
    { key: 'All', label: 'All' },
    { key: 'Quality', label: 'Quality' },
    { key: 'Service', label: 'Service' },
    { key: 'Results', label: 'Results' },
  ];

  return (
    <section className="py-16 bg-transparent relative">
      
      {/* Top Gradient Fade (White) */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 pb-8 border-b border-gray-200 relative">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="bg-white border border-gray-200 p-2 rounded-lg shadow-sm">
                 {/* Yelp Logo adjusted for light mode */}
                 <img src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Yelp_Logo.svg" alt="Yelp" className="h-6 md:h-8 w-auto" />
               </div>
               <span className="px-3 py-1 md:px-4 md:py-1.5 bg-green-100 border border-green-200 text-green-800 text-xs md:text-sm font-bold rounded-full">Verified Business</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-navy-900 mb-2">Bay Area Favorites</h2>
            <div className="flex items-center gap-3">
              <div className="flex"> 
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 md:w-6 md:h-6 fill-brand-red text-brand-red" />
                ))}
              </div>
              <span className="text-gray-700 font-bold text-base md:text-lg">5.0 Average Rating</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-start sm:items-center">
             <div className="flex flex-wrap gap-1 bg-gray-100 border border-gray-200 p-1 rounded-xl overflow-hidden w-full sm:w-auto justify-center">
              {filters.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key as any)}
                  className={`px-4 py-2 md:px-5 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all duration-300 flex-1 sm:flex-none ${
                    filter === item.key 
                      ? 'bg-white text-navy-900 shadow-sm border border-gray-200' 
                      : 'text-gray-500 hover:text-navy-900 hover:bg-white/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <a 
              href="https://www.yelp.com/biz/cruz-remodel-san-jose" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-brand-red hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-base transition-all shadow-lg shadow-brand-red/20 hover:shadow-brand-red/40 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              Check our Yelp
            </a>
          </div>
        </div>

        {/* Masonry Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {filteredReviews.map((review) => (
            <div key={review.id} className="break-inside-avoid bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:border-gold-400/30 hover:-translate-y-1 relative group backdrop-blur-sm">
              
              {/* Animated Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 md:w-10 md:h-10 text-gray-200 fill-gray-200 group-hover:text-gold-200 group-hover:fill-gold-200 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12" />

              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-brand-red text-brand-red' : 'fill-gray-300 text-gray-300'}`} />
                ))}
              </div>
              
              <p className="text-gray-800 leading-relaxed mb-6 font-medium text-lg md:text-xl">"{review.text}"</p>
              
              <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-navy-900 flex items-center justify-center text-white font-bold text-sm md:text-base shadow-sm">
                   {review.name.charAt(0)}
                 </div>
                 <div>
                   <h4 className="font-bold text-navy-900 text-base leading-tight">{review.name}</h4>
                   <span className="text-sm text-gray-500 font-medium">{review.date}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
    </section>
  );
};