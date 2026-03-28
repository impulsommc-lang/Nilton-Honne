import React from 'react';
import { ImageIcon, Upload } from 'lucide-react';

interface LogoUploadProps {
  preview: string | null;
  onUpload: () => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ preview, onUpload }) => {
  return (
    <section className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F27D26]/10 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-[#F27D26]" />
          </div>
          Identidad de Marca
        </h3>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <button
          onClick={onUpload}
          aria-label="Subir logo"
          className="w-24 h-24 sm:w-40 sm:h-40 border-2 border-dashed border-gray-100 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-2 sm:gap-3 cursor-pointer hover:border-[#F27D26] hover:bg-[#F27D26]/5 transition-all overflow-hidden bg-gray-50 group shrink-0"
        >
          {preview ? (
            <img src={preview} alt="Logo" className="w-full h-full object-contain p-2 sm:p-4" />
          ) : (
            <>
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300 group-hover:text-[#F27D26] transition-colors" />
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Subir
              </span>
            </>
          )}
        </button>
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Colores Corporativos
          </p>
          <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-white border border-gray-200 shadow-sm" title="Blanco" />
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-black shadow-sm" title="Negro" />
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-[#FFD700] shadow-sm border border-black/5" title="Amarillo" />
          </div>
          <p className="text-xs text-gray-400 leading-relaxed italic font-serif">
            "Elegancia, pureza e impacto visual."
          </p>
        </div>
      </div>
    </section>
  );
};
