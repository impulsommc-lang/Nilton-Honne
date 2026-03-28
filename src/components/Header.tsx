import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface HeaderProps {
  isGenerating: boolean;
  onGenerate: () => void;
  imagesCount: number;
}

export const Header: React.FC<HeaderProps> = ({ isGenerating, onGenerate, imagesCount }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F27D26] rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
            H
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Honne Inmobiliaria</h1>
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-semibold hidden sm:block">
              Ad Creator Pro
            </p>
          </div>
        </div>
        <button 
          onClick={onGenerate}
          disabled={isGenerating || imagesCount === 0}
          aria-label={isGenerating ? "Generando anuncio" : "Generar anuncio"}
          className="bg-[#1A1A1A] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium flex items-center gap-2 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10 text-sm sm:text-base"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Generando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generar</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
