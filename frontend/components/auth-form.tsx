"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { signIn, signInWithGoogle, signUp, user } = useAuth()

  // Si el usuario ya está autenticado, redirigir a la página principal
  if (user) {
    router.push("/")
    return null
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Correo electrónico no válido"
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida"
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!isLogin && !name) {
      newErrors.name = "El nombre es requerido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      if (isLogin) {
        // Iniciar sesión
        const { error } = await signIn({
          email,
          password,
        })

        if (error) {
          throw new Error(error.message)
        }

        toast.success("Inicio de sesión exitoso")
        router.push("/")
      } else {
        // Registrarse
        const { error } = await signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: "customer"
            }
          }
        })

        if (error) {
          throw new Error(error.message)
        }

        toast.success("Cuenta creada correctamente. Verifica tu correo electrónico.")
        setIsLogin(true)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error en la autenticación")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Ingresa tus credenciales para acceder a tu cuenta"
            : "Completa el formulario para crear una nueva cuenta"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "Procesando..."
              : isLogin ? "Iniciar Sesión" : "Registrarse"}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                O continuar con
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={async () => {
              setIsSubmitting(true)
              try {
                const { error } = await signInWithGoogle()
                if (error) {
                  toast.error(error.message || "Error al iniciar sesión con Google")
                }
              } catch (error) {
                toast.error("Error al iniciar sesión con Google")
              } finally {
                setIsSubmitting(false)
              }
            }}
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {isLogin ? (
          <p className="text-sm text-center">
            ¿No tienes una cuenta?{" "}
            <Button
              variant="link"
              className="p-0"
              onClick={() => setIsLogin(false)}
              disabled={isSubmitting}
            >
              Crear una cuenta
            </Button>
          </p>
        ) : (
          <p className="text-sm text-center">
            ¿Ya tienes una cuenta?{" "}
            <Button
              variant="link"
              className="p-0"
              onClick={() => setIsLogin(true)}
              disabled={isSubmitting}
            >
              Iniciar sesión
            </Button>
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
