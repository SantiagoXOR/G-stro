# Implementación de Autenticación con Clerk en Gëstro: Parte 2

## Índice

1. [Integración Profunda con Supabase](#integración-profunda-con-supabase)
2. [Modo Offline Mejorado](#modo-offline-mejorado)
3. [Manejo de Errores](#manejo-de-errores)
4. [Consideraciones de Seguridad](#consideraciones-de-seguridad)

## Integración Profunda con Supabase

### Diagrama de Flujo de Autenticación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Cliente    │◄────┤  Next.js    │◄────┤   Clerk     │
│  (Browser)  │     │  (Server)   │     │             │
│             │────►│             │────►│             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │             │
                    │  Supabase   │
                    │  Database   │
                    │             │
                    └─────────────┘
```

### Integración con la Arquitectura Actual

1. **Capa de Presentación**:
   - Componentes de UI de Clerk reemplazan los formularios personalizados
   - Middleware de Clerk reemplaza la protección de rutas personalizada

2. **Capa de Lógica de Negocio**:
   - Hooks de Clerk (`useUser`, `useClerk`, `useAuth`) reemplazan los hooks personalizados
   - Webhooks de Clerk sincronizan datos con Supabase

3. **Capa de Datos**:
   - Supabase sigue siendo la base de datos principal
   - Clerk almacena datos de autenticación y sesiones
   - Se utiliza el ID de usuario de Clerk como clave externa en Supabase

### Flujo de Datos

1. **Registro de Usuario**:
   - Usuario se registra a través de Clerk
   - Clerk crea el usuario y envía un webhook
   - El webhook crea un perfil en Supabase

2. **Inicio de Sesión**:
   - Usuario inicia sesión a través de Clerk
   - Clerk valida credenciales y crea una sesión
   - La aplicación obtiene el token de sesión

3. **Acceso a Datos**:
   - La aplicación utiliza el ID de usuario de Clerk
   - Las consultas a Supabase incluyen el ID de usuario
   - Las políticas RLS de Supabase validan el acceso

### Configuración del Cliente de Supabase

```typescript
// lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente sin autenticación (para uso general)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// Cliente con autenticación JWT de Clerk (para componentes del servidor)
export async function getAuthenticatedClient(clerkToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`
      }
    }
  })
}
```

### Obtención del Token JWT de Clerk

Para usar el token JWT de Clerk con Supabase, necesitamos configurar un template de JWT personalizado en Clerk y luego obtener ese token:

1. **Configurar Template JWT en Clerk Dashboard**:
   - En el dashboard de Clerk, ir a JWT Templates
   - Crear un nuevo template para Supabase con el siguiente formato:

```json
{
  "sub": "{{user.id}}",
  "role": "{{user.unsafe_metadata.role}}",
  "aud": "authenticated",
  "iat": "{{now}}",
  "exp": "{{now_plus_seconds(3600)}}",
  "email": "{{user.primary_email_address}}"
}
```

2. **Obtener el Token JWT en el Servidor**:

```typescript
// lib/auth-utils.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { getAuthenticatedClient } from './supabase-client'

export async function getSupabaseClient() {
  const { getToken } = auth()
  
  // Obtener token JWT con el template de Supabase
  const token = await getToken({ template: 'supabase' })
  
  if (!token) {
    throw new Error('No se pudo obtener el token JWT')
  }
  
  // Crear cliente autenticado de Supabase
  return getAuthenticatedClient(token)
}
```

3. **Uso en Componentes del Servidor**:

```typescript
// app/api/protected-data/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/auth-utils'

export async function GET() {
  try {
    const supabase = await getSupabaseClient()
    
    // Ahora las consultas respetarán las políticas RLS
    const { data, error } = await supabase
      .from('protected_table')
      .select('*')
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener datos' },
      { status: 500 }
    )
  }
}
```

### Configuración de Políticas RLS para Clerk

Para que Supabase funcione correctamente con los IDs de Clerk, es necesario configurar las políticas RLS adecuadamente:

1. **Migración de Columnas UUID a TEXT**:

```sql
-- Migrar la columna id de UUID a TEXT en la tabla profiles
ALTER TABLE profiles 
  ALTER COLUMN id TYPE TEXT;

-- Migrar la columna user_id de UUID a TEXT en otras tablas
ALTER TABLE orders
  ALTER COLUMN customer_id TYPE TEXT;
```

2. **Políticas RLS para Perfiles**:

```sql
-- Política para que los usuarios solo puedan ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (id = auth.uid());

-- Política para que los usuarios solo puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Política para administradores (pueden ver todos los perfiles)
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
```

3. **Políticas RLS para Órdenes**:

```sql
-- Política para que los usuarios solo puedan ver sus propias órdenes
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  USING (customer_id = auth.uid());

-- Política para que los usuarios solo puedan crear órdenes para sí mismos
CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Política para staff y administradores
CREATE POLICY "Staff and admins can view all orders"
  ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );
```

## Modo Offline Mejorado

### Arquitectura del Modo Offline

El modo offline en Gëstro permite a los usuarios seguir utilizando la aplicación incluso cuando no tienen conexión a internet. La integración con Clerk requiere una implementación especial para manejar la autenticación en modo offline.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    Aplicación                       │
│                                                     │
├─────────────┬─────────────────────┬────────────────┤
│             │                     │                │
│  Modo       │  Detector de        │  Sincronizador │
│  Offline    │  Conectividad       │  de Datos      │
│             │                     │                │
├─────────────┴─────────────────────┴────────────────┤
│                                                     │
│  ┌─────────────┐    ┌─────────────┐                 │
│  │             │    │             │                 │
│  │  Auth       │    │  Datos      │                 │
│  │  Local      │    │  Locales    │                 │
│  │             │    │             │                 │
│  └─────────────┘    └─────────────┘                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Implementación del Modo Offline

```typescript
// lib/offline-mode.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos para el estado del modo offline
type OfflineUser = {
  id: string
  email: string
  name: string
  role: string
}

type OfflineState = {
  isOfflineMode: boolean
  lastOnlineTime: number | null
  offlineUser: OfflineUser | null
  enableOfflineMode: () => void
  disableOfflineMode: () => void
  setOfflineUser: (user: OfflineUser | null) => void
  clearOfflineUser: () => void
}

// Store para el modo offline
export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOfflineMode: false,
      lastOnlineTime: null,
      offlineUser: null,
      enableOfflineMode: () => set({ isOfflineMode: true, lastOnlineTime: Date.now() }),
      disableOfflineMode: () => set({ isOfflineMode: false }),
      setOfflineUser: (user) => set({ offlineUser: user }),
      clearOfflineUser: () => set({ offlineUser: null }),
    }),
    {
      name: 'offline-storage',
    }
  )
)

// Detector de conectividad
export function useConnectivityDetector() {
  const { enableOfflineMode, disableOfflineMode } = useOfflineStore()
  
  useEffect(() => {
    // Función para manejar cambios en la conectividad
    const handleOnlineStatusChange = () => {
      if (navigator.onLine) {
        disableOfflineMode()
      } else {
        enableOfflineMode()
      }
    }
    
    // Verificar estado inicial
    handleOnlineStatusChange()
    
    // Agregar event listeners
    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange)
      window.removeEventListener('offline', handleOnlineStatusChange)
    }
  }, [enableOfflineMode, disableOfflineMode])
}

// Hook para verificar si estamos en modo offline
export function useIsOffline() {
  const isOfflineMode = useOfflineStore((state) => state.isOfflineMode)
  const [isOffline, setIsOffline] = useState(isOfflineMode)
  
  useEffect(() => {
    setIsOffline(isOfflineMode || !navigator.onLine)
  }, [isOfflineMode])
  
  return isOffline
}
```

### Integración con Clerk

Para integrar el modo offline con Clerk, necesitamos crear un proveedor de autenticación que maneje ambos modos:

```typescript
// components/auth-provider-with-offline.tsx
"use client"

import { useUser, useAuth, useClerk } from "@clerk/nextjs"
import { createContext, useContext, useEffect, useState } from "react"
import { useOfflineStore, useIsOffline } from "@/lib/offline-mode"

// Contexto de autenticación con soporte offline
type AuthWithOfflineContextType = {
  user: any
  isLoaded: boolean
  isSignedIn: boolean
  isOffline: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthWithOfflineContext = createContext<AuthWithOfflineContextType | undefined>(undefined)

export function AuthProviderWithOffline({ children }: { children: React.ReactNode }) {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const clerk = useClerk()
  const isOffline = useIsOffline()
  const offlineUser = useOfflineStore((state) => state.offlineUser)
  const setOfflineUser = useOfflineStore((state) => state.setOfflineUser)
  
  // Estado combinado
  const [user, setUser] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Actualizar usuario cuando cambia el estado de autenticación
  useEffect(() => {
    if (isOffline) {
      // En modo offline, usar el usuario offline
      setUser(offlineUser)
      setIsLoaded(true)
    } else if (clerkLoaded) {
      // En modo online, usar el usuario de Clerk
      if (isSignedIn && clerkUser) {
        const userObj = {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          role: clerkUser.unsafeMetadata?.role || 'customer'
        }
        
        // Guardar usuario para modo offline
        setOfflineUser(userObj)
        setUser(userObj)
      } else {
        setUser(null)
      }
      
      setIsLoaded(true)
    }
  }, [clerkLoaded, isSignedIn, clerkUser, isOffline, offlineUser, setOfflineUser])
  
  // Funciones de autenticación
  const signIn = async (email: string, password: string) => {
    if (isOffline) {
      // En modo offline, simular inicio de sesión
      if (password === 'offline' && offlineUser) {
        // Usar el usuario guardado previamente
        return
      } else if (password === 'offline') {
        // Crear un usuario offline temporal
        setOfflineUser({
          id: 'offline-user',
          email,
          name: 'Usuario Offline',
          role: 'customer'
        })
        return
      }
      
      throw new Error('En modo offline, solo se puede iniciar sesión con la contraseña "offline"')
    }
    
    // En modo online, usar Clerk
    await clerk.signIn.create({
      identifier: email,
      password
    })
  }
  
  const signOut = async () => {
    if (isOffline) {
      // En modo offline, simular cierre de sesión
      setOfflineUser(null)
      return
    }
    
    // En modo online, usar Clerk
    await clerk.signOut()
  }
  
  return (
    <AuthWithOfflineContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn: !!user,
        isOffline,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthWithOfflineContext.Provider>
  )
}

// Hook para usar el contexto de autenticación con soporte offline
export function useAuthWithOffline() {
  const context = useContext(AuthWithOfflineContext)
  
  if (context === undefined) {
    throw new Error('useAuthWithOffline debe ser usado dentro de un AuthProviderWithOffline')
  }
  
  return context
}
```
