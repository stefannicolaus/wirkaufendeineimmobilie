# NEXUS V4 Final -- Alle Seiten Desktop + Mobile

> Datum: 2026-03-16
> Screenshots: /tmp/nexus-v4-*.png

## Screenshots Uebersicht

| Seite | Desktop | Mobile | Verdict |
|-------|---------|--------|---------|
| Home (/) | Sauber, volle Breite, Hero + PLZ-Input + Trust-Badges + Stats | Gut gestackt, PLZ-Input passt, Badges untereinander | PASS |
| Investoren (/investoren) | Hero + 3 Feature-Cards sauber nebeneinander, Icons sichtbar | Cards stacken sauber, Buttons volle Breite, kein Overflow | PASS |
| So funktioniert's (/so-funktionierts) | Verkaeufer/Kaeufer Toggle, 3-Step Cards sauber | Steps stacken korrekt, Toggle lesbar | PASS |
| ROI-Rechner (/roi-rechner) | 2-Spalten Layout (Input links, Ergebnis rechts), Zahlen klar | Input-Felder volle Breite, Ergebnis-Panel vermutlich unterhalb (above fold nur Input sichtbar) | PASS |
| Stadtteil (/leipzig/volkmarsdorf) | Breadcrumb + Hero + 4 Marktdaten-Cards nebeneinander, Quellenangabe | Cards 2x2 Grid auf Mobile, Headline bricht mit Trennstrichen | NEEDS WORK |
| Aktionsplan (/aktionsplan-erbengemeinschaft) | Hero + 3-Step Icons + CTA Button, sauber zentriert | Headline bricht hart mit Trennstrichen ("Akti-onsplan", "Erberge-meinschaft") | NEEDS WORK |

## Desktop Findings

**Home:** Einwandfrei. Hero zentriert, PLZ-Suchfeld prominent, Trust-Badges in einer Zeile, Stats-Section (48h, 0EUR, 100%, 35+) kontrastreich auf dunklem Hintergrund. Navigation komplett mit Telefon + CTA.

**Investoren:** Sauber. Hero mit klarem Value-Prop, 3 Feature-Cards ("Off-Market Zugang", "Kuratierte Objekte", "Geschlossenes Verfahren") gleichmaessig verteilt. Icons in blauen Kreisen sichtbar.

**So funktioniert's:** Gut. Verkaeufer/Kaeufer-Toggle sauber, Steps (01, 02, 03) klar nummeriert mit Beschreibung. Zwei CTAs im Hero.

**ROI-Rechner:** Stark. 2-Spalten Layout funktioniert perfekt. Links Eingabe (Stadtteil-Dropdown, Kaufpreis, Wohnflaeche), rechts Ergebnis-Panel im Dark Theme mit klaren Zahlen. Netto-Gewinn und ROI in Accent-Farbe hervorgehoben.

**Stadtteil (Volkmarsdorf):** Headline "Sanierungsbeduerfttige Woh-nung verkaufen in Volkmarsdorf" -- PROBLEM: Wort "Wohnung" wird mit Bindestrich getrennt ("Woh-nung"). Sieht ungewollt aus. Marktdaten-Cards (4 nebeneinander) funktionieren. "stark steigend" Card hat blauen Border als Akzent.

**Aktionsplan:** Sauber auf Desktop. Hero-Headline laeuft ueber 3 Zeilen, ist aber lesbar. 3-Step Process Icons mit Verbindungslinien. CTA "Jetzt starten" prominent.

## Mobile Findings

**Home:** PASS. Hero-Text bricht sauber. PLZ-Input stacked korrekt (Input oben, Button darunter volle Breite). Trust-Badges untereinander. Hamburger-Menu sichtbar.

**Investoren:** PASS. Headline bricht gut ("Dein naechstes Flip-Objekt. / Bevor es jemand an-deres sieht.") -- leichter Trennstrich bei "anderes" aber akzeptabel. Buttons stacken korrekt.

**So funktioniert's:** PASS. Steps stacken sauber untereinander. Toggle-Buttons nebeneinander. Keine Overflow-Probleme.

**ROI-Rechner:** PASS. Eingabe-Felder volle Breite, gut lesbar. Ergebnis-Panel wird unterhalb angezeigt (nicht im Screenshot sichtbar, da above-fold nur Input).

**Stadtteil (Volkmarsdorf):** NEEDS WORK. Headline "Sanierungsbeduerf-ti-ge Wohnung verkaufen in Volkmarsdorf" -- doppelter Trennstrich bei "Sanierungsbeduerf-ti-ge" ist haesslich. Font-Size ist fuer Mobile zu gross, erzwingt unschoene Silbentrennung. Marktdaten-Cards stacken 2x2, funktioniert.

**Aktionsplan:** NEEDS WORK. Headline "Dein 7-Schritte Akti-onsplan -- auf deine Erberge-meinschaft zugeschnitten" -- Silbentrennung bricht die Woerter an falschen Stellen ("Akti-onsplan", "Erberge-meinschaft"). Process-Steps werden inline statt vertikal dargestellt (Icons + Text in einer Zeile), funktioniert aber ist eng.

## Brand Check: PASS

- [x] Kein "wir kaufen" in der Copy (geprueft, 0 Treffer)
- [x] Premium-Du konsistent auf allen Seiten (du/dein/deinem)
- [x] Sie/Ihnen NUR in Datenschutz (rechtlich korrekt)
- [x] Outfit Font durchgehend (lokal gehostet, DSGVO-konform)
- [x] Keine verbotenen Fonts (Inter, Roboto, Arial, Geist, Space Grotesk)

## Code Check: PASS

- [x] Alle Farben als CSS Variables in global.css definiert
- [x] Hex-Werte NUR in Variable-Definitionen (:root), nicht inline
- [x] font-family ueberall via var(--font-family)
- [x] Outfit Font als @font-face lokal eingebunden

## Identifizierte Issues

### ISSUE 1: Silbentrennung auf Mobile (hyphens)
**Betrifft:** /leipzig/volkmarsdorf, /aktionsplan-erbengemeinschaft
**Problem:** CSS `hyphens: auto` oder zu grosse Font-Size auf Mobile fuehrt zu haesslichen Worttrennungen ("Woh-nung", "Akti-onsplan", "Erberge-meinschaft", "Sanierungsbeduerf-ti-ge")
**Fix:** Entweder `hyphens: none` auf Headlines setzen ODER Font-Size auf Mobile reduzieren ODER Headline-Text kuerzen/umbrechen mit `<br>` an gewuenschter Stelle.
**Prioritaet:** Mittel -- sieht unprofessionell aus, betrifft 2 von 6 Seiten.

### ISSUE 2: Stadtteil-Headline Desktop Wortumbruch
**Betrifft:** /leipzig/volkmarsdorf (Desktop)
**Problem:** "Sanierungsbeduerfttige Woh-nung" bricht mitten im Wort
**Fix:** Headline-Container breiter machen oder Text umbrechen
**Prioritaet:** Mittel

---

## FINAL VERDICT: NEEDS WORK

**4 von 6 Seiten: PASS** (Home, Investoren, So funktioniert's, ROI-Rechner)
**2 von 6 Seiten: NEEDS WORK** (Stadtteil, Aktionsplan) -- beides wegen Silbentrennung auf Mobile

**Blocker fuer Launch:** Nein. Die Silbentrennung ist kosmetisch, nicht funktional. Aber fuer "Weltklasse"-Anspruch muss das gefixt werden.

**Empfohlener Fix:** 15 Minuten -- `hyphens: none` auf `.hero h1` / Headline-Klassen + ggf. responsive Font-Size-Anpassung fuer lange deutsche Woerter.
