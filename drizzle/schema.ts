import { pgTable, check, integer, varchar, unique, text, timestamp, jsonb, date, boolean, serial, uuid, foreignKey, primaryKey, pgView, bigint, inet, doublePrecision, numeric } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"




export const spatialRefSys = pgTable("spatial_ref_sys", {
	srid: integer().primaryKey().notNull(),
	authName: varchar("auth_name", { length: 256 }),
	authSrid: integer("auth_srid"),
	srtext: varchar({ length: 2048 }),
	proj4Text: varchar({ length: 2048 }),
},
(table) => {
	return {
		spatialRefSysSridCheck: check("spatial_ref_sys_srid_check", sql`(srid > 0) AND (srid <= 998999)`),
	}
});

export const authUser = pgTable("auth_user", {
	id: text().primaryKey().notNull(),
	username: varchar({ length: 90 }).notNull(),
	email: varchar({ length: 120 }).notNull(),
	nombre: varchar({ length: 250 }).notNull(),
	fono: varchar({ length: 120 }),
	passwordHash: varchar("password_hash", { length: 120 }),
	activo: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	otros: jsonb(),
	foto: varchar(),
	dob: date(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	idn: serial().notNull(),
	idLargo: uuid("id_largo").default(sql`uuid_generate_v4()`).notNull(),
},
(table) => {
	return {
		authUserUniqueMail: unique("auth_user_unique_mail").on(table.email),
	}
});

export const userSession = pgTable("user_session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	userId: text("user_id").notNull(),
});

export const taTiposYCodigos = pgTable("ta_tipos_y_codigos", {
	id: serial().primaryKey().notNull(),
	nombre: varchar({ length: 200 }).notNull(),
	descripcion: text(),
	activo: integer().default(1).notNull(),
	cssClass: varchar("css_class", { length: 45 }).default(sql`NULL`),
	gruposCodigos: varchar("grupos_codigos", { length: 8 }).default(sql`NULL`),
	idParent: integer("id_parent"),
	icono: varchar({ length: 30 }),
	idLargo: uuid("id_largo").default(sql`uuid_generate_v4()`).notNull(),
	adicionales: jsonb(),
});

export const taGrupoCodigo = pgTable("ta_grupo_codigo", {
	id: serial().primaryKey().notNull(),
	grupoCodigo: varchar("grupo_codigo", { length: 15 }).default(sql`NULL`).notNull(),
	nombreCorto: varchar("nombre_corto", { length: 80 }).notNull(),
	descripcion: varchar({ length: 500 }).default(sql`NULL`),
});

export const test = pgTable("test", {
	id: serial().primaryKey().notNull(),
});

export const oauthAccount = pgTable("oauth_account", {
	providerId: text("provider_id").notNull(),
	providerUserId: text("provider_user_id").notNull(),
	userId: text("user_id").notNull(),
},
(table) => {
	return {
		oauthAccountUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [authUser.id],
			name: "oauth_account_user_id_fkey"
		}),
		oauthAccountPkey: primaryKey({ columns: [table.providerId, table.providerUserId], name: "oauth_account_pkey"}),
	}
});
export const geographyColumns = pgView("geography_columns", {	// TODO: failed to parse database type 'name'
	fTableCatalog: unknown("f_table_catalog"),
	// TODO: failed to parse database type 'name'
	fTableSchema: unknown("f_table_schema"),
	// TODO: failed to parse database type 'name'
	fTableName: unknown("f_table_name"),
	// TODO: failed to parse database type 'name'
	fGeographyColumn: unknown("f_geography_column"),
	coordDimension: integer("coord_dimension"),
	srid: integer(),
	type: text(),
}).as(sql`SELECT current_database() AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geography_column, postgis_typmod_dims(a.atttypmod) AS coord_dimension, postgis_typmod_srid(a.atttypmod) AS srid, postgis_typmod_type(a.atttypmod) AS type FROM pg_class c, pg_attribute a, pg_type t, pg_namespace n WHERE t.typname = 'geography'::name AND a.attisdropped = false AND a.atttypid = t.oid AND a.attrelid = c.oid AND c.relnamespace = n.oid AND (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text)`);

export const geometryColumns = pgView("geometry_columns", {	fTableCatalog: varchar("f_table_catalog", { length: 256 }),
	// TODO: failed to parse database type 'name'
	fTableSchema: unknown("f_table_schema"),
	// TODO: failed to parse database type 'name'
	fTableName: unknown("f_table_name"),
	// TODO: failed to parse database type 'name'
	fGeometryColumn: unknown("f_geometry_column"),
	coordDimension: integer("coord_dimension"),
	srid: integer(),
	type: varchar({ length: 30 }),
}).as(sql`SELECT current_database()::character varying(256) AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geometry_column, COALESCE(postgis_typmod_dims(a.atttypmod), sn.ndims, 2) AS coord_dimension, COALESCE(NULLIF(postgis_typmod_srid(a.atttypmod), 0), sr.srid, 0) AS srid, replace(replace(COALESCE(NULLIF(upper(postgis_typmod_type(a.atttypmod)), 'GEOMETRY'::text), st.type, 'GEOMETRY'::text), 'ZM'::text, ''::text), 'Z'::text, ''::text)::character varying(30) AS type FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid AND NOT a.attisdropped JOIN pg_namespace n ON c.relnamespace = n.oid JOIN pg_type t ON a.atttypid = t.oid LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, replace(split_part(s.consrc, ''''::text, 2), ')'::text, ''::text) AS type FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~~* '%geometrytype(% = %'::text) st ON st.connamespace = n.oid AND st.conrelid = c.oid AND (a.attnum = ANY (st.conkey)) LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, replace(split_part(s.consrc, ' = '::text, 2), ')'::text, ''::text)::integer AS ndims FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~~* '%ndims(% = %'::text) sn ON sn.connamespace = n.oid AND sn.conrelid = c.oid AND (a.attnum = ANY (sn.conkey)) LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, replace(replace(split_part(s.consrc, ' = '::text, 2), ')'::text, ''::text), '('::text, ''::text)::integer AS srid FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~~* '%srid(% = %'::text) sr ON sr.connamespace = n.oid AND sr.conrelid = c.oid AND (a.attnum = ANY (sr.conkey)) WHERE (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT c.relname = 'raster_columns'::name AND t.typname = 'geometry'::name AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text)`);

export const pgStatMonitor = pgView("pg_stat_monitor", {	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	bucket: bigint({ mode: "number" }),
	bucketStartTime: timestamp("bucket_start_time", { withTimezone: true, mode: 'string' }),
	// TODO: failed to parse database type 'oid'
	userid: unknown("userid"),
	username: text(),
	// TODO: failed to parse database type 'oid'
	dbid: unknown("dbid"),
	datname: text(),
	clientIp: inet("client_ip"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pgsmQueryId: bigint("pgsm_query_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	queryid: bigint({ mode: "number" }),
	toplevel: boolean(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	topQueryid: bigint("top_queryid", { mode: "number" }),
	query: text(),
	comments: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	planid: bigint({ mode: "number" }),
	queryPlan: text("query_plan"),
	topQuery: text("top_query"),
	applicationName: text("application_name"),
	relations: text(),
	cmdType: integer("cmd_type"),
	cmdTypeText: text("cmd_type_text"),
	elevel: integer(),
	sqlcode: text(),
	message: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	calls: bigint({ mode: "number" }),
	totalExecTime: doublePrecision("total_exec_time"),
	minExecTime: doublePrecision("min_exec_time"),
	maxExecTime: doublePrecision("max_exec_time"),
	meanExecTime: doublePrecision("mean_exec_time"),
	stddevExecTime: doublePrecision("stddev_exec_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	rows: bigint({ mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksHit: bigint("shared_blks_hit", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksRead: bigint("shared_blks_read", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksDirtied: bigint("shared_blks_dirtied", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksWritten: bigint("shared_blks_written", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksHit: bigint("local_blks_hit", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksRead: bigint("local_blks_read", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksDirtied: bigint("local_blks_dirtied", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksWritten: bigint("local_blks_written", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tempBlksRead: bigint("temp_blks_read", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tempBlksWritten: bigint("temp_blks_written", { mode: "number" }),
	blkReadTime: doublePrecision("blk_read_time"),
	blkWriteTime: doublePrecision("blk_write_time"),
	tempBlkReadTime: doublePrecision("temp_blk_read_time"),
	tempBlkWriteTime: doublePrecision("temp_blk_write_time"),
	respCalls: text("resp_calls"),
	cpuUserTime: doublePrecision("cpu_user_time"),
	cpuSysTime: doublePrecision("cpu_sys_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	walRecords: bigint("wal_records", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	walFpi: bigint("wal_fpi", { mode: "number" }),
	walBytes: numeric("wal_bytes"),
	bucketDone: boolean("bucket_done"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	plans: bigint({ mode: "number" }),
	totalPlanTime: doublePrecision("total_plan_time"),
	minPlanTime: doublePrecision("min_plan_time"),
	maxPlanTime: doublePrecision("max_plan_time"),
	meanPlanTime: doublePrecision("mean_plan_time"),
	stddevPlanTime: doublePrecision("stddev_plan_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitFunctions: bigint("jit_functions", { mode: "number" }),
	jitGenerationTime: doublePrecision("jit_generation_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitInliningCount: bigint("jit_inlining_count", { mode: "number" }),
	jitInliningTime: doublePrecision("jit_inlining_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitOptimizationCount: bigint("jit_optimization_count", { mode: "number" }),
	jitOptimizationTime: doublePrecision("jit_optimization_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitEmissionCount: bigint("jit_emission_count", { mode: "number" }),
	jitEmissionTime: doublePrecision("jit_emission_time"),
}).as(sql`SELECT bucket, bucket_start_time, userid, username, dbid, datname, '0.0.0.0'::inet + client_ip AS client_ip, pgsm_query_id, queryid, toplevel, top_queryid, query, comments, planid, query_plan, top_query, application_name, string_to_array(relations, ','::text) AS relations, cmd_type, get_cmd_type(cmd_type) AS cmd_type_text, elevel, sqlcode, message, calls, total_exec_time, min_exec_time, max_exec_time, mean_exec_time, stddev_exec_time, rows, shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, local_blks_hit, local_blks_read, local_blks_dirtied, local_blks_written, temp_blks_read, temp_blks_written, shared_blk_read_time AS blk_read_time, shared_blk_write_time AS blk_write_time, temp_blk_read_time, temp_blk_write_time, string_to_array(resp_calls, ','::text) AS resp_calls, cpu_user_time, cpu_sys_time, wal_records, wal_fpi, wal_bytes, bucket_done, plans, total_plan_time, min_plan_time, max_plan_time, mean_plan_time, stddev_plan_time, jit_functions, jit_generation_time, jit_inlining_count, jit_inlining_time, jit_optimization_count, jit_optimization_time, jit_emission_count, jit_emission_time FROM pg_stat_monitor_internal(true) pg_stat_monitor_internal(bucket, userid, username, dbid, datname, client_ip, queryid, planid, query, query_plan, pgsm_query_id, top_queryid, top_query, application_name, relations, cmd_type, elevel, sqlcode, message, bucket_start_time, calls, total_exec_time, min_exec_time, max_exec_time, mean_exec_time, stddev_exec_time, rows, plans, total_plan_time, min_plan_time, max_plan_time, mean_plan_time, stddev_plan_time, shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, local_blks_hit, local_blks_read, local_blks_dirtied, local_blks_written, temp_blks_read, temp_blks_written, shared_blk_read_time, shared_blk_write_time, local_blk_read_time, local_blk_write_time, temp_blk_read_time, temp_blk_write_time, resp_calls, cpu_user_time, cpu_sys_time, wal_records, wal_fpi, wal_bytes, comments, jit_functions, jit_generation_time, jit_inlining_count, jit_inlining_time, jit_optimization_count, jit_optimization_time, jit_emission_count, jit_emission_time, jit_deform_count, jit_deform_time, stats_since, minmax_stats_since, toplevel, bucket_done) ORDER BY bucket_start_time`);

export const pgStatStatementsInfo = pgView("pg_stat_statements_info", {	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dealloc: bigint({ mode: "number" }),
	statsReset: timestamp("stats_reset", { withTimezone: true, mode: 'string' }),
}).as(sql`SELECT dealloc, stats_reset FROM pg_stat_statements_info() pg_stat_statements_info(dealloc, stats_reset)`);

export const pgStatStatements = pgView("pg_stat_statements", {	// TODO: failed to parse database type 'oid'
	userid: unknown("userid"),
	// TODO: failed to parse database type 'oid'
	dbid: unknown("dbid"),
	toplevel: boolean(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	queryid: bigint({ mode: "number" }),
	query: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	plans: bigint({ mode: "number" }),
	totalPlanTime: doublePrecision("total_plan_time"),
	minPlanTime: doublePrecision("min_plan_time"),
	maxPlanTime: doublePrecision("max_plan_time"),
	meanPlanTime: doublePrecision("mean_plan_time"),
	stddevPlanTime: doublePrecision("stddev_plan_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	calls: bigint({ mode: "number" }),
	totalExecTime: doublePrecision("total_exec_time"),
	minExecTime: doublePrecision("min_exec_time"),
	maxExecTime: doublePrecision("max_exec_time"),
	meanExecTime: doublePrecision("mean_exec_time"),
	stddevExecTime: doublePrecision("stddev_exec_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	rows: bigint({ mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksHit: bigint("shared_blks_hit", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksRead: bigint("shared_blks_read", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksDirtied: bigint("shared_blks_dirtied", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sharedBlksWritten: bigint("shared_blks_written", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksHit: bigint("local_blks_hit", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksRead: bigint("local_blks_read", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksDirtied: bigint("local_blks_dirtied", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	localBlksWritten: bigint("local_blks_written", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tempBlksRead: bigint("temp_blks_read", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tempBlksWritten: bigint("temp_blks_written", { mode: "number" }),
	blkReadTime: doublePrecision("blk_read_time"),
	blkWriteTime: doublePrecision("blk_write_time"),
	tempBlkReadTime: doublePrecision("temp_blk_read_time"),
	tempBlkWriteTime: doublePrecision("temp_blk_write_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	walRecords: bigint("wal_records", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	walFpi: bigint("wal_fpi", { mode: "number" }),
	walBytes: numeric("wal_bytes"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitFunctions: bigint("jit_functions", { mode: "number" }),
	jitGenerationTime: doublePrecision("jit_generation_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitInliningCount: bigint("jit_inlining_count", { mode: "number" }),
	jitInliningTime: doublePrecision("jit_inlining_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitOptimizationCount: bigint("jit_optimization_count", { mode: "number" }),
	jitOptimizationTime: doublePrecision("jit_optimization_time"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jitEmissionCount: bigint("jit_emission_count", { mode: "number" }),
	jitEmissionTime: doublePrecision("jit_emission_time"),
}).as(sql`SELECT userid, dbid, toplevel, queryid, query, plans, total_plan_time, min_plan_time, max_plan_time, mean_plan_time, stddev_plan_time, calls, total_exec_time, min_exec_time, max_exec_time, mean_exec_time, stddev_exec_time, rows, shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, local_blks_hit, local_blks_read, local_blks_dirtied, local_blks_written, temp_blks_read, temp_blks_written, blk_read_time, blk_write_time, temp_blk_read_time, temp_blk_write_time, wal_records, wal_fpi, wal_bytes, jit_functions, jit_generation_time, jit_inlining_count, jit_inlining_time, jit_optimization_count, jit_optimization_time, jit_emission_count, jit_emission_time FROM pg_stat_statements(true) pg_stat_statements(userid, dbid, toplevel, queryid, query, plans, total_plan_time, min_plan_time, max_plan_time, mean_plan_time, stddev_plan_time, calls, total_exec_time, min_exec_time, max_exec_time, mean_exec_time, stddev_exec_time, rows, shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, local_blks_hit, local_blks_read, local_blks_dirtied, local_blks_written, temp_blks_read, temp_blks_written, blk_read_time, blk_write_time, temp_blk_read_time, temp_blk_write_time, wal_records, wal_fpi, wal_bytes, jit_functions, jit_generation_time, jit_inlining_count, jit_inlining_time, jit_optimization_count, jit_optimization_time, jit_emission_count, jit_emission_time)`);