import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import PromptTranslator from './PromptTranslator.tsx';
import './index.css';

type Tool = 'ads' | 'prompt';

function Root() {
  const [tool, setTool] = useState<Tool>('ads');

  return (
    <>
      {/* Tab switcher */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-[#1A1A1A] border border-white/10 shadow-2xl rounded-2xl p-1">
        <button
          onClick={() => setTool('ads')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tool === 'ads'
              ? 'bg-[#F27D26] text-white shadow-lg'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          Anuncios Inmobiliarios
        </button>
        <button
          onClick={() => setTool('prompt')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            tool === 'prompt'
              ? 'bg-[#F27D26] text-white shadow-lg'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          Traductor de Prompts
        </button>
      </div>

      {tool === 'ads' ? <App /> : <PromptTranslator />}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
