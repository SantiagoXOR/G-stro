# Recomendaciones para Completar la Implementación de Clerk en Gëstro

## 1. Configuración del Dashboard de Clerk

### 1.1 Configuración General
- **Configurar URLs de redirección**: Asegúrate de que todas las URLs de redirección estén configuradas en el dashboard de Clerk, incluyendo:
  - `https://tu-dominio.com/auth/sso-callback`
  - `https://tu-dominio.com/auth/verify-email`
  - `https://tu-dominio.com/auth/reset-password`
- **Personalizar apariencia**: Configura los colores y estilos para que coincidan con la identidad visual de Gëstro (verde #112D1C y crema melocotón #FAECD8).
- **Configurar dominio**: Si tienes un dominio personalizado, configúralo en el dashboard de Clerk.

### 1.2 Configuración de Proveedores OAuth
- **Google OAuth**: 
  - Crea un proyecto en Google Cloud Console
  - Configura las credenciales de OAuth
  - Añade las URLs de redirección autorizadas
  - Copia el Client ID y Client Secret a la configuración de Clerk

### 1.3 Configuración del Webhook
- **Crear webhook**: En el dashboard de Clerk, crea un nuevo webhook con la siguiente URL:
  - `https://tu-dominio.com/api/webhooks/clerk`
- **Seleccionar eventos**: Asegúrate de seleccionar los siguientes eventos:
  - `user.created`
  - `user.updated`
  - `user.deleted`
- **Configurar secreto**: Guarda el secreto del webhook en tus variables de entorno como `CLERK_WEBHOOK_SECRET`.

### 1.4 Personalización de Emails
- **Plantilla de verificación**: Personaliza la plantilla de email de verificación con el logo y colores de Gëstro.
- **Plantilla de recuperación**: Personaliza la plantilla de email de recuperación de contraseña.
- **Configurar remitente**: Configura el nombre y email del remitente para los correos enviados por Clerk.

## 2. Mejoras en la Implementación Actual

### 2.1 Mejoras en el ClerkProvider
```typescript
// components/clerk-provider.tsx
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  
  return (
    <ClerkProviderOriginal
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#112D1C',
          colorTextOnPrimaryBackground: '#FAECD8',
        },
        elements: {
          // Añadir más personalizaciones de elementos UI
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'shadow-md',
          formField: 'mb-4',
          formFieldLabel: 'text-foreground font-medium',
          formFieldInput: 'border-border rounded-md',
          footerActionLink: 'text-primary hover:text-primary/90',
        }
      }}
      localization={{
        locale: 'es',
        socialButtonsBlockButton: {
          google: 'Continuar con Google',
        },
        signIn: {
          start: {
            title: 'Iniciar sesión',
            subtitle: 'para continuar en Gëstro',
          },
          // Añadir más traducciones
        },
        signUp: {
          start: {
            title: 'Crear cuenta',
            subtitle: 'para comenzar a usar Gëstro',
          },
          // Añadir más traducciones
        },
      }}
    >
      {children}
    </ClerkProviderOriginal>
  )
}
```

### 2.2 Mejoras en el Webhook
```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Obtener la firma del header
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Si falta algún header requerido, rechazar la petición
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400
    })
  }

  // Obtener el body como texto sin procesar
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Crear instancia de Webhook para verificar la firma
  const wh = new Webhook(WEBHOOK_SECRET);
  
  try {
    // Verificar que la petición es auténtica
    const evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    // Procesar el evento según su tipo
    if (evt.type === 'user.created') {
      await handleUserCreated(evt.data);
    }

    return new Response('Webhook processed successfully', {
      status: 200
    });
  } catch (err) {
    console.error('Error al verificar webhook:', err);
    return new Response('Error verifying webhook', {
      status: 400
    });
  }
}

async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url, created_at } = data;

  // Obtener el email principal
  const primaryEmail = email_addresses.find((email: any) => email.id === data.primary_email_address_id)?.email_address;

  try {
    // Insertar el usuario en la tabla de usuarios de Supabase
    const { error } = await supabaseAdmin
      .from('users')
      .insert({
        id: id,
        clerk_id: id,
        email: primaryEmail,
        first_name: first_name || null,
        last_name: last_name || null,
        avatar_url: image_url || null,
        role: 'customer', // Rol por defecto
        created_at: created_at,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error al crear usuario en Supabase:', error);
      throw error;
    }

    // También crear un perfil en la tabla profiles si existe
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: id,
        user_id: id,
        name: `${first_name || ''} ${last_name || ''}`.trim() || primaryEmail?.split('@')[0] || 'Usuario',
        email: primaryEmail,
        created_at: created_at,
      });

    if (profileError) {
      console.error('Error al crear perfil en Supabase:', profileError);
      // No lanzar error para no interrumpir el flujo si falla la creación del perfil
    }
  } catch (error) {
    console.error('Error al sincronizar usuario con Supabase:', error);
    throw error;
  }
}
```

### 2.3 Mejoras en la Verificación de Roles
```typescript
// middleware.ts
// Función para obtener el rol del usuario desde Supabase
async function getUserRole(userId: string): Promise<string> {
  try {
    // Inicializar cliente de Supabase con la clave de servicio
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Obtener el rol del usuario
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (error) {
      console.error('Error al obtener rol del usuario:', error);
      return 'customer'; // Rol por defecto en caso de error
    }

    return data?.role || 'customer';
  } catch (error) {
    console.error('Error inesperado al obtener rol:', error);
    return 'customer'; // Rol por defecto en caso de error
  }
}
```

## 3. Estrategia para Eliminar la Capa de Compatibilidad

### 3.1 Identificar Componentes que Usan la Capa de Compatibilidad
- Busca todos los componentes que importan `useAuth` desde `@/lib/clerk-client`
- Crea una lista de estos componentes para planificar su actualización

### 3.2 Actualizar Componentes Gradualmente
- Actualiza cada componente para usar directamente la API de Clerk:
  - Reemplaza `useAuth` por `useUser`, `useClerk` y `useAuth` de `@clerk/nextjs`
  - Actualiza las referencias a propiedades del usuario
  - Actualiza las llamadas a métodos de autenticación

### 3.3 Ejemplo de Actualización de Componente
```typescript
// Antes
import { useAuth } from "@/lib/clerk-client"

function ProfileComponent() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <div>Cargando...</div>
  
  return (
    <div>
      <h1>Perfil de {user?.user_metadata?.name}</h1>
      <p>Email: {user?.email}</p>
    </div>
  )
}

// Después
import { useUser } from "@clerk/nextjs"

function ProfileComponent() {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded) return <div>Cargando...</div>
  
  return (
    <div>
      <h1>Perfil de {user?.fullName}</h1>
      <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
    </div>
  )
}
```

## 4. Pruebas Exhaustivas

### 4.1 Pruebas de Autenticación
- Registro con email y contraseña
- Verificación de email
- Inicio de sesión con email y contraseña
- Inicio de sesión con Google
- Recuperación de contraseña
- Cierre de sesión

### 4.2 Pruebas de Integración
- Verificar que los usuarios se sincronizan correctamente con Supabase
- Comprobar que las políticas RLS funcionan con los IDs de Clerk
- Verificar que los componentes pueden acceder a datos de Supabase

### 4.3 Pruebas de Seguridad
- Verificar que las rutas protegidas no son accesibles sin autenticación
- Comprobar que las rutas de rol específico no son accesibles sin el rol adecuado
- Verificar que los tokens de sesión se manejan de forma segura
