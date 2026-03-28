import React from 'react';
import { MapPin, Bed, Bath, Car, Phone, Zap } from 'lucide-react';

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
  buyerProfile: 'family' | 'investor';
}

interface DetailsFormProps {
  details: PropertyDetails;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBuyerProfileChange: (profile: 'family' | 'investor') => void;
}

export const DetailsForm: React.FC<DetailsFormProps> = ({ details, onChange, onBuyerProfileChange }) => {
  const fields = [
    { name: 'location', label: 'Ubicación', icon: MapPin, placeholder: 'Ej: Valle Hermoso 334' },
    { name: 'price', label: 'Precio ($)', icon: null, placeholder: 'Ej: 180,000', special: true },
    { name: 'cta', label: 'CTA', icon: null, placeholder: 'Ej: ¡Contáctanos hoy!' },
    { name: 'phone', label: 'Teléfono', icon: Phone, placeholder: 'Ej: 999 882 223' },
  ];

  const propertyFields = [
    { name: 'beds', label: 'Dorm.', icon: Bed },
    { name: 'baths', label: 'Baños', icon: Bath },
    { name: 'parking', label: 'Cochera', icon: Car },
  ];

  const secondaryFields = [
    { name: 'usp', label: 'Propuesta Única (USP)', icon: Zap, placeholder: 'Ej: Acabados de Mármol' },
    { name: 'urgency', label: 'Factor Urgencia', icon: null, placeholder: 'Ej: Solo por esta semana' },
    { name: 'nearbyStreets', label: 'Avenidas Cercanas', icon: null, placeholder: 'Ej: Av. Principal, Av. Secundaria' },
  ];

  return (
    <section className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F27D26]/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-[#F27D26]" />
          </div>
          Detalles Estratégicos
        </h3>
      </div>

      {/* Primary Fields */}
      <div className="space-y-4 sm:space-y-6">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
              {field.icon && <field.icon className="w-4 h-4" />}
              {field.label}
            </label>
            <input 
              type="text"
              name={field.name}
              value={(details as any)[field.name]}
              onChange={onChange}
              className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl font-medium border border-transparent focus-ring outline-none transition-all shadow-inner ${
                field.special ? 'bg-[#FFF9E6] text-[#B8860B] focus:border-[#F27D26]' : 'bg-gray-50 focus:bg-white focus:border-[#F27D26]'
              }`}
              placeholder={field.placeholder}
              aria-label={field.label}
            />
          </div>
        ))}
      </div>

      {/* Property Features Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {propertyFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
              <field.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              {field.label}
            </label>
            <input 
              type="text"
              name={field.name}
              value={(details as any)[field.name]}
              onChange={onChange}
              className="w-full p-2 sm:p-4 bg-gray-50 rounded-lg sm:rounded-2xl text-center font-bold border border-transparent focus:bg-white focus:border-[#F27D26] outline-none transition-all shadow-inner focus-ring text-sm sm:text-base"
              aria-label={field.label}
            />
          </div>
        ))}
      </div>

      {/* Secondary Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 pt-6 border-t border-gray-100">
        {secondaryFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
              {field.icon && <field.icon className="w-4 h-4" />}
              {field.label}
            </label>
            <input 
              type="text"
              name={field.name}
              value={(details as any)[field.name]}
              onChange={onChange}
              className="w-full p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl font-medium border border-transparent focus:bg-white focus:border-[#F27D26] outline-none transition-all shadow-inner focus-ring"
              placeholder={field.placeholder}
              aria-label={field.label}
            />
          </div>
        ))}
      </div>

      {/* Buyer Profile Selection */}
      <div className="pt-6 border-t border-gray-100 space-y-3">
        <label className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-400 block">
          Perfil de Comprador
        </label>
        <div className="flex gap-3 sm:gap-4">
          {['family', 'investor'].map((profile) => (
            <button
              key={profile}
              onClick={() => onBuyerProfileChange(profile as 'family' | 'investor')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-2xl font-bold text-xs sm:text-sm transition-all capitalize ${
                details.buyerProfile === profile
                  ? 'bg-[#F27D26] text-white shadow-lg shadow-[#F27D26]/20'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              aria-pressed={details.buyerProfile === profile}
            >
              {profile === 'family' ? 'Familia' : 'Inversor'}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
