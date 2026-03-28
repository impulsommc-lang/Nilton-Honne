/**
 * Shared type definitions for Honne Inmobiliaria Ad Creator
 */

export type AdStyle = 'collage' | 'luxury' | 'functionality' | 'lifestyle' | 'roi';
export type BuyerProfile = 'family' | 'investor';

export interface PropertyImage {
  id: string;
  label: string;
  file: File | null;
  preview: string | null;
}

export interface PropertyDetails {
  location: string;
  price: string;
  beds: string;
  baths: string;
  parking: string;
  phone: string;
  usp: string;
  urgency: string;
  nearbyStreets: string;
  cta: string;
  buyerProfile: BuyerProfile;
}

export interface GenerationHistory {
  prompt: string;
  image: string;
  timestamp?: number;
}

export interface LogoState {
  file: File | null;
  preview: string | null;
}

export const DEFAULT_PROPERTY_DETAILS: PropertyDetails = {
  location: 'Valle Hermoso 334',
  price: '180,000',
  beds: '3',
  baths: '1',
  parking: '1',
  phone: '999 882 223',
  usp: '',
  urgency: '',
  nearbyStreets: '',
  cta: '¡Contáctanos hoy!',
  buyerProfile: 'family'
};

export const INITIAL_IMAGES: PropertyImage[] = [
  { id: 'exterior', label: 'Fachada Exterior', file: null, preview: null },
  { id: 'sala', label: 'Sala', file: null, preview: null },
  { id: 'cocina', label: 'Cocina', file: null, preview: null },
  { id: 'comedor', label: 'Comedor', file: null, preview: null },
  { id: 'dormitorio', label: 'Dormitorio', file: null, preview: null },
];

export const STRATEGIC_SUGGESTIONS: Record<AdStyle, string> = {
  collage: "Especialista en Collages: Ideal para mostrar múltiples ambientes en un solo impacto visual de alta conversión.",
  luxury: "Impacto Visual Único: Perfecto para destacar una sola foto de gran calidad con un diseño minimalista y premium.",
  functionality: "Infografía Inmobiliaria: Organiza datos técnicos (m2, dormitorios, baños) de forma clara y profesional.",
  lifestyle: "Conexión Emocional: Vende la experiencia y el bienestar de habitar el espacio con un look editorial.",
  roi: "Oportunidad de Inversión: Diseño directo y agresivo para captar inversores con indicadores de rentabilidad."
};
