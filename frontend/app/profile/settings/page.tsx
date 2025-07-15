"use client"

import { useState } from "react"
import { UserProfile } from "@clerk/nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const router = useRouter()
  const { theme } = useTheme()

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background pt-4 pb-2 px-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Configuración de Perfil</h1>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="account">Cuenta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-0">
            <div className="mb-4">
              <p className="text-muted-foreground mb-4">
                Actualiza tu información personal, foto de perfil y preferencias.
              </p>
            </div>
            
            <UserProfile
              appearance={{
                elements: {
                  rootBox: "w-full mx-auto",
                  card: "shadow-none border-0 p-0",
                  navbar: "hidden",
                  pageScrollBox: "p-0",
                  profilePage: {
                    root: "p-0",
                  },
                  profileSection: {
                    root: "mb-6",
                  },
                  formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                  formFieldLabel: "text-foreground font-medium",
                  formFieldInput: "border-border rounded-md",
                  formFieldErrorText: "text-destructive text-sm",
                  formFieldSuccessText: "text-green-500 text-sm",
                  userPreviewMainIdentifier: "text-foreground",
                  userPreviewSecondaryIdentifier: "text-muted-foreground",
                  userButtonBox: "hidden",
                },
                baseTheme: theme === 'dark' ? 'dark' : 'light',
                variables: {
                  colorPrimary: '#112D1C',
                  colorTextOnPrimaryBackground: '#FAECD8',
                },
              }}
              path="/profile/settings"
              routing="path"
            />
          </TabsContent>
          
          <TabsContent value="account" className="mt-0">
            <div className="mb-4">
              <p className="text-muted-foreground mb-4">
                Gestiona tu cuenta, contraseña y métodos de inicio de sesión.
              </p>
            </div>
            
            <UserProfile
              appearance={{
                elements: {
                  rootBox: "w-full mx-auto",
                  card: "shadow-none border-0 p-0",
                  navbar: "hidden",
                  pageScrollBox: "p-0",
                  profilePage: {
                    root: "p-0",
                  },
                  profileSection: {
                    root: "mb-6",
                  },
                  formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                  formFieldLabel: "text-foreground font-medium",
                  formFieldInput: "border-border rounded-md",
                  formFieldErrorText: "text-destructive text-sm",
                  formFieldSuccessText: "text-green-500 text-sm",
                  userPreviewMainIdentifier: "text-foreground",
                  userPreviewSecondaryIdentifier: "text-muted-foreground",
                  userButtonBox: "hidden",
                },
                baseTheme: theme === 'dark' ? 'dark' : 'light',
                variables: {
                  colorPrimary: '#112D1C',
                  colorTextOnPrimaryBackground: '#FAECD8',
                },
              }}
              path="/user/account"
              routing="path"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
