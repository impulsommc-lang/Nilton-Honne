# Guía de Desarrollo

Esta guía te ayudará a entender la arquitectura del proyecto y contribuir eficientemente.

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── Header.tsx
│   ├── PropertyGallery.tsx
│   ├── PreviewPanel.tsx
│   ├── DetailsForm.tsx
│   ├── CustomInstructions.tsx
│   ├── StrategicInsight.tsx
│   ├── ReferenceImages.tsx
│   ├── LogoUpload.tsx
│   ├── RefinementPanel.tsx
│   └── index.ts
├── types/              # Definiciones de tipos TypeScript
│   └── index.ts
├── lib/                # Utilidades y funciones compartidas
│   └── utils.ts
├── App.tsx             # Componente principal
├── main.tsx            # Entry point
└── index.css           # Estilos globales
```

## 🏗️ Arquitectura

### Patrón de Componentes

Cada componente sigue este patrón:

```typescript
import React from 'react';
import { SomeIcon } from 'lucide-react';

interface ComponentProps {
  // Props requeridas
  requiredProp: string;
  // Props opcionales
  optionalProp?: boolean;
}

export const MyComponent: React.FC<ComponentProps> = ({
  requiredProp,
  optionalProp = false
}) => {
  return (
    <div>
      {/* JSX aquí */}
    </div>
  );
};
```

### Convenciones

- **Nombres**: PascalCase para componentes, camelCase para funciones
- **Props**: Interface explícita para cada componente
- **Tipos**: Usar TypeScript strict mode
- **Estilos**: Tailwind CSS con utilidades personalizadas

## 🎨 Sistema de Diseño

### Colores

```css
/* Primary */
--color-primary: #F27D26;

/* Neutral */
--color-dark: #1A1A1A;
--color-light: #F8F9FA;

/* Accent */
--color-gold: #FFD700;
```

### Responsive Breakpoints

```
- Mobile: 0 - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+
```

Usa prefijos de Tailwind: `sm:`, `md:`, `lg:`, `xl:`

### Utilidades Personalizadas

```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-[#F27D26];
}

.card-hover {
  @apply transition-all duration-300 hover:shadow-lg hover:-translate-y-1;
}
```

## 🔄 Flujo de Estado

### Estado Local vs. Global

**Local** (useState):
- Valores booleanos (isOpen, isLoading)
- Datos temporales de formularios
- Estado de UI (focus, hover)

**Global** (props):
- Datos compartidos entre componentes
- State management (App.tsx)

```typescript
// ✅ Correcto: Estado local
const [isOpen, setIsOpen] = useState(false);

// ❌ Incorrecto: Pasar estado local profundamente anidado
// Usar context o state management en su lugar
```

## 🚀 Performance

### Optimizaciones Implementadas

1. **Lazy Loading**: Imágenes con `loading="lazy"`
2. **Memo**: Componentes que no necesitan actualizarse
3. **useCallback**: Funciones para event handlers
4. **Debounce**: Input handlers

```typescript
// Buena práctica
const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
  // Lógica aquí
}, [dependencies]);
```

## 📝 Escribir Componentes

### Template de Componente

```typescript
import React from 'react';
import { Icon } from 'lucide-react';

interface YourComponentProps {
  /** Descripción de la prop */
  title: string;
  /** Callback cuando ocurre algo */
  onAction?: (value: string) => void;
}

/**
 * Descripción clara del propósito del componente
 * @example
 * <YourComponent title="Example" />
 */
export const YourComponent: React.FC<YourComponentProps> = ({
  title,
  onAction
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">{title}</h3>
      {/* Contenido */}
    </div>
  );
};
```

## 🧪 Testing

### Testing Local

```bash
# Linter
npm run lint

# Build
npm run build

# Preview
npm run preview
```

### Casos de Prueba Manual

- [ ] Responsive en móvil, tablet, desktop
- [ ] Carga de imágenes funciona
- [ ] Generación de anuncios completa
- [ ] Refinamiento aplica cambios
- [ ] Descarga genera archivo
- [ ] Accesibilidad (tab navigation, screen readers)

## 📚 Dependencias Clave

| Package | Versión | Propósito |
|---------|---------|-----------|
| react | ^19.0.0 | Framework UI |
| tailwindcss | ^4.1.14 | Styling |
| framer-motion | ^12.38.0 | Animaciones |
| lucide-react | ^0.546.0 | Iconos |
| @google/genai | ^1.29.0 | AI API |

### Añadir Nuevas Dependencias

```bash
# Desarrollo
npm install --save-dev <package>

# Producción
npm install <package>
```

Asegúrate de:
1. Usar versiones estables
2. Documentar la razón en el PR
3. Actualizar CHANGELOG.md

## 🐛 Debugging

### Console Logs

```typescript
// Debug durante desarrollo
console.log("[v0] Variable value:", variable);

// Quitar antes de commit
```

### React DevTools

1. Instala [React DevTools](https://react-devtools-tutorial.vercel.app/)
2. Inspecciona componentes
3. Modifica props en tiempo real

### Vite Debug

```bash
# Debug mode
npm run dev -- --inspect-brk
```

## 🔒 Seguridad

### Mejores Prácticas

- ✅ Validar entrada de usuarios
- ✅ Sanitizar URLs
- ✅ No exposer API keys en client
- ✅ HTTPS en producción
- ✅ Headers de seguridad

### Sensible Data

```typescript
// ❌ Evitar
const apiKey = "sk-1234567";

// ✅ Correcto
const apiKey = process.env.GEMINI_API_KEY;
```

## 📖 Documentación

### Convenciones de Comentarios

```typescript
/**
 * Descripción breve del propósito
 * 
 * Descripción más detallada si es necesario
 * 
 * @param {type} name - Descripción del parámetro
 * @returns {type} Descripción del return
 * 
 * @example
 * const result = myFunction(arg);
 */
export function myFunction(arg: string): string {
  // Comentarios para lógica compleja
  return result;
}
```

## 🤝 Contribuciones

### Antes de Hacer Push

1. Prueba localmente: `npm run build`
2. Revisa los estilos de código
3. Actualiza CHANGELOG.md
4. Asegúrate de que TypeScript no tiene errores

```bash
npm run lint
```

### Workflow de PR

1. Crea una rama: `git checkout -b feature/my-feature`
2. Haz cambios
3. Commit con mensaje claro: `git commit -m "feat: add new feature"`
4. Push: `git push origin feature/my-feature`
5. Abre PR en GitHub

### Commit Messages

Usa el formato Conventional Commits:

```
feat: descripción de la nueva feature
fix: descripción de la corrección
docs: cambios en documentación
style: cambios de estilos (sin lógica)
refactor: refactorización de código
perf: mejoras de performance
test: añadir o actualizar tests
```

## 🚀 Workflow de Desarrollo

### Setup Inicial

```bash
git clone <repository>
cd honne-inmobiliaria-ad-creator
npm install
cp .env.local.example .env.local
# Añade tu GEMINI_API_KEY
npm run dev
```

### Desarrollo Diario

```bash
# Inicia servidor con HMR
npm run dev

# En otra terminal, build de TypeScript
npm run lint

# Antes de commit
npm run build
```

## 📋 Checklist para Releases

- [ ] Tests pasan localmente
- [ ] Build funciona (`npm run build`)
- [ ] Cambios documentados en CHANGELOG.md
- [ ] Versión actualizada en package.json
- [ ] PR revisado y aprobado
- [ ] Merge a main
- [ ] Tag creado: `git tag v2.x.x`
- [ ] Deploy a producción verificado

## 🆘 Troubleshooting Común

### "Module not found"
```bash
npm install
npm run build
```

### HMR no funciona
```bash
# Reinicia el servidor
npm run dev
```

### TypeScript errors
```bash
npm run lint
```

### Estilos no se aplican
- Verifica que el archivo CSS está importado
- Revisa la especificidad de Tailwind
- Limpia caché del navegador

## 🎓 Recursos Útiles

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Vite Guide](https://vitejs.dev/guide/)

---

**¿Preguntas?** Abre un issue en GitHub o contacta al equipo de desarrollo.

**Gracias por contribuir a Honne Inmobiliaria!** 🙏
