# Manual Completo - Plataforma Filadelfia React

## Parte 3: Stores y Gestión de Estado

---

## 📋 Tabla de Contenidos

1. [Introducción a Zustand](#introducción-a-zustand)
2. [Estructura de un Store](#estructura-de-un-store)
3. [Auth Store](#auth-store)
4. [Transacciones Store](#transacciones-store)
5. [Otros Stores](#otros-stores)
6. [Uso de Stores en Componentes](#uso-de-stores-en-componentes)
7. [Persistencia de Estado](#persistencia-de-estado)

---

## 1. Introducción a Zustand

**Zustand** es una librería minimalista de gestión de estado para React. A diferencia de Redux, no requiere:
- ❌ Providers
- ❌ Reducers
- ❌ Actions creators
- ❌ Boilerplate excesivo

### Ventajas

✅ **Simple**: API directa y fácil de entender  
✅ **TypeScript**: Soporte nativo completo  
✅ **Rendimiento**: Re-renders optimizados automáticamente  
✅ **Persistencia**: Middleware integrado para localStorage  
✅ **Sin Context**: No necesita wrappers ni providers  

### Instalación

```bash
npm install zustand
```

---

## 2. Estructura de un Store

Un store de Zustand típico tiene:

```typescript
import { create } from 'zustand'

interface MiStore {
  // 1. Estado
  datos: any[]
  loading: boolean
  error: string | null
  
  // 2. Acciones (funciones que modifican el estado)
  setDatos: (datos: any[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useMiStore = create<MiStore>((set) => ({
  // 3. Estado inicial
  datos: [],
  loading: false,
  error: null,
  
  // 4. Implementación de acciones
  setDatos: (datos) => set({ datos }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
```

### Componentes de un Store

1. **Interface**: Define el tipo del estado y acciones
2. **Estado inicial**: Valores por defecto
3. **Acciones**: Funciones que modifican el estado usando `set()`
4. **Hook personalizado**: `useMiStore` para usar en componentes

---

## 3. Auth Store

**Archivo:** `src/stores/auth.store.ts`

### Propósito

Gestiona el estado de autenticación del usuario:
- Usuario actual
- Token JWT
- Estado de autenticación
- Estados de carga y error

### Estructura

```typescript
interface AuthStore {
  // Estado
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Acciones
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  clearError: () => void
}
```

### Tipo User

```typescript
interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'usuario' | 'contador'
  sede_id: string
  sede_nombre: string
  sede_lider: string
  created_at: string
}
```

### Persistencia

El Auth Store usa el middleware `persist` para guardar en localStorage:

```typescript
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'auth-store', // Clave en localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

**Campos persistidos:**
- `user`
- `token`
- `isAuthenticated`

**Campos NO persistidos:**
- `isLoading`
- `error`

### Uso en Componentes

```typescript
import { useAuthStore } from '@/stores/auth.store'

function MiComponente() {
  // Obtener estado
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  // Obtener acciones
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  
  // Uso
  if (!isAuthenticated) {
    return <div>No autenticado</div>
  }
  
  return (
    <div>
      <p>Bienvenido, {user?.full_name}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}
```

### Acceso fuera de Componentes

```typescript
// En servicios o utilidades
import { useAuthStore } from '@/stores/auth.store'

const { user } = useAuthStore.getState()
const rol = user?.role
```

---

## 4. Transacciones Store

**Archivo:** `src/stores/transacciones.store.ts`

### Propósito

Gestiona el estado de transacciones:
- Lista de transacciones
- Filtros aplicados
- Estadísticas calculadas
- Estados de carga (datos, stats, export)

### Estructura

```typescript
interface TransaccionesState {
  // Data
  transacciones: TransaccionCompleta[]
  filters: TransaccionesFilters
  stats: TransaccionesStats | null
  
  // Loading states
  loading: boolean
  loadingStats: boolean
  loadingExport: boolean
  
  // Error
  error: string | null
  
  // Actions
  setTransacciones: (transacciones: TransaccionCompleta[]) => void
  addTransaccion: (transaccion: TransaccionCompleta) => void
  updateTransaccion: (id: string, transaccion: TransaccionCompleta) => void
  removeTransaccion: (id: string) => void
  clearTransacciones: () => void
  
  setFilters: (filters: TransaccionesFilters) => void
  clearFilters: () => void
  
  setStats: (stats: TransaccionesStats) => void
  
  setLoading: (loading: boolean) => void
  setLoadingStats: (loading: boolean) => void
  setLoadingExport: (loading: boolean) => void
  setError: (error: string | null) => void
}
```

### Acciones Principales

#### `setTransacciones(transacciones)`

Reemplaza toda la lista de transacciones.

```typescript
const setTransacciones = useTransaccionesStore(
  (state) => state.setTransacciones
)

setTransacciones(nuevasTransacciones)
```

#### `addTransaccion(transaccion)`

Agrega una transacción al inicio de la lista.

```typescript
addTransaccion: (transaccion) =>
  set((state) => ({
    transacciones: [transaccion, ...state.transacciones],
  }))
```

#### `updateTransaccion(id, transaccion)`

Actualiza una transacción específica.

```typescript
updateTransaccion: (id, transaccion) =>
  set((state) => ({
    transacciones: state.transacciones.map((t) =>
      t.id === id ? transaccion : t
    ),
  }))
```

#### `removeTransaccion(id)`

Elimina una transacción de la lista.

```typescript
removeTransaccion: (id) =>
  set((state) => ({
    transacciones: state.transacciones.filter((t) => t.id !== id),
  }))
```

### Uso en Páginas

```typescript
function TransaccionesPage() {
  const transacciones = useTransaccionesStore((s) => s.transacciones)
  const loading = useTransaccionesStore((s) => s.loading)
  const setTransacciones = useTransaccionesStore((s) => s.setTransacciones)
  const setLoading = useTransaccionesStore((s) => s.setLoading)
  
  useEffect(() => {
    const cargarTransacciones = async () => {
      setLoading(true)
      try {
        const data = await TransaccionesService.obtenerTodas()
        setTransacciones(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    cargarTransacciones()
  }, [])
  
  if (loading) return <LoadingSpinner />
  
  return (
    <div>
      {transacciones.map(t => (
        <TransaccionCard key={t.id} transaccion={t} />
      ))}
    </div>
  )
}
```

---

## 5. Otros Stores

### 5.1 Personas Store

**Archivo:** `src/stores/personas.store.ts`

Gestiona:
- Lista de personas
- Estados de carga y error
- Acciones CRUD

```typescript
interface PersonasStore {
  personas: Persona[]
  loading: boolean
  error: string | null
  
  setPersonas: (personas: Persona[]) => void
  addPersona: (persona: Persona) => void
  updatePersona: (id: string, persona: Persona) => void
  removePersona: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}
```

### 5.2 Actividades Store

**Archivo:** `src/stores/actividades.store.ts`

Gestiona:
- Lista de actividades
- Estados de carga
- Acciones CRUD

### 5.3 Categorías Store

**Archivo:** `src/stores/categorias.store.ts`

Gestiona:
- Lista de categorías
- Filtrado por tipo (ingreso/egreso)
- Acciones CRUD

---

## 6. Uso de Stores en Componentes

### 6.1 Selección de Estado

**Seleccionar campos específicos** (recomendado):

```typescript
// ✅ Solo re-renderiza si cambia 'user'
const user = useAuthStore((state) => state.user)
```

**Seleccionar todo el estado** (no recomendado):

```typescript
// ❌ Re-renderiza en CUALQUIER cambio del store
const store = useAuthStore()
```

### 6.2 Selección Múltiple

```typescript
// Opción 1: Múltiples hooks
const user = useAuthStore((state) => state.user)
const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

// Opción 2: Selector con objeto (shallow comparison)
import { shallow } from 'zustand/shallow'

const { user, isAuthenticated } = useAuthStore(
  (state) => ({ 
    user: state.user, 
    isAuthenticated: state.isAuthenticated 
  }),
  shallow
)
```

### 6.3 Acciones

```typescript
// Obtener acción
const logout = useAuthStore((state) => state.logout)

// Usar en evento
<button onClick={logout}>Cerrar sesión</button>

// Usar en función
const handleLogout = async () => {
  await AuthService.logout()
  logout() // Limpia el store
}
```

### 6.4 Patrón Completo

```typescript
function MiComponente() {
  // Estado
  const transacciones = useTransaccionesStore((s) => s.transacciones)
  const loading = useTransaccionesStore((s) => s.loading)
  const error = useTransaccionesStore((s) => s.error)
  
  // Acciones
  const setTransacciones = useTransaccionesStore((s) => s.setTransacciones)
  const setLoading = useTransaccionesStore((s) => s.setLoading)
  const setError = useTransaccionesStore((s) => s.setError)
  
  // Efecto para cargar datos
  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await MiServicio.obtener()
        setTransacciones(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])
  
  // Renderizado condicional
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return <MiLista items={transacciones} />
}
```

---

## 7. Persistencia de Estado

### 7.1 Middleware Persist

Zustand incluye un middleware para persistir estado en localStorage:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useMiStore = create<MiStore>()(
  persist(
    (set) => ({
      // Estado y acciones
    }),
    {
      name: 'mi-store-key', // Clave en localStorage
      partialize: (state) => ({
        // Solo estos campos se persisten
        campo1: state.campo1,
        campo2: state.campo2,
      }),
    }
  )
)
```

### 7.2 Cuándo Persistir

**Persistir:**
- ✅ Datos de autenticación (user, token)
- ✅ Preferencias de usuario
- ✅ Configuraciones
- ✅ Filtros seleccionados

**NO persistir:**
- ❌ Estados de carga (loading)
- ❌ Errores temporales
- ❌ Datos que cambian frecuentemente
- ❌ Datos sensibles (contraseñas)

### 7.3 Limpiar Persistencia

```typescript
// Limpiar un store específico
localStorage.removeItem('auth-store')

// Limpiar todo
localStorage.clear()
```

### 7.4 Migración de Versiones

Si cambias la estructura del store:

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'mi-store',
    version: 1, // Incrementar cuando cambies la estructura
    migrate: (persistedState: any, version: number) => {
      if (version === 0) {
        // Migrar de v0 a v1
        return {
          ...persistedState,
          nuevocampo: 'valor-default',
        }
      }
      return persistedState
    },
  }
)
```

---

## 📌 Resumen Parte 3

En esta tercera parte hemos cubierto:

✅ Introducción a Zustand y sus ventajas  
✅ Estructura de un store  
✅ Auth Store con persistencia  
✅ Transacciones Store con acciones CRUD  
✅ Otros stores (personas, actividades, categorías)  
✅ Uso de stores en componentes  
✅ Selección optimizada de estado  
✅ Persistencia con localStorage  

---

**Continúa en:** [Parte 4 - Componentes y Páginas](./MANUAL_PARTE_4.md)
