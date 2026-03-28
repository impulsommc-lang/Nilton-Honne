import React from 'react';
import { AlertCircle, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Download, Brush } from 'lucide-react';

interface PreviewPanelProps {
  isGenerating: boolean;
  generatedAd: string | null;
  error: string | null;
  isEditing: boolean;
  onEditToggle: () => void;
  onDownload: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  isBrushing?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  isGenerating,
  generatedAd,
  error,
  isEditing,
  onEditToggle,
  onDownload,
  canvasRef,
  isBrushing,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 relative group">
        <div className="aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-50 relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 sm:gap-6 text-center p-8 sm:p-12"
              >
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-[#F27D26]/10 border-t-[#F27D26] rounded-full animate-spin" />
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#F27D26] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="font-serif italic text-lg sm:text-2xl tracking-tight">Creando tu anuncio...</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Calidad HD 1080px</p>
                </div>
              </motion.div>
            ) : generatedAd ? (
              <div className="relative w-full h-full">
                <motion.img 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={generatedAd} 
                  alt="Anuncio Generado" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-all">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={onMouseUp}
                      onMouseLeave={onMouseLeave}
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                      className={`w-full h-full cursor-crosshair ${isBrushing ? 'opacity-40' : 'pointer-events-none opacity-0'}`}
                      style={{ mixBlendMode: 'screen' }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 sm:gap-6 text-center p-8 sm:p-12 text-gray-300">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white shadow-inner flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 opacity-20" />
                </div>
                <div className="space-y-2">
                  <p className="font-serif italic text-lg sm:text-xl">Tu diseño aparecerá aquí</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold">Completa y genera</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-3 sm:p-4 bg-red-500 text-white text-xs rounded-xl sm:rounded-2xl shadow-xl font-bold flex items-center gap-2 sm:gap-3"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="leading-tight">{error}</span>
            </motion.div>
          )}
        </div>

        {/* Floating Actions */}
        {generatedAd && !isGenerating && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-white p-1.5 sm:p-2 rounded-full shadow-2xl border border-gray-100 flex-wrap justify-center"
          >
            <button 
              onClick={onEditToggle}
              aria-label={isEditing ? "Cerrar edición" : "Refinar anuncio"}
              className={`flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                isEditing ? 'bg-[#F27D26] text-white' : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <Brush className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{isEditing ? 'Cerrar' : 'Refinar'}</span>
            </button>
            <div className="w-px h-5 sm:h-6 bg-gray-100" />
            <button 
              onClick={onDownload}
              aria-label="Descargar anuncio"
              className="flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#F27D26] hover:bg-[#F27D26]/5 transition-all"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Descargar</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
