# ⚡ Quick Start - Inicio Rápido

## 🚀 En 5 Minutos

### 1️⃣ Instalación (2 min)
```bash
# Clonar repo
git clone <repository>
cd honne-inmobiliaria-ad-creator

# Instalar dependencias
npm install

# Configurar API Key
cp .env.local.example .env.local
# Edita .env.local y añade tu GEMINI_API_KEY
```

### 2️⃣ Iniciar (1 min)
```bash
npm run dev
```

### 3️⃣ Abre en Navegador (instant)
```
http://localhost:3000
```

### 4️⃣ Genera tu Primer Anuncio (2 min)
1. Sube logo
2. Sube 1+ imágenes de propiedad
3. Rellena detalles básicos
4. Click "Generar Anuncio"
5. ¡Descarga!

---

## 🎯 Primeros Pasos

### Obtener API Key
1. Ve a [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Copia la clave
4. Pégala en `.env.local`

### Preparar Imágenes
- Elige 3-5 fotos de calidad (1024x768px mínimo)
- Fachada, sala, cocina (essenciales)
- JPG o PNG (no GIF)

### Configurar Propiedad
```
Ubicación: Dirección exacta
Precio: En tu moneda
Dorm/Baños/Cochera: Números
Teléfono: Contacto directo
```

### Generar
- Elige estilo
- Click "Generar"
- Espera 30-60 seg
- ¡Descarga tu anuncio!

---

## 💡 Tips Rápidos

| Tip | Beneficio |
|-----|-----------|
| Usa fotos de calidad | Resultados mejores |
| Escribe instrucciones claras | IA entiende mejor |
| Prueba diferentes estilos | Encuentra el mejor |
| Refina específicamente | Ahorras tokens |
| Guarda configuraciones | Reutiliza después |

---

## 📞 Ayuda Rápida

### ¿Algo no funciona?
1. **Limpia caché**: Ctrl+Shift+Del
2. **Reinicia servidor**: Ctrl+C, `npm run dev`
3. **Verifica API Key**: En .env.local
4. **Lee FAQ**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Errores Comunes
```
"API Key not found"
→ Verifica .env.local tiene GEMINI_API_KEY

"No valid images"  
→ Sube al menos 1 imagen antes de generar

"Canvas too large"
→ Usa navegador diferente o dispositivo con más RAM

"Generation timeout"
→ Intenta con imágenes más pequeñas
```

---

## 🔗 Enlaces Útiles

- [Documentación Completa](DOCUMENTATION_INDEX.md)
- [README Detallado](README.md)
- [Solución de Problemas](TROUBLESHOOTING.md)
- [Guía de Desarrollo](DEVELOPMENT.md)
- [Guía de Deployment](DEPLOYMENT.md)

---

## ✅ Checklist Rápido

- [ ] Node.js instalado
- [ ] Repo clonado
- [ ] `npm install` ejecutado
- [ ] `.env.local` con API Key
- [ ] `npm run dev` corriendo
- [ ] Navegador en http://localhost:3000
- [ ] Imágenes preparadas
- [ ] ¡Primer anuncio generado!

---

## 🎓 Próximas Acciones

1. **Dominar Estilos**: Prueba los 5 estilos
2. **Refinamiento**: Aprende a editar anuncios
3. **Bulk**: Genera múltiples anuncios
4. **Deployment**: Despliega en Vercel
5. **Desarrollo**: Contribuye mejoras

---

## 🆘 Atascado?

1. **Lee el README**: 50% problemas resueltos
2. **Revisa FAQ**: 40% más resueltos
3. **Abre issue**: Ultimo 10%
4. **Contacta soporte**: Premium support

---

**¡Listo para empezar?** 🚀

Siguiente paso → [README.md](README.md) o [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
