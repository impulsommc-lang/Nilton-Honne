import React from 'react';
import { ImageIcon, Sparkles, X } from 'lucide-react';

interface PropertyImage {
  id: string;
  label: string;
  preview: string | null;
}

interface ReferenceImagesProps {
  images: PropertyImage[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export const ReferenceImages: React.FC<ReferenceImagesProps> = ({ images, onAdd, onRemove }) => {
  return (
    <section className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            Inspiración & Referencias
          </h3>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            Sube una referencia (Canva, etc.)
          </p>
        </div>
        <button 
          onClick={onAdd}
          aria-label="Añadir referencia"
          className="text-xs font-bold text-purple-600 bg-purple-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-purple-100 transition-all whitespace-nowrap"
        >
          + Añadir
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {images.map((img) => (
          <div 
            key={img.id} 
            className="relative group aspect-square bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 card-hover"
            role="img"
            aria-label={img.label}
          >
            {img.preview && (
              <>
                <img 
                  src={img.preview} 
                  alt={img.label} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
                <button 
                  onClick={() => onRemove(img.id)}
                  aria-label={`Eliminar ${img.label}`}
                  className="absolute top-1 sm:top-2 right-1 sm:right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </>
            )}
          </div>
        ))}
        
        {images.length === 0 && (
          <div className="col-span-full py-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300">
            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sin referencias</span>
          </div>
        )}
      </div>
    </section>
  );
};
