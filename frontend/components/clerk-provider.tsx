'use client'

import * as React from 'react'
import { ClerkProvider as ClerkProviderOriginal } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'

// Configuración de localización personalizada para Gëstro
const customLocalization = {
  locale: 'es-ES',
  // Configuración corregida para botones sociales
  socialButtonsBlockButton: 'Continuar con {{provider|titleize}}',
  // Textos específicos para cada proveedor
  socialButtonsBlockButtonGoogle: 'Continuar con Google',
  socialButtonsBlockButtonFacebook: 'Continuar con Facebook',
  socialButtonsBlockButtonApple: 'Continuar con Apple',
  socialButtonsBlockButtonGithub: 'Continuar con GitHub',
  socialButtonsBlockButtonDiscord: 'Continuar con Discord',

  signIn: {
    start: {
      title: 'Iniciar sesión en Gëstro',
      subtitle: 'Bienvenido de vuelta',
      actionText: 'Iniciar sesión',
      actionLink: 'Crear cuenta',
    },
    emailCode: {
      title: 'Verificar email',
      subtitle: 'Te hemos enviado un código de verificación',
      formTitle: 'Código de verificación',
      formSubtitle: 'Ingresa el código que recibiste por email',
    },
    password: {
      title: 'Ingresa tu contraseña',
      subtitle: 'para continuar en Gëstro',
      actionText: 'Continuar',
    },
  },
  signUp: {
    start: {
      title: 'Crear cuenta en Gëstro',
      subtitle: 'Únete a nosotros',
      actionText: 'Crear cuenta',
      actionLink: 'Iniciar sesión',
    },
    emailCode: {
      title: 'Verificar email',
      subtitle: 'Te hemos enviado un enlace de verificación',
      formTitle: 'Código de verificación',
      formSubtitle: 'Ingresa el código que recibiste por email',
    },
  },
  userProfile: {
    navbar: {
      title: 'Perfil',
      description: 'Gestiona tu información personal',
    },
  },
}

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  // Validar que la clave de Clerk esté disponible
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY no está configurada')
    return <div>Error de configuración de autenticación</div>
  }

  return (
    <ClerkProviderOriginal
      publishableKey={publishableKey}
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#112D1C',
          colorTextOnPrimaryBackground: '#FAECD8',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#FFFFFF',
          colorInputText: '#000000',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: '#112D1C',
            color: '#FAECD8',
            '&:hover': {
              backgroundColor: '#0d2318',
            },
          },
          card: {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          },
          formField: {
            marginBottom: '1rem',
          },
          formFieldLabel: {
            color: '#374151',
            fontWeight: '500',
          },
          formFieldInput: {
            borderColor: '#d1d5db',
            borderRadius: '0.375rem',
            '&:focus': {
              borderColor: '#112D1C',
              boxShadow: '0 0 0 3px rgba(17, 45, 28, 0.1)',
            },
          },
          footerActionLink: {
            color: '#112D1C',
            '&:hover': {
              color: '#0d2318',
            },
          },
          socialButtonsBlockButton: {
            borderColor: '#d1d5db',
            '&:hover': {
              backgroundColor: '#f9fafb',
            },
          },
        }
      }}
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      localization={customLocalization}
    >
      {children}
    </ClerkProviderOriginal>
  )
}
