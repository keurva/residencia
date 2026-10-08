# Tokens — Cosa

Fuente de verdad implementada en `app/app.css` (Tailwind v4 `@theme` + `@theme inline`).
Estilo: soft modern (tarjetas redondeadas, sombras suaves, bordes hairline). Acento azul. Inter.

## Primitive

- Neutros `--gray-50…950`: gris frío (hue 255, chroma 0.003–0.014).
- Acento `--accent-50…950`: azul (hue 254–268); `--accent-600` es el acento base.
- Semánticos: `--green-400/600` (éxito), `--amber-400/600` (aviso), `--red-400/600` (error).
- Espaciado: escala Tailwind (base 4 px; los valores 2/4/6/8/12… son la retícula 8 pt).
- Tipografía: `--text-xs…5xl`, pesos 400/500/600/700, `--tracking-tight` en display.
- Radios: `--radius-sm` 6 px (inputs), `--radius-lg` 10 px (tarjetas), `--radius-xl` 14 px (modales), `--radius-2xl` 20 px (burbujas).
- Sombras: capas ambient + directa (`--shadow-sm/md/lg/xl`); en oscuro se sustituyen por anillo de borde.
- Movimiento: `--duration-fast` 150 ms, `--duration-normal` 250 ms; `--ease-out-quart` para entradas.
- Z: capas semánticas (dropdown 10, sticky 20, backdrop 30, modal 40, toast 50).

## Semantic (claro / oscuro)

| Token | Claro | Oscuro |
|---|---|---|
| `--surface-canvas` | blanco | gris 950 frío tintado (no negro puro) |
| `--surface-raised` | gris 50 | gris 900 |
| `--surface-panel` | blanco | gris 800 |
| `--surface-sunken` | gris 100 | más oscuro que canvas |
| `--text-primary` | gris 900 | gris 50 |
| `--text-secondary` | gris 600 | gris 400 |
| `--text-tertiary` | gris 400 | gris 600 |
| `--border-subtle/default/strong` | negro 6/12/24 % | blanco 6/12/24 % |
| `--accent-bg` | accent-600 | accent-580 + chroma reducida |
| `--accent-soft` | accent 12 % sobre blanco | accent 18 % transparente |
| estados | bg suave + texto 600 | igual con bg tintado |

Utilidades Tailwind expuestas: `bg-canvas`, `bg-raised`, `bg-panel`, `bg-sunken`, `text-ink`, `text-ink-2`, `text-ink-3`, `border-line`, `border-line-strong`, `bg-accent`, `bg-accent-soft`, `text-accent`, `bg-danger-soft`, etc.

## Reglas de aplicación

- Un solo acento (azul); el color semántico solo para estado (punto + texto), nunca decoración.
- Números con `tabular-nums`; fechas y duraciones nunca en píldoras de color.
- Radios variados por elemento (input 6, tarjeta 10, modal 14, burbuja 20) — nunca uniformes.
- En oscuro la profundidad es borde/anillo, no sombra.
- Movimiento con Motion: entra 200 ms, sale ~75 % (150 ms); `MotionConfig reducedMotion="user"`.
