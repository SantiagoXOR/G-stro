import { NextRequest, NextResponse } from 'next/server'
import { clerkClient, auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Inicializar cliente de Supabase con la clave de servicio
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    // Verificar si el usuario es administrador
    const { data: adminData } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (!adminData || adminData.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }
    
    // Obtener datos del cuerpo de la solicitud
    const { targetUserId, role } = await req.json()
    
    if (!targetUserId || !role) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }
    
    // Validar el rol
    if (!['admin', 'staff', 'customer'].includes(role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }
    
    // Actualizar el rol en Clerk
    await clerkClient.users.updateUser(targetUserId, {
      unsafeMetadata: { role }
    })
    
    // Actualizar el rol en Supabase
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)
    
    if (error) {
      console.error('Error al actualizar rol en Supabase:', error)
      return NextResponse.json({ error: 'Error al actualizar rol en Supabase' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: `Rol actualizado a ${role}` })
  } catch (error) {
    console.error('Error al actualizar rol de usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
