'use client'

import { SignUp } from "@clerk/nextjs"
import Image from "next/image"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="mb-8">
        <Image
          src="/logo-complete.svg"
          alt="Gëstro Logo"
          width={180}
          height={48}
          className="object-contain"
        />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Crear cuenta en Gëstro</h1>
          <p className="text-muted-foreground mt-2">
            Únete a nosotros y comienza a gestionar tu restaurante.
          </p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-lg border border-border bg-card",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "border-border hover:bg-accent",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
              formFieldInput: "border-border focus:border-primary",
              footerActionLink: "text-primary hover:text-primary/90",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
            }
          }}
          signInUrl="/auth/sign-in"
          redirectUrl="/"
        />
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <a href="/auth/sign-in" className="text-primary hover:underline font-medium">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
