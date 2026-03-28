import React, { useRef } from 'react';
import { Upload, Camera, X } from 'lucide-react';

export interface PropertyImage {
  id: string;
  label: string;
  file: File | null;
  preview: string | null;
}

interface PropertyGalleryProps {
  images: PropertyImage[];
  onUpload: (id: string) => void;
  onRemove: (id: string) => void;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, onUpload, onRemove }) => {
  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="space-y-1 flex-1">
          <h3 className="text-xl sm:text-2xl font-serif italic">Galería de la Propiedad</h3>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            Sube hasta 5 fotografías reales
          </p>
          <p className="text-[10px] text-[#F27D26] font-bold uppercase tracking-tighter mt-1">
            ⚠️ El AI usará estas fotos
          </p>
        </div>
        <span className="text-xs font-mono text-[#F27D26] bg-[#F27D26]/10 px-3 py-1 rounded-full font-bold whitespace-nowrap">
          {images.filter(img => img.file).length} / {images.length}
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {images.map((img) => (
          <div 
            key={img.id}
            className="relative group aspect-square bg-white border border-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 card-hover"
            role="img"
            aria-label={img.label}
          >
            {img.preview ? (
              <>
                <img src={img.preview} alt={img.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => onRemove(img.id)}
                    aria-label={`Eliminar ${img.label}`}
                    className="p-2 sm:p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-red-500 transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => onUpload(img.id)}
                aria-label={`Subir ${img.label}`}
                className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-4 text-gray-300 hover:text-[#F27D26] transition-colors bg-gray-50/50 cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
                  <Camera className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-center px-2">
                  {img.label}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
