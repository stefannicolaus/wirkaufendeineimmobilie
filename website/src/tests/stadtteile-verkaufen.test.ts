import { describe, it, expect } from 'vitest';
import {
  getObjektTypText,
  getMilieuschutzText,
  MILIEUSCHUTZ_FAQ,
  SZENARIEN,
  type ObjektTyp,
} from '../lib/stadtteile-verkaufen/copy';

describe('getObjektTypText', () => {
  const typen: ObjektTyp[] = ['altbau', 'gruenderzeit', 'plattenbau', 'mischbebauung'];

  it('gibt nicht-leeren Text für alle 4 Typen zurück', () => {
    typen.forEach(typ => {
      const text = getObjektTypText(typ, 'Connewitz');
      expect(text.length).toBeGreaterThan(50);
    });
  });

  it('enthält den Stadtteilnamen', () => {
    typen.forEach(typ => {
      const text = getObjektTypText(typ, 'Plagwitz');
      expect(text).toContain('Plagwitz');
    });
  });

  it('altbau-Text enthält Denkmalschutz-Hinweis', () => {
    const text = getObjektTypText('altbau', 'Gohlis');
    expect(text).toContain('denkmalgeschützt');
  });

  it('plattenbau-Text enthält GEG-Hinweis', () => {
    const text = getObjektTypText('plattenbau', 'Grünau-Ost');
    expect(text).toContain('Gebäudeenergiegesetz');
  });
});

describe('getMilieuschutzText', () => {
  it('enthält § 172 BauGB', () => {
    expect(getMilieuschutzText('Connewitz')).toContain('§ 172');
  });

  it('enthält den Stadtteilnamen', () => {
    expect(getMilieuschutzText('Lindenau')).toContain('Lindenau');
  });
});

describe('MILIEUSCHUTZ_FAQ', () => {
  it('hat genau 2 Einträge', () => {
    expect(MILIEUSCHUTZ_FAQ).toHaveLength(2);
  });

  it('jeder Eintrag hat question-Funktion und answer-String', () => {
    MILIEUSCHUTZ_FAQ.forEach(item => {
      expect(typeof item.question).toBe('function');
      expect(typeof item.answer).toBe('string');
      expect(item.answer.length).toBeGreaterThan(20);
    });
  });

  it('question-Funktion setzt Stadtteilnamen ein', () => {
    expect(MILIEUSCHUTZ_FAQ[0].question('Leutzsch')).toContain('Leutzsch');
  });
});

describe('SZENARIEN', () => {
  it('hat genau 3 Szenarien', () => {
    expect(SZENARIEN).toHaveLength(3);
  });

  it('jedes Szenario hat icon, titel und text', () => {
    SZENARIEN.forEach(s => {
      expect(s.icon).toBeTruthy();
      expect(s.titel.length).toBeGreaterThan(5);
      expect(s.text.length).toBeGreaterThan(50);
    });
  });
});

import { STADTTEILE, getBySlug, groupByBezirk, BEZIRK_ORDER } from '../data/stadtteile-verkaufen';

describe('STADTTEILE data integrity', () => {
  it('hat 56 Einträge (Immowelt-Preisdaten, Stand März 2026)', () => {
    // Leipzig hat 63 Stadtteile — Immowelt-Daten decken 56 ab.
    // Stefan kann fehlende Einträge ergänzen; dann diesen Wert anpassen.
    expect(STADTTEILE).toHaveLength(56);
  });

  it('alle slugs sind eindeutig', () => {
    const slugs = STADTTEILE.map(st => st.slug);
    expect(new Set(slugs).size).toBe(56);
  });

  it('alle preise sind positive Ganzzahlen', () => {
    STADTTEILE.forEach(st => {
      expect(st.preis).toBeGreaterThan(0);
      expect(Number.isInteger(st.preis)).toBe(true);
    });
  });

  it('genau 11 Stadtteile haben milieuschutz=true', () => {
    const ms = STADTTEILE.filter(st => st.milieuschutz);
    expect(ms).toHaveLength(11);
  });

  it('alle milieuschutz-slugs stimmen mit dem bekannten Set überein', () => {
    const expected = new Set([
      'eutritzsch', 'schoenefeld-abtnaundorf', 'neustadt-neuschoenef',
      'volkmarsdorf', 'reudnitz-thonberg', 'connewitz', 'plagwitz',
      'kleinzschocher', 'lindenau', 'alt-lindenau', 'leutzsch',
    ]);
    const actual = new Set(STADTTEILE.filter(st => st.milieuschutz).map(st => st.slug));
    expect(actual).toEqual(expected);
  });

  it('alle nachbarn-slugs existieren in der Datei', () => {
    const allSlugs = new Set(STADTTEILE.map(st => st.slug));
    STADTTEILE.forEach(st => {
      st.nachbarn.forEach(n => {
        expect(allSlugs.has(n), `${st.slug} hat ungültigen Nachbar-Slug: ${n}`).toBe(true);
      });
    });
  });

  it('alle bezirk-Werte sind gültige BezirkName-Werte', () => {
    const valid = new Set(['Zentrum', 'Nord', 'Ost', 'West', 'Süd', 'Stadtrand']);
    STADTTEILE.forEach(st => {
      expect(valid.has(st.bezirk), `${st.slug} hat ungültigen Bezirk: ${st.bezirk}`).toBe(true);
    });
  });

  it('alle objekttyp-Werte sind gültig', () => {
    const valid = new Set(['altbau', 'gruenderzeit', 'plattenbau', 'mischbebauung']);
    STADTTEILE.forEach(st => {
      expect(valid.has(st.objekttyp), `${st.slug} hat ungültigen Typ: ${st.objekttyp}`).toBe(true);
    });
  });
});

describe('groupByBezirk', () => {
  it('gibt alle 6 Bezirke zurück', () => {
    const groups = groupByBezirk();
    expect(Object.keys(groups)).toHaveLength(BEZIRK_ORDER.length);
  });

  it('Summe aller Gruppen = 56', () => {
    const groups = groupByBezirk();
    const total = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0);
    expect(total).toBe(56);
  });
});

describe('getBySlug', () => {
  it('findet Connewitz', () => {
    const st = getBySlug('connewitz');
    expect(st?.name).toBe('Connewitz');
    expect(st?.preis).toBe(2669);
  });

  it('gibt undefined für unbekannten Slug', () => {
    expect(getBySlug('nichtvorhanden')).toBeUndefined();
  });
});
