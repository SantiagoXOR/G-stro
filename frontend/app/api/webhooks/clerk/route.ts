import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Inicializar cliente de Supabase con la clave de servicio
// para tener acceso completo a la base de datos
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  // Obtener los headers para verificar la firma
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Si falta algún header requerido, devolver error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Headers de verificación faltantes', {
      status: 400
    });
  }

  // Obtener el cuerpo de la solicitud
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verificar la firma del webhook
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error al verificar el webhook:', err);
    return new Response('Error: Firma inválida', {
      status: 400
    });
  }

  // Manejar diferentes tipos de eventos
  const eventType = evt.type;
  console.log(`Webhook recibido: ${eventType}`);

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Evento no manejado: ${eventType}`);
    }

    return new Response('Webhook procesado correctamente', { status: 200 });
  } catch (error) {
    console.error('Error al procesar el webhook:', error);
    return new Response('Error al procesar el webhook', { status: 500 });
  }
}

// Función para manejar la creación de usuarios
async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url, created_at, unsafe_metadata } = data;

  // Obtener el email principal
  const primaryEmail = email_addresses.find((email: any) => email.id === data.primary_email_address_id)?.email_address;

  if (!primaryEmail) {
    console.error('No se pudo obtener el email principal del usuario:', id);
    throw new Error('Email principal no encontrado');
  }

  // Construir el nombre completo
  const fullName = `${first_name || ''} ${last_name || ''}`.trim();

  // Obtener el rol de los metadatos o usar 'customer' por defecto
  const role = unsafe_metadata?.role || 'customer';

  // Insertar el usuario en la tabla profiles de Supabase
  const { error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: id, // Usar el ID de Clerk como ID en Supabase
      email: primaryEmail,
      name: fullName || null,
      role: role,
      created_at: created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error al insertar perfil en Supabase:', error);

    // Verificar si el error es por duplicado (el perfil ya existe)
    if (error.code === '23505') { // Código de error de PostgreSQL para violación de restricción única
      console.log(`El perfil ya existe, intentando actualizar: ${id}`);

      // Intentar actualizar en su lugar
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          email: primaryEmail,
          name: fullName || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error al actualizar perfil existente:', updateError);
        throw updateError;
      }

      console.log(`Perfil actualizado en Supabase: ${id}`);
      return;
    }

    throw error;
  }

  console.log(`Perfil creado en Supabase: ${id}`);
}

// Función para manejar la actualización de usuarios
async function handleUserUpdated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = data;

  // Obtener el email principal
  const primaryEmail = email_addresses.find((email: any) => email.id === data.primary_email_address_id)?.email_address;

  if (!primaryEmail) {
    console.error('No se pudo obtener el email principal del usuario:', id);
    throw new Error('Email principal no encontrado');
  }

  // Construir el nombre completo
  const fullName = `${first_name || ''} ${last_name || ''}`.trim();

  // Obtener el rol de los metadatos o mantener el existente
  const updateData: any = {
    email: primaryEmail,
    name: fullName || null,
    updated_at: new Date().toISOString(),
  };

  // Solo actualizar el rol si está presente en los metadatos
  if (unsafe_metadata && unsafe_metadata.role) {
    updateData.role = unsafe_metadata.role;
  }

  // Actualizar el perfil en la tabla profiles de Supabase
  const { error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar perfil en Supabase:', error);

    // Si el perfil no existe, intentar crearlo
    if (error.code === 'PGRST116') { // Código para "no rows updated"
      console.log(`El perfil no existe, intentando crearlo: ${id}`);

      // Asegurarse de que tenemos un rol
      if (!updateData.role) {
        updateData.role = 'customer'; // Rol por defecto
      }

      // Intentar crear el perfil
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: id,
          email: primaryEmail,
          name: fullName || null,
          role: updateData.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error al crear perfil faltante:', insertError);
        throw insertError;
      }

      console.log(`Perfil creado en Supabase: ${id}`);
      return;
    }

    throw error;
  }

  console.log(`Perfil actualizado en Supabase: ${id}`);
}

// Función para manejar la eliminación de usuarios
async function handleUserDeleted(data: any) {
  const { id } = data;

  // Verificar si el perfil existe
  const { data: profileData, error: checkError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error al verificar existencia del perfil:', checkError);
    throw checkError;
  }

  // Si el perfil no existe, no hay nada que hacer
  if (!profileData) {
    console.log(`No se encontró perfil para eliminar con ID: ${id}`);
    return;
  }

  // Opción 1: Eliminar el perfil de la base de datos
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', id);

  // Opción 2 (alternativa): Marcar el perfil como eliminado (soft delete)
  // Requiere añadir una columna is_deleted a la tabla profiles
  /*
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  */

  if (error) {
    console.error('Error al eliminar perfil en Supabase:', error);
    throw error;
  }

  console.log(`Perfil eliminado en Supabase: ${id}`);

  // Nota: También se podrían eliminar datos relacionados como pedidos, reservas, etc.
  // Pero eso depende de la lógica de negocio específica
}
