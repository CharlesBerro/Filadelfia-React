# Manual Completo - Plataforma Filadelfia React

## Parte 4: Componentes y Páginas

---

## 📋 Tabla de Contenidos

1. [Arquitectura de Componentes](#arquitectura-de-componentes)
2. [Componentes de Layout](#componentes-de-layout)
3. [Componentes UI Base](#componentes-ui-base)
4. [Componentes de Dominio](#componentes-de-dominio)
5. [Páginas](#páginas)
6. [Rutas y Navegación](#rutas-y-navegación)
7. [Lazy Loading](#lazy-loading)

---

## 1. Arquitectura de Componentes

La aplicación organiza los componentes en una jerarquía clara:

```
components/
├── layout/          # Componentes de estructura (Header, Sidebar, Layout)
├── ui/              # Componentes UI reutilizables (Button, Input, Modal)
├── common/          # Componentes comunes compartidos
├── auth/            # Componentes de autenticación
├── personas/        # Componentes específicos de personas
├── transacciones/   # Componentes específicos de transacciones
├── actividades/     # Componentes específicos de actividades
├── categorias/      # Componentes específicos de categorías
├── sedes/           # Componentes específicos de sedes
├── usuarios/        # Componentes específicos de usuarios
├── reportes/        # Componentes de reportes
└── charts/          # Componentes de gráficos
```

### Principios de Organización

1. **Separación por responsabilidad**: Cada carpeta agrupa componentes relacionados
2. **Reutilización**: Componentes UI base son agnósticos del dominio
3. **Composición**: Componentes complejos se construyen con componentes simples
4. **Encapsulación**: Cada componente maneja su propia lógica

---

## 2. Componentes de Layout

### 2.1 Layout

**Archivo:** `src/components/layout/Layout.tsx`

Componente principal que estructura la aplicación.

```typescript
interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Estructura:**
```
┌─────────────────────────────────┐
│          Header                 │
├──────────┬──────────────────────┤
│          │                      │
│ Sidebar  │   Main Content       │
│          │   (children)         │
│          │                      │
└──────────┴──────────────────────┘
```

### 2.2 Header

**Archivo:** `src/components/layout/Header.tsx`

Barra superior con:
- Botón de menú (mobile)
- Logo/Título
- Información del usuario
- Botón de logout

```typescript
interface HeaderProps {
  onMenuToggle: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Botón menú mobile */}
        <button onClick={onMenuToggle} className="md:hidden">
          <Menu />
        </button>
        
        {/* Usuario */}
        <div className="flex items-center gap-3">
          <span>{user?.full_name}</span>
          <button onClick={logout}>Salir</button>
        </div>
      </div>
    </header>
  )
}
```

### 2.3 Sidebar

**Archivo:** `src/components/layout/Sidebar.tsx`

Menú lateral de navegación con:
- Logo
- Enlaces a páginas principales
- Indicador de ruta activa
- Responsive (drawer en mobile)

```typescript
interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  
  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/personas', icon: Users, label: 'Personas' },
    { path: '/transacciones', icon: DollarSign, label: 'Transacciones' },
    { path: '/actividades', icon: Calendar, label: 'Actividades' },
    // ...
  ]
  
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {menuItems.map(item => (
        <NavLink 
          key={item.path}
          to={item.path}
          className={location.pathname === item.path ? 'active' : ''}
        >
          <item.icon />
          {item.label}
        </NavLink>
      ))}
    </aside>
  )
}
```

### 2.4 ProtectedRoute

**Archivo:** `src/components/layout/ProtectedRoute.tsx`

Componente que protege rutas requiriendo autenticación.

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'usuario' | 'contador'
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, token, isLoading } = useAuthStore()
  
  // Mostrar loading mientras carga
  if (isLoading) {
    return <LoadingSpinner />
  }
  
  // Redirigir a login si no autenticado
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }
  
  // Verificar rol si es requerido
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}
```

**Uso:**
```typescript
<Route
  path="/usuarios"
  element={
    <ProtectedRoute requiredRole="admin">
      <UsuariosPage />
    </ProtectedRoute>
  }
/>
```

---

## 3. Componentes UI Base

### 3.1 Button

**Archivo:** `src/components/ui/Button.tsx`

Botón reutilizable con variantes.

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  onClick,
  children,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
```

**Uso:**
```typescript
<Button variant="primary" onClick={handleSave}>
  Guardar
</Button>

<Button variant="danger" loading={isDeleting}>
  Eliminar
</Button>
```

### 3.2 Input

**Archivo:** `src/components/ui/Input.tsx`

Campo de entrada con validación.

```typescript
interface InputProps {
  label?: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
}) => {
  return (
    <div className="form-group">
      {label && (
        <label>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'input-error' : ''}
      />
      
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}
```

### 3.3 Modal

**Archivo:** `src/components/ui/Modal.tsx`

Modal reutilizable.

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}
```

### 3.4 LoadingSpinner

**Archivo:** `src/components/ui/LoadingSpinner.tsx`

Indicador de carga.

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`spinner spinner-${size}`} />
      {text && <p className="mt-2">{text}</p>}
    </div>
  )
}
```

### 3.5 Card

**Archivo:** `src/components/ui/Card.tsx`

Contenedor con estilo de tarjeta.

```typescript
interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-body">{children}</div>
    </div>
  )
}
```

### 3.6 FotoUploader

**Archivo:** `src/components/ui/FotoUploader.tsx`

Componente para subir y previsualizar fotos.

```typescript
interface FotoUploaderProps {
  currentUrl?: string | null
  onFileSelect: (file: File) => void
  onRemove?: () => void
}

export const FotoUploader: React.FC<FotoUploaderProps> = ({
  currentUrl,
  onFileSelect,
  onRemove,
}) => {
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
      setPreview(URL.createObjectURL(file))
    }
  }
  
  return (
    <div className="foto-uploader">
      {preview ? (
        <div className="preview">
          <img src={preview} alt="Preview" />
          <button onClick={onRemove}>Eliminar</button>
        </div>
      ) : (
        <label className="upload-area">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <span>Seleccionar foto</span>
        </label>
      )}
    </div>
  )
}
```

---

## 4. Componentes de Dominio

### 4.1 Transacciones

#### TransaccionesTable

Tabla de transacciones con filtros y acciones.

```typescript
interface TransaccionesTableProps {
  transacciones: TransaccionCompleta[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onAnular: (id: string) => void
}
```

#### TransaccionCard

Tarjeta individual de transacción.

#### TransaccionFilters

Formulario de filtros para transacciones.

### 4.2 Personas

#### PersonasTable

Tabla de personas con búsqueda y filtros.

#### PersonaCard

Tarjeta de persona con foto y datos principales.

#### PersonaForm

Formulario para crear/editar personas.

### 4.3 Actividades

#### ActividadesGrid

Grid de actividades con progreso.

#### ActividadCard

Tarjeta de actividad con barra de progreso.

---

## 5. Páginas

Las páginas son componentes que representan rutas completas.

### 5.1 Estructura de una Página

```typescript
export const MiPage: React.FC = () => {
  // 1. Hooks de estado
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 2. Hooks de stores
  const datos = useMiStore((s) => s.datos)
  const setDatos = useMiStore((s) => s.setDatos)
  
  // 3. Hooks de navegación
  const navigate = useNavigate()
  
  // 4. Efectos
  useEffect(() => {
    cargarDatos()
  }, [])
  
  // 5. Funciones
  const cargarDatos = async () => {
    setLoading(true)
    try {
      const data = await MiServicio.obtener()
      setDatos(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // 6. Renderizado condicional
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  // 7. Renderizado principal
  return (
    <Layout>
      <div className="container">
        <h1>Mi Página</h1>
        {/* Contenido */}
      </div>
    </Layout>
  )
}
```

### 5.2 Páginas Principales

| Página | Ruta | Descripción |
|--------|------|-------------|
| **HomePage** | `/` | Página de inicio pública |
| **LoginPage** | `/login` | Inicio de sesión |
| **DashboardPage** | `/dashboard` | Panel principal |
| **PersonasPage** | `/personas` | Lista de personas |
| **NuevaPersonaPage** | `/personas/nueva` | Crear persona |
| **PersonaDetallePage** | `/personas/:id` | Detalle de persona |
| **EditarPersonaPage** | `/personas/:id/editar` | Editar persona |
| **TransaccionesPage** | `/transacciones` | Lista de transacciones |
| **ActividadesPage** | `/actividades` | Lista de actividades |
| **CategoriasPage** | `/categorias` | Gestión de categorías |
| **ReportesPage** | `/reportes` | Reportes y estadísticas |
| **UsuariosPage** | `/usuarios` | Gestión de usuarios (admin) |
| **SedesPage** | `/sedes` | Gestión de sedes (admin) |

---

## 6. Rutas y Navegación

### 6.1 Configuración de Rutas

**Archivo:** `src/config/routes.tsx`

```typescript
export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          {/* Admin only */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute requiredRole="admin">
                <UsuariosPage />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### 6.2 Navegación Programática

```typescript
import { useNavigate } from 'react-router-dom'

function MiComponente() {
  const navigate = useNavigate()
  
  const handleClick = () => {
    navigate('/dashboard')
  }
  
  const handleBack = () => {
    navigate(-1) // Volver atrás
  }
  
  return (
    <button onClick={handleClick}>Ir al Dashboard</button>
  )
}
```

### 6.3 Parámetros de Ruta

```typescript
import { useParams } from 'react-router-dom'

function PersonaDetallePage() {
  const { id } = useParams<{ id: string }>()
  
  useEffect(() => {
    cargarPersona(id!)
  }, [id])
  
  // ...
}
```

---

## 7. Lazy Loading

### 7.1 ¿Qué es Lazy Loading?

Lazy loading carga componentes solo cuando se necesitan, reduciendo el tamaño del bundle inicial.

### 7.2 Implementación

```typescript
import { lazy, Suspense } from 'react'

// Lazy load
const DashboardPage = lazy(() => 
  import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage }))
)

// Uso con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <DashboardPage />
</Suspense>
```

### 7.3 Beneficios

✅ **Carga inicial más rápida**: Solo se carga el código necesario  
✅ **Mejor rendimiento**: Divide el bundle en chunks  
✅ **Mejor UX**: Usuario ve contenido más rápido  

### 7.4 Cuándo Usar

- ✅ Páginas completas
- ✅ Componentes grandes y complejos
- ✅ Componentes usados condicionalmente
- ❌ Componentes pequeños y frecuentes

---

## 📌 Resumen Parte 4

En esta cuarta parte hemos cubierto:

✅ Arquitectura de componentes por responsabilidad  
✅ Componentes de layout (Layout, Header, Sidebar, ProtectedRoute)  
✅ Componentes UI base reutilizables  
✅ Componentes de dominio específicos  
✅ Estructura de páginas  
✅ Sistema de rutas y navegación  
✅ Lazy loading para optimización  

---

**Continúa en:** [Parte 5 - Optimizaciones y Mejores Prácticas](./MANUAL_PARTE_5.md)
