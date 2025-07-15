import { ClerkTest } from '@/components/clerk-test'
import { ComprehensiveImageTest } from '@/components/comprehensive-image-test'
import { ProductionReadinessTest } from '@/components/production-readiness-test'
import { NavigationTest } from '@/components/navigation-test'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bush-50 to-peach-cream-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-bush-900">
              Prueba de Autenticación - Gëstro
            </CardTitle>
            <CardDescription>
              Página de prueba para verificar la configuración de Clerk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Botones de autenticación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SignInButton mode="modal">
                <Button 
                  variant="default" 
                  className="w-full bg-bush-700 hover:bg-bush-800 text-peach-cream-50"
                >
                  Iniciar Sesión
                </Button>
              </SignInButton>
              
              <SignUpButton mode="modal">
                <Button 
                  variant="outline" 
                  className="w-full border-bush-700 text-bush-700 hover:bg-bush-50"
                >
                  Crear Cuenta
                </Button>
              </SignUpButton>
            </div>

            {/* Información de configuración */}
            <div className="bg-bush-50 p-4 rounded-lg">
              <h3 className="font-semibold text-bush-900 mb-2">Estado de Configuración:</h3>
              <ul className="text-sm text-bush-700 space-y-1">
                <li>✅ ClerkProvider configurado</li>
                <li>✅ Localización en español</li>
                <li>✅ Tema personalizado de Gëstro</li>
                <li>✅ Autenticación con Google habilitada</li>
              </ul>
            </div>

            {/* Componente de prueba de autenticación */}
            <ClerkTest />

            {/* Pruebas de preparación para producción */}
            <ProductionReadinessTest />

            {/* Pruebas de navegación y UX */}
            <NavigationTest />

            {/* Prueba exhaustiva de imágenes */}
            <ComprehensiveImageTest />

            {/* Información de depuración */}
            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Información de Depuración
              </summary>
              <div className="mt-2 text-sm text-gray-600 space-y-2">
                <p><strong>Clerk Publishable Key:</strong> {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Configurada' : '❌ No configurada'}</p>
                <p><strong>Sign In URL:</strong> /auth/sign-in</p>
                <p><strong>Sign Up URL:</strong> /auth/sign-up</p>
                <p><strong>Localización:</strong> es-ES</p>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
