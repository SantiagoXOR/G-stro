"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, ChevronRight, CreditCard, Heart, HelpCircle, LogOut, MapPin, Settings, User } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { getSupabaseClient } from "@/lib/supabase-client"
import type { Database } from "../../shared/types/database.types"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"
import { toast } from "sonner"
import { getOrCreateUserProfile } from "@/lib/services/profiles"
import { ProfileErrorBoundary } from "@/components/profile-error-boundary"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Order = Database["public"]["Tables"]["orders"]["Row"]

function ProfilePageContent() {
  const [activeTab, setActiveTab] = useState("orders")
  const router = useRouter()
  const { signOut } = useAuth()
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirigir si no hay usuario autenticado
    if (!clerkUser && clerkIsLoaded) {
      router.push("/auth/sign-in")
      return
    }

    // Esperar a que Clerk cargue
    if (!clerkIsLoaded) {
      return
    }

    // Cargar datos del perfil
    const fetchProfileData = async () => {
      try {
        setIsLoading(true)

        // Verificar que tenemos datos de Clerk
        if (!clerkUser?.id) {
          console.warn('⚠️ No hay ID de usuario de Clerk disponible')
          return
        }

        // Usar datos de Clerk
        const userId = clerkUser.id
        const userEmail = clerkUser.primaryEmailAddress?.emailAddress || ''
        const userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()

        console.log('🔄 Cargando datos del perfil para el usuario:', userId)

        // Verificar que tenemos email
        if (!userEmail) {
          console.error('❌ No se pudo obtener el email del usuario')
          toast.error('Error: No se pudo obtener el email del usuario')
          return
        }

        // Obtener o crear perfil usando el servicio
        const profileData = await getOrCreateUserProfile(
          userId,
          userEmail,
          userName || undefined,
          'customer'
        )

        if (!profileData) {
          console.error('❌ No se pudo obtener o crear el perfil del usuario')
          toast.error('No se pudo cargar el perfil del usuario')
          return
        }

        console.log('✅ Perfil cargado exitosamente:', profileData)
        setProfile(profileData)

        // Obtener pedidos de forma segura
        try {
          const supabase = await getSupabaseClient()
          if (supabase) {
            const { data: ordersData, error: ordersError } = await supabase
              .from("orders")
              .select("*")
              .eq("customer_id", userId)
              .order("created_at", { ascending: false })

            if (ordersError) {
              console.error('Error al obtener pedidos:', ordersError)
              // No lanzar error, solo mostrar mensaje
              toast.error('No se pudieron cargar los pedidos')
              setOrders([])
            } else {
              setOrders(ordersData || [])
            }
          } else {
            console.warn('⚠️ Cliente de Supabase no disponible para obtener pedidos')
            setOrders([])
          }
        } catch (ordersError) {
          console.error('❌ Error inesperado al obtener pedidos:', ordersError)
          toast.error('Error al cargar pedidos')
          setOrders([])
        }
      } catch (error) {
        console.error("❌ Error crítico al cargar datos del perfil:", error)

        // Determinar el mensaje de error apropiado
        let errorMessage = 'Error al cargar datos del perfil'
        if (error instanceof Error) {
          if (error.message.includes('No se pudo obtener o crear el perfil')) {
            errorMessage = 'No se pudo acceder a tu perfil. Intenta cerrar sesión e iniciar sesión nuevamente.'
          } else if (error.message.includes('email')) {
            errorMessage = 'Error con la información de tu cuenta. Verifica tu email.'
          } else {
            errorMessage = error.message
          }
        }

        // Mostrar un toast con el error
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [clerkUser, clerkIsLoaded, router])

  const navigateToSection = (section: string) => {
    router.push(`/profile/${section}`)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 pt-8 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white">
            <Image
              src={clerkUser?.imageUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1780&auto=format&fit=crop"}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">¡Hola, {
              `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() ||
              clerkUser?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
              'Usuario'
            }!</h1>
            <p className="text-primary-foreground/80">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span className="font-medium">
                {profile?.role === "admin" ? "Administrador" :
                 profile?.role === "staff" ? "Personal" : "Cliente"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mt-4">
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === "orders" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Mis Pedidos
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === "account" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("account")}
        >
          Mi Cuenta
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "orders" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold mb-3">Pedidos Recientes</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tienes pedidos realizados</p>
                <Button className="mt-4" onClick={() => router.push("/menu")}>
                  Ver Menú
                </Button>
              </div>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Pedido #{order.id.substring(0, 8)}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    {order.notes && <p className="text-sm mb-2 line-clamp-1">{order.notes}</p>}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">${order.total_amount.toLocaleString()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            <Button variant="outline" className="w-full" onClick={() => router.push('/orders/history')}>
              Ver Todos los Pedidos
            </Button>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-bold mb-3">Preferencias</h2>
              <AccountLink
                icon={User}
                text="Información Personal"
                section="personal-info"
                onClick={navigateToSection}
              />
              <AccountLink icon={MapPin} text="Direcciones Guardadas" section="addresses" onClick={navigateToSection} />
              <AccountLink
                icon={CreditCard}
                text="Métodos de Pago"
                section="payment-methods"
                onClick={() => router.push('/profile/payment-methods')}
              />
              <AccountLink icon={Heart} text="Favoritos" section="favorites" onClick={navigateToSection} />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold mb-3">Configuración</h2>
              <AccountLink
                icon={Settings}
                text="Configuración de Perfil"
                section="settings"
                onClick={navigateToSection}
              />
              <AccountLink icon={HelpCircle} text="Ayuda y Soporte" section="support" onClick={navigateToSection} />
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProfileErrorBoundary>
      <ProfilePageContent />
    </ProfileErrorBoundary>
  )
}

function AccountLink({
  icon: Icon,
  text,
  section,
  onClick,
}: {
  icon: any
  text: string
  section: string
  onClick: (section: string) => void
}) {
  return (
    <Button variant="ghost" className="w-full justify-start" onClick={() => onClick(section)}>
      <Icon className="h-5 w-5 mr-3" />
      {text}
      <ChevronRight className="h-5 w-5 ml-auto" />
    </Button>
  )
}

