import type { ModoPractica } from "./api.types";

export type { ModoPractica };

export function modoDesdeRuta(pathname: string): ModoPractica {
  return pathname.startsWith("/practice/writing") ? "writing" : "speaking";
}

export function rutaPractica(modo: ModoPractica): string {
  return `/practice/${modo}`;
}

export function rutaSesion(modo: ModoPractica, idSesion: string): string {
  return `/practice/${modo}/${idSesion}`;
}
