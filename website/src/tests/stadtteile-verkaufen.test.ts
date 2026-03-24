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
