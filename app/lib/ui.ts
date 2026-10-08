import {
  BedDouble,
  BriefcaseBusiness,
  Plane,
  ShoppingBag,
  Stethoscope,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import type {
  Escenario,
  EstadoSesion,
  NivelMCER,
  TipoError,
} from "./api.types";

export const ESCENARIO_ICON: Record<Escenario, LucideIcon> = {
  restaurante: UtensilsCrossed,
  aeropuerto: Plane,
  hotel: BedDouble,
  entrevista_trabajo: BriefcaseBusiness,
  consultorio_medico: Stethoscope,
  tienda: ShoppingBag,
};

export const NIVEL_DESCRIPCION: Record<NivelMCER, string> = {
  A1: "Principiante",
  A2: "Básico",
  B1: "Intermedio",
  B2: "Intermedio alto",
  C1: "Avanzado",
};

export const ESTADO_LABEL: Record<EstadoSesion, string> = {
  activa: "Activa",
  pausada: "En pausa",
  concluida: "Concluida",
};

export const TIPO_LABEL: Record<TipoError, string> = {
  gramatica: "Gramática",
  vocabulario: "Vocabulario",
  orden: "Orden",
  otro: "Otro",
};

const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
});

const timeFormatter = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatTime(value: string): string {
  return timeFormatter.format(new Date(value));
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
