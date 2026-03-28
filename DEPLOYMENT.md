# Guía de Deployment

## Deployment en Vercel

Honne Inmobiliaria Ad Creator está optimizado para deployment en Vercel y puede estar listo para producción en minutos.

### Requisitos Previos

- Cuenta en [Vercel](https://vercel.com) (gratis)
- Repositorio en GitHub, GitLab o Bitbucket
- API Key de Google Gemini

### Pasos para Deployar

#### 1. Preparar el Repositorio

```bash
# Asegúrate de tener todo commiteado
git status
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Conectar a Vercel

**Opción A: Usando Vercel Dashboard**

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "New Project"
3. Selecciona tu repositorio
4. Vercel detectará automáticamente que es un proyecto Vite
5. Haz clic en "Deploy"

**Opción B: Usando Vercel CLI**

```bash
# Instala Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### 3. Configurar Variables de Entorno

En el dashboard de Vercel:

1. Ve a tu proyecto → Settings → Environment Variables
2. Añade la variable:
   - **Nombre**: `GEMINI_API_KEY`
   - **Valor**: Tu API key de Google Gemini
3. Selecciona los ambientes: Production, Preview, Development
4. Haz clic en "Save"

#### 4. Re-deploy

Después de añadir las variables de entorno:

```bash
vercel --prod
```

O simplemente haz un nuevo push a tu rama principal.

### Configuración de Vercel.json

El proyecto incluye optimizaciones automáticas. Si necesitas ajustes adicionales, crea un `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "GEMINI_API_KEY": "@gemini_api_key"
  }
}
```

### Variables de Entorno Recomendadas

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `GEMINI_API_KEY` | Sí | API key de Google Gemini |
| `NODE_ENV` | No | Desarrollo o producción |

### Dominio Personalizado

1. Ve a Settings → Domains
2. Añade tu dominio personalizado
3. Sigue las instrucciones de DNS
4. Verifica el dominio

### CI/CD Automático

Vercel despliega automáticamente:

- **Commits a main**: Deployment a producción
- **Pull Requests**: Preview deployments
- **Preview de Branches**: Cada rama tiene su URL única

### Optimizaciones Incluidas

- ✅ Compresión automática de assets
- ✅ Image optimization
- ✅ CSS minification
- ✅ JS bundling
- ✅ Cache headers optimizados
- ✅ Edge caching

### Monitoreo

1. Ve a Analytics en el dashboard
2. Monitorea:
   - Core Web Vitals
   - Performance
   - Error rates
   - Usage

### Troubleshooting

#### Error: "GEMINI_API_KEY is not set"

**Solución**: Verifica que agregaste la variable en Environment Variables y re-deployó después.

#### Build falla con "Module not found"

**Solución**: 
```bash
# Limpia y reinstala
npm ci
npm run build
```

#### Deployment muy lento

**Solución**: Verifica que no estés incluyendo `node_modules` en el repositorio. Añade a `.gitignore`:

```
node_modules/
dist/
.env.local
```

#### La aplicación se ve rota en producción

**Solución**: Limpia cache de Vercel y re-deploy:

```bash
vercel env pull # Descarga las env vars
npm run build
vercel --prod
```

### Performance

El sitio debería tener estos métricas:

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

### Escala y Límites

- **Funciones Serverless**: Máximo 60 segundos
- **Tamaño de deployment**: Máximo 250MB
- **Requests concurrentes**: Sin límite
- **Bandwidth**: Incluido

### Rollback

Si necesitas volver a una versión anterior:

1. Ve a Deployments
2. Haz clic en el deployment anterior
3. Haz clic en "Promote to Production"

### Security

✅ **Implementado**:
- HTTPS automático
- Headers de seguridad
- CORS configurado
- Rate limiting incluido
- DDoS protection

### Costos

- **Hobby (Gratis)**: Perfecto para desarrollo
- **Pro ($20/mes)**: Recomendado para producción
- **Enterprise**: Para uso a gran escala

### Próximos Pasos

1. Configura un nombre de dominio
2. Habilita Google Analytics
3. Configura alertas de error
4. Establece backups automáticos
5. Documenta el proceso

### Recursos Adicionales

- [Vercel Docs](https://vercel.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Google Gemini API](https://ai.google.dev)

---

**¿Necesitas más información?** Contacta al equipo de soporte o revisa la documentación oficial de Vercel.
