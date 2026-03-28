# Requisitos de Imágenes para Generación de Anuncios

## Especificaciones Técnicas

### Tamaño de Archivo
- **Máximo permitido**: 5 MB por imagen
- **Recomendado**: 1-3 MB
- **Mínimo**: 50 KB

### Dimensiones
- **Mínimo**: 320 x 240 píxeles
- **Máximo**: 4096 x 4096 píxeles
- **Recomendado**: 1200 x 900 píxeles o superior

### Formatos Soportados
✓ JPEG/JPG (Recomendado)
✓ PNG
✓ WebP
✓ GIF

### Calidad de Imagen
- Resolución mínima: 72 DPI
- Resolución recomendada: 150+ DPI
- Evita imágenes comprimidas excesivamente

## Errores Comunes y Soluciones

### Error: "El archivo es demasiado grande"

**Problema**: La imagen supera 5 MB

**Soluciones**:
1. Comprime la imagen usando:
   - TinyPNG (tinypng.com)
   - Compressor.io
   - ImageOptim (Mac)
   - Photoshop: File > Export As

2. Reduce las dimensiones:
   - Si es 4000x3000px, cámbiala a 2000x1500px
   - Usa ImageResizer o Pixlr.com

3. Cambia el formato:
   - Intenta WebP (mejor compresión)
   - JPEG ofrece mejor compresión que PNG

### Error: "Formato no soportado"

**Problema**: Intentaste subir un formato no permitido (BMP, TIFF, ICO, etc.)

**Soluciones**:
1. Convierte la imagen:
   - CloudConvert.com
   - Online-Convert.com
   - Photoshop: File > Export As > JPEG

2. Formatos recomendados (en orden):
   - JPEG (mejor para fotografías)
   - PNG (mejor para imágenes con transparencia)
   - WebP (mejor compresión general)

### Error: "No se pudo cargar la imagen"

**Problema**: El archivo está corrupto o dañado

**Soluciones**:
1. Prueba con otra imagen similar
2. Reabre el archivo en un editor de imágenes:
   - Photoshop
   - GIMP (gratuito)
   - Paint.net
3. Exporta nuevamente en JPEG con máxima calidad

### Error: "La imagen comprimida es demasiado pequeña"

**Problema**: El algoritmo de compresión resultó en datos insuficientes

**Soluciones**:
1. Usa imágenes con más detalle/contenido
2. Reduce menos la compresión (aumenta calidad)
3. Intenta con diferentes dimensiones
4. Verifica que el archivo original no esté vacío

### Error: "Tiempo de carga de imagen agotado"

**Problema**: La imagen tardó demasiado en procesarse (>10 segundos)

**Soluciones**:
1. Usa imágenes más pequeñas (<2MB)
2. Reduce las dimensiones
3. Comprime más la imagen
4. Intenta desde una conexión más rápida
5. Reinicia la aplicación

## Recomendaciones para Mejores Resultados

### Fotografías de Propiedad (Fachada, Sala, etc.)

**Características ideales**:
- Buena iluminación natural
- Ángulo claro sin obstrucciones
- Colores naturales (sin filtros extremos)
- Sin personas visibles
- Sin elementos movibles de fondo

**Tamaño recomendado**: 1200 x 900 px - 2000 x 1500 px

**Formato recomendado**: JPEG con 85-90% de calidad

**Ejemplo de nombres**:
- fachada-frente.jpg
- sala-principal.jpg
- cocina-moderna.jpg

### Imágenes de Referencia (Inspiración de Diseño)

**Características ideales**:
- Diseños de Canva, Figma o similar
- Screenshots de anuncios exitosos
- Layouts que quieres replicar
- Paletas de color que te gustan

**Tamaño recomendado**: 1000 x 1000 px (1:1 es ideal)

**Formato recomendado**: PNG (conserva calidad)

### Logo de Inmobiliaria

**Características ideales**:
- Fondo transparente (PNG)
- Sin fondo de color
- Resolución alta
- Proporciones horizontales (2:1)

**Tamaño recomendado**: 500 x 250 px - 1000 x 500 px

**Formato recomendado**: PNG con transparencia

## Herramientas Recomendadas

### Compresión Online
- **TinyPNG** (tinypng.com) - Mejor compresión
- **Compressor.io** - Rápido y fácil
- **ImageOptim** (Mac) - Integrado en el SO

### Redimensionamiento
- **Pixlr.com** - Editor online
- **Canva** (canva.com) - Más que redimensionamiento
- **ImageResizer** - Software específico

### Conversión de Formatos
- **CloudConvert** (cloudconvert.com)
- **Online-Convert** (online-convert.com)
- **Zamzar** (zamzar.com)

### Edición Completa
- **Photoshop** - Profesional ($)
- **GIMP** - Gratuito
- **Paint.NET** - Gratuito y rápido
- **Affinity Photo** - Alternativa profesional ($)

## Checklist Antes de Generar

Antes de intentar generar un anuncio, verifica:

- [ ] Cargaste al menos UNA imagen de propiedad
- [ ] Cada archivo es menor a 5 MB
- [ ] Todas las imágenes tienen formato soportado (JPG, PNG, WebP)
- [ ] Las dimensiones son entre 320x240 y 4096x4096 píxeles
- [ ] Las imágenes no están corruptas (abrelas en un editor)
- [ ] Tienes conexión a internet estable
- [ ] La API Key de Gemini está configurada correctamente

## Mejora de Imágenes Paso a Paso

### Para Fotografías de Baja Calidad

1. **Abre en GIMP o Photoshop**
2. **Ajusta el brillo/contraste**:
   - Image > Brightness-Contrast (GIMP)
   - Image > Adjustments > Brightness/Contrast (Photoshop)
3. **Mejora nitidez**:
   - Filters > Enhance > Sharpen (GIMP)
   - Filter > Sharpen > Unsharp Mask (Photoshop)
4. **Exporta como JPEG** con calidad 85-90%

### Para Imágenes Demasiado Grandes

1. **Abre en Pixlr.com o Photoshop**
2. **Ve a Image > Scale Image** (Photoshop) o **Edit > Resize** (Pixlr)
3. **Establece anchura a 1500-2000 píxeles**
4. **Mantén proporción (cadena vinculada)**
5. **Exporta como JPEG** con compresión normal

## Solucionar Problemas de Generación

Si aún recibes errores después de verificar todo:

1. **Intenta con una imagen diferente**
   - A veces una imagen específica es problemática
   - Prueba con fotografías de otro dispositivo

2. **Reduce significativamente el tamaño**
   - Intenta con 800x600px
   - Comprime a máximo (baja calidad)

3. **Limpia cache del navegador**
   - Chrome: Settings > Privacy > Clear browsing data
   - Firefox: History > Clear Recent History
   - Safari: History > Clear History

4. **Intenta en otro navegador**
   - Chrome (recomendado)
   - Firefox
   - Safari
   - Edge

5. **Reinicia la aplicación**
   - Cierra todas las pestañas
   - Limpia cache
   - Abre de nuevo

## Contacto para Problemas

Si persisten los problemas después de todos estos pasos:
1. Toma una captura del error
2. Anota el tamaño y tipo de imagen
3. Contacta al equipo de soporte con estos detalles
