# Troubleshooting & FAQ

## ❓ Preguntas Frecuentes

### ¿Cómo obtengo mi API Key de Google Gemini?

1. Ve a [ai.google.dev](https://ai.google.dev)
2. Haz clic en "Get API Key"
3. Selecciona o crea un proyecto
4. Copia tu API key
5. Pégala en `.env.local`

**Importante**: Nunca compartas tu API key públicamente.

### ¿Cuál es el costo de usar esta aplicación?

Google Gemini ofrece:
- **Free tier**: $0/mes con ciertos límites
- **Paid**: Basado en uso
- Ver [pricing](https://ai.google.dev/pricing)

Vercel ofrece:
- **Hobby**: Gratis
- **Pro**: $20/mes

### ¿Qué formatos de imagen se aceptan?

Se aceptan:
- JPEG / JPG
- PNG
- WebP
- GIF

**Tamaño recomendado**: 
- Mínimo: 800x600px
- Máximo: 5MB por imagen
- Mejor: 1200x800px

### ¿Cuántas imágenes puedo subir?

- **Máximo 5 imágenes** de propiedades
- **Ilimitadas imágenes** de referencia (pero se recomienda 1-3)

### ¿Puedo usar esta app sin internet?

No, necesitas conexión a internet para:
- Acceder a la interfaz web
- Llamar a la API de Gemini
- Descargar los anuncios

Puedes usar modo offline con PWA (próximamente).

### ¿Cuánto tiempo tarda en generar un anuncio?

- **Generación inicial**: 30-60 segundos
- **Refinamiento**: 20-40 segundos

Depende de:
- Tamaño de las imágenes
- Velocidad de internet
- Carga de los servidores de Google

---

## 🐛 Problemas Comunes

### "API Key not found" o "GEMINI_API_KEY is not set"

**Síntomas**:
- Página muestra error de configuración
- No puedes generar anuncios

**Soluciones**:
1. Verifica que `.env.local` existe
2. Asegúrate de que `GEMINI_API_KEY=tu_clave_aqui`
3. Reinicia el servidor: `npm run dev`
4. Abre en una ventana nueva

```bash
# Verificar que la variable está configurada
echo $GEMINI_API_KEY  # debe mostrar tu clave
```

### Las imágenes no se cargan

**Síntomas**:
- Botones de upload no funcionan
- Imágenes no se ven después de cargar

**Soluciones**:
1. Verifica el tamaño del archivo (máx 5MB)
2. Intenta con formato JPG en lugar de PNG
3. Limpia caché: Ctrl+Shift+Del
4. Abre en navegador diferente

```bash
# Verifica que el servidor está corriendo
npm run dev
```

### La generación falla con "No valid images"

**Síntomas**:
- Error al hacer clic en "Generar Anuncio"
- Mensaje "Por favor, sube al menos una imagen"

**Soluciones**:
1. Asegúrate de que cargaste al menos 1 imagen
2. Verifica que la imagen se ve en la galería
3. Intenta con una imagen diferente
4. Reinicia la página

### El anuncio se ve pixelado o borroso

**Síntomas**:
- Imagen descargada tiene baja calidad
- Texto no se ve nítido

**Soluciones**:
1. Carga imágenes de mayor resolución (min 1000px)
2. Usa JPEG de buena calidad en lugar de PNG comprimido
3. Intenta generar de nuevo
4. Verifica la iluminación de las fotos originales

### El refinamiento no hace cambios

**Síntomas**:
- Aplica cambios pero nada cambia en la imagen
- El pincel no dibuja

**Soluciones**:
1. Escribe instrucciones más claras y específicas
2. Usa el pincel para marcar el área a cambiar
3. Intenta cambios más radicales
4. Espera a que termine la generación anterior

### Problema de responsividad en móvil

**Síntomas**:
- Interfaz se ve cortada o mal organizada
- Botones muy pequeños o lejanos

**Soluciones**:
1. Actualiza tu navegador
2. Limpia caché y cookies
3. Prueba con navegador diferente
4. Abre en horizontal (landscape)

```
Navegadores soportados:
- Chrome/Edge: v90+
- Firefox: v88+
- Safari: v14+
- Mobile: Safari 14+, Chrome Mobile
```

### Error "Canvas is too large"

**Síntomas**:
- Error en la consola durante edición
- Pincel no funciona

**Soluciones**:
1. Cierra todas las pestañas excepto esta
2. Reinicia el navegador
3. Intenta en otro navegador
4. Usa dispositivo con más memoria

### Descarga no funciona

**Síntomas**:
- Clic en "Descargar" no hace nada
- No aparece el archivo

**Soluciones**:
1. Verifica configuración de downloads del navegador
2. Revisa carpeta "Descargas"
3. Intenta con otro navegador
4. Desactiva extensiones bloqueadoras

### Deployment falla en Vercel

**Síntomas**:
- Error 500
- Página no carga

**Soluciones**:
1. Verifica que `GEMINI_API_KEY` está en Environment Variables
2. Haz re-deploy: `vercel --prod`
3. Revisa logs en Vercel dashboard
4. Limpia caché de Vercel

---

## 🔧 Debugging

### Activar modo debug

Abre la consola del navegador (F12) para ver logs:

```javascript
// En consola
localStorage.debug = 'honne:*'
```

### Verificar variables de entorno

```bash
# Dev
echo $GEMINI_API_KEY

# Vercel
vercel env pull
cat .env.local
```

### Limpiar datos locales

```javascript
// En consola del navegador
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Tests de API

```bash
# Verificar que la API está disponible
curl https://api.google.dev/

# O en JavaScript
fetch('https://api.google.dev/').then(r => console.log(r.status))
```

---

## 📊 Rendimiento

### Checkpoints de Performance

Medir con DevTools (F12 → Network):

| Métrica | Target | Tu Valor |
|---------|--------|----------|
| First Paint | < 1s | ? |
| First Contentful Paint | < 1.5s | ? |
| Time to Interactive | < 3s | ? |
| Total Size | < 2MB | ? |

### Optimizaciones

Si está lento:

1. **Menos imágenes**: Carga máximo 2-3
2. **Imágenes comprimidas**: Usa Tinypng.com
3. **Limpia cache**: Ctrl+Shift+Del
4. **Cierra tabs**: Libera memoria
5. **Reinicia router**: Si está lento

---

## 🔒 Seguridad

### Proteger tu API Key

❌ **NUNCA**:
```javascript
// ❌ NO hagas esto
const apiKey = "sk-1234567890"
```

✅ **SIEMPRE**:
```
GEMINI_API_KEY=tu_clave_en_.env.local
# Nunca commits .env.local
```

### Si tu API Key se compromete

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Regenera tu API key
3. Actualiza `.env.local`
4. Redeploy la app

### Navegar de forma segura

- ✅ Usa HTTPS (vercel.app usa HTTPS automático)
- ✅ No uses WiFi público para datos sensibles
- ✅ Revisa URL antes de ingresar info
- ✅ Actualiza navegador regularmente

---

## 📞 Soporte

### Escalation de Issues

1. **Primer nivel**: Revisa esta guía
2. **Segundo nivel**: Revisa [README.md](README.md)
3. **Tercero**: Abre issue en GitHub
4. **Soporte Premium**: Contacta al equipo

### Reportar un Bug

Al reportar, incluye:

```markdown
## Bug Report

**Descripción**:
Lo que sucedió

**Pasos para reproducir**:
1. Haz esto
2. Luego esto
3. Entonces ocurre esto

**Resultado esperado**:
Qué debería pasar

**Resultado actual**:
Qué realmente pasó

**Entorno**:
- Navegador: Chrome 120
- Sistema: Windows 11
- API Key: Configurada ✓
```

### Obtener Logs

```bash
# Desarrollo
npm run dev 2>&1 | tee debug.log

# Build
npm run build 2>&1 | tee build.log

# Envía los logs en tu reporte
```

---

## 🚀 Optimizaciones Avanzadas

### Caché Local

La app automáticamente cacheará:
- Últimas 5 generaciones
- Configuración de usuario
- Imágenes cargadas

### Offloading a Worker

Para mejor rendimiento con muchas imágenes:

```javascript
// Web Worker (proximamente)
const worker = new Worker('imageProcessor.js');
worker.postMessage({images});
```

---

## 📋 Checklist para Troubleshooting

Cuando algo falla:

- [ ] ¿Tengo internet?
- [ ] ¿Es válida mi API key?
- [ ] ¿Actualicé el navegador?
- [ ] ¿Limpié caché/cookies?
- [ ] ¿El servidor está corriendo?
- [ ] ¿Son válidas mis imágenes?
- [ ] ¿Están todos los campos completos?
- [ ] ¿Esperé a que termine la generación anterior?
- [ ] ¿Probé en otro navegador?
- [ ] ¿Probé en otra red?

---

## 💡 Tips & Tricks

### Generar Rápido

1. Prepara tus imágenes de antemano
2. Usa instrucciones claras
3. Elige un estilo y mantente en él
4. Refina solo lo necesario

### Mejores Resultados

1. Usa fotos de buena calidad
2. Iluminación natural preferida
3. Planos claros de propiedades
4. Combina exterior e interior

### Ahorrar en API Calls

1. Generador inicial con estilos probados
2. Refina solo cambios específicos
3. Guarda versiones que funcionan
4. Reutiliza configuraciones

---

**¿Aún tienes problemas?** Contacta al soporte o abre un issue en GitHub. Estamos aquí para ayudarte. 🤝
