import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { validateImageFile } from './lib/imageValidator';
import {
  Upload,
  X,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ImagePlus,
  Wand2,
  ChevronDown,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff', 'image/bmp'];

type StylePreset = {
  id: string;
  label: string;
  hint: string;
};

type UploadedImage = {
  id: string;
  role: 'reference' | 'subject';
  file: File;
  preview: string;
  label: string;
};

const STYLE_PRESETS: StylePreset[] = [
  { id: 'cinematic', label: 'Cinematico', hint: 'Anamorphic lens, film grain, bokeh, depth of field, color grading' },
  { id: 'editorial', label: 'Editorial', hint: 'Fashion photography, high-key lighting, negative space, editorial composition' },
  { id: 'studio', label: 'Estudio', hint: 'Three-point lighting, seamless backdrop, product photography, rim light' },
  { id: 'golden', label: 'Hora Dorada', hint: 'Golden hour, warm tones, lens flare, soft shadows, natural light' },
  { id: 'moody', label: 'Atmosferico', hint: 'Low-key lighting, chiaroscuro, dramatic shadows, noir style, underexposed' },
  { id: 'hyperreal', label: 'Hiperrealista', hint: 'Photorealistic, 8K resolution, macro detail, crisp focus, RAW capture' },
];

const QUALITY_SUFFIXES = [
  'masterpiece', 'ultra-detailed', 'award-winning photography',
  '8K resolution', 'professional retouching', 'sharp focus',
  'perfect exposure', 'high dynamic range',
];

function resizeForApi(base64Str: string, maxPx = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = setTimeout(() => reject(new Error('Timeout cargando imagen')), 15000);
    img.onload = () => {
      clearTimeout(timeout);
      try {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
          else { width = Math.round(width * maxPx / height); height = maxPx; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas no disponible');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
      } catch (e) { reject(e); }
    };
    img.onerror = () => { clearTimeout(timeout); reject(new Error('No se pudo cargar la imagen')); };
    img.src = base64Str;
  });
}

export default function PromptTranslator() {
  const [idea, setIdea] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('cinematic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [promptEs, setPromptEs] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedEs, setCopiedEs] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeRole, setActiveRole] = useState<'reference' | 'subject'>('subject');
  const [showPresets, setShowPresets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const roleForUpload = useRef<'reference' | 'subject'>('subject');

  const addImages = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    arr.forEach(file => {
      if (file.size > MAX_SIZE_BYTES) {
        setError(`"${file.name}" supera los ${MAX_SIZE_MB}MB permitidos.`);
        return;
      }
      if (!VALID_TYPES.includes(file.type)) {
        setError(`Formato no soportado: ${file.name}. Usa JPG, PNG, WebP, GIF, AVIF, TIFF o BMP.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setImages(prev => [...prev, {
          id: `img-${Date.now()}-${Math.random()}`,
          role: roleForUpload.current,
          file,
          preview,
          label: file.name,
        }]);
        setError(null);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const triggerUpload = (role: 'reference' | 'subject') => {
    roleForUpload.current = role;
    fileInputRef.current?.click();
  };

  const removeImage = (id: string) => setImages(prev => prev.filter(i => i.id !== id));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addImages(e.dataTransfer.files);
  };

  const copyPrompt = async (text: string, isEs = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isEs) { setCopiedEs(true); setTimeout(() => setCopiedEs(false), 2000); }
      else { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* ignore */ }
  };

  const preset = STYLE_PRESETS.find(p => p.id === selectedPreset)!;

  const generatePrompt = async () => {
    if (!idea.trim() && images.length === 0) {
      setError('Describe tu idea o sube al menos una imagen para continuar.');
      return;
    }
    setError(null);
    setIsGenerating(true);
    setGeneratedPrompt(null);
    setPromptEs(null);

    try {
      const imageParts = await Promise.all(
        images.map(async (img) => {
          const data = await resizeForApi(img.preview);
          return {
            role: img.role,
            part: { inlineData: { data, mimeType: 'image/jpeg' } },
          };
        })
      );

      const subjectParts = imageParts.filter(i => i.role === 'subject').map(i => i.part);
      const refParts = imageParts.filter(i => i.role === 'reference').map(i => i.part);

      const systemInstruction = `Eres un experto en prompt engineering para IAs generativas de imágenes (Midjourney, DALL·E, Stable Diffusion, Firefly, Flux, Ideogram). 
Tu tarea es tomar la idea del usuario y enriquecerla con terminología técnica profesional de:
- Iluminación: Rembrandt lighting, rim light, volumetric light, chiaroscuro, three-point lighting, soft box, golden hour, blue hour, etc.
- Composición: rule of thirds, leading lines, negative space, symmetry, foreground/background depth, Dutch angle, etc.
- Lentes y cámara: anamorphic, 85mm f/1.4, macro, tilt-shift, fish-eye, bokeh, depth of field, motion blur, etc.
- Estilo artístico: hyperrealistic, painterly, editorial, cinematic, commercial, fine art, fashion photography, etc.
- Calidad y render: 8K, RAW, photorealistic, unreal engine, octane render, sharp focus, HDR, etc.

SIEMPRE genera DOS versiones del prompt:
1. EN INGLÉS (más efectivo para IAs): Un prompt fluido, detallado y técnico, en una sola línea, listo para copiar y pegar.
2. EN ESPAÑOL: La misma versión pero en español, para que el usuario entienda exactamente lo que se va a generar.

El estilo visual seleccionado es: "${preset.label}" — usa estos elementos técnicos como base: ${preset.hint}.

RESPONDE ÚNICAMENTE con este formato JSON exacto (sin markdown, sin explicaciones extra):
{"en": "el prompt completo en inglés", "es": "el prompt completo en español"}`;

      const textPart = idea.trim()
        ? `Mi idea: "${idea.trim()}"`
        : 'Analiza las imágenes y crea el mejor prompt posible para recrearlas o mejorarlas.';

      const contents: any[] = [
        { text: textPart },
        ...refParts.map((p, i) => ({ ...p, text: `Imagen de referencia de estilo ${i + 1}:` })),
        ...subjectParts.map((p, i) => ({ ...p, text: `Imagen de trabajo ${i + 1} (sujeto principal):` })),
      ];

      // Flatten: build parts array properly
      const parts: any[] = [{ text: textPart }];
      refParts.forEach((p, i) => { parts.push({ text: `Imagen de referencia de estilo ${i + 1}:` }); parts.push(p); });
      subjectParts.forEach((p, i) => { parts.push({ text: `Imagen de trabajo ${i + 1}:` }); parts.push(p); });

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        config: { systemInstruction },
        contents: [{ role: 'user', parts }],
      });

      const raw = response.text?.trim() ?? '';

      // Parse JSON response
      let parsed: { en: string; es: string };
      try {
        // Strip markdown code fences if present
        const clean = raw.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(clean);
      } catch {
        // Fallback: try to extract manually
        const enMatch = raw.match(/"en"\s*:\s*"([\s\S]+?)(?=",\s*"es"|"\s*})/);
        const esMatch = raw.match(/"es"\s*:\s*"([\s\S]+?)(?="?\s*})/);
        if (!enMatch || !esMatch) throw new Error('No se pudo parsear la respuesta del modelo.');
        parsed = { en: enMatch[1], es: esMatch[1] };
      }

      // Append quality suffixes
      const qualityTail = QUALITY_SUFFIXES.join(', ');
      setGeneratedPrompt(`${parsed.en}, ${qualityTail}`);
      setPromptEs(parsed.es);

    } catch (err: any) {
      const msg = err?.message ?? String(err);
      if (msg.includes('Timeout')) setError('Una imagen tardó demasiado. Prueba con una más pequeña.');
      else if (msg.includes('parsear')) setError('El modelo devolvió un formato inesperado. Intenta de nuevo.');
      else setError(`Error: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const subjectImages = images.filter(i => i.role === 'subject');
  const referenceImages = images.filter(i => i.role === 'reference');

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0D0D0D]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#F27D26] flex items-center justify-center">
              <Wand2 size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm tracking-wide">Traductor de Prompts</span>
            <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40 uppercase tracking-widest">
              Beta
            </span>
          </div>
          <button
            onClick={generatePrompt}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-[#F27D26] hover:bg-[#E06D1A] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span className="hidden sm:inline">{isGenerating ? 'Traduciendo...' : 'Generar Prompt'}</span>
            <span className="sm:hidden">{isGenerating ? '...' : 'Generar'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">

        {/* Hero label */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">
            Convierte tus ideas en{' '}
            <span className="text-[#F27D26]">prompts profesionales</span>
          </h1>
          <p className="text-sm text-white/40 text-pretty">
            Describe tu vision, sube imagenes de referencia o trabajo, elige un estilo y obtendras un prompt tecnico listo para cualquier IA generativa.
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto shrink-0 hover:text-red-300">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT COLUMN — inputs */}
          <div className="lg:col-span-3 space-y-5">

            {/* Idea textarea */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-white/40">
                Tu Idea
              </label>
              <textarea
                value={idea}
                onChange={e => setIdea(e.target.value)}
                placeholder="Ej: Una modelo en un campo de lavanda al atardecer, con look boho y sensacion de libertad..."
                rows={4}
                className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:border-[#F27D26]/50 focus:ring-1 focus:ring-[#F27D26]/20 transition-all"
              />
              <p className="text-[11px] text-white/25">
                Puedes ser vago o muy especifico — el AI enriquecera tu descripcion con terminologia tecnica.
              </p>
            </div>

            {/* Style Preset */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-white/40">
                Estilo Visual
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {STYLE_PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPreset(p.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      selectedPreset === p.id
                        ? 'bg-[#F27D26] border-[#F27D26] text-white'
                        : 'bg-[#1A1A1A] border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/80'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-white/25 font-mono leading-relaxed">
                <span className="text-[#F27D26]/70">Tecnica incluida: </span>
                {preset.hint}
              </p>
            </div>

            {/* Image upload zones */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-white/40">
                Imagenes (max {MAX_SIZE_MB}MB c/u)
              </label>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl transition-all ${
                  dragOver
                    ? 'border-[#F27D26] bg-[#F27D26]/5'
                    : 'border-white/[0.08] bg-[#1A1A1A]'
                }`}
              >
                <div className="p-6 flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <ImagePlus size={18} className="text-white/30" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50 font-medium">Arrastra imagenes aqui</p>
                    <p className="text-[11px] text-white/25 mt-0.5">JPG, PNG, WebP, GIF, AVIF, TIFF, BMP — hasta {MAX_SIZE_MB}MB</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerUpload('subject')}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] px-3 py-2 rounded-lg transition-colors"
                    >
                      <Upload size={12} />
                      Imagen de trabajo
                    </button>
                    <button
                      onClick={() => triggerUpload('reference')}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] px-3 py-2 rounded-lg transition-colors text-[#F27D26]/80"
                    >
                      <Upload size={12} />
                      Referencia de estilo
                    </button>
                  </div>
                </div>
              </div>

              {/* Image grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {images.map(img => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden bg-[#1A1A1A] aspect-square border border-white/[0.06]">
                      <img
                        src={img.preview}
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                      {/* Role badge */}
                      <div className={`absolute top-2 left-2 text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded ${
                        img.role === 'reference'
                          ? 'bg-[#F27D26] text-white'
                          : 'bg-black/60 text-white/70 border border-white/10'
                      }`}>
                        {img.role === 'reference' ? 'REF' : 'SUJETO'}
                      </div>
                      {/* Remove */}
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                      >
                        <X size={11} />
                      </button>
                      {/* Label */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-[10px] text-white/60 truncate">{img.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Counters */}
              {images.length > 0 && (
                <div className="flex gap-3 text-[11px] text-white/30">
                  <span>{subjectImages.length} imagen{subjectImages.length !== 1 ? 'es' : ''} de trabajo</span>
                  <span>·</span>
                  <span>{referenceImages.length} referencia{referenceImages.length !== 1 ? 's' : ''} de estilo</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — output */}
          <div className="lg:col-span-2 space-y-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-white/40">
                Prompt Generado
              </label>

              {/* English prompt */}
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#1A1A1A] border border-white/[0.08] rounded-xl p-5 min-h-[200px] flex flex-col items-center justify-center gap-3"
                  >
                    <Loader2 size={24} className="animate-spin text-[#F27D26]" />
                    <p className="text-sm text-white/30">Enriqueciendo con terminologia tecnica...</p>
                  </motion.div>
                ) : generatedPrompt ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* EN */}
                    <div className="relative bg-[#111] border border-white/[0.08] rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#F27D26]/70">
                          English — Para copiar en la IA
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => generatePrompt()}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                            title="Regenerar"
                          >
                            <RefreshCw size={12} />
                          </button>
                          <button
                            onClick={() => copyPrompt(generatedPrompt, false)}
                            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
                              copied
                                ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                : 'bg-white/[0.06] hover:bg-white/10 text-white/50 border border-white/[0.06]'
                            }`}
                          >
                            {copied ? <Check size={11} /> : <Copy size={11} />}
                            {copied ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                      <div className="p-4 max-h-48 overflow-y-auto scrollbar-hide">
                        <p className="text-xs font-mono text-white/80 leading-relaxed whitespace-pre-wrap">
                          {generatedPrompt}
                        </p>
                      </div>
                    </div>

                    {/* ES */}
                    {promptEs && (
                      <div className="relative bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-white/25">
                            Espanol — Lo que se va a generar
                          </span>
                          <button
                            onClick={() => copyPrompt(promptEs, true)}
                            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
                              copiedEs
                                ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                : 'bg-white/[0.04] hover:bg-white/[0.07] text-white/30 border border-white/[0.04]'
                            }`}
                          >
                            {copiedEs ? <Check size={11} /> : <Copy size={11} />}
                            {copiedEs ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                        <div className="p-4 max-h-36 overflow-y-auto scrollbar-hide">
                          <p className="text-xs text-white/40 leading-relaxed">
                            {promptEs}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quality tail hint */}
                    <div className="bg-[#1A1A1A] border border-white/[0.05] rounded-xl px-4 py-3">
                      <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-1.5">Sufijos de calidad incluidos</p>
                      <div className="flex flex-wrap gap-1.5">
                        {QUALITY_SUFFIXES.map(s => (
                          <span key={s} className="text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] text-white/30 px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-[#1A1A1A] border border-dashed border-white/[0.06] rounded-xl p-6 min-h-[180px] flex flex-col items-center justify-center gap-3 text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                      <Sparkles size={18} className="text-white/15" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/20">Tu prompt aparecera aqui</p>
                      <p className="text-[11px] text-white/15 mt-0.5">Describe tu idea y haz clic en Generar Prompt</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* How it works */}
              {!generatedPrompt && !isGenerating && (
                <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4 space-y-3">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-white/25">Como funciona</p>
                  {[
                    ['1', 'Describe tu idea en palabras naturales'],
                    ['2', 'Sube imagenes de referencia o trabajo (opcional)'],
                    ['3', 'Elige el estilo visual que quieres lograr'],
                    ['4', 'El AI traduce todo a terminologia tecnica profesional'],
                  ].map(([n, t]) => (
                    <div key={n} className="flex items-start gap-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#F27D26]/15 text-[#F27D26] text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {n}
                      </span>
                      <p className="text-xs text-white/30 leading-relaxed">{t}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={VALID_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={e => { if (e.target.files) addImages(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
