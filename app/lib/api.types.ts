export type UserRead = {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserCreate = {
  email: string;
  username: string;
  password: string;
};

export type UserLogin = {
  email: string;
  password: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserRead;
};

export type Escenario =
  | "restaurante"
  | "aeropuerto"
  | "hotel"
  | "entrevista_trabajo"
  | "consultorio_medico"
  | "tienda";

export type NivelMCER = "A1" | "A2" | "B1" | "B2" | "C1";

export type EstadoSesion = "activa" | "pausada" | "concluida";

export type RolTurno = "agente" | "estudiante";

export type TipoError = "gramatica" | "vocabulario" | "orden" | "otro";

export type EscenarioRead = {
  clave: Escenario;
  nombre: string;
  descripcion: string;
};

export type CatalogoRead = {
  escenarios: EscenarioRead[];
  niveles: NivelMCER[];
};

export type SesionCreate = {
  escenario: Escenario;
  nivel: NivelMCER;
};

export type TurnoHistorial = {
  rol: RolTurno;
  contenido: string;
  fecha: string;
};

export type EvaluacionSistema = {
  calificacion: number;
  comentario?: string | null;
  fecha: string;
};

export type SesionResumen = {
  id_sesion: string;
  escenario: Escenario;
  nivel: NivelMCER;
  estado: EstadoSesion;
  fecha_inicio: string;
  fecha_fin?: string | null;
};

export type SesionListado = SesionResumen & {
  puede_reanudarse: boolean;
};

export type SesionRead = SesionResumen & {
  historial: TurnoHistorial[];
  evaluacion_sistema?: EvaluacionSistema | null;
};

export type TurnoCreate = {
  texto: string;
};

export type TurnoRespuesta = {
  id_sesion: string;
  estado: EstadoSesion;
  texto_estudiante: string;
  mensaje: TurnoHistorial;
};

export type CorreccionIA = {
  tipo: TipoError;
  original: string;
  correccion: string;
  explicacion: string;
};

export type RetroalimentacionRead = {
  id_retroalimentacion: string;
  entrada_usuario: string;
  correccion_ia: CorreccionIA;
};

export type InformeRead = {
  id_sesion: string;
  escenario: Escenario;
  nivel: NivelMCER;
  generado_en: string;
  resumen: string;
  gramatica: string[];
  vocabulario: string[];
  areas_mejora: string[];
  fortalezas: string[];
  errores: CorreccionIA[];
  retroalimentaciones: RetroalimentacionRead[];
  aviso: string;
};

export type EvaluacionCreate = {
  calificacion: number;
  comentario?: string | null;
};

export type ErrorDetail = {
  code: string;
  message: string;
};

export type ErrorResponse = {
  detail: ErrorDetail;
};

export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};

export type ValidationErrorResponse = {
  detail: ValidationError[];
};
