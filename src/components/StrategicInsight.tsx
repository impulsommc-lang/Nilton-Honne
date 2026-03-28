import React from 'react';
import { Sparkles } from 'lucide-react';

interface StrategicInsightProps {
  selectedStyle: string;
  suggestion: string;
}

export const StrategicInsight: React.FC<StrategicInsightProps> = ({ selectedStyle, suggestion }) => {
  return (
    <div className="bg-[#1A1A1A] p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F27D26]/10 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="relative z-10 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-[#F27D26] flex items-center justify-center shadow-lg shadow-[#F27D26]/20">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-[#F27D26]">
            Insight Estratégico
          </p>
        </div>
        <p className="font-serif italic text-base sm:text-lg leading-relaxed text-gray-200">
          "{suggestion}"
        </p>
        <div className="pt-3 sm:pt-4 border-t border-white/10">
          <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            Recomendación para Meta Ads
          </p>
        </div>
      </div>
    </div>
  );
};
