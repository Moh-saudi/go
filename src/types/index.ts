// src/types/index.ts

export interface Player {
    id: string;
    name: string;
    phone: string;
    email?: string;
    dateOfBirth: string;
    position: string;
    height?: number;
    weight?: number;
    nationality: string;
    currentClub?: string;
    previousClubs?: string[];
    achievements?: string[];
    videoUrls?: string[];
    photoUrls?: string[];
    documents?: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Club {
    id: string;
    name: string;
    country: string;
    city: string;
    league: string;
    contactPerson: string;
    email: string;
    phone: string;
    requirements?: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Agent {
    id: string;
    name: string;
    email: string;
    phone: string;
    licenseNumber?: string;
    experience: number;
    representedPlayers?: string[];
    successfulDeals?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UserProfile {
    uid: string;
    type: 'player' | 'club' | 'agent';
    email: string;
    phone: string;
    verified: boolean;
    profileCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }