export interface Profile {
  name: string;
  title: string;
  alias: string[];
  bio: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  neural_link: 'ACTIVE' | 'INACTIVE';
  ai_arsenal: 'LOADED' | 'UNLOADED';
  social: {
    github: string;
    twitter: string;
    linkedin: string;
  };
  ai_systems: AISystem[];
  tech_stack: TechStack;
  stats: Stats;
  theme: 'cyberpunk' | 'minimal' | 'corporate';
  edition: string;
  manifesto: string;
}

export interface AISystem {
  name: string;
  purpose: string;
  status: 'ONLINE' | 'OFFLINE' | 'TRAINING';
}

export interface TechStack {
  languages: string[];
  frameworks: string[];
  cloud: string[];
  ai_ml: string[];
}

export interface Stats {
  projects: string;
  downloads: string;
  uptime: string;
  ai_models: string;
}
