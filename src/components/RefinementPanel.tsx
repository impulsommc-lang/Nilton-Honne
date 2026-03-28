import React, { useState, useRef } from 'react';
import { Loader2, Sparkles, Brush, Eraser, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RefinementPanelProps {
  isVisible: boolean;
  isBrushing: boolean;
  brushSize: number;
  refinementText: string;
  isGenerating: boolean;
  qualityWarning: string | null;
  onBrushToggle: () => void;
  onClearCanvas: () => void;
  onBrushSizeChange: (size: number) => void;
  onTextChange: (text: string) => void;
  onApply: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  contextRef: React.MutableRefObject<CanvasRenderingContext2D | null>;
}

export const RefinementPanel: React.FC<RefinementPanelProps> = ({
  isVisible,
  isBrushing,
  brushSize,
  refinementText,
  isGenerating,
  qualityWarning,
  onBrushToggle,
  onClearCanvas,
  onBrushSizeChange,
  onTextChange,
  onApply,
  canvasRef,
  contextRef,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-2xl space-y-4 sm:space-y-6"
        >
          <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
            <h3 className="font-bold text-lg sm:text-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F27D26]/10 flex items-center justify-center">
                <Brush className="w-4 h-4 text-[#F27D26]" />
              </div>
              Refinamiento de Precisión
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={onBrushToggle}
                aria-pressed={isBrushing}
                className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${
                  isBrushing ? 'bg-[#F27D26] text-white shadow-lg shadow-[#F27D26]/20' : 'bg-gray-50 text-gray-400 hover:text-black'
                }`}
                aria-label="Activar pincel de edición"
              >
                <Brush className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {isBrushing && (
                <button 
                  onClick={onClearCanvas}
                  className="p-2 sm:p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg sm:rounded-xl transition-all"
                  aria-label="Limpiar canvas"
                >
                  <Eraser className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>

          {isBrushing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100"
            >
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Grosor del Pincel</span>
                <span>{brushSize}px</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="150" 
                value={brushSize} 
                onChange={(e) => {
                  const newSize = parseInt(e.target.value);
                  onBrushSizeChange(newSize);
                  if (contextRef.current) contextRef.current.lineWidth = newSize;
                }}
                className="w-full accent-[#F27D26] cursor-pointer"
                aria-label="Tamaño del pincel"
              />
              <p className="text-[9px] sm:text-xs text-gray-400 font-medium italic">
                Pinta sobre el elemento que deseas cambiar
              </p>
            </motion.div>
          )}

          <textarea 
            value={refinementText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={isBrushing ? "Describe qué quieres cambiar..." : "Ej: Cambia el cielo a atardecer..."}
            className="w-full p-4 sm:p-5 bg-gray-50 rounded-lg sm:rounded-2xl text-sm border border-transparent focus:bg-white focus:border-[#F27D26] outline-none min-h-[100px] sm:min-h-[120px] resize-none shadow-inner leading-relaxed focus-ring"
            aria-label="Instrucciones de refinamiento"
          />

          {qualityWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-amber-50 rounded-lg sm:rounded-xl border border-amber-200 flex gap-2"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-amber-800">{qualityWarning}</p>
            </motion.div>
          )}

          <button 
            onClick={onApply}
            disabled={!refinementText || isGenerating}
            className="w-full bg-black text-white py-3 sm:py-4 rounded-lg sm:rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 hover:bg-[#1A1A1A] transition-all disabled:opacity-50 shadow-xl shadow-black/10"
            aria-label="Aplicar cambios"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="hidden sm:inline">Procesando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#F27D26]" />
                <span className="hidden sm:inline">Aplicar Cambios</span>
                <span className="sm:hidden">Aplicar</span>
              </>
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
