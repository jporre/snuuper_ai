import { z } from 'zod';

const detalleCampaniaSchema = z.array(z.object({
  id_linea: z.number().int().optional(), // serial4 is auto-incrementing, typically not provided on insert
  id_campania: z.number().int().nullable(), // int4 can be null
  userid: z.string().nullable(), // varchar can be null
  nombre_completo: z.string().nullable(), // varchar can be null
  email: z.string().email(), // varchar NOT NULL, must be a valid email
  estado: z.number().int().default(1), // int4 DEFAULT 1
  enviado: z.boolean().default(false), // bool DEFAULT false
  recibido: z.boolean().default(false), // bool DEFAULT false
  rechazado: z.boolean().default(false), // bool DEFAULT false
  fecha_envio: z.date().nullable(), // timestamptz can be null
  fecha_recibido: z.date().nullable(), // timestamptz can be null
  fecha_rechazo: z.date().nullable(), // timestamptz can be null
  razon_rechazo: z.string().nullable(), // varchar can be null
  fecha_creacion: z.date().default(() => new Date()), // timestamptz DEFAULT CURRENT_TIMESTAMP
  estado_notificacion: z.string().max(10).default('CREADO').nullable(), // varchar(10) DEFAULT 'CREADO'
  fecha_ultimo_estado: z.date().nullable(), // timestamptz can be null
})).default([]);

export type detalleCampania = z.infer<typeof detalleCampaniaSchema>;