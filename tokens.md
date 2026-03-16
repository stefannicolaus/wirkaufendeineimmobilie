# Design Tokens — wirkaufendeineimmobilie.de

> Single Source of Truth. Extrahiert aus Brand V2 "Direkt & Modern" (bestaetigt 16.03.2026).
> Stack: Astro — CSS Custom Properties, kein Tailwind.

---

## Farben

### Brand-Palette

```css
:root {
  /* Primary — Slate (Vertrauen, Serioesitaet) */
  --color-primary: #0F172A;
  --color-primary-light: #1E293B;
  --color-primary-muted: #334155;

  /* Accent — Blau (Aktion, Dynamik) */
  --color-accent: #3B82F6;
  --color-accent-hover: #2563EB;
  --color-accent-light: #DBEAFE;

  /* Success — Gruen (Fortschritt, Abschluss) */
  --color-success: #10B981;
  --color-success-light: #D1FAE5;

  /* Warning */
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;

  /* Error */
  --color-error: #EF4444;
  --color-error-light: #FEE2E2;

  /* Backgrounds */
  --color-bg: #FAFBFC;          /* Leicht getinted, nicht pure white */
  --color-bg-alt: #F1F5F9;
  --color-bg-card: #FFFFFF;
  --color-bg-dark: #0F172A;     /* = Primary, fuer dunkle Sektionen */

  /* Text */
  --color-text: #0F172A;        /* = Primary */
  --color-text-mid: #64748B;
  --color-text-muted: #94A3B8;
  --color-text-on-dark: #F8FAFC;
  --color-text-on-accent: #FFFFFF;

  /* Borders */
  --color-border: #E2E8F0;
  --color-border-strong: #CBD5E1;
}
```

### Farb-Regeln
- **60-30-10:** 60% Bg/White, 30% Slate, 10% Blau (Accent)
- **Kein pure #000 oder #fff** — immer getinted (Anti-Slop)
- **Accent NUR fuer CTAs und Highlights** — nicht dekorativ streuen
- **Slate-Sektionen** fuer Kontrast-Wechsel (Investor-Card, Footer)

---

## Typography

### Font: Outfit (Google Fonts)

**Warum Outfit:**
- Geometrisch, clean, modern — passt zu "Tech-Clean wie SaaS"
- Gewichte 100-900 verfuegbar → starke Hierarchie
- Nicht auf der Verbotsliste (Anti-Slop)
- Gute Lesbarkeit auch bei kleineren Groessen
- Variable Font → ein Request, alle Gewichte

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### Type Scale (Modular, Major Third 1.25)

```css
:root {
  --font-family: 'Outfit', sans-serif;

  /* Sizes — fluid mit clamp */
  --text-xs:   clamp(0.75rem, 0.7rem + 0.25vw, 0.8rem);     /* 12-13px */
  --text-sm:   clamp(0.8125rem, 0.76rem + 0.26vw, 0.875rem); /* 13-14px */
  --text-base: clamp(0.9375rem, 0.88rem + 0.28vw, 1rem);     /* 15-16px */
  --text-lg:   clamp(1.125rem, 1.05rem + 0.38vw, 1.25rem);   /* 18-20px */
  --text-xl:   clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);      /* 20-24px */
  --text-2xl:  clamp(1.5rem, 1.2rem + 1.5vw, 1.875rem);      /* 24-30px */
  --text-3xl:  clamp(1.875rem, 1.5rem + 1.88vw, 2.5rem);     /* 30-40px */
  --text-4xl:  clamp(2.25rem, 1.7rem + 2.75vw, 3.25rem);     /* 36-52px */

  /* Weights */
  --weight-light: 300;
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-extrabold: 800;

  /* Line Heights */
  --leading-tight: 1.1;    /* Headlines */
  --leading-snug: 1.3;     /* Subheadlines */
  --leading-normal: 1.6;   /* Body */
  --leading-relaxed: 1.7;  /* Long-form */

  /* Letter Spacing */
  --tracking-tight: -0.02em;   /* Headlines */
  --tracking-normal: 0;        /* Body */
  --tracking-wide: 0.05em;     /* Labels, Badges */
  --tracking-wider: 0.1em;     /* Uppercase Labels */
}
```

### Typography-Klassen

| Rolle | Size | Weight | Leading | Tracking | Einsatz |
|-------|------|--------|---------|----------|---------|
| Display | --text-4xl | 800 | tight | tight | Hero Headlines |
| H1 | --text-3xl | 800 | tight | tight | Seiten-Titel |
| H2 | --text-2xl | 700 | snug | tight | Sektions-Titel |
| H3 | --text-xl | 700 | snug | normal | Card-Titel, Unter-Sektionen |
| H4 | --text-lg | 600 | snug | normal | Sub-Headlines |
| Body | --text-base | 400 | normal | normal | Fliesstext |
| Body Small | --text-sm | 400 | normal | normal | Nebeninfo |
| Label | --text-xs | 600 | tight | wider | Badges, Tags, Meta |
| Stat Number | --text-4xl | 800 | tight | tight | Zahlen-Highlights |
| Stat Unit | --text-xl | 600 | tight | normal | Einheiten neben Stats |

---

## Spacing (4pt Base Grid)

```css
:root {
  --space-1:  0.25rem;  /*  4px */
  --space-2:  0.5rem;   /*  8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-5:  1.25rem;  /* 20px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  /* Section Spacing — fluid */
  --section-gap: clamp(3rem, 2rem + 5vw, 6rem);
  --container-max: 1120px;
  --container-padding: clamp(1rem, 0.5rem + 2.5vw, 3rem);
}
```

---

## Border Radius

```css
:root {
  --radius-sm:   6px;    /* Buttons, Inputs */
  --radius-md:   10px;   /* Cards, kleine Container */
  --radius-lg:   16px;   /* Grosse Cards, Sektionen */
  --radius-xl:   24px;   /* Hero-Elemente, Feature-Cards */
  --radius-full: 9999px; /* Badges, Avatare, Dots */
}
```

---

## Shadows (Layered — Anti-Slop)

```css
:root {
  /* Subtle — Cards im Ruhezustand */
  --shadow-sm:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 1px 3px rgba(15, 23, 42, 0.06);

  /* Medium — Hover, aktive Cards */
  --shadow-md:
    0 2px 4px rgba(15, 23, 42, 0.04),
    0 4px 12px rgba(15, 23, 42, 0.08);

  /* Elevated — Dropdowns, Modals, Hero-Form */
  --shadow-lg:
    0 4px 8px rgba(15, 23, 42, 0.04),
    0 8px 24px rgba(15, 23, 42, 0.1);

  /* Accent-Glow — CTA Buttons */
  --shadow-accent:
    0 2px 4px rgba(59, 130, 246, 0.15),
    0 4px 16px rgba(59, 130, 246, 0.2);
}
```

---

## Logo-Behandlung

### Wortmarke

```
wirkaufen[deine]immobilie
```

- **"wirkaufen"** + **"immobilie"** → `--color-primary` (#0F172A), weight 800
- **"deine"** → `--color-accent` (#3B82F6), weight 800
- Font: Outfit, 20px (Nav), 28px (Footer), 36px (Standalone)
- Kein Icon/Symbol — reine Wortmarke
- Keine Trennung durch Punkte oder Leerzeichen
- Lowercase durchgehend

### Logo-Varianten

| Kontext | Behandlung |
|---------|-----------|
| Heller Hintergrund | Primary + Accent "deine" |
| Dunkler Hintergrund (Slate) | White + Accent "deine" |
| Favicon | "WDI" in Accent auf Primary-Quadrat (radius-sm) |
| OG-Image | Zentriert, auf Primary-Hintergrund |

---

## Transitions

```css
:root {
  --ease-default: cubic-bezier(0.25, 1, 0.5, 1);  /* ease-out-quart */
  --duration-fast: 100ms;    /* Instant Feedback (hover color) */
  --duration-normal: 200ms;  /* State Changes (button press) */
  --duration-slow: 350ms;    /* Layout Shifts (accordion, tabs) */
  --duration-enter: 500ms;   /* Entrance Animations (page load) */
}
```

---

## Breakpoints

```css
/* Mobile-First (min-width) */
--bp-sm:  640px;   /* Large phones */
--bp-md:  768px;   /* Tablets */
--bp-lg:  1024px;  /* Laptops */
--bp-xl:  1280px;  /* Desktops */
```

---

## Z-Index Scale

```css
:root {
  --z-base:    0;
  --z-above:   10;
  --z-sticky:  100;
  --z-nav:     200;
  --z-modal:   300;
  --z-toast:   400;
}
```
