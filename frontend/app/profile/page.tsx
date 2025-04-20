"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, ChevronRight, CreditCard, Heart, HelpCircle, LogOut, MapPin, Settings, User } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Database } from "../../shared/types/database.types"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Order = Database["public"]["Tables"]["orders"]["Row"]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("orders")
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirigir si no hay usuario autenticado
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Cargar datos del perfil
    const fetchProfileData = async () => {
      try {
        setIsLoading(true)

        // Obtener perfil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // Obtener pedidos
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })

        if (ordersError) throw ordersError
        setOrders(ordersData || [])
      } catch (error) {
        console.error("Error al cargar datos del perfil:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [user, router])

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
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1780&auto=format&fit=crop"
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">¡Hola!</h1>
            <p className="text-primary-foreground/80">{user?.email}</p>
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
                text="Configuración de la App"
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

