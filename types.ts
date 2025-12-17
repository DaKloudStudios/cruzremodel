export interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  category: 'Quality' | 'Service' | 'Results';
  date: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  professionalImage: string;
  candidImage: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface StatItem {
  id: number;
  label: string;
  value: number;
  suffix: string;
}
