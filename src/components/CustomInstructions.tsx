import React from 'react';
import { Sparkles, MessageSquare, X } from 'lucide-react';

interface CustomInstructionsProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  selectedStyle: 'collage' | 'luxury' | 'functionality' | 'lifestyle' | 'roi';
  onStyleChange: (style: 'collage' | 'luxury' | 'functionality' | 'lifestyle' | 'roi') => void;
  strategicSuggestions: Record<string, string>;
}

export const CustomInstructions: React.FC<CustomInstructionsProps> = ({
  value,
  onChange,
  onClear,
  selectedStyle,
  onStyleChange,
  strategicSuggestions
}) => {
  const styles: Array<'collage' | 'luxury' | 'functionality' | 'lifestyle' | 'roi'> = [
    'collage',
    'luxury',
    'functionality',
    'lifestyle',
    'roi'
  ];

  const styleLabels = {
    collage: 'Collage',
    luxury: 'Lujo',
    functionality: 'Datos',
    lifestyle: 'Estilo',
    roi: 'Inversión'
  };

  return (
    <section className="space-y-6">
      {/* Style Selector */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          Estilo de Anuncio
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => onStyleChange(style)}
              aria-pressed={selectedStyle === style}
              className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                selectedStyle === style
                  ? 'bg-[#F27D26] text-white shadow-lg'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {styleLabels[style]}
            </button>
          ))}
        </div>
        <div className="p-3 sm:p-4 bg-blue-50 rounded-xl sm:rounded-2xl border border-blue-100">
          <p className="text-xs sm:text-sm text-blue-800 italic leading-relaxed">
            {strategicSuggestions[selectedStyle]}
          </p>
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F27D26]/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#F27D26]" />
            </div>
            Instrucciones Creativas
          </h3>
          <button 
            onClick={onClear}
            className="text-[10px] sm:text-xs font-bold text-gray-300 hover:text-red-400 uppercase tracking-widest transition-colors p-1.5 sm:p-2"
            aria-label="Limpiar instrucciones"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <textarea 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 sm:p-6 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-[#F27D26] outline-none transition-all text-sm min-h-[150px] resize-none font-medium shadow-inner leading-relaxed focus-ring"
          placeholder="Ej: Resalta la avenida principal con una línea neón y añade un pin..."
          aria-label="Instrucciones creativas personalizadas"
        />
      </div>
    </section>
  );
};
