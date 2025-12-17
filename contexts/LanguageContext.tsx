import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Hero
    "hero.badge": "Now Scheduling San Jose Projects",
    "hero.prefix": "Cruz Remodel is",
    "hero.rotate.1": "redefining quality.",
    "hero.rotate.2": "transforming homes.",
    "hero.rotate.3": "building your dream.",
    "hero.subtitle": "San Jose's trusted choice for luxury kitchens, bathrooms, and complete home renovations.",
    "hero.button": "Why should you trust us?",
    "hero.scroll": "Scroll to learn more",
    
    // Stats
    "stats.years": "Years Experience",
    "stats.projects": "Projects Delivered",
    "stats.serving": "Serving San Jose",
    "stats.rating": "Yelp Rating",

    // BeforeAfter
    "ba.label": "Real Results",
    "ba.title": "See The Transformation",
    "ba.subtitle": "Drag the slider to reveal how we turn outdated spaces into award-winning designs.",
    "ba.img1.title": "Modern Luxury Bathroom",
    "ba.img1.desc": "Witness the dramatic difference detailed craftsmanship makes.",
    "ba.img2.title": "Living Room Revitalization",
    "ba.img2.desc": "Creating open, inviting spaces for family and entertainment.",
    "ba.before": "Before",
    "ba.after": "After",

    // Reviews
    "reviews.badge": "Verified Business",
    "reviews.title": "San Jose Favorites",
    "reviews.rating_text": "5.0 Average Rating",
    "reviews.btn_yelp": "Check our Yelp",
    "reviews.filter.all": "All",
    "reviews.filter.quality": "Quality",
    "reviews.filter.service": "Service",
    "reviews.filter.results": "Results",

    // Process
    "process.label": "Our Method",
    "process.title": "How We Work",
    "process.subtitle": "A transparent, three-step journey from concept to reality.",
    "process.step1.title": "The Walkthrough",
    "process.step1.desc": "We listen to your vision, measure the space, and understand your lifestyle needs to create a perfect plan.",
    "process.step2.title": "Strategic Design",
    "process.step2.desc": "Our team drafts a comprehensive roadmap, balancing aesthetics with functionality and budget.",
    "process.step3.title": "Flawless Execution",
    "process.step3.desc": "We bring the vision to life with precision, keeping you informed at every milestone until handover.",

    // Timeline
    "timeline.label": "History",
    "timeline.title": "Our Journey",
    "timeline.ev1.title": "The Beginning",
    "timeline.ev1.desc": "Founded in a small garage with a vision to change the industry standard for client service.",
    "timeline.ev2.title": "Rapid Expansion",
    "timeline.ev2.desc": "Moved to our first headquarters and grew the team to 15 passionate experts.",
    "timeline.ev3.title": "National Recognition",
    "timeline.ev3.desc": "Awarded 'Best New Agency' and expanded our services to include comprehensive consulting.",
    "timeline.ev4.title": "Innovation Lead",
    "timeline.ev4.desc": "Launched our proprietary tech platform that now powers results for 500+ clients.",

    // Team (CEO Profile)
    "team.title": "Meet The Founder",
    "team.subtitle": "Leadership driven by a passion for excellence and a commitment to your vision.",
    "team.role1": "Founder & CEO",
    "team.quote": "We don't just remodel homes; we reimagine lifestyles. Every project is a personal promise of quality.",
    "team.bio": "With over a decade of experience in high-end construction, Christian established Cruz Remodel to bring a higher standard of transparency and craftsmanship to San Jose homeowners.",

    // FAQ
    "faq.label": "Common Questions",
    "faq.title": "Everything You Need to Know",
    "faq.more": "Have more questions?",
    "faq.contact": "Contact our design team directly",
    "faq.q1": "How long does a typical kitchen remodel take?",
    "faq.a1": "For a high-end kitchen remodel in San Jose, timelines typically range from 6 to 10 weeks once construction begins. However, our planning phase ensures all materials are on-site before we demo, minimizing downtime for your family.",
    "faq.q2": "Do you handle permits and city inspections?",
    "faq.a2": "Absolutely. We are a full-service design-build firm. We handle all architectural drawings, submit them to the City of San Jose (or surrounding municipalities), and manage all inspections throughout the build.",
    "faq.q3": "What is your pricing structure?",
    "faq.a3": "We operate on a fixed-price contract basis. After our detailed design phase, we provide a comprehensive quote. This means no surprise bills or hidden fees unless you explicitly choose to change the scope during the project.",
    "faq.q4": "Do I need to move out during the renovation?",
    "faq.a4": "Not necessarily. For kitchen and bath remodels, most clients stay in their homes. We set up dust barriers, air scrubbers, and temporary kitchenettes to make the process as comfortable as possible.",

    // Footer
    "footer.tagline": "Transforming homes and lifestyles in San Jose.",
    "footer.thanks": "We appreciate your trust.",
    "footer.rights": "All rights reserved.",

    // CTA & Chat
    "cta.ready": "Ready to start?",
    "cta.visit": "Visit Website",
    "chat.placeholder": "Ask a question...",
    "chat.agent": "Cruz AI",
    "chat.intro": "Hi! I am the Cruz Remodel assistant. How can I help you today?"
  },
  es: {
    // Hero
    "hero.badge": "Agendando Proyectos en San Jose",
    "hero.prefix": "Cruz Remodel está",
    "hero.rotate.1": "redefiniendo la calidad.",
    "hero.rotate.2": "transformando hogares.",
    "hero.rotate.3": "construyendo su sueño.",
    "hero.subtitle": "La elección de confianza en San Jose para cocinas de lujo, baños y remodelaciones completas.",
    "hero.button": "¿Por qué confiar en nosotros?",
    "hero.scroll": "Desliza para ver más",
    
    // Stats
    "stats.years": "Años de Experiencia",
    "stats.projects": "Proyectos Entregados",
    "stats.serving": "Sirviendo a San Jose",
    "stats.rating": "Calificación Yelp",

    // BeforeAfter
    "ba.label": "Resultados Reales",
    "ba.title": "Vea la Transformación",
    "ba.subtitle": "Deslice para revelar cómo convertimos espacios anticuados en diseños premiados.",
    "ba.img1.title": "Baño de Lujo Moderno",
    "ba.img1.desc": "Sea testigo de la diferencia dramática que hace la artesanía detallada.",
    "ba.img2.title": "Revitalización de Sala",
    "ba.img2.desc": "Creando espacios abiertos y acogedores para la familia y el entretenimiento.",
    "ba.before": "Antes",
    "ba.after": "Después",

    // Reviews
    "reviews.badge": "Negocio Verificado",
    "reviews.title": "Favoritos de San Jose",
    "reviews.rating_text": "5.0 Calificación Promedio",
    "reviews.btn_yelp": "Ver nuestro Yelp",
    "reviews.filter.all": "Todos",
    "reviews.filter.quality": "Calidad",
    "reviews.filter.service": "Servicio",
    "reviews.filter.results": "Resultados",

    // Process
    "process.label": "Nuestro Método",
    "process.title": "Cómo Trabajamos",
    "process.subtitle": "Un viaje transparente de tres pasos, desde el concepto hasta la realidad.",
    "process.step1.title": "El Recorrido",
    "process.step1.desc": "Escuchamos su visión, medimos el espacio y entendemos su estilo de vida para crear un plan perfecto.",
    "process.step2.title": "Diseño Estratégico",
    "process.step2.desc": "Nuestro equipo elabora una hoja de ruta integral, equilibrando estética con funcionalidad y presupuesto.",
    "process.step3.title": "Ejecución Impecable",
    "process.step3.desc": "Damos vida a la visión con precisión, manteniéndolo informado en cada hito hasta la entrega.",

    // Timeline
    "timeline.label": "Historia",
    "timeline.title": "Nuestra Trayectoria",
    "timeline.ev1.title": "El Comienzo",
    "timeline.ev1.desc": "Fundado en un pequeño garaje con la visión de cambiar el estándar de servicio al cliente en la industria.",
    "timeline.ev2.title": "Expansión Rápida",
    "timeline.ev2.desc": "Nos mudamos a nuestra primera sede y el equipo creció a 15 expertos apasionados.",
    "timeline.ev3.title": "Reconocimiento Nacional",
    "timeline.ev3.desc": "Galardonados como 'Mejor Nueva Agencia' y expandimos servicios para incluir consultoría integral.",
    "timeline.ev4.title": "Liderazgo en Innovación",
    "timeline.ev4.desc": "Lanzamos nuestra plataforma tecnológica patentada que ahora impulsa resultados para más de 500 clientes.",

    // Team (CEO Profile)
    "team.title": "Conozca al Fundador",
    "team.subtitle": "Liderazgo impulsado por la pasión por la excelencia y el compromiso con su visión.",
    "team.role1": "Fundador y CEO",
    "team.quote": "No solo remodelamos casas; reimaginamos estilos de vida. Cada proyecto es una promesa personal de calidad.",
    "team.bio": "Con más de una década de experiencia en construcción de alta gama, Christian estableció Cruz Remodel para traer un estándar más alto de transparencia y artesanía a los propietarios de San Jose.",

    // FAQ
    "faq.label": "Preguntas Frecuentes",
    "faq.title": "Todo lo que Necesita Saber",
    "faq.more": "¿Tiene más preguntas?",
    "faq.contact": "Contacte a nuestro equipo de diseño",
    "faq.q1": "¿Cuánto tarda una remodelación de cocina típica?",
    "faq.a1": "Para una cocina de lujo en San Jose, los tiempos suelen ser de 6 a 10 semanas una vez inicia la construcción. Sin embargo, nuestra fase de planificación asegura que todos los materiales estén en sitio antes de demoler, minimizando molestias.",
    "faq.q2": "¿Manejan permisos e inspecciones municipales?",
    "faq.a2": "Absolutamente. Somos una firma integral de diseño y construcción. Manejamos todos los planos, los presentamos a la Ciudad de San Jose (o municipios aledaños) y gestionamos todas las inspecciones.",
    "faq.q3": "¿Cuál es su estructura de precios?",
    "faq.a3": "Operamos con contrato de precio fijo. Tras el diseño detallado, damos un presupuesto integral. Esto significa sin facturas sorpresa ni cargos ocultos a menos que usted decida cambiar el alcance explícitamente.",
    "faq.q4": "¿Necesito mudarme durante la renovación?",
    "faq.a4": "No necesariamente. Para cocinas y baños, la mayoría de clientes se quedan en casa. Instalamos barreras contra polvo, purificadores de aire y cocinas temporales para hacer el proceso lo más cómodo posible.",

    // Footer
    "footer.tagline": "Transformando hogares y estilos de vida en San Jose.",
    "footer.thanks": "Apreciamos su confianza.",
    "footer.rights": "Todos los derechos reservados.",

    // CTA & Chat
    "cta.ready": "¿Listo para empezar?",
    "cta.visit": "Visitar Sitio Web",
    "chat.placeholder": "Haz una pregunta...",
    "chat.agent": "Cruz IA",
    "chat.intro": "¡Hola! Soy el asistente de Cruz Remodel. ¿Cómo puedo ayudarte hoy?"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Auto-detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'es') {
      setLanguage('es');
    }
  }, []);

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};