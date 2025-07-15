'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface LoginFormProps {
  email: string
  password: string
  error: string | null
  isLoading: boolean
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  helpText?: string
  idPrefix?: string
}

export function LoginForm({
  email,
  password,
  error,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  helpText,
  idPrefix = ''
}: LoginFormProps) {
  const emailId = `${idPrefix}email`.trim()
  const passwordId = `${idPrefix}password`.trim()

  return (
    <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form">
      <div className="space-y-2">
        <Label htmlFor={emailId}>Correo electrónico</Label>
        <Input
          id={emailId}
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={onEmailChange}
          required
          data-testid="email-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={passwordId}>Contraseña</Label>
        <Input
          id={passwordId}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={onPasswordChange}
          required
          data-testid="password-input"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm" role="alert" data-testid="error-message">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading} data-testid="submit-button">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          "Iniciar sesión"
        )}
      </Button>

      {helpText && (
        <div className="text-center text-xs text-muted-foreground mt-2">
          <p>{helpText}</p>
        </div>
      )}
    </form>
  )
}
