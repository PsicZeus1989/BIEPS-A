// ============================================================
// Configuración de Supabase
// ============================================================
// Reemplaza los dos valores de abajo con los de TU proyecto:
// Supabase → tu proyecto → Project Settings → API Keys
//
//   SUPABASE_URL       = "Project URL"
//   SUPABASE_ANON_KEY  = la llave "Publishable key" (sb_publishable_...)
//                         — o, si tu proyecto todavía solo muestra las
//                         llaves antiguas, la "anon public" (empieza
//                         con "eyJ..."). Cualquiera de las dos sirve
//                         aquí, la librería de Supabase acepta ambas.
//
// IMPORTANTE: TODOS los valores en este archivo quedan visibles para
// cualquiera que abra el sitio (así funciona una app que corre en el
// navegador) — por eso solo va aquí una llave de bajo privilegio.
//
// NUNCA pegues aquí la "Secret key" (sb_secret_...) ni la antigua
// "service_role": esas dos se saltan por completo la seguridad de la
// base de datos (Row Level Security) y le darían a cualquiera que
// vea el código acceso total de lectura y escritura a la tabla de
// respuestas — nombres, matrículas y puntajes de los estudiantes
// incluidos. Esas dos llaves son solo para código que corre en un
// servidor que tú controlas, nunca para un sitio como este.
// ============================================================

const SUPABASE_URL = "https://lfluritocexmduxkdmec.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9IrwusmCmxs3xGlRR_puqg_gAvn492E";
