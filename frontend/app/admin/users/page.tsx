"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Search, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"
import type { Database } from "../../../shared/types/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function AdminUsersPage() {
  const { user, isLoaded } = useUser()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})

  // Inicializar cliente de Supabase
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Verificar si el usuario está autenticado y cargar perfiles
    if (isLoaded) {
      fetchProfiles()
    }
  }, [isLoaded])

  // Filtrar perfiles cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProfiles(profiles)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredProfiles(
        profiles.filter(
          (profile) =>
            profile.email.toLowerCase().includes(term) ||
            (profile.name && profile.name.toLowerCase().includes(term))
        )
      )
    }
  }, [searchTerm, profiles])

  // Función para cargar perfiles de usuario
  const fetchProfiles = async () => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setProfiles(data || [])
      setFilteredProfiles(data || [])
    } catch (error) {
      console.error("Error al cargar perfiles:", error)
      toast.error("Error al cargar perfiles de usuario")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para actualizar el rol de un usuario
  const updateUserRole = async (userId: string, role: string) => {
    try {
      setIsUpdating((prev) => ({ ...prev, [userId]: true }))

      // Llamar al endpoint para actualizar el rol en Clerk y Supabase
      const response = await fetch('/api/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar rol')
      }

      // Actualizar la lista de perfiles
      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === userId ? { ...profile, role: role as any } : profile
        )
      )

      toast.success(data.message || `Rol actualizado a ${role}`)
    } catch (error) {
      console.error("Error al actualizar rol:", error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar rol de usuario")
    } finally {
      setIsUpdating((prev) => ({ ...prev, [userId]: false }))
    }
  }

  // Si el usuario no está cargado, mostrar spinner
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>
            Administra los usuarios y sus roles en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por email o nombre..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={fetchProfiles} variant="outline">
              Actualizar
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.name || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {profile.role === "admin" ? (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            ) : profile.role === "staff" ? (
                              <UserCheck className="h-4 w-4 text-blue-500" />
                            ) : (
                              <UserX className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="capitalize">{profile.role}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(profile.created_at).toLocaleDateString("es-AR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            defaultValue={profile.role}
                            onValueChange={(value) => updateUserRole(profile.id, value)}
                            disabled={isUpdating[profile.id]}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">Cliente</SelectItem>
                              <SelectItem value="staff">Personal</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
