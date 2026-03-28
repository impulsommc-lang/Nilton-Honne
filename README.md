<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Honne Inmobiliaria - AI Studio Ad Creator

Generador avanzado de anuncios inmobiliarios impulsado por IA. Crea anuncios de Meta Ads profesionales y de alta conversión con Gemini AI 2.5 Flash Image.

## ✨ Características Principales

- **Generación de Anuncios con IA**: Crea anuncios profesionales en segundos usando Gemini AI
- **5 Estilos Creativos**: Collage, Lujo, Infografía, Estilo de Vida e Inversión
- **Edición Refinada**: Edita áreas específicas de tus anuncios con herramienta de pincel intuitiva
- **Interfaz Moderna y Responsive**: Diseño adaptable para móvil, tablet y desktop
- **Gestión Completa de Imágenes**: Carga y gestiona múltiples imágenes de propiedades
- **Inspiración Visual**: Carga referencias de diseño para replicar estilos
- **Configuración Estratégica**: Personaliza todos los detalles de tu campaña
- **Historial de Versiones**: Accede a todas tus generaciones anteriores
- **Descarga en HD**: Exporta anuncios en calidad 1080x1080px optimizada

## 🚀 Mejoras Recientes (v2.0)

### 📱 Soporte Multiplataforma
- Interfaz completamente responsive para móvil, tablet y desktop
- Diseño mobile-first con breakpoints optimizados
- Gestos táctiles nativos para canvas de edición

### 🎨 Interfaz Modernizada
- Componentes refactorizados para mejor mantenibilidad
- Animaciones suaves con Framer Motion
- Diseño consistente y profesional
- Mejor accesibilidad (ARIA labels, navegación clara)

### ⚡ Optimizaciones de Rendimiento
- Componentes funcionales con lazy loading
- Gestión eficiente del estado
- Canvas drawing optimizado para touch y mouse
- Redimensionamiento inteligente de imágenes

### 🔧 Arquitectura Mejorada
- Componentes modulares reutilizables
- Separación clara de responsabilidades
- Mejor manejo de errores
- Utilidades compartidas

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm, yarn, pnpm o bun

## 🛠️ Instalación Local

1. **Instala las dependencias**:
   ```bash
   npm install
   ```

2. **Configura tu API Key de Gemini**:
   - Copia `.env.local.example` a `.env.local` (si existe)
   - Obtén tu API key en [Google AI Studio](https://ai.google.dev)
   - Añade tu clave:
   ```
   GEMINI_API_KEY=tu_clave_aqui
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abre tu navegador**:
   ```
   http://localhost:3000
   ```

## 📦 Scripts Disponibles

```bash
# Desarrollo con HMR
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview

# Limpiar carpeta dist
npm run clean

# Verificar tipos TypeScript
npm run lint
```

## 🎯 Cómo Usar

### 1. **Carga tu Logo**
   - Sube el logo de tu inmobiliaria
   - Se usará como firma en los anuncios

### 2. **Sube Imágenes de la Propiedad**
   - Mínimo 1 imagen, máximo 5
   - Categorías: Fachada, Sala, Cocina, Comedor, Dormitorio
   - El AI solo usará estas fotos (sin contenido ficticio)

### 3. **Añade Referencias (Opcional)**
   - Sube diseños de Canva u otras referencias
   - El AI replicará el estilo pero con tus fotos

### 4. **Completa los Detalles**
   - **Ubicación**: Dirección exacta
   - **Precio**: En tu moneda local
   - **Características**: Dormitorios, baños, cochera
   - **Contacto**: Teléfono directo
   - **USP**: Tu propuesta única (ej: "Acabados de Mármol")
   - **Urgencia**: Factor de conversión (ej: "Solo esta semana")
   - **CTA**: Llamado a la acción personalizado

### 5. **Elige Estilo Creativo**
   - **📸 Collage**: Múltiples fotos, alta conversión
   - **✨ Lujo**: Imagen única, diseño premium
   - **📋 Datos**: Infografía con detalles técnicos
   - **🏡 Estilo**: Conexión emocional
   - **💰 Inversión**: ROI y rentabilidad

### 6. **Instrucciones Personalizadas (Opcional)**
   - Especifica cambios creativos adicionales
   - Usa referencias geográficas (calles, avenidas)
   - Pide enfoque específico en ciertas áreas

### 7. **Genera tu Anuncio**
   - Haz clic en "Generar Anuncio"
   - Espera a que se procese (30-60 segundos)
   - Verás el resultado en HD 1080x1080px

### 8. **Refina si es Necesario**
   - Click en "Refinar" para hacer ajustes
   - Usa el pincel para marcar áreas específicas
   - Describe el cambio que quieres hacer
   - Click en "Aplicar Cambios"

### 9. **Descarga tu Anuncio**
   - Click en "Descargar"
   - Se guardará como `honne-anuncio.png`

## 🎨 Paleta de Colores

| Color | Código | Uso |
|-------|--------|-----|
| Blanco | #FFFFFF | Fondo principal |
| Negro | #000000 | Texto y acentos |
| Naranja | #F27D26 | Marca Honne |
| Amarillo | #FFD700 | Precios y CTAs |

## 📱 Soporte de Dispositivos

- **Desktop**: Experiencia completa optimizada
- **Tablet**: Layout adaptado, gestos táctiles
- **Mobile**: Diseño comprimido, interfaz simplificada
- **Pantallas pequeñas**: Navegación vertical optimizada

## 🔐 Privacidad y Seguridad

- Las imágenes se procesan únicamente para generar anuncios
- No se almacenan datos en el servidor
- Las claves API se manejan de forma segura
- Conexión HTTPS recomendada

## 🐛 Solución de Problemas

### La generación falla
- Verifica que tienes imágenes cargadas
- Asegúrate de que las imágenes no son demasiado grandes
- Revisa que tu API key es válida

### Las imágenes se ven pixeladas
- Carga imágenes de mayor resolución
- Intenta con formatos PNG o JPEG de calidad alta

### El refinamiento no funciona
- Asegúrate de escribir instrucciones claras
- Usa el pincel si necesitas cambios en áreas específicas
- Evita instrucciones contradictorias

### Problemas de responsividad
- Actualiza tu navegador
- Limpia el caché del navegador
- Intenta en modo incógnito

## 🛠️ Stack Tecnológico

- **Frontend**: React 19, TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS v4
- **Animaciones**: Framer Motion
- **AI**: Google Gemini 2.5 Flash Image
- **Icons**: Lucide React
- **State**: React Hooks

## 📚 Documentación

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Vite](https://vitejs.dev)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios mayores:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 📞 Soporte

Para soporte técnico o reportar bugs:
- Abre un issue en el repositorio
- Contacta al equipo de desarrollo
- Consulta la documentación en [AI Studio](https://ai.studio)

## 🙏 Créditos

Desarrollado con ❤️ para Honne Inmobiliaria.

---

**© 2026 HONNE INMOBILIARIA. POWERED BY GEMINI 3.1 FLASH IMAGE.**
