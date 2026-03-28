import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'framer-motion';
import { validateImageFile, validateBase64Image } from './lib/imageValidator';
import {
  Header,
  PropertyGallery,
  PreviewPanel,
  DetailsForm,
  CustomInstructions,
  StrategicInsight,
  ReferenceImages,
  LogoUpload,
  RefinementPanel,
  type PropertyImage,
  type PropertyDetails
} from './components';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const INITIAL_IMAGES: PropertyImage[] = [
  { id: 'exterior', label: 'Fachada Exterior', file: null, preview: null },
  { id: 'sala', label: 'Sala', file: null, preview: null },
  { id: 'cocina', label: 'Cocina', file: null, preview: null },
  { id: 'comedor', label: 'Comedor', file: null, preview: null },
  { id: 'dormitorio', label: 'Dormitorio', file: null, preview: null },
];

const STRATEGIC_SUGGESTIONS: Record<string, string> = {
  collage: "Especialista en Collages: Ideal para mostrar múltiples ambientes en un solo impacto visual de alta conversión.",
  luxury: "Impacto Visual Único: Perfecto para destacar una sola foto de gran calidad con un diseño minimalista y premium.",
  functionality: "Infografía Inmobiliaria: Organiza datos técnicos (m2, dormitorios, baños) de forma clara y profesional.",
  lifestyle: "Conexión Emocional: Vende la experiencia y el bienestar de habitar el espacio con un look editorial.",
  roi: "Oportunidad de Inversión: Diseño directo y agresivo para captar inversores con indicadores de rentabilidad."
};

export default function App() {
  // State Management
  const [images, setImages] = useState<PropertyImage[]>(INITIAL_IMAGES);
  const [referenceImages, setReferenceImages] = useState<PropertyImage[]>([]);
  const [logo, setLogo] = useState<{ file: File | null, preview: string | null }>({ file: null, preview: null });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'collage' | 'luxury' | 'functionality' | 'lifestyle' | 'roi'>('collage');

  // Iteration & Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [refinementText, setRefinementText] = useState('');
  const [isBrushing, setIsBrushing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [history, setHistory] = useState<{ prompt: string; image: string }[]>([]);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Details State
  const [customInstructions, setCustomInstructions] = useState('');
  const [details, setDetails] = useState<PropertyDetails>({
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
    buyerProfile: 'family'
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Handlers
  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleBuyerProfileChange = (profile: 'family' | 'investor') => {
    setDetails(prev => ({ ...prev, buyerProfile: profile }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar el logo
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || "Logo inválido");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // Validar el base64
        const base64Validation = validateBase64Image(result);
        if (!base64Validation.valid) {
          setError(base64Validation.error || "No se pudo procesar el logo");
          return;
        }
        
        setLogo({ file, preview: result });
        setError(null);
      };
      
      reader.onerror = () => {
        setError("Error al leer el logo. Intenta de nuevo.");
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlot) {
      // Validar el archivo antes de procesarlo
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || "Archivo inválido");
        setActiveSlot(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // Validar el base64 resultado
        const base64Validation = validateBase64Image(result);
        if (!base64Validation.valid) {
          setError(base64Validation.error || "No se pudo procesar la imagen");
          setActiveSlot(null);
          return;
        }

        if (activeSlot === 'reference') {
          const newRef: PropertyImage = {
            id: `ref-${Date.now()}`,
            label: 'Inspiración',
            file,
            preview: result
          };
          setReferenceImages(prev => [...prev, newRef]);
          setError(null);
        } else {
          setImages(prev => prev.map(img => 
            img.id === activeSlot 
              ? { ...img, file, preview: result } 
              : img
          ));
          setError(null);
        }
      };
      
      reader.onerror = () => {
        setError("Error al leer el archivo. Intenta de nuevo.");
      };
      
      reader.readAsDataURL(file);
    }
    setActiveSlot(null);
  };

  const triggerUpload = (id: string) => {
    setActiveSlot(id);
    fileInputRef.current?.click();
  };

  const triggerLogoUpload = () => {
    logoInputRef.current?.click();
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

  // AI Generation Logic (keeping original implementation)
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
      const resizeImage = (base64Str: string, quality = 0.7): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = base64Str;
          
          // Timeout de 10 segundos
          const timeout = setTimeout(() => {
            reject(new Error("Tiempo de carga de imagen agotado"));
          }, 10000);
          
          img.onload = () => {
            clearTimeout(timeout);
            try {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1024;
              const MAX_HEIGHT = 1024;
              let width = img.width;
              let height = img.height;

              // Validar que las dimensiones sean razonables
              if (width <= 0 || height <= 0) {
                throw new Error("Las dimensiones de la imagen no son válidas");
              }

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
              if (!ctx) {
                throw new Error("No se pudo obtener contexto del canvas");
              }
              
              ctx.drawImage(img, 0, 0, width, height);
              const result = canvas.toDataURL('image/jpeg', quality);
              
              // Validar que el resultado sea válido
              if (!result || result.length < 100) {
                throw new Error("La imagen comprimida es demasiado pequeña");
              }
              
              resolve(result.split(',')[1]);
            } catch (error) {
              reject(error);
            }
          };
          
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("No se pudo cargar la imagen. Verifica que sea válida"));
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

        const lastHistory = history[history.length - 1];
        if (lastHistory) {
          parts.push({ text: `CONTEXTO DE DISEÑO PREVIO: El anuncio anterior se generó con este concepto: ${lastHistory.prompt}. Respeta los colores corporativos (Blanco, Negro, Amarillo Sutil) y la tipografía sofisticada.` });
        }
      } else {
        // Validar que haya imágenes cargadas
        const uploadedImages = images.filter(img => img.file && img.preview);
        
        if (uploadedImages.length === 0) {
          throw new Error("Debes cargar al menos una imagen de la propiedad para generar el anuncio");
        }

        
        let propertyParts: any[] = [];
        let referenceParts: any[] = [];
        let logoPart: any[] = [];

        try {
          propertyParts = await Promise.all(uploadedImages.map(async (img) => {
            if (!img.preview) throw new Error("Preview de imagen no disponible");
            const resizedData = await resizeImage(img.preview);
            return {
              inlineData: {
                data: resizedData,
                mimeType: "image/jpeg"
              }
            };
          }));

          referenceParts = (await Promise.all(referenceImages.map(async (img) => {
            if (!img.preview) return null;
            const resizedData = await resizeImage(img.preview);
            return {
              inlineData: {
                data: resizedData,
                mimeType: "image/jpeg"
              }
            };
          }))).filter((p): p is any => p !== null);

          if (logo.preview) {
            const logoData = await resizeImage(logo.preview, 0.9);
            logoPart = [{
              inlineData: {
                data: logoData,
                mimeType: "image/jpeg"
              }
            }];
          }
        } catch (imgError: any) {
          throw new Error(`Error al procesar imágenes: ${imgError.message}`);
        }

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
      console.error("[v0] Error de generación:", err);
      
      const errorMessage = err.message || err.toString();
      
      // Mensajes específicos según el error
      if (errorMessage.includes("Debes cargar")) {
        setError(errorMessage);
      } else if (errorMessage.includes("No se pudo cargar")) {
        setError("Una o más imágenes no se pudieron cargar. Intenta con otros formatos (JPG, PNG).");
      } else if (errorMessage.includes("Tiempo de carga")) {
        setError("La imagen tardó demasiado en cargar. Intenta con archivos más pequeños.");
      } else if (errorMessage.includes("Error al procesar")) {
        setError(`${errorMessage} Por favor, verifica que tus imágenes sean válidas.`);
      } else if (errorMessage.includes("Requested entity was not found")) {
        setError("Error de configuración del modelo. Por favor intenta en unos momentos.");
      } else if (errorMessage.includes("No se pudo generar")) {
        setError(errorMessage);
      } else {
        setError("Error al generar el anuncio. Verifica las imágenes y try de nuevo.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Header */}
      <Header 
        isGenerating={isGenerating}
        onGenerate={generateAd}
        imagesCount={images.filter(img => img.file).length}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Configuration Panel */}
        <div className="lg:col-span-7 space-y-8 sm:space-y-12 pb-12 sm:pb-24">
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h2 className="text-3xl sm:text-4xl font-serif italic font-light tracking-tight">
              Configuración del Anuncio
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-widest">
              Personaliza cada detalle de tu campaña
            </p>
          </motion.header>

          {/* Logo Section */}
          <LogoUpload 
            preview={logo.preview}
            onUpload={triggerLogoUpload}
          />

          {/* Property Gallery */}
          <PropertyGallery 
            images={images}
            onUpload={triggerUpload}
            onRemove={removeImage}
          />

          {/* Reference Images */}
          <ReferenceImages 
            images={referenceImages}
            onAdd={() => {
              setActiveSlot('reference');
              fileInputRef.current?.click();
            }}
            onRemove={removeReferenceImage}
          />

          {/* Details Form */}
          <DetailsForm 
            details={details}
            onChange={handleDetailChange}
            onBuyerProfileChange={handleBuyerProfileChange}
          />

          {/* Custom Instructions */}
          <CustomInstructions 
            value={customInstructions}
            onChange={setCustomInstructions}
            onClear={() => setCustomInstructions('')}
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            strategicSuggestions={STRATEGIC_SUGGESTIONS}
          />
        </div>

        {/* Right: Preview & Actions (Sticky) */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-8">
          {/* Preview */}
          <PreviewPanel
            isGenerating={isGenerating}
            generatedAd={generatedAd}
            error={error}
            isEditing={isEditing}
            onEditToggle={() => {
              setIsEditing(!isEditing);
              if (!isEditing) setTimeout(initCanvas, 100);
            }}
            onDownload={() => {
              if (generatedAd) {
                const a = document.createElement('a');
                a.href = generatedAd;
                a.download = 'honne-anuncio.png';
                a.click();
              }
            }}
            canvasRef={canvasRef}
            isBrushing={isBrushing}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Refinement Panel */}
          <RefinementPanel
            isVisible={isEditing && !!generatedAd}
            isBrushing={isBrushing}
            brushSize={brushSize}
            refinementText={refinementText}
            isGenerating={isGenerating}
            qualityWarning={qualityWarning}
            onBrushToggle={() => setIsBrushing(!isBrushing)}
            onClearCanvas={clearCanvas}
            onBrushSizeChange={setBrushSize}
            onTextChange={(text) => {
              setRefinementText(text);
              checkQuality(text);
            }}
            onApply={() => generateAd(true)}
            canvasRef={canvasRef}
            contextRef={contextRef}
          />

          {/* Strategic Insight */}
          <StrategicInsight 
            selectedStyle={selectedStyle}
            suggestion={STRATEGIC_SUGGESTIONS[selectedStyle]}
          />
        </div>
      </main>

      {/* File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
        aria-label="Cargar imagen"
      />

      <input 
        type="file" 
        ref={logoInputRef} 
        onChange={handleLogoChange} 
        accept="image/*" 
        className="hidden" 
        aria-label="Cargar logo"
      />

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-center sm:text-left">
        <div className="flex items-center gap-2 opacity-30 grayscale">
          <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white font-bold text-[10px]">H</div>
          <span className="text-xs sm:text-sm font-bold tracking-tighter">HONNE INMOBILIARIA</span>
        </div>
        <p className="text-xs text-gray-400 font-mono">© 2026 HONNE INMOBILIARIA. POWERED BY GEMINI 3.1 FLASH IMAGE.</p>
      </footer>
    </div>
  );
}
