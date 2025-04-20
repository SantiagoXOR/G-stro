// Script para generar tipos TypeScript a partir del esquema de Supabase

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Cargar configuración de Supabase desde el archivo de configuración
const config = require('./supabase-config');
const supabaseUrl = config.supabaseUrl;
const supabaseServiceKey = config.supabaseServiceKey;

// Verificar que tenemos la clave de servicio
if (!supabaseServiceKey) {
  console.error('Error: No se encontró la clave de servicio de Supabase');
  console.error('Asegúrate de configurar correctamente el archivo scripts/supabase-config.js');
  process.exit(1);
}

// Crear cliente de Supabase con la clave de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para obtener la estructura de la base de datos desde Supabase
async function getDatabaseSchema() {
  try {
    console.log('Obteniendo esquema de la base de datos desde Supabase...');

    // Obtener lista de tablas en el esquema public
    const { data: tables, error: tablesError } = await supabase
      .rpc('pgexec', { sql: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      `});

    if (tablesError) {
      console.error('Error al obtener tablas:', tablesError);
      return null;
    }

    const schema = {};

    // Para cada tabla, obtener sus columnas
    for (const table of tables) {
      const tableName = table.table_name;

      const { data: columns, error: columnsError } = await supabase
        .rpc('pgexec', { sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = '${tableName}'
          ORDER BY ordinal_position
        `});

      if (columnsError) {
        console.error(`Error al obtener columnas para la tabla ${tableName}:`, columnsError);
        continue;
      }

      schema[tableName] = columns;
    }

    // Obtener enums
    const { data: enums, error: enumsError } = await supabase
      .rpc('pgexec', { sql: `
        SELECT t.typname AS enum_name,
               array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        GROUP BY t.typname
      `});

    if (enumsError) {
      console.error('Error al obtener enums:', enumsError);
    } else {
      schema.enums = enums;
    }

    // Obtener relaciones entre tablas
    const { data: relationships, error: relError } = await supabase
      .rpc('pgexec', { sql: `
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
        FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      `});

    if (relError) {
      console.error('Error al obtener relaciones:', relError);
    } else {
      schema.relationships = relationships;
    }

    console.log(`Esquema obtenido con ${Object.keys(schema).length - 2} tablas y ${schema.enums ? schema.enums.length : 0} enums`);
    return schema;
  } catch (err) {
    console.error('Error inesperado al obtener esquema:', err);
    return null;
  }
}

// Función para generar tipos TypeScript
function generateTypeScript(schema) {
  let ts = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
`;

  // Generar tipos para tablas
  for (const [tableName, columns] of Object.entries(schema)) {
    if (tableName === 'enums' || tableName === 'relationships') continue;

    ts += `      ${tableName}: {
        Row: {
`;

    // Columnas para Row
    for (const column of columns) {
      let tsType = mapPostgreSQLTypeToTypeScript(column.data_type);

      // Si es un tipo enum, usar la referencia al enum
      if (column.data_type === 'USER-DEFINED' && schema.enums) {
        // Extraer el nombre del enum del column_default si existe
        const enumMatch = column.column_default ? column.column_default.match(/'[^']*'::([^\s]*)/) : null;
        if (enumMatch && enumMatch[1]) {
          const enumName = enumMatch[1];
          // Verificar si este enum existe en nuestros enums
          const enumExists = schema.enums.some(e => e.enum_name === enumName);
          if (enumExists) {
            tsType = `Database["public"]["Enums"]["${enumName}"]`;
          }
        }
      }

      const nullable = column.is_nullable === 'YES' ? ' | null' : '';
      ts += `          ${column.column_name}: ${tsType}${nullable}\n`;
    }

    ts += `        },\n        Insert: {\n`;

    // Columnas para Insert
    for (const column of columns) {
      let tsType = mapPostgreSQLTypeToTypeScript(column.data_type);

      // Si es un tipo enum, usar la referencia al enum
      if (column.data_type === 'USER-DEFINED' && schema.enums) {
        const enumMatch = column.column_default ? column.column_default.match(/'[^']*'::([^\s]*)/) : null;
        if (enumMatch && enumMatch[1]) {
          const enumName = enumMatch[1];
          const enumExists = schema.enums.some(e => e.enum_name === enumName);
          if (enumExists) {
            tsType = `Database["public"]["Enums"]["${enumName}"]`;
          }
        }
      }

      const nullable = column.is_nullable === 'YES' ? ' | null' : '';
      const optional = column.column_default !== null ? '?' : '';
      ts += `          ${column.column_name}${optional}: ${tsType}${nullable}\n`;
    }

    ts += `        },\n        Update: {\n`;

    // Columnas para Update
    for (const column of columns) {
      let tsType = mapPostgreSQLTypeToTypeScript(column.data_type);

      // Si es un tipo enum, usar la referencia al enum
      if (column.data_type === 'USER-DEFINED' && schema.enums) {
        const enumMatch = column.column_default ? column.column_default.match(/'[^']*'::([^\s]*)/) : null;
        if (enumMatch && enumMatch[1]) {
          const enumName = enumMatch[1];
          const enumExists = schema.enums.some(e => e.enum_name === enumName);
          if (enumExists) {
            tsType = `Database["public"]["Enums"]["${enumName}"]`;
          }
        }
      }

      const nullable = column.is_nullable === 'YES' ? ' | null' : '';
      ts += `          ${column.column_name}?: ${tsType}${nullable}\n`;
    }

    ts += `        },\n        Relationships: [\n`;

    // Generar relaciones basadas en las claves foráneas
    if (schema.relationships) {
      const tableRelationships = schema.relationships.filter(rel => rel.table_name === tableName);

      if (tableRelationships.length > 0) {
        for (const rel of tableRelationships) {
          ts += `          {\n`;
          ts += `            foreignKeyName: "${rel.constraint_name}"\n`;
          ts += `            columns: ["${rel.column_name}"]\n`;
          ts += `            isOneToOne: false\n`; // Por defecto asumimos que no es one-to-one
          ts += `            referencedRelation: "${rel.foreign_table_name}"\n`;
          ts += `            referencedColumns: ["${rel.foreign_column_name}"]\n`;
          ts += `          },\n`;
        }
      } else {
        // Si no hay relaciones, dejamos un array vacío
        ts += ``;
      }
    } else {
      // Si no hay información de relaciones, dejamos un array vacío
      ts += ``;
    }

    ts += `        ]\n      },\n`;
  }

  ts += `    },\n    Views: {\n      [_ in never]: never\n    },\n    Functions: {\n      // Aquí irían las funciones de la base de datos\n    },\n    Enums: {\n`;

  // Generar tipos para enums
  if (schema.enums) {
    for (const enumType of schema.enums) {
      // Convertir el array de valores a string con formato de enum TypeScript
      const enumValues = enumType.enum_values.map(v => `"${v}"`).join(' | ');
      ts += `      ${enumType.enum_name}: ${enumValues}\n`;
    }
  }

  ts += `    },\n    CompositeTypes: {\n      [_ in never]: never\n    }\n  }\n}\n`;

  // Agregar tipos auxiliares
  ts += `\ntype DefaultSchema = Database[Extract<keyof Database, "public">]\n\n`;
  ts += `export type Tables<\n  DefaultSchemaTableNameOrOptions extends\n    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])\n    | { schema: keyof Database },\n  TableName extends DefaultSchemaTableNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &\n        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])\n    : never = never,\n> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }\n  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &\n      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {\n      Row: infer R\n    }\n    ? R\n    : never\n  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &\n        DefaultSchema["Views"])\n    ? (DefaultSchema["Tables"] &\n        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {\n        Row: infer R\n      }\n      ? R\n      : never\n    : never\n\nexport type TablesInsert<\n  DefaultSchemaTableNameOrOptions extends\n    | keyof DefaultSchema["Tables"]\n    | { schema: keyof Database },\n  TableName extends DefaultSchemaTableNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]\n    : never = never,\n> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }\n  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {\n      Insert: infer I\n    }\n    ? I\n    : never\n  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]\n    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {\n        Insert: infer I\n      }\n      ? I\n      : never\n    : never\n\nexport type TablesUpdate<\n  DefaultSchemaTableNameOrOptions extends\n    | keyof DefaultSchema["Tables"]\n    | { schema: keyof Database },\n  TableName extends DefaultSchemaTableNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]\n    : never = never,\n> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }\n  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {\n      Update: infer U\n    }\n    ? U\n    : never\n  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]\n    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {\n        Update: infer U\n      }\n      ? U\n      : never\n    : never\n\nexport type Enums<\n  DefaultSchemaEnumNameOrOptions extends\n    | keyof DefaultSchema["Enums"]\n    | { schema: keyof Database },\n  EnumName extends DefaultSchemaEnumNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]\n    : never = never,\n> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }\n  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]\n  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]\n    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]\n    : never\n\nexport type CompositeTypes<\n  PublicCompositeTypeNameOrOptions extends\n    | keyof DefaultSchema["CompositeTypes"]\n    | { schema: keyof Database },\n  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {\n    schema: keyof Database\n  }\n    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]\n    : never = never,\n> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }\n  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]\n  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]\n    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]\n    : never\n\nexport const Constants = {\n  public: {\n    Enums: {\n`;

  // Generar constantes para enums
  if (schema.enums) {
    for (const enumType of schema.enums) {
      ts += `      ${enumType.enum_name}: [${enumType.enum_values.map(v => `"${v}"`).join(', ')}],\n`;
    }
  }

  ts += `    },\n  },\n} as const`;

  return ts;
}

// Función para mapear tipos de PostgreSQL a TypeScript
function mapPostgreSQLTypeToTypeScript(pgType) {
  const typeMap = {
    'integer': 'number',
    'bigint': 'number',
    'smallint': 'number',
    'decimal': 'number',
    'numeric': 'number',
    'real': 'number',
    'double precision': 'number',
    'character varying': 'string',
    'character': 'string',
    'text': 'string',
    'boolean': 'boolean',
    'json': 'Json',
    'jsonb': 'Json',
    'timestamp with time zone': 'string',
    'timestamp without time zone': 'string',
    'date': 'string',
    'time': 'string',
    'uuid': 'string',
    'USER-DEFINED': 'string', // Para tipos personalizados como enums
  };

  return typeMap[pgType] || 'unknown';
}

// Función principal
async function generateTypes() {
  try {
    console.log('Generando tipos TypeScript a partir del esquema de Supabase...');

    // Obtener esquema
    const schema = await getDatabaseSchema();
    if (!schema) {
      console.error('No se pudo obtener el esquema de la base de datos.');
      process.exit(1);
    }

    // Generar TypeScript
    const typeScript = generateTypeScript(schema);

    // Guardar en archivo
    const outputPath = path.join(__dirname, '..', 'shared', 'types', 'database.types.ts');
    fs.writeFileSync(outputPath, typeScript, 'utf8');

    console.log(`Tipos TypeScript generados correctamente en: ${outputPath}`);

  } catch (err) {
    console.error('Error inesperado:', err);
    process.exit(1);
  }
}

// Ejecutar la función principal
generateTypes();
