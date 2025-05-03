# Flujo de Autenticación - Gëstro

## Introducción

Este documento describe el flujo de autenticación implementado en Gëstro, utilizando Supabase como proveedor de autenticación. El sistema permite a los usuarios registrarse e iniciar sesión mediante correo electrónico/contraseña o a través de proveedores OAuth como Google.

## Tecnologías Utilizadas

- **Supabase Auth**: Servicio de autenticación basado en PostgreSQL
- **Next.js 15**: Framework de React para el frontend
- **@supabase/ssr**: Biblioteca para integrar Supabase con Server-Side Rendering
- **@supabase/supabase-js**: Cliente de JavaScript para Supabase

## Flujo de Autenticación

### 1. Registro de Usuario

#### Registro con Email/Contraseña

1. El usuario accede a la página de registro (`/auth/signup`)
2. Completa el formulario con su email, contraseña y datos personales
3. Al enviar el formulario, se llama a `supabase.auth.signUp()`
4. Supabase crea un nuevo usuario en `auth.users`
5. El trigger `on_auth_user_created` ejecuta la función `handle_new_user()`
6. La función crea automáticamente un perfil en la tabla `profiles`
7. Se envía un correo de verificación al usuario
8. El usuario confirma su correo haciendo clic en el enlace
9. El usuario es redirigido a la página de inicio de sesión

#### Registro con Google

1. El usuario accede a la página de inicio de sesión (`/auth/login`)
2. Hace clic en "Continuar con Google"
3. Se llama a `supabase.auth.signInWithOAuth({ provider: 'google' })`
4. El usuario es redirigido a la página de autenticación de Google
5. Después de autenticarse, Google redirige al usuario a la URL de callback (`/auth/callback`)
6. La ruta de callback intercambia el código de autorización por una sesión
7. El trigger `on_auth_user_created` ejecuta la función `handle_new_user()`
8. La función crea automáticamente un perfil en la tabla `profiles`
9. El usuario es redirigido a la página principal

### 2. Inicio de Sesión

#### Inicio de Sesión con Email/Contraseña

1. El usuario accede a la página de inicio de sesión (`/auth/login`)
2. Ingresa su email y contraseña
3. Al enviar el formulario, se llama a `supabase.auth.signInWithPassword()`
4. Si las credenciales son correctas, Supabase devuelve una sesión
5. La sesión se almacena en cookies
6. El usuario es redirigido a la página principal

#### Inicio de Sesión con Google

1. El usuario accede a la página de inicio de sesión (`/auth/login`)
2. Hace clic en "Continuar con Google"
3. Se llama a `supabase.auth.signInWithOAuth({ provider: 'google' })`
4. El usuario es redirigido a la página de autenticación de Google
5. Después de autenticarse, Google redirige al usuario a la URL de callback (`/auth/callback`)
6. La ruta de callback intercambia el código de autorización por una sesión
7. La sesión se almacena en cookies
8. El usuario es redirigido a la página principal

### 3. Gestión de Sesiones

#### Verificación de Sesión en el Servidor

```typescript
// Ejemplo de middleware para verificar la sesión
import { createServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}
```

#### Verificación de Sesión en el Cliente

```typescript
// Ejemplo de hook para verificar la sesión en el cliente
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          router.push('/auth/login');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);
  
  return { user, loading };
}
```

### 4. Cierre de Sesión

1. El usuario hace clic en "Cerrar sesión"
2. Se llama a `supabase.auth.signOut()`
3. Supabase elimina la sesión
4. El usuario es redirigido a la página de inicio de sesión

## Implementación Técnica

### Configuración de Supabase

```typescript
// lib/supabase-config.ts
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function isConfigValid() {
  const missingVars = [];
  
  if (!SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  return {
    valid: missingVars.length === 0,
    missingVars
  };
}
```

### Cliente de Supabase para el Navegador

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/types/database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config';

// Opciones de autenticación
const authOptions = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'pkce' as const
};

// Cliente para el navegador
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: authOptions
});
```

### Cliente de Supabase para el Servidor

```typescript
// lib/supabase-server.ts
import { createServerClient as createServerClientSSR } from '@supabase/ssr';
import type { Database } from '../../shared/types/database.types';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config';

// Cliente para componentes del servidor
export const createServerClient = (cookieStore?: ReturnType<typeof cookies>) => {
  return createServerClientSSR<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      async get(name: string) {
        const cookie = await cookieStore?.get(name);
        return cookie?.value;
      },
      async set(name: string, value: string, options: any) {
        await cookieStore?.set(name, value, options);
      },
      async remove(name: string, options: any) {
        await cookieStore?.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });
};

// Cliente para rutas API
export const createRouteHandlerClient = () => {
  const cookieStore = cookies();
  return createServerClientSSR<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      async get(name: string) {
        const cookie = await cookieStore.get(name);
        return cookie?.value;
      },
      async set(name: string, value: string, options: any) {
        await cookieStore.set(name, value, options);
      },
      async remove(name: string, options: any) {
        await cookieStore.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });
};
```

### Ruta de Callback para OAuth

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Si hay un error, redirigir a la página de login con el mensaje de error
  if (error) {
    console.error(`Error de autenticación: ${error} - ${errorDescription}`);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  // Si hay un código, intercambiarlo por una sesión
  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
          cookies: {
            async get(name: string) {
              const cookie = await cookieStore.get(name);
              return cookie?.value;
            },
            async set(name: string, value: string, options: any) {
              await cookieStore.set(name, value, options);
            },
            async remove(name: string, options: any) {
              await cookieStore.set(name, '', { ...options, maxAge: 0 });
            },
          },
        }
      );

      // Intercambiar el código por una sesión
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error('Error al intercambiar código por sesión:', sessionError);
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent(sessionError.message)}`, request.url)
        );
      }
    } catch (err) {
      console.error('Error inesperado en el callback de autenticación:', err);
      return NextResponse.redirect(
        new URL('/auth/login?error=Error+inesperado+durante+la+autenticación', request.url)
      );
    }
  }

  // Redirigir a la página principal después de la autenticación exitosa
  return NextResponse.redirect(new URL('/', request.url));
}
```

### Componente de Inicio de Sesión

```tsx
// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Error inesperado durante el inicio de sesión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      setError('Error inesperado durante el inicio de sesión con Google');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Iniciar Sesión</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleEmailLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
      
      <div className="divider">o</div>
      
      <button onClick={handleGoogleLogin} disabled={loading} className="google-button">
        Continuar con Google
      </button>
      
      <p>
        ¿No tienes una cuenta?{' '}
        <a href="/auth/signup">Regístrate</a>
      </p>
    </div>
  );
}
```

## Función para Crear Perfiles de Usuario

Cuando un usuario se registra, se ejecuta automáticamente la función `handle_new_user()` que crea un perfil en la tabla `profiles`:

```sql
-- Función para crear perfiles de usuario automáticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Trigger para ejecutar la función cuando se crea un nuevo usuario
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Políticas de Seguridad

Las políticas de Row Level Security (RLS) garantizan que los usuarios solo puedan acceder a sus propios datos:

```sql
-- Políticas para la tabla profiles
CREATE POLICY "Los usuarios pueden ver sus propios perfiles"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar sus propios perfiles"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Políticas para el personal y administradores
CREATE POLICY "El personal puede ver todos los perfiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'staff' OR role = 'admin'
));

CREATE POLICY "Los administradores pueden actualizar cualquier perfil"
ON public.profiles
FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'admin'
));
```

## Consideraciones de Seguridad

1. **HTTPS**: Todas las comunicaciones se realizan a través de HTTPS para garantizar la seguridad de los datos.

2. **Tokens JWT**: Supabase utiliza tokens JWT para la autenticación, que se almacenan en cookies seguras.

3. **PKCE**: Se utiliza el flujo PKCE (Proof Key for Code Exchange) para la autenticación OAuth, lo que proporciona una capa adicional de seguridad.

4. **Row Level Security**: Las políticas RLS garantizan que los usuarios solo puedan acceder a los datos que les corresponden.

5. **Validación de Datos**: Se validan todos los datos de entrada para prevenir ataques de inyección.

6. **Protección contra CSRF**: Se implementan medidas para prevenir ataques CSRF (Cross-Site Request Forgery).

7. **Tiempo de Expiración de Sesiones**: Las sesiones tienen un tiempo de expiración para minimizar el riesgo de acceso no autorizado.

## Flujo de Recuperación de Contraseña

1. El usuario accede a la página de recuperación de contraseña (`/auth/reset-password`)
2. Ingresa su dirección de correo electrónico
3. Se llama a `supabase.auth.resetPasswordForEmail()`
4. Supabase envía un correo con un enlace para restablecer la contraseña
5. El usuario hace clic en el enlace y es redirigido a la página de cambio de contraseña
6. Ingresa su nueva contraseña
7. Se llama a `supabase.auth.updateUser({ password })`
8. El usuario es redirigido a la página de inicio de sesión

## Pruebas

Para probar el flujo de autenticación:

1. Registrar un nuevo usuario con correo electrónico y contraseña
2. Iniciar sesión con las credenciales creadas
3. Cerrar sesión
4. Iniciar sesión con Google
5. Verificar que se crea correctamente el perfil en la tabla `profiles`
6. Probar el flujo de recuperación de contraseña

## Solución de Problemas Comunes

### Error: "invalid request: both auth code and code verifier should be non-empty"

Este error puede ocurrir durante la autenticación OAuth si las cookies no se manejan correctamente. Asegúrate de que:

1. Las funciones de manejo de cookies en `createServerClient` sean asíncronas
2. El código de autorización se pase correctamente a `exchangeCodeForSession`
3. La URL de redirección esté configurada correctamente

### Error: "Database error saving new user"

Este error puede ocurrir si hay problemas con la función `handle_new_user()`. Verifica que:

1. La función esté correctamente definida con `SECURITY DEFINER`
2. El trigger `on_auth_user_created` esté correctamente configurado
3. La tabla `profiles` tenga las columnas necesarias
4. No haya restricciones que impidan la inserción de nuevos registros

### Error: "Session expired"

Este error puede ocurrir si la sesión ha expirado. Soluciones:

1. Implementar un mecanismo de renovación automática de tokens
2. Aumentar el tiempo de expiración de las sesiones en la configuración de Supabase
3. Manejar adecuadamente la expiración de sesiones en la interfaz de usuario

## Recursos Adicionales

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentación de @supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Ejemplos de autenticación con Next.js](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
