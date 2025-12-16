# Manual Completo - Plataforma Filadelfia React

## Parte 2: Servicios y Persistencia de Datos

---

## 📋 Tabla de Contenidos

1. [Capa de Servicios](#capa-de-servicios)
2. [Servicio de Autenticación](#servicio-de-autenticación)
3. [Servicio de Personas](#servicio-de-personas)
4. [Servicio de Transacciones](#servicio-de-transacciones)
5. [Servicio de Storage](#servicio-de-storage)
6. [Otros Servicios](#otros-servicios)
7. [Comunicación con Supabase](#comunicación-con-supabase)

---

## 1. Capa de Servicios

Los **servicios** son clases estáticas que encapsulan toda la lógica de comunicación con Supabase. Siguen el patrón **Service Layer** para separar la lógica de negocio de la presentación.

### Estructura de un Servicio

```typescript
export class MiServicio {
  // Métodos estáticos para operaciones CRUD
  static async obtenerTodos() { /* ... */ }
  static async obtenerPorId(id: string) { /* ... */ }
  static async crear(data: CreateDTO) { /* ... */ }
  static async actualizar(id: string, data: UpdateDTO) { /* ... */ }
  static async eliminar(id: string) { /* ... */ }
}
```

### Servicios Disponibles

| Servicio | Archivo | Responsabilidad |
|----------|---------|-----------------|
| **AuthService** | `auth.service.ts` | Autenticación y gestión de usuarios |
| **PersonasService** | `personas.service.ts` | CRUD de personas/miembros |
| **TransaccionesService** | `transacciones.service.ts` | Gestión de transacciones financieras |
| **ActividadesService** | `actividades.service.ts` | Gestión de actividades/eventos |
| **CategoriasService** | `categorias.services.ts` | Gestión de categorías |
| **SedesService** | `sedes.service.ts` | Gestión de sedes |
| **StorageService** | `storage.service.ts` | Subida y gestión de archivos |
| **ExportService** | `export.service.ts` | Exportación a PDF/Excel |

---

## 2. Servicio de Autenticación

**Archivo:** `src/services/auth.service.ts`

### Responsabilidades

- Login y registro de usuarios
- Recuperación de contraseña
- Gestión de sesiones
- Actualización de credenciales

### Métodos Principales

#### `login(email, password)`

Autentica un usuario y obtiene su perfil completo.

```typescript
const { user, token } = await AuthService.login(
  'usuario@ejemplo.com',
  'password123'
)
```

**Flujo:**
1. Autentica con Supabase Auth
2. Obtiene datos del perfil desde tabla `profiles`
3. Obtiene información de la sede
4. Retorna usuario completo con token JWT

**Retorno:**
```typescript
{
  user: {
    id: string
    email: string
    full_name: string
    role: 'admin' | 'usuario' | 'contador'
    sede_id: string
    sede_nombre: string
    sede_lider: string
    created_at: string
  },
  token: string
}
```

#### `signup(email, password, nombre)`

Registra un nuevo usuario.

```typescript
await AuthService.signup(
  'nuevo@ejemplo.com',
  'password123',
  'Juan Pérez'
)
```

**Flujo:**
1. Crea usuario en Supabase Auth
2. Inserta registro en tabla `users`
3. Envía email de verificación

#### `logout()`

Cierra la sesión del usuario actual.

```typescript
await AuthService.logout()
```

#### `resetPasswordForEmail(email)`

Envía correo de recuperación de contraseña.

```typescript
await AuthService.resetPasswordForEmail('usuario@ejemplo.com')
```

#### `updatePassword(newPassword)`

Actualiza la contraseña del usuario autenticado.

```typescript
await AuthService.updatePassword('nuevaPassword123')
```

#### `adminUpdateEmail(userId, newEmail)`

Permite a un admin actualizar el email de otro usuario.

```typescript
await AuthService.adminUpdateEmail(
  'user-id-123',
  'nuevo-email@ejemplo.com'
)
```

> **Nota:** Requiere función RPC `admin_update_user_email` en Supabase.

---

## 3. Servicio de Personas

**Archivo:** `src/services/personas.service.ts`

### Responsabilidades

- CRUD de personas/miembros
- Filtrado por permisos (usuarios ven solo sus personas, admins ven todas)
- Cálculo de cumpleaños próximos
- Formateo de nombres a Title Case

### Métodos Principales

#### `obtenerMias()`

Obtiene personas visibles para el usuario autenticado.

```typescript
const personas = await PersonasService.obtenerMias()
```

**Lógica de permisos:**
- **Admin:** Ve TODAS las personas
- **Otros roles:** Solo sus propias personas (`user_id = auth.uid()`)

#### `obtenerProximosCumpleanos()`

Obtiene personas con cumpleaños en los próximos 30 días.

```typescript
const proximos = await PersonasService.obtenerProximosCumpleanos()
```

**Algoritmo:**
1. Obtiene todas las personas del usuario
2. Calcula cumpleaños de este año
3. Si ya pasó, calcula para el próximo año
4. Filtra los que están dentro de 30 días
5. Ordena por fecha de cumpleaños

#### `crear(personaData)`

Crea una nueva persona.

```typescript
const persona = await PersonasService.crear({
  nombres: 'Juan',
  primer_apellido: 'Pérez',
  segundo_apellido: 'García',
  numero_id: '1234567890',
  fecha_nacimiento: '1990-01-15',
  telefono: '555-1234',
  email: 'juan@ejemplo.com',
  direccion: 'Calle 123',
  // ... otros campos
})
```

**Características:**
- ✅ Valida que la cédula sea única a nivel global
- ✅ Formatea nombres a Title Case
- ✅ Asigna automáticamente `user_id` y `sede_id`
- ✅ Sube foto a Storage si se proporciona

#### `actualizar(id, updates)`

Actualiza una persona existente.

```typescript
await PersonasService.actualizar('persona-id', {
  telefono: '555-9999',
  email: 'nuevo@ejemplo.com'
})
```

#### `eliminar(id)`

Elimina una persona y su foto de Storage.

```typescript
await PersonasService.eliminar('persona-id')
```

### Formateo de Nombres

El servicio incluye un método privado `formatToTitleCase` que convierte:

```
"juan perez" → "Juan Perez"
"MARÍA GARCÍA" → "María García"
```

---

## 4. Servicio de Transacciones

**Archivo:** `src/services/transacciones.service.ts`

### Responsabilidades

- CRUD de transacciones (ingresos/egresos)
- Auto-generación de números de transacción
- Anulación de transacciones (no eliminación)
- Filtros avanzados
- Cálculo de estadísticas

### Métodos Principales

#### `obtenerTodas(filters?)`

Obtiene transacciones con filtros opcionales.

```typescript
const transacciones = await TransaccionesService.obtenerTodas({
  tipo: 'ingreso',
  sede_id: 'sede-123',
  fecha_inicio: '2024-01-01',
  fecha_fin: '2024-12-31',
  categoria_id: 'cat-456',
  anulada: false
})
```

**Filtros disponibles:**
```typescript
interface TransaccionesFilters {
  tipo?: 'ingreso' | 'egreso'
  sede_id?: string
  categoria_id?: string
  actividad_id?: string
  fecha_inicio?: string
  fecha_fin?: string
  anulada?: boolean
}
```

**Características:**
- Incluye datos relacionados (categoría, actividad, sede)
- Respeta permisos de usuario
- Ordena por fecha descendente

#### `crear(transaccionData)`

Crea una nueva transacción.

```typescript
const transaccion = await TransaccionesService.crear({
  tipo: 'ingreso',
  monto: 1000,
  descripcion: 'Ofrenda dominical',
  fecha: '2024-12-01',
  categoria_id: 'cat-123',
  actividad_id: 'act-456', // opcional
  metodo_pago: 'efectivo'
})
```

**Flujo:**
1. Genera número de transacción automático (ej: `ING001`)
2. Asigna `user_id` y `sede_id` automáticamente
3. Inserta en BD
4. Retorna transacción completa con relaciones

#### `generarNumeroTransaccion(tipo)`

Genera número único de transacción.

```typescript
const numero = await TransaccionesService.generarNumeroTransaccion('ingreso')
// Retorna: "ING001", "ING002", etc.
```

**Formato:**
- Ingresos: `ING001`, `ING002`, `ING003`, ...
- Egresos: `EGR001`, `EGR002`, `EGR003`, ...

**Algoritmo:**
1. Obtiene la última transacción del tipo
2. Extrae el número secuencial
3. Incrementa en 1
4. Formatea con ceros a la izquierda (3 dígitos)

#### `anular(id, notasAnulacion)`

Anula una transacción (no la elimina).

```typescript
await TransaccionesService.anular(
  'trans-123',
  'Transacción duplicada'
)
```

**Características:**
- ✅ No elimina el registro (auditoría)
- ✅ Marca como `anulada: true`
- ✅ Guarda notas de anulación
- ✅ Registra fecha y usuario que anuló

#### `obtenerEstadisticas(filters?)`

Calcula estadísticas de transacciones.

```typescript
const stats = await TransaccionesService.obtenerEstadisticas({
  fecha_inicio: '2024-01-01',
  fecha_fin: '2024-12-31'
})
```

**Retorno:**
```typescript
{
  totalIngresos: 50000,
  totalEgresos: 30000,
  balance: 20000,
  cantidadIngresos: 25,
  cantidadEgresos: 15,
  promedioIngreso: 2000,
  promedioEgreso: 2000
}
```

---

## 5. Servicio de Storage

**Archivo:** `src/services/storage.service.ts`

### Responsabilidades

- Subida de archivos a Supabase Storage
- Conversión de imágenes a WebP
- Eliminación de archivos
- Reemplazo de archivos

### Configuración

```typescript
private static readonly BUCKET_NAME = 'fotos_personas'
```

### Métodos Principales

#### `uploadPersonaFoto(file, userId, personaId?)`

Sube una foto de persona.

```typescript
const url = await StorageService.uploadPersonaFoto(
  file,           // File object
  'user-123',     // ID del usuario
  'persona-456'   // ID de la persona (opcional)
)
```

**Flujo:**
1. Convierte imagen a WebP (compresión)
2. Genera nombre único: `{personaId}_{timestamp}.webp`
3. Sube a bucket en ruta: `{userId}/{fileName}`
4. Retorna URL pública

**Ventajas de WebP:**
- ✅ Reduce tamaño de archivo ~30-50%
- ✅ Mantiene calidad visual
- ✅ Acelera carga de imágenes

#### `convertToWebP(file, quality?)`

Convierte una imagen a formato WebP.

```typescript
const webpBlob = await StorageService.convertToWebP(file, 0.85)
```

**Parámetros:**
- `file`: Archivo de imagen original
- `quality`: Calidad de compresión (0-1), default: 0.85

#### `deleteFile(url)`

Elimina un archivo del Storage.

```typescript
await StorageService.deleteFile(
  'https://...supabase.co/storage/v1/object/public/fotos_personas/...'
)
```

#### `replacePersonaFoto(oldUrl, newFile, userId, personaId?)`

Reemplaza una foto existente.

```typescript
const newUrl = await StorageService.replacePersonaFoto(
  'https://old-photo-url.com/...',
  newFile,
  'user-123',
  'persona-456'
)
```

**Flujo:**
1. Elimina foto anterior
2. Sube nueva foto
3. Retorna nueva URL

---

## 6. Otros Servicios

### 6.1 ActividadesService

**Archivo:** `src/services/actividades.service.ts`

Gestiona actividades/eventos:
- CRUD de actividades
- Cálculo de progreso (basado en transacciones)
- Filtrado por sede y fechas
- Validación de eliminación (no permite si tiene transacciones)

### 6.2 CategoriasService

**Archivo:** `src/services/categorias.services.ts`

Gestiona categorías de transacciones:
- CRUD de categorías
- Filtrado por tipo (ingreso/egreso)
- Restricción de creación (solo admins)

### 6.3 SedesService

**Archivo:** `src/services/sedes.service.ts`

Gestiona sedes de la organización:
- CRUD de sedes
- Listado de todas las sedes
- Asignación de líderes

### 6.4 ExportService

**Archivo:** `src/services/export.service.ts`

Exporta datos a diferentes formatos:
- **PDF**: Usando jsPDF y jsPDF-AutoTable
- **Excel**: Usando xlsx
- Generación de reportes
- Códigos QR para transacciones

---

## 7. Comunicación con Supabase

### 7.1 Cliente de Supabase

**Archivo:** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 7.2 Operaciones CRUD

#### SELECT (Lectura)

```typescript
// Simple
const { data, error } = await supabase
  .from('personas')
  .select('*')

// Con relaciones
const { data, error } = await supabase
  .from('transacciones')
  .select(`
    *,
    categoria:categoria_id(nombre, tipo),
    actividad:actividad_id(nombre),
    sede:sede_id(nombre_sede)
  `)

// Con filtros
const { data, error } = await supabase
  .from('personas')
  .select('*')
  .eq('sede_id', 'sede-123')
  .gte('created_at', '2024-01-01')
  .order('nombres', { ascending: true })
```

#### INSERT (Creación)

```typescript
const { data, error } = await supabase
  .from('personas')
  .insert({
    nombres: 'Juan',
    primer_apellido: 'Pérez',
    numero_id: '1234567890'
  })
  .select()
  .maybeSingle()
```

#### UPDATE (Actualización)

```typescript
const { data, error } = await supabase
  .from('personas')
  .update({ telefono: '555-9999' })
  .eq('id', 'persona-123')
  .select()
```

#### DELETE (Eliminación)

```typescript
const { error } = await supabase
  .from('personas')
  .delete()
  .eq('id', 'persona-123')
```

### 7.3 Manejo de Errores

Todos los servicios implementan try-catch:

```typescript
static async obtenerPorId(id: string) {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Persona no encontrada')
    
    return data
  } catch (error: any) {
    throw error // Re-lanza para que el componente lo maneje
  }
}
```

### 7.4 Row Level Security (RLS)

Supabase implementa seguridad a nivel de fila. Ejemplos de políticas:

```sql
-- Usuarios ven solo sus propias personas
CREATE POLICY "Users can view own personas"
ON personas FOR SELECT
USING (auth.uid() = user_id);

-- Admins ven todas las personas
CREATE POLICY "Admins can view all personas"
ON personas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### 7.5 Autenticación JWT

Supabase maneja automáticamente los tokens JWT:

```typescript
// El token se incluye automáticamente en todas las peticiones
const { data: { session } } = await supabase.auth.getSession()
console.log(session.access_token) // JWT token
```

---

## 📌 Resumen Parte 2

En esta segunda parte hemos cubierto:

✅ Estructura y propósito de la capa de servicios  
✅ Servicio de autenticación completo  
✅ Servicio de personas con permisos  
✅ Servicio de transacciones con auto-numeración  
✅ Servicio de storage con conversión WebP  
✅ Otros servicios (actividades, categorías, sedes, export)  
✅ Comunicación con Supabase (CRUD, RLS, JWT)  

---

**Continúa en:** [Parte 3 - Stores y Gestión de Estado](./MANUAL_PARTE_3.md)
