import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Phone, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Download,
  Loader2,
  Image as ImageIcon,
  X,
  Brush,
  MessageSquare,
  RotateCcw,
  Check,
  AlertCircle,
  Eraser
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface PropertyImage {
  id: string;
  label: string;
  file: File | null;
  preview: string | null;
}

const INITIAL_IMAGES: PropertyImage[] = [
  { id: 'exterior', label: 'Fachada Exterior', file: null, preview: null },
  { id: 'sala', label: 'Sala', file: null, preview: null },
  { id: 'cocina', label: 'Cocina', file: null, preview: null },
  { id: 'comedor', label: 'Comedor', file: null, preview: null },
  { id: 'dormitorio', label: 'Dormitorio', file: null, preview: null },
];

export default function App() {
  const [images, setImages] = useState<PropertyImage[]>(INITIAL_IMAGES);
  const [referenceImages, setReferenceImages] = useState<PropertyImage[]>([]);
  const [logo, setLogo] = useState<{ file: File | null, preview: string | null }>({ file: null, preview: null });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'collage' | 'luxury' | 'functionality' | 'lifestyle' | 'roi'>('collage');

  const STRATEGIC_SUGGESTIONS = {
    collage: "Especialista en Collages: Ideal para mostrar múltiples ambientes en un solo impacto visual de alta conversión.",
    luxury: "Impacto Visual Único: Perfecto para destacar una sola foto de gran calidad con un diseño minimalista y premium.",
    functionality: "Infografía Inmobiliaria: Organiza datos técnicos (m2, dormitorios, baños) de forma clara y profesional.",
    lifestyle: "Conexión Emocional: Vende la experiencia y el bienestar de habitar el espacio con un look editorial.",
    roi: "Oportunidad de Inversión: Diseño directo y agresivo para captar inversores con indicadores de rentabilidad."
  };
  
  // Iteration & Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [refinementText, setRefinementText] = useState('');
  const [isBrushing, setIsBrushing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [history, setHistory] = useState<{ prompt: string; image: string }[]>([]);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Editable fields state
  const [customInstructions, setCustomInstructions] = useState('');
  const [details, setDetails] = useState({
    location: 'Valle Hermoso 334',
    price: '180,000',
    beds: '3',
    baths: '1',
    parking: '1',
    phone: '999 882 223',
    usp: '',
    urgency: '',
    nearbyStreets: '',
    cta: '¡Contáctanos hoy!',
    buyerProfile: 'family' as 'family' | 'investor'
  });

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo({ file, preview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlot) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (activeSlot === 'reference') {
          const newRef: PropertyImage = {
            id: `ref-${Date.now()}`,
            label: 'Inspiración',
            file,
            preview: reader.result as string
          };
          setReferenceImages(prev => [...prev, newRef]);
        } else {
          setImages(prev => prev.map(img => 
            img.id === activeSlot 
              ? { ...img, file, preview: reader.result as string } 
              : img
          ));
        }
      };
      reader.readAsDataURL(file);
    }
    setActiveSlot(null);
  };

  const triggerUpload = (id: string) => {
    setActiveSlot(id);
    fileInputRef.current?.click();
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, file: null, preview: null } : img
    ));
  };

  const removeReferenceImage = (id: string) => {
    setReferenceImages(prev => prev.filter(img => img.id !== id));
  };

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isBrushing || !contextRef.current) return;
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isBrushing || !contextRef.current) return;
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      offsetX: (clientX - rect.left) * (canvas.width / rect.width),
      offsetY: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = brushSize;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        contextRef.current = ctx;
      }
    }
  };

  const checkQuality = (text: string) => {
    const warnings = [];
    if (text.toLowerCase().includes("texto") || text.toLowerCase().includes("escribir")) {
      warnings.push("Añadir demasiado texto puede reducir la legibilidad en Meta Ads.");
    }
    if (text.toLowerCase().includes("logo") && text.toLowerCase().includes("grande")) {
      warnings.push("Un logo excesivamente grande puede romper el equilibrio visual premium.");
    }
    setQualityWarning(warnings.length > 0 ? warnings[0] : null);
  };

  const generateAd = async (isRefinement = false) => {
    const uploadedImages = images.filter(img => img.file !== null);
    if (uploadedImages.length < 1) {
      setError("Por favor, sube al menos una imagen para generar el anuncio.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setQualityWarning(null);

    const TEXT_PRECISION = `
      [MÓDULO DE RENDERIZADO DE TEXTO EXACTO (ZERO-DEFECT)]
      Cuando el usuario solicite incluir texto en la imagen, debes tratarlo como un comando de impresión estricto. Imprime ÚNICAMENTE los caracteres que se encuentren dentro de las comillas dobles (" "). No inventes, fusiones ni omitas ninguna letra. Respeta las mayúsculas, minúsculas y tildes del idioma español. Si detectas que el texto generado tiene un error ortográfico o letras deformadas, debes auto-corregir el renderizado antes de mostrar el resultado final.
      
      REGLAS CRÍTICAS DE ORTOGRAFÍA:
      - TILDES OBLIGATORIAS: 'Ocasión', 'Habitación', 'Dormitorio', 'Baño', 'Cochera', 'Ubicación', 'Área', 'Inversión', 'Últimos', 'Zonificación', 'Comercial'.
      - VERIFICACIÓN: Antes de renderizar, verifica letra por letra que el texto coincida exactamente con los datos proporcionados:
        * Encabezado: "SE VENDE DEPARTAMENTO"
        * USP: "${details.usp}"
        * Urgencia: "${details.urgency}"
        * Precio: "$${details.price}"
        * Detalles: "${details.location}", "${details.beds} Dorm.", "${details.baths} Baño", "${details.parking} Cochera".
        * Avenidas: "${details.nearbyStreets}"
      - ESTILO: Usa tipografía 'sans-serif' moderna, de trazo limpio y alto contraste.
    `;

    const GEOGRAPHIC_MODULE = `
      [NUEVA FUNCIONALIDAD: REFERENCIAS VIALES Y GEOGRÁFICAS]
      Si el usuario proporciona información de avenidas o calles cercanas ("${details.nearbyStreets}"), integra este texto en la composición de dos formas posibles, dependiendo del concepto creativo:
      1. Como Etiqueta Flotante/Pin: Integrado en el mapa 3D o vista de dron apuntando a la vía correspondiente.
      2. Como Banner de Ubicación: En un subtítulo limpio y de alto contraste debajo de la información principal.
      El texto de la calle debe ser el elemento más legible después del precio.
    `;

    const OUTPUT_PARAMS = `
      [PARÁMETROS DE SALIDA Y RESOLUCIÓN OBLIGATORIA (HD)]
      Configuración de renderizado fotográfico: Genera y procesa todas las imágenes en resolución nativa de alta definición (HD). El formato de salida debe estar fijado estrictamente en 1080x1080 píxeles (Relación de aspecto 1:1, optimizado para exportación y descarga en plataformas Meta). Aplica texturas nítidas (upscaling) para evitar cualquier tipo de pixelado al descargar.
    `;

    const QUALITY_ENHANCERS = `
      [MÓDULO DE DIRECCIÓN DE ARTE PREMIUM (OBLIGATORIO)]
      Resultados de nivel agencia internacional. 
      - FOTOGRAFÍA: Arquitectura fotorrealista, iluminación cinematográfica, enfoque nítido.
      - COMPOSICIÓN: Diseño limpio, balanceado, con uso estratégico de espacios en blanco.
      - ACABADO: Bordes perfectos, tipografía integrada sin distorsión, sombras realistas.
      - FORMATO: Ocupar el 100% del lienzo 1:1 con proporciones correctas.
    `;

    const QUALITY_BARRIERS = `
      [BARRERAS DE CALIDAD (PROMPT NEGATIVO ESTRICTO)]
      EVITA por completo: 'Texto borroso o deforme, letras fusionadas, ortografía incorrecta, tildes faltantes, extremidades humanas deformes, ruido visual, elementos fusionados sin sentido, imágenes estiradas o aplastadas, proporciones arquitectónicas irreales, colores sobresaturados o artificiales, sombras inconsistentes'.
    `;

    const SMART_CROPPING = `
      [MOTOR DE RECORTE INTELIGENTE Y ENCUADRE]
      - FORMATO INDIVIDUAL: Cada creativo debe centrarse en una imagen principal que ocupe el 100% del espacio o sea el eje central.
      - AJUSTE AUTOMÁTICO: Redimensiona y reencuadra las fotos del usuario para que encajen perfectamente en el formato 1:1 sin distorsión.
      - PROPORCIONES: Mantén la integridad arquitectónica. No estires ni aplastes.
    `;

    const REFERENCE_INSTRUCTION = `
      [PROCESAMIENTO DE INSPIRACIÓN (REPLICAR ESTRUCTURA)]
      Si hay imágenes de referencia, REPLICA SU ESTRUCTURA Y ESTILO VISUAL (layout, posición de textos, tipos de bloques). 
      SIN EMBARGO: 
      1. REEMPLAZA todas las fotos de la referencia por las FOTOS DEL PRODUCTO cargadas por el usuario.
      2. APLICA la paleta de marca: Blanco predominante, Negro secundario, Amarillo (#FFD700) para precios.
      3. El resultado debe ser una versión "Honne" del diseño de referencia.
    `;

    const buyerProfilePrompt = details.buyerProfile === 'investor' 
      ? "PSICOLOGÍA DE COLOR (Inversionistas): Utiliza una paleta de colores de alto contraste, tonos oscuros con acentos dorados o amarillos para transmitir solidez y rentabilidad."
      : "PSICOLOGÍA DE COLOR (Familias): Utiliza tonos cálidos, cielos azules despejados y luz natural abundante para transmitir hogar y bienestar.";

    const customInstructionsPrompt = customInstructions 
      ? `INSTRUCCIONES CREATIVAS LIBRES (Prompting Espacial y Geográfico): ${customInstructions}. 
         REGLAS DE RENDERIZADO GEOGRÁFICO:
         - Si se solicita resaltar avenidas, utiliza líneas brillantes (neón o luz sólida) que sigan la trayectoria vial.
         - Las etiquetas de texto (ej. nombres de calles) deben ser perfectamente legibles, con tipografía 'sans-serif' moderna y un ligero sombreado para contraste.
         - Los pines o flechas deben tener un estilo 3D profesional, integrándose con la perspectiva de la imagen.
         - El resultado debe parecer un render urbano de alta gama o una visualización arquitectónica de planeamiento.`
      : "";

    try {
      // Resize images to prevent oversized requests
      const resizeImage = (base64Str: string, quality = 0.7): Promise<string> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = base64Str;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 1024;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
          };
        });
      };

      let parts: any[] = [];

      if (isRefinement && generatedAd) {
        const baseImage = await resizeImage(generatedAd);
        parts.push({
          inlineData: {
            data: baseImage,
            mimeType: "image/jpeg"
          }
        });

        if (isBrushing && canvasRef.current) {
          const maskData = canvasRef.current.toDataURL('image/png').split(',')[1];
          parts.push({
            inlineData: {
              data: maskData,
              mimeType: "image/png"
            }
          });
          parts.push({ text: `
            MÓDULO DE EDICIÓN QUIRÚRGICA POR MÁSCARA:
            INSTRUCCIÓN ESPECÍFICA: ${refinementText}.
            REGLA CRÍTICA: Realiza el cambio solicitado ÚNICAMENTE en el área marcada por la máscara blanca. Si pido "elimina este texto", bórralo y rellena el fondo de forma coherente. NO cambies la estructura, ni los colores, ni las fotos del resto de la imagen. La consistencia es la prioridad absoluta.
            
            ${TEXT_PRECISION}
            ${QUALITY_ENHANCERS}
            ${QUALITY_BARRIERS}
          ` });
        } else {
          parts.push({ text: `
            SISTEMA DE REFINAMIENTO GLOBAL:
            INSTRUCCIÓN ESPECÍFICA: ${refinementText}.
            Mantén la consistencia con la propiedad (${details.location}) y el estilo Honne.
            
            ${TEXT_PRECISION}
            ${QUALITY_ENHANCERS}
            ${QUALITY_BARRIERS}
          ` });
        }

        // Add context memory
        const lastHistory = history[history.length - 1];
        if (lastHistory) {
          parts.push({ text: `CONTEXTO DE DISEÑO PREVIO: El anuncio anterior se generó con este concepto: ${lastHistory.prompt}. Respeta los colores corporativos (Blanco, Negro, Amarillo Sutil) y la tipografía sofisticada.` });
        }
      } else {
        const propertyParts = await Promise.all(uploadedImages.map(async (img) => {
          const resizedData = await resizeImage(img.preview!);
          return {
            inlineData: {
              data: resizedData,
              mimeType: "image/jpeg"
            }
          };
        }));

        const referenceParts = await Promise.all(referenceImages.map(async (img) => {
          const resizedData = await resizeImage(img.preview!);
          return {
            inlineData: {
              data: resizedData,
              mimeType: "image/jpeg"
            }
          };
        }));

        const logoPart = logo.preview ? [{
          inlineData: {
            data: await resizeImage(logo.preview, 0.9),
            mimeType: "image/jpeg"
          }
        }] : [];

        const stylePrompts = {
          collage: `
            RECETA: COLLAGE ESTRATÉGICO (Expert Mode)
            - Mood: Dinámico, informativo y de alta conversión para Meta Ads.
            - Composición: Imagen principal de gran tamaño (ej. fachada o vista aérea) con 2-3 miniaturas en la parte inferior o lateral con bordes redondeados y sombra suave.
            - Tipografía: Títulos en 'Inter Bold' (Negro sobre Blanco o Blanco sobre Negro).
            - Paleta de Colores: Fondo predominante BLANCO. Acentos en NEGRO para legibilidad. AMARILLO INTENSO (#FFD700) exclusivo para el precio y llamadas a la acción.
            - Elementos: Círculos amarillos para resaltar áreas, pines de ubicación con tiempo de llegada (ej. 'A 5 min').
            - REGLA DE ORO: Utiliza EXCLUSIVAMENTE las fotos cargadas por el usuario. No generes entornos ficticios.
          `,
          luxury: `
            RECETA: IMPACTO VISUAL ÚNICO (Single Image Expert)
            - Mood: Minimalista, premium y aspiracional.
            - Composición: Una sola imagen de impacto total (full bleed). Superposición de texto en bloques sólidos (Negro o Blanco) con opacidad controlada.
            - Tipografía: 'Cormorant Garamond' para elegancia, combinada con 'Inter' para datos técnicos.
            - Paleta de Colores: Elegancia en NEGRO y BLANCO. El PRECIO debe resaltar en un bloque AMARILLO (#FFD700) de alto impacto.
            - Elementos: Líneas de trazado vial (neón cian o blanco) si es una vista aérea. Logo de Honne en una esquina limpia.
            - REGLA DE ORO: Utiliza EXCLUSIVAMENTE la foto principal cargada por el usuario.
          `,
          functionality: `
            RECETA: INFOGRAFÍA INMOBILIARIA
            - Mood: Técnico, claro y resolutivo.
            - Composición: Estructura de rejilla visible, micro-etiquetas para datos técnicos. Espacio generoso para datos (m2, dormitorios, baños).
            - Tipografía: 'JetBrains Mono' para cifras numéricas, 'Inter' para etiquetas.
            - Paleta de Colores: Fondo BLANCO limpio. Iconos en NEGRO. Precio en AMARILLO (#FFD700).
            - Elementos: Iconos minimalistas de alta calidad. Etiquetas de texto con fondo blanco y borde negro fino.
            - REGLA DE ORO: Integra los datos reales sobre las fotos proporcionadas.
          `,
          lifestyle: `
            RECETA: CONEXIÓN EMOCIONAL
            - Mood: Cálido, humano y acogedor.
            - Composición: Enfoque en la luz natural, plantas, y texturas orgánicas. Superposición de texto tipo "revista" con frases inspiracionales.
            - Tipografía: Serif sofisticada para el titular, Sans-serif para el cuerpo.
            - Paleta de Colores: Predominio de BLANCO para amplitud. Acentos NEGROS. El precio siempre en AMARILLO (#FFD700) para no perder el foco comercial.
            - Elementos: Filtros de luz suave (Golden Hour).
            - REGLA DE ORO: No inventes personas ni muebles si no están en las fotos originales.
          `,
          roi: `
            RECETA: OPORTUNIDAD DE INVERSIÓN (High Conversion)
            - Mood: Impactante, directo, urgente.
            - Composición: Tipografía masiva (oversized), colores de alto contraste (Amarillo #FFD700 sobre Negro). Layout tipo "Ocasión" con banners grandes.
            - Tipografía: 'Anton' o sans-serif extra-bold.
            - Paleta de Colores: Contraste agresivo NEGRO/BLANCO. El AMARILLO (#FFD700) debe cubrir al menos el 20% del diseño (banners de precio).
            - Elementos: Badges de "¡BAJÓ DE PRECIO!" o "¡PRECIO DE OCASIÓN!".
            - REGLA DE ORO: Maximiza la visibilidad de los datos financieros sobre la imagen real.
          `
        };

        const prompt = `
          ROL: EXPERTO DIRECTOR DE ARTE EN META ADS PARA BIENES RAÍCES.
          MISIÓN: Crear un anuncio de alto impacto visual utilizando EXCLUSIVAMENTE las fotos reales cargadas por el usuario.

          REGLAS DE DISEÑO OBLIGATORIAS:
          1. PALETA DE COLORES: Predominio de BLANCO (#FFFFFF). Uso secundario de NEGRO (#000000). AMARILLO INTENSO (#FFD700) para resaltar el precio y elementos clave.
          2. FUENTES: 'Inter' para legibilidad y 'Cormorant Garamond' para elegancia.
          3. TEXTO: Ortografía perfecta en español. Tildes obligatorias.
          4. IMÁGENES: No generes paisajes ni casas ficticias. Usa las fotos proporcionadas como la base real del proyecto.
          5. LAYOUT: Si es un collage, integra las fotos de forma orgánica con bordes limpios. Si es imagen única, maximiza el impacto visual.

          ${SMART_CROPPING}
          ${TEXT_PRECISION}
          ${GEOGRAPHIC_MODULE}
          ${QUALITY_ENHANCERS}
          ${REFERENCE_INSTRUCTION}
          ${QUALITY_BARRIERS}
          ${OUTPUT_PARAMS}

          ${buyerProfilePrompt}
          ${customInstructionsPrompt}

          JERARQUÍA VISUAL ESTRICTA:
          1. ENCABEZADO: Texto "SE VENDE DEPARTAMENTO" o "SE VENDE TERRENO" (según corresponda).
          2. PROPUESTA DE VALOR (USP): "${details.usp}" (Subtítulo de alto contraste).
          3. INDICADOR DE URGENCIA: "${details.urgency}" (Badge llamativo).
          4. BANNER DE PRECIO: Resaltado en AMARILLO INTENSO (#FFD700) con el texto "$${details.price}".
          5. LLAMADO A LA ACCIÓN (CTA): "${details.cta}" (Botón o texto estratégico de alta visibilidad).
          6. BRANDING: Logo de Honne Inmobiliaria integrado profesionalmente.
          7. DETALLES: Ubicación: ${details.location} | ${details.beds} Dorm. | ${details.baths} Baño | ${details.parking} Cochera | Contacto: ${details.phone}.

          ${stylePrompts[selectedStyle]}

          VERIFICACIÓN FINAL:
          - ¿El precio está en amarillo intenso? SÍ.
          - ¿El fondo es predominantemente blanco? SÍ.
          - ¿Se usaron solo las fotos del usuario? SÍ.
          - ¿La ortografía es perfecta? SÍ.
        `;

        parts = [
          { text: "Imágenes de la propiedad para el anuncio:" },
          ...propertyParts,
          { text: "Imágenes de referencia (SOLO PARA INSPIRACIÓN DE ESTILO, NO COPIAR):" },
          ...referenceParts,
          { text: "Logotipo oficial de Honne Inmobiliaria (usar como firma):" },
          ...logoPart,
          { text: prompt }
        ];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        const newImage = `data:image/png;base64,${imagePart.inlineData.data}`;
        setGeneratedAd(newImage);
        setHistory(prev => [...prev, { prompt: isRefinement ? refinementText : 'Generación Inicial', image: newImage }]);
        setIsEditing(false);
        setRefinementText('');
        setIsBrushing(false);
      } else {
        throw new Error("No se pudo generar la imagen. Inténtalo de nuevo.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setError("Error de configuración del modelo. Inténtalo de nuevo en unos momentos.");
      } else {
        setError("Error al generar el anuncio. Asegúrate de que las imágenes sean válidas y no demasiado pesadas.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F27D26] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              H
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Honne Inmobiliaria</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Ad Creator Pro</p>
            </div>
          </div>
          <button 
            onClick={generateAd}
            disabled={isGenerating || images.filter(img => img.file).length === 0}
            className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generar Anuncio
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left: Configuration Panel */}
        <div className="lg:col-span-7 space-y-12 pb-24">
          <header className="space-y-2">
            <h2 className="text-4xl font-serif italic font-light tracking-tight">Configuración del Anuncio</h2>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">Personaliza cada detalle de tu campaña</p>
          </header>

          {/* Brand & Logo */}
          <section className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F27D26]/10 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-[#F27D26]" />
                </div>
                Identidad de Marca
              </h3>
            </div>
            <div className="flex items-center gap-8">
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="w-40 h-40 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#F27D26] hover:bg-[#F27D26]/5 transition-all overflow-hidden bg-gray-50 group"
              >
                {logo.preview ? (
                  <img src={logo.preview} alt="Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-[#F27D26] transition-colors" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subir Logo</span>
                  </>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Colores Corporativos</p>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm" title="Blanco" />
                  <div className="w-10 h-10 rounded-2xl bg-black shadow-sm" title="Negro" />
                  <div className="w-10 h-10 rounded-2xl bg-[#FFD700] shadow-sm border border-black/5" title="Amarillo Sutil" />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed italic font-serif">
                  "La elegancia del negro, la pureza del blanco y el impacto del amarillo."
                </p>
              </div>
            </div>
          </section>

          {/* Property Images */}
          <section className="space-y-6">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-serif italic">Galería de la Propiedad</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Sube hasta 5 fotografías reales del proyecto</p>
                <p className="text-[10px] text-[#F27D26] font-bold uppercase tracking-tighter mt-1">
                  ⚠️ EL AI UTILIZARÁ EXCLUSIVAMENTE ESTAS FOTOS PARA EL ANUNCIO
                </p>
              </div>
              <span className="text-xs font-mono text-[#F27D26] bg-[#F27D26]/10 px-3 py-1 rounded-full font-bold">
                {images.filter(img => img.file).length} / 5
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div 
                  key={img.id}
                  className="relative group aspect-square bg-white border border-gray-100 rounded-[1.5rem] overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  {img.preview ? (
                    <>
                      <img src={img.preview} alt={img.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => removeImage(img.id)}
                          className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button 
                      onClick={() => triggerUpload(img.id)}
                      className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-300 hover:text-[#F27D26] transition-colors bg-gray-50/50"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
                        <Camera className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{img.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Inspiration Section */}
          <section className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-lg font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  Sección de Inspiración
                </h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Sube una referencia (ej. Canva) para replicar su estilo</p>
              </div>
              <button 
                onClick={() => triggerUpload('reference')}
                className="text-xs font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-full hover:bg-purple-100 transition-all"
              >
                + Añadir Referencia
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {referenceImages.map((img) => (
                <div key={img.id} className="relative group aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <img src={img.preview!} alt="Referencia" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <button 
                    onClick={() => removeReferenceImage(img.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {referenceImages.length === 0 && (
                <div className="col-span-full py-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sin referencias cargadas</span>
                </div>
              )}
            </div>
          </section>

          {/* Details & Strategic Context */}
          <section className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F27D26]/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#F27D26]" />
                </div>
                Detalles Estratégicos
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Ubicación Exacta</label>
                <input 
                  type="text"
                  name="location"
                  value={details.location}
                  onChange={handleDetailChange}
                  className="w-full p-4 bg-gray-50 rounded-2xl font-medium border border-transparent focus:bg-white focus:border-[#F27D26] outline-none transition-all shadow-inner"
                  placeholder="Ej: Valle Hermoso 334"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Precio de Venta ($)</label>
                <input 
                  type="text"
                  name="price"
                  value={details.price}
                  onChange={handleDetailChange}
                  className="w-full p-4 bg-[#FFF9E6] text-[#B8860B] rounded-2xl font-black border border-[#F27D26]/10 focus:border-[#F27D26] outline-none transition-all shadow-inner"
                  placeholder="Ej: 180,000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Llamado a la Acción (CTA)</label>
                <input 
                  type="text"
                  name="cta"
                  value={details.cta}
                  onChange={handleDetailChange}
                  className="w-full p-4 bg-gray-50 rounded-2xl font-medium border border-transparent focus:bg-white focus:border-[#F27D26] outline-none transition-all shadow-inner"
                  placeholder="Ej: ¡Contáctanos hoy!"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Teléfono de Contacto</label>
                <input 
                  type="text"
                  name="phone"
                  value={details.phone}
                  onChange={handleDetailChange}
                  className="w-full p-4 bg-gray-50 rounded-2xl font-medium border border-transparent focus:bg-white focus:border-[#F27D26] outline-none transition-all shadow-inner"
                  placeholder="Ej: 999 882 223"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { name: 'beds', label: 'Dorm.', icon: <Bed className="w-4 h-4" /> },
                { name: 'baths', label: 'Baños', icon: <Bath className="w-4 h-4" /> },
                { name: 'parking', label: 'Cochera', icon: <Car className="w-4 h-4" /> }
              ].map((field) => (
                <div key={field.name} className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                    {field.icon} {field.label}
                  </label>
                  <input 
                    type="text"
                    name={field.name}
                    value={(details as any)[field.name]}
                    onChange={handleDetailChange}
                    className="w-full p-4 bg-gray-50 rounded-2xl text-center font-bold border border-transparent focus:bg-white focus:border-[#F27D26] outline-none transition-all shadow-inner"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Propuesta Única (USP)</label>
                <input 
                  type="text"
                  name="usp"
                  value={details.usp}
                  onChange={handleDetailChange}
                  className="w-full p-4 bg-gray-50 rounded-2xl font-medium border border-transparent focus:bg-white focus:border-[#F27D26] outline-none transition-all shadow-inner"
                  placeholder="Ej: Acabados de Mármol"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Factor Urgencia</label>
                <input 
                  type="text"
                  name="urgency"
                  value={details.urgency}
                  onChange={handleDetailChange}
                  className="w-full p-4 bg-gray-50 rounded-2xl font-medium border border-transparent focus:bg-white focus:border-[#F27D26] outline-none transition-all shadow-inner"
                  placeholder="Ej: Solo por esta semana"
                />
              </div>
            </div>
          </section>

          {/* Custom Instructions */}
          <section className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F27D26]/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-[#F27D26]" />
                </div>
                Instrucciones Creativas
              </h3>
              <button 
                onClick={() => setCustomInstructions("")}
                className="text-[10px] font-bold text-gray-300 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                Limpiar
              </button>
            </div>
            <textarea 
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="w-full p-6 bg-gray-50 rounded-[1.5rem] border border-transparent focus:bg-white focus:border-[#F27D26] outline-none transition-all text-sm min-h-[150px] resize-none font-medium shadow-inner leading-relaxed"
              placeholder="Ej: Resalta la avenida principal con una línea neón y añade un pin que diga 'A 2 min del Mall'..."
            />
          </section>
        </div>

        {/* Right: Preview & Actions (Sticky) */}
        <div className="lg:col-span-5 sticky top-32 space-y-8">
          <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-gray-100 relative group">
            <div className="aspect-square rounded-[2rem] overflow-hidden bg-gray-50 relative flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-6 text-center p-12"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-[#F27D26]/10 border-t-[#F27D26] rounded-full animate-spin" />
                      <Sparkles className="w-8 h-8 text-[#F27D26] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-serif italic text-2xl tracking-tight">Esculpiendo tu anuncio...</p>
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
                    />
                    
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-all">
                        <canvas
                          ref={canvasRef}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className={`w-full h-full cursor-crosshair ${isBrushing ? 'opacity-40' : 'pointer-events-none opacity-0'}`}
                          style={{ mixBlendMode: 'screen' }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 text-center p-12 text-gray-300">
                    <div className="w-24 h-24 rounded-full bg-white shadow-inner flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-serif italic text-xl">Tu diseño aparecerá aquí</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold">Completa la configuración y genera</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {error && (
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-red-500 text-white text-xs rounded-2xl shadow-xl font-bold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Floating Actions */}
            {generatedAd && !isGenerating && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white p-2 rounded-full shadow-2xl border border-gray-100">
                <button 
                  onClick={() => {
                    setIsEditing(!isEditing);
                    if (!isEditing) setTimeout(initCanvas, 100);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${isEditing ? 'bg-[#F27D26] text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  <Brush className="w-4 h-4" /> {isEditing ? 'Cerrar Edición' : 'Refinar'}
                </button>
                <div className="w-px h-6 bg-gray-100" />
                <a 
                  href={generatedAd} 
                  download="honne-anuncio.png"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-[#F27D26] hover:bg-[#F27D26]/5 transition-all"
                >
                  <Download className="w-4 h-4" /> Descargar
                </a>
              </div>
            )}
          </div>

          {/* Refinement Panel (Contextual) */}
          <AnimatePresence>
            {isEditing && generatedAd && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F27D26]/10 flex items-center justify-center">
                      <Brush className="w-4 h-4 text-[#F27D26]" />
                    </div>
                    Refinamiento de Precisión
                  </h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsBrushing(!isBrushing)}
                      className={`p-2.5 rounded-xl transition-all ${isBrushing ? 'bg-[#F27D26] text-white shadow-lg shadow-[#F27D26]/20' : 'bg-gray-50 text-gray-400 hover:text-black'}`}
                      title="Pincel de Inpainting"
                    >
                      <Brush className="w-4 h-4" />
                    </button>
                    {isBrushing && (
                      <button 
                        onClick={clearCanvas}
                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                      >
                        <Eraser className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {isBrushing && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
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
                        setBrushSize(parseInt(e.target.value));
                        if (contextRef.current) contextRef.current.lineWidth = parseInt(e.target.value);
                      }}
                      className="w-full accent-[#F27D26]"
                    />
                    <p className="text-[9px] text-gray-400 font-medium italic">Pinta sobre el elemento que deseas cambiar (ej. un texto, una ventana, el cielo).</p>
                  </div>
                )}

                <textarea 
                  value={refinementText}
                  onChange={(e) => {
                    setRefinementText(e.target.value);
                    checkQuality(e.target.value);
                  }}
                  placeholder={isBrushing ? "Describe qué quieres cambiar en el área pintada..." : "Ej: Cambia el cielo a atardecer, pon el precio en blanco..."}
                  className="w-full p-5 bg-gray-50 rounded-2xl text-sm border border-transparent focus:bg-white focus:border-[#F27D26] outline-none min-h-[120px] resize-none shadow-inner leading-relaxed"
                />

                <div className="flex gap-4">
                  <button 
                    onClick={() => generateAd(true)}
                    disabled={!refinementText || isGenerating}
                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#1A1A1A] transition-all disabled:opacity-50 shadow-xl shadow-black/10"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-[#F27D26]" />}
                    Aplicar Cambios
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Section */}
          {history.length > 1 && (
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-gray-400" />
                Historial de Versiones
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {history.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setGeneratedAd(item.image)}
                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${generatedAd === item.image ? 'border-[#F27D26] scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={item.image} alt={`Versión ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Strategic Insight */}
          <div className="bg-[#1A1A1A] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F27D26]/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F27D26] flex items-center justify-center shadow-lg shadow-[#F27D26]/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#F27D26]">Insight Estratégico</p>
              </div>
              <p className="font-serif italic text-lg leading-relaxed text-gray-200">
                "{STRATEGIC_SUGGESTIONS[selectedStyle]}"
              </p>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Recomendación para Meta Ads</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <input 
        type="file" 
        ref={logoInputRef} 
        onChange={handleLogoChange} 
        accept="image/*" 
        className="hidden" 
      />

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 opacity-30 grayscale">
          <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white font-bold text-[10px]">H</div>
          <span className="text-sm font-bold tracking-tighter">HONNE INMOBILIARIA</span>
        </div>
        <p className="text-xs text-gray-400 font-mono">© 2026 HONNE INMOBILIARIA. POWERED BY GEMINI 3.1 FLASH IMAGE.</p>
      </footer>
    </div>
  );
}
