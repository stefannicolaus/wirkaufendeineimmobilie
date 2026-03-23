// website/public/interview-tool/topics.js
// 12 Interview-Guides für das WKDI Joachim Interview Tool
// Jedes Topic: Einstieg → Best Practices → Pain Points → Learning Loop
// hiddenAgenda: null | 'WHAT' | 'HOW' | 'WHO'

export const TOPICS = [

  // ──────────────────────────────────────────────
  // 1. Fix & Flip
  // ──────────────────────────────────────────────
  {
    id: 'fix-flip',
    label: 'Fix & Flip Immobilienhandel',
    emoji: '🔨',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'ff_e1',
            text: 'Wie bist du zum Fix & Flip gekommen — war das ein bewusster Einstieg oder hat sich das aus einem anderen Geschäft heraus entwickelt?',
            hiddenAgenda: null
          },
          {
            id: 'ff_e2',
            text: 'Was war dein erster Deal und was hast du daraus mitgenommen, das dich bis heute begleitet?',
            hiddenAgenda: null
          },
          {
            id: 'ff_e3',
            text: 'Wie viele Projekte hast du aktuell parallel laufen und wie sieht dein typischer Deal-Zyklus aus — vom Ankauf bis zum Exit?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'ff_bp1',
            text: 'Wenn du die MAO berechnest — wie gehst du mit dem Renovation Budget um? Rechnest du pauschal 20-30% Puffer oder hast du ein anderes System?',
            hiddenAgenda: null
          },
          {
            id: 'ff_bp2',
            text: 'Die Baukostenexplosion der letzten Jahre hat ja vielen die Kalkulation zerschossen. Welches konkrete Problem in deinem Workflow hat dir am meisten Kopfzerbrechen gemacht — und wie löst du das heute?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'ff_bp3',
            text: 'Wie sicherst du dich gegen Altlasten und versteckte Mängel ab — Schimmel, Asbest, Feuchtigkeit? Machst du immer ein vollständiges Gutachten oder hast du Abkürzungen gefunden?',
            hiddenAgenda: null
          },
          {
            id: 'ff_bp4',
            text: 'ARV-Ermittlung in einem Markt der sich schnell bewegt — wie stellst du sicher, dass dein Exit-Preis realistisch ist und du nicht auf dem Objekt sitzen bleibst?',
            hiddenAgenda: null
          },
          {
            id: 'ff_bp5',
            text: 'Grunderwerbsteuer, Spekulationssteuer, §35a — wie denkst du die steuerliche Seite von Anfang an mit in den Deal rein?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'ff_pp1',
            text: 'Erzähl mir von einem Projekt, wo die Holding Costs dir das Genick gebrochen haben — was ist passiert?',
            hiddenAgenda: null
          },
          {
            id: 'ff_pp2',
            text: 'Handwerkerknappheit ist ja das Dauerthema. Was war dein härtester Fall, wo ein Gewerk nicht performt hat und der ganze Zeitplan gekippt ist?',
            hiddenAgenda: null
          },
          {
            id: 'ff_pp3',
            text: 'Behördenverzögerungen bei Baugenehmigungen — hattest du mal einen Fall wo das den ganzen Deal gefährdet hat?',
            hiddenAgenda: null
          },
          {
            id: 'ff_pp4',
            text: 'Wenn du dir die perfekte Lösung für dein größtes operatives Problem beim Flippen vorstellen könntest — wie würde die konkret aussehen? Was müsste die können?',
            hiddenAgenda: 'HOW'
          },
          {
            id: 'ff_pp5',
            text: 'Cashflow-Lücke zwischen Ankauf und Exit — wie überbrückst du die, und gab es mal eine Situation wo die Kreditlinie nicht gereicht hat?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'ff_ll1',
            text: 'Wenn du deinem jüngeren Ich einen einzigen Rat für Fix & Flip geben könntest — was wäre das?',
            hiddenAgenda: null
          },
          {
            id: 'ff_ll2',
            text: 'Wem in der Branche vertraust du wirklich, wenn es um Deal-Bewertung oder Kalkulation geht — und was müsste jemand mitbringen, damit du für dessen Expertise bezahlen würdest?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────
  // 2. Buy & Hold
  // ──────────────────────────────────────────────
  {
    id: 'buy-hold',
    label: 'Buy & Hold Bestandsimmobilien',
    emoji: '🏢',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'bh_e1',
            text: 'Was war deine Strategie beim Aufbau deines Portfolios — hast du von Anfang an Buy & Hold gemacht oder kam das mit der Zeit?',
            hiddenAgenda: null
          },
          {
            id: 'bh_e2',
            text: 'Wie viele Einheiten hältst du aktuell und in welchen Lagen — und nach welchen Kriterien hast du die ausgewählt?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'bh_bp1',
            text: 'Nettomietrendite vs. Cash-on-Cash Return — welche Kennzahl steuerst du wirklich und warum?',
            hiddenAgenda: null
          },
          {
            id: 'bh_bp2',
            text: 'Die Zinsbindungsenden laufen ja gerade massenhaft aus. Welches konkrete Problem siehst du da bei deinen Beständen — und wie gehst du damit um?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'bh_bp3',
            text: 'Mieterhöhung nach Modernisierung — §559 ist ja ein Minenfeld. Wie gehst du das strategisch an, ohne die Mieter zu verlieren?',
            hiddenAgenda: null
          },
          {
            id: 'bh_bp4',
            text: 'Energetische Sanierungspflicht durch das GEG — hast du schon konkrete Maßnahmen ergriffen oder wartest du ab?',
            hiddenAgenda: null
          },
          {
            id: 'bh_bp5',
            text: 'WEG-Versammlungen und Mehrheitsentscheidungen — hast du Strategien entwickelt, um Blockaden zu vermeiden?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'bh_pp1',
            text: 'Erzähl mir von einem Objekt, das auf dem Papier perfekt aussah — Vervielfältiger, Lage, Zustand — und dann zum Problemkind wurde. Was ist passiert?',
            hiddenAgenda: null
          },
          {
            id: 'bh_pp2',
            text: 'Was war dein härtester Leerstand und wie lange hat es gedauert, bis du das wieder in den Griff bekommen hast?',
            hiddenAgenda: null
          },
          {
            id: 'bh_pp3',
            text: 'Betriebskostenabrechnung nach §556 BGB — hattest du mal einen Fall wo das richtig eskaliert ist mit Mietern?',
            hiddenAgenda: null
          },
          {
            id: 'bh_pp4',
            text: 'Wenn du dir ein ideales Werkzeug bauen könntest, das dir bei der Bestandsverwaltung den größten Stress nimmt — wie würde das funktionieren?',
            hiddenAgenda: 'HOW'
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'bh_ll1',
            text: 'Was würdest du bei deinen ersten drei Objekten heute anders machen?',
            hiddenAgenda: null
          },
          {
            id: 'bh_ll2',
            text: 'Wem vertraust du bei der Bewertung von Bestandsobjekten — und wem würdest du Geld dafür zahlen, dass er dir die wirklich guten Deals zeigt?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────
  // 3. Aufteilergeschäft
  // ──────────────────────────────────────────────
  {
    id: 'aufteiler',
    label: 'Aufteilergeschäft',
    emoji: '🏗️',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'au_e1',
            text: 'Wie bist du ins Aufteilergeschäft reingerutscht — war das ein logischer nächster Schritt oder eher Zufall?',
            hiddenAgenda: null
          },
          {
            id: 'au_e2',
            text: 'Was war dein erstes Aufteilungsprojekt und wie lange hat der gesamte Prozess von Ankauf bis zum Verkauf der letzten Einheit gedauert?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'au_bp1',
            text: 'Abgeschlossenheitsbescheinigung — alle klagen über die Wartezeiten. Hast du Wege gefunden, das zu beschleunigen, oder kalkulierst du die 6-18 Monate einfach ein?',
            hiddenAgenda: null
          },
          {
            id: 'au_bp2',
            text: 'Milieuschutz ist ja in Berlin, München, Hamburg ein Riesenthema. Was ist das konkrete Problem, das dir am meisten im Weg steht, wenn du ein MFH aufteilen willst?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'au_bp3',
            text: 'Wie strukturierst du die Teilungserklärung — machst du das selbst mit Notar oder hast du da einen spezialisierten Anwalt?',
            hiddenAgenda: null
          },
          {
            id: 'au_bp4',
            text: 'Kauffaktor pro Einheit vs. Gesamtobjekt — wie ermittelst du den Sweet Spot, ab dem sich die Aufteilung wirklich lohnt?',
            hiddenAgenda: null
          },
          {
            id: 'au_bp5',
            text: 'Sperrfrist nach §577a — wie gehst du damit um? Hältst du die Einheiten und vermietest, oder verkaufst du nur an Kapitalanleger?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'au_pp1',
            text: 'Erzähl mir von einem Aufteilungsprojekt, wo das Vorkaufsrecht der Mieter nach §577a alles verkompliziert hat — wie hast du das gelöst?',
            hiddenAgenda: null
          },
          {
            id: 'au_pp2',
            text: 'Was war dein härtester Fall mit der WEG-Gründung — gab es Quorum-Probleme oder Streit bei der ersten Versammlung?',
            hiddenAgenda: null
          },
          {
            id: 'au_pp3',
            text: 'Finanzierungsrisiko in der Haltephase — hattest du mal eine Situation wo die Bank kalte Füße bekommen hat, weil Splittergrundstücke nicht finanziert wurden?',
            hiddenAgenda: null
          },
          {
            id: 'au_pp4',
            text: 'Wenn du dir den perfekten Ablauf für eine Aufteilung vorstellen könntest — von der Prüfung bis zum Exit jeder Einheit — wie würde der idealerweise funktionieren?',
            hiddenAgenda: 'HOW'
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'au_ll1',
            text: 'Welchen Fehler beim Aufteilen würdest du nie wieder machen?',
            hiddenAgenda: null
          },
          {
            id: 'au_ll2',
            text: 'Wem würdest du vertrauen, wenn du ein komplexes Aufteilungsprojekt in einem Milieuschutzgebiet durchziehen müsstest — und was wäre dir diese Expertise wert?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────
  // 4. Immobilieninvestoren
  // ──────────────────────────────────────────────
  {
    id: 'investoren',
    label: 'Immobilieninvestoren',
    emoji: '💼',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'iv_e1',
            text: 'Was war der Moment, wo du vom Angestellten oder Selbstständigen zum Immobilieninvestor geworden bist — gab es einen Auslöser?',
            hiddenAgenda: null
          },
          {
            id: 'iv_e2',
            text: 'Wie sieht dein Deal Flow heute aus — woher kommen deine Deals und wie viele schaust du dir an, bevor du einen machst?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'iv_bp1',
            text: 'IRR vs. MOIC vs. Cash-on-Cash — welche Kennzahl ist für dich die ehrlichste und warum?',
            hiddenAgenda: null
          },
          {
            id: 'iv_bp2',
            text: 'Off-Market-Deals — alle reden davon, aber kaum jemand hat konstanten Zugang. Welches konkrete Problem beim Deal Flow treibt dich am meisten um?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'iv_bp3',
            text: 'Due Diligence — ab welcher Dealgröße lohnt sich für dich der volle Aufwand und wie kürzt du bei kleineren Deals ab?',
            hiddenAgenda: null
          },
          {
            id: 'iv_bp4',
            text: 'Steuerstruktur — KG, GmbH, privat? Wie denkst du die Struktur von Anfang an mit und was hat sich als Fehler herausgestellt?',
            hiddenAgenda: null
          },
          {
            id: 'iv_bp5',
            text: 'Spekulationsfrist 10 Jahre nach §23 EStG — wie beeinflusst die deine Exit-Strategie konkret?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'iv_pp1',
            text: 'Erzähl mir von einem Deal, wo die Due Diligence sauber war und es trotzdem schiefgegangen ist — was hast du übersehen?',
            hiddenAgenda: null
          },
          {
            id: 'iv_pp2',
            text: 'Was war dein härtester Moment mit einer Finanzierungslücke in der Zwischenfinanzierung?',
            hiddenAgenda: null
          },
          {
            id: 'iv_pp3',
            text: 'Netzwerk-Asymmetrie — die besten Deals sehen nur wenige. Hattest du mal eine Situation, wo du einen Deal verloren hast, weil jemand schneller war?',
            hiddenAgenda: null
          },
          {
            id: 'iv_pp4',
            text: 'Wenn du dir die ideale Lösung für dein Deal-Sourcing vorstellen könntest — wie würde die funktionieren, damit du die richtigen Deals früher siehst?',
            hiddenAgenda: 'HOW'
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'iv_ll1',
            text: 'Welche Investitionsentscheidung würdest du rückblickend komplett anders treffen?',
            hiddenAgenda: null
          },
          {
            id: 'iv_ll2',
            text: 'Wem vertraust du in deinem Netzwerk wirklich bei Deal-Bewertungen — und was müsste ein Dienstleister mitbringen, damit du ihn dauerhaft bezahlst?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────
  // 5. Immobilienmakler
  // ──────────────────────────────────────────────
  {
    id: 'makler',
    label: 'Immobilienmakler',
    emoji: '🤝',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'mk_e1',
            text: 'Wie lange bist du schon als Makler aktiv und wie hat sich dein Geschäftsmodell seit der Provisionsteilung 2020 verändert?',
            hiddenAgenda: null
          },
          {
            id: 'mk_e2',
            text: 'Was ist dein typisches Objekt — Bestand, Neubau, Anlage? Und wie sieht dein Akquise-Mix zwischen Alleinauftrag und offenem Auftrag aus?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'mk_bp1',
            text: 'Alleinauftrag durchsetzen ist ja die Königsdisziplin. Wie überzeugst du Eigentümer, dir exklusiv zu vertrauen?',
            hiddenAgenda: null
          },
          {
            id: 'mk_bp2',
            text: 'Die Portalkosten für Immoscout und Immowelt steigen ja ständig. Welches konkrete Problem bei der Leadgenerierung bereitet dir am meisten Sorgen?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'mk_bp3',
            text: 'Bonitätsprüfung vor dem Notartermin — wie gründlich machst du das und hattest du schon Fälle, wo Käufer doch abgesprungen sind?',
            hiddenAgenda: null
          },
          {
            id: 'mk_bp4',
            text: 'Bieterverfahren — setzt du das ein und wenn ja, wie reagieren Verkäufer und Käufer darauf?',
            hiddenAgenda: null
          },
          {
            id: 'mk_bp5',
            text: 'DSGVO bei Interessentendaten — wie managst du das praktisch im Tagesgeschäft?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'mk_pp1',
            text: 'Erzähl mir von einem Objekt, das sich am Markt verbrannt hat — Kaufpreis zu hoch angesetzt, monatelang drin, am Ende runterpreisen. Wie gehst du damit um?',
            hiddenAgenda: null
          },
          {
            id: 'mk_pp2',
            text: 'Was war dein härtester Fall mit der Provisionsteilung nach §656c — hat das einen Deal gekostet?',
            hiddenAgenda: null
          },
          {
            id: 'mk_pp3',
            text: 'PropTechs und digitale Maklermodelle — spürst du den Druck und wenn ja, wo genau?',
            hiddenAgenda: null
          },
          {
            id: 'mk_pp4',
            text: 'Wenn du dir das perfekte System für deine Maklertätigkeit vorstellen könntest — Akquise, Vermarktung, Abschluss — wie würde das idealerweise ablaufen?',
            hiddenAgenda: 'HOW'
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'mk_ll1',
            text: 'Was hättest du am Anfang deiner Maklerkarriere gerne gewusst, das dir niemand gesagt hat?',
            hiddenAgenda: null
          },
          {
            id: 'mk_ll2',
            text: 'Wem würdest du als Makler wirklich vertrauen, wenn es um Tools, Weiterbildung oder Netzwerk geht — und was wäre dir das wert?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────
  // 6. Kapitalanlagevertrieb
  // ──────────────────────────────────────────────
  {
    id: 'kapitalanlage',
    label: 'Kapitalanlagevertrieb',
    emoji: '📊',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'ka_e1',
            text: 'Wie bist du in den Kapitalanlagevertrieb gekommen — über §34c, §34f, oder einen ganz anderen Weg?',
            hiddenAgenda: null
          },
          {
            id: 'ka_e2',
            text: 'Was ist dein typisches Produkt — Denkmal, Neubau-ETW, Pflegeimmobilie? Und wie sieht dein Kundenprofil aus?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'ka_bp1',
            text: 'Denkmal-AfA ist ja das Zugpferd im Vertrieb. Wie stellst du sicher, dass die Objekte auch wirklich die versprochene Rendite liefern?',
            hiddenAgenda: null
          },
          {
            id: 'ka_bp2',
            text: 'Die Storno-Welle seit der Zinswende — Käufer aus 2021/22 können nicht mehr finanzieren. Welches Problem in deinem Geschäft hat dich das am härtesten getroffen?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'ka_bp3',
            text: 'Beratungsdokumentation nach §34f — wie managst du das effizient, ohne dass es zum Verwaltungsmonster wird?',
            hiddenAgenda: null
          },
          {
            id: 'ka_bp4',
            text: 'Qualitätskontrolle bei der Sanierung von Denkmal-Objekten — hast du da eigene Prozesse oder verlässt du dich auf den Bauträger?',
            hiddenAgenda: null
          },
          {
            id: 'ka_bp5',
            text: 'Renditeberechnung inklusive aller Nebenkosten — wie transparent bist du da mit deinen Kunden, und wie reagieren die darauf?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'ka_pp1',
            text: 'Erzähl mir von einem Fall, wo ein Denkmal-Objekt massiv überbewertet war und der Kunde sich beschwert hat — wie bist du damit umgegangen?',
            hiddenAgenda: null
          },
          {
            id: 'ka_pp2',
            text: 'Was war dein härtester Storno-Fall — Kunde hat nach Notartermin die Finanzierung verloren?',
            hiddenAgenda: null
          },
          {
            id: 'ka_pp3',
            text: '§34f-Regulierung wird ja immer strenger. Hast du schon mal einen Deal verloren, weil die Dokumentationsanforderungen zu hoch waren?',
            hiddenAgenda: null
          },
          {
            id: 'ka_pp4',
            text: 'Wenn du dir die perfekte Lösung vorstellen könntest, um deine Kunden durch den gesamten Kaufprozess — von der Beratung bis zur Übergabe — sicher zu begleiten, wie würde die funktionieren?',
            hiddenAgenda: 'HOW'
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'ka_ll1',
            text: 'Was hat sich in deinem Vertriebsansatz seit der Zinswende fundamental geändert?',
            hiddenAgenda: null
          },
          {
            id: 'ka_ll2',
            text: 'Wem vertraust du wirklich, wenn es um Objektprüfung und Renditevalidierung geht — und was müsste jemand liefern, damit du dauerhaft dafür bezahlst?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────
  // 7. Klassische Finanzierung
  // ──────────────────────────────────────────────
  {
    id: 'finanzierung',
    label: 'Klassische Finanzierung',
    emoji: '🏦',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'fi_e1',
            text: 'Wie lange finanzierst du schon Immobilien und wie hat sich die Landschaft seit der Zinswende 2022 für dich verändert?',
            hiddenAgenda: null
          },
          {
            id: 'fi_e2',
            text: 'Was ist dein typisches Finanzierungsvolumen und arbeitest du eher mit Privatinvestoren oder gewerblichen Kunden?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'fi_bp1',
            text: 'Zinsbindung 5 vs. 10 vs. 15 Jahre — wie berätst du deine Kunden und was war rückblickend die beste Empfehlung?',
            hiddenAgenda: null
          },
          {
            id: 'fi_bp2',
            text: 'BelWertV und die Bankbewertung vs. Kaufpreis — welches konkrete Problem siehst du da am häufigsten bei deinen Kunden?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'fi_bp3',
            text: 'KfW 297/298 und BEG-Förderung — wie integrierst du das in die Finanzierungsstruktur und wie oft wird das vergessen?',
            hiddenAgenda: null
          },
          {
            id: 'fi_bp4',
            text: 'DSCR als Kennzahl — ab welchem Wert wirst du nervös und wie kommunizierst du das den Kunden?',
            hiddenAgenda: null
          },
          {
            id: 'fi_bp5',
            text: 'Bereitstellungszinsen bei langen Bauzeiten — wie verhandelst du die bereitstellungszinsfreie Zeit und was sind realistische Konditionen?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'fi_pp1',
            text: 'Erzähl mir von einem Fall, wo ein Kreditnehmer nach der Zinswende seine Anschlussfinanzierung nicht mehr stemmen konnte — wie ist das ausgegangen?',
            hiddenAgenda: null
          },
          {
            id: 'fi_pp2',
            text: 'Was war dein härtester Fall mit Basel III-Anforderungen — Eigenkapital reicht plötzlich nicht mehr, Deal platzt?',
            hiddenAgenda: null
          },
          {
            id: 'fi_pp3',
            text: 'Blanko-Darlehen sind ja fast unmöglich geworden. Wie gehst du mit Kunden um, die das noch aus der alten Zeit kennen?',
            hiddenAgenda: null
          },
          {
            id: 'fi_pp4',
            text: 'Wenn du dir den perfekten Finanzierungsprozess vorstellen könntest — vom Erstgespräch bis zur Auszahlung — wie würde der idealerweise aussehen, damit nichts mehr schiefgeht?',
            hiddenAgenda: 'HOW'
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'fi_ll1',
            text: 'Welche Finanzierungsstruktur, die du früher empfohlen hast, würdest du heute nie wieder machen?',
            hiddenAgenda: null
          },
          {
            id: 'fi_ll2',
            text: 'Wem vertraust du bei komplexen Finanzierungsstrukturen — und wem würdest du eine Vermittlungsgebühr zahlen, weil er wirklich bessere Konditionen rausholt?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────
  // 8. Mezzanine Kapital
  // ──────────────────────────────────────────────
  {
    id: 'mezzanine',
    label: 'Mezzanine Kapital',
    emoji: '🔗',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'mz_e1',
            text: 'Wie bist du mit Mezzanine-Finanzierung in Berührung gekommen — von der Kapitalgeber- oder der Kapitalsucher-Seite?',
            hiddenAgenda: null
          },
          {
            id: 'mz_e2',
            text: 'Was ist dein typischer Mezzanine-Deal — Nachrangdarlehen, Equity Kicker, PIK-Struktur? Und in welchen Größenordnungen bewegst du dich?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'mz_bp1',
            text: 'Renditeerwartung 8-15% bei Nachrangdarlehen — wie strukturierst du das, damit das Risiko-Rendite-Verhältnis für beide Seiten fair ist?',
            hiddenAgenda: null
          },
          {
            id: 'mz_bp2',
            text: 'Die Regulierungsgrauzone zwischen VermAnlG und KAGB — welches konkrete Problem bereitet dir da im Tagesgeschäft die größten Kopfschmerzen?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'mz_bp3',
            text: 'Exit-Sicherung ohne Grundbucheintrag — wie schützt du dich als Mezzanine-Geber wirklich?',
            hiddenAgenda: null
          },
          {
            id: 'mz_bp4',
            text: 'Covenants bei Mezzanine-Tranchen — welche sind für dich nicht verhandelbar und warum?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'mz_pp1',
            text: 'Erzähl mir von einem Mezzanine-Deal, wo die Senior-Finanzierung wackelig wurde — was ist passiert und wie hast du dich geschützt?',
            hiddenAgenda: null
          },
          {
            id: 'mz_pp2',
            text: 'Was war dein härtester Fall mit einer Nachrangabrede — hat §39 InsO dich mal wirklich getroffen?',
            hiddenAgenda: null
          },
          {
            id: 'mz_pp3',
            text: 'Equity Kicker Bewertung — hattest du Fälle, wo das am Ende weniger wert war als gedacht?',
            hiddenAgenda: null
          },
          {
            id: 'mz_pp4',
            text: 'Wenn du dir die ideale Mezzanine-Struktur vorstellen könntest, die sowohl für den Kapitalgeber als auch für den Developer funktioniert — wie müsste die aufgebaut sein?',
            hiddenAgenda: 'HOW'
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'mz_ll1',
            text: 'Was hast du über Mezzanine-Kapital gelernt, das in keinem Lehrbuch steht?',
            hiddenAgenda: null
          },
          {
            id: 'mz_ll2',
            text: 'Wem würdest du bei einer komplexen Mezzanine-Strukturierung vertrauen — und was müsste der mitbringen, damit du ihn dauerhaft als Berater engagierst?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────
  // 9. Partiarische Darlehen
  // ──────────────────────────────────────────────
  {
    id: 'partiarisch',
    label: 'Partiarische Darlehen',
    emoji: '📈',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'pa_e1',
            text: 'Wie bist du auf partiarische Darlehen als Finanzierungsform gestoßen — war das ein bewusster Schritt weg von klassischen Modellen?',
            hiddenAgenda: null
          },
          {
            id: 'pa_e2',
            text: 'Bist du eher auf der Geber- oder der Nehmer-Seite und wie viele solcher Strukturen hast du schon aufgesetzt?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'pa_bp1',
            text: 'Gewinnbemessungsgrundlage — wie definierst du die in der Praxis, damit es hinterher keinen Streit gibt?',
            hiddenAgenda: null
          },
          {
            id: 'pa_bp2',
            text: 'Die Abgrenzung zur stillen Gesellschaft ist ja rechtlich heikel. Was ist das konkrete Problem, das du bei der steuerlichen Einordnung am häufigsten siehst?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'pa_bp3',
            text: 'VermAnlG-Prospektpflicht ab €6M — wie positionierst du dich unter dieser Grenze und was passiert wenn du drüber kommst?',
            hiddenAgenda: null
          },
          {
            id: 'pa_bp4',
            text: 'Kündigungsregelung nach §489 BGB — wie strukturierst du die Laufzeiten, damit beide Seiten Planungssicherheit haben?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'pa_pp1',
            text: 'Erzähl mir von einem Fall, wo die Gewinnbeteiligung am Ende anders ausgefallen ist als erwartet — wie hat der Kapitalgeber reagiert?',
            hiddenAgenda: null
          },
          {
            id: 'pa_pp2',
            text: 'Was war dein härtester Moment mit der steuerlichen Behandlung — Kapitalertrag vs. gewerbliche Einkünfte, Finanzamt sieht es anders?',
            hiddenAgenda: null
          },
          {
            id: 'pa_pp3',
            text: 'Rückzahlungsrisiko ohne Grundbucheintrag — hattest du mal einen Fall wo das wirklich kritisch wurde?',
            hiddenAgenda: null
          },
          {
            id: 'pa_pp4',
            text: 'Wenn du dir das perfekte Vertragswerk für ein partiarisches Darlehen vorstellen könntest — wie müsste das aufgebaut sein, damit es für beide Seiten wasserdicht ist?',
            hiddenAgenda: 'HOW'
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'pa_ll1',
            text: 'Was würdest du beim nächsten partiarischen Darlehen von Anfang an anders aufsetzen?',
            hiddenAgenda: null
          },
          {
            id: 'pa_ll2',
            text: 'Wem vertraust du bei der rechtlichen Strukturierung — und was müsste ein Steuerberater oder Anwalt mitbringen, damit du ihn dafür langfristig bezahlst?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────
  // 10. Eigentümerdarlehen / Vendor Loan
  // ──────────────────────────────────────────────
  {
    id: 'eigentuemer-darlehen',
    label: 'Eigentümerdarlehen / Vendor Loan',
    emoji: '🤲',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'ed_e1',
            text: 'Wie bist du zum Thema Verkäuferdarlehen gekommen — hat sich das aus einem Deal ergeben, wo die klassische Finanzierung nicht funktioniert hat?',
            hiddenAgenda: null
          },
          {
            id: 'ed_e2',
            text: 'In welchen Situationen setzt du Vendor Loans ein und wie oft kommt das in deiner Praxis vor?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'ed_bp1',
            text: 'Nachrangigkeit im Grundbuch — wie erklärst du dem Verkäufer das Risiko und unter welchen Bedingungen macht er trotzdem mit?',
            hiddenAgenda: null
          },
          {
            id: 'ed_bp2',
            text: 'Banken wollen ja oft keinen Vendor Loan im selben Objekt. Welches konkrete Problem erlebst du da am häufigsten und wie löst du es?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'ed_bp3',
            text: 'Notarielle Beurkundung bei Grundstücksdarlehen — wie strukturierst du das sauber, damit es rechtlich hält?',
            hiddenAgenda: null
          },
          {
            id: 'ed_bp4',
            text: 'Steuerliche Behandlung der Zinsen beim Verkäufer als Kapitalertrag nach §20 EStG — wie adressierst du das in den Verhandlungen?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'ed_pp1',
            text: 'Erzähl mir von einem Fall, wo der Käufer trotz Vendor Loan abgesprungen ist — wie hat sich das auf den Deal ausgewirkt?',
            hiddenAgenda: null
          },
          {
            id: 'ed_pp2',
            text: 'Was war dein härtester Moment mit einem Vendor Loan — Käufer-Insolvenz, Laufzeit zu kurz, oder etwas ganz anderes?',
            hiddenAgenda: null
          },
          {
            id: 'ed_pp3',
            text: 'Mischform zwischen Kaufpreis-Stundung und echtem Darlehen — hattest du Fälle, wo das nicht sauber getrennt war und Probleme verursacht hat?',
            hiddenAgenda: null
          },
          {
            id: 'ed_pp4',
            text: 'Wenn du dir die perfekte Absicherung für beide Seiten bei einem Vendor Loan vorstellen könntest — wie würde die strukturiert sein?',
            hiddenAgenda: 'HOW'
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'ed_ll1',
            text: 'Welchen Fehler bei einem Eigentümerdarlehen würdest du nie wieder machen?',
            hiddenAgenda: null
          },
          {
            id: 'ed_ll2',
            text: 'Wem würdest du vertrauen, wenn du einen Vendor Loan strukturieren musst — und was wäre dir diese Expertise wert?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────
  // 11. Private Equity Immobilien
  // ──────────────────────────────────────────────
  {
    id: 'private-equity',
    label: 'Private Equity Immobilien',
    emoji: '💰',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'pe_e1',
            text: 'Wie bist du in den PE-Immobilien-Bereich gekommen — über einen institutionellen Hintergrund oder als Unternehmer?',
            hiddenAgenda: null
          },
          {
            id: 'pe_e2',
            text: 'Was für eine Fondsgröße managst du und wie sieht dein LP-Profil aus — Family Offices, institutionelle, private HNWIs?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'pe_bp1',
            text: 'KAGB-Regulierung und KVG-Zulassung — wie hast du das gelöst und was hat die BaFin-Zulassung wirklich gekostet?',
            hiddenAgenda: null
          },
          {
            id: 'pe_bp2',
            text: 'Fondsdomizil Deutschland vs. Luxemburg — welches konkrete Problem hat dich bei der Strukturierung am meisten beschäftigt?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'pe_bp3',
            text: 'Carry-Modell für dein Team — wie strukturierst du den Carried Interest, damit er für GPs attraktiv ist und LPs es akzeptieren?',
            hiddenAgenda: null
          },
          {
            id: 'pe_bp4',
            text: 'Hurdle Rate und Preferred Return — was ist marktüblich im DACH-Raum und wie verhandelst du das mit den LPs?',
            hiddenAgenda: null
          },
          {
            id: 'pe_bp5',
            text: 'Investor Relations — wie oft reportest du und was wollen deine LPs wirklich wissen?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'pe_pp1',
            text: 'Erzähl mir von einem Exit, der in einem schwierigen Marktumfeld stattfinden musste — wie bist du damit umgegangen?',
            hiddenAgenda: null
          },
          {
            id: 'pe_pp2',
            text: 'Was war dein härtester Moment in der J-Curve — wie hast du die LPs bei Laune gehalten, als die ersten Jahre rot waren?',
            hiddenAgenda: null
          },
          {
            id: 'pe_pp3',
            text: 'BaFin-Zulassung dauert 12-18 Monate — hattest du Deals, die deswegen gestorben sind?',
            hiddenAgenda: null
          },
          {
            id: 'pe_pp4',
            text: 'Wenn du dir den perfekten Fondsprozess vorstellen könntest — von der Strukturierung über die Investmentphase bis zum Exit — wie würde der laufen, damit die typischen Probleme nicht mehr auftreten?',
            hiddenAgenda: 'HOW'
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'pe_ll1',
            text: 'Welches Vintage-Jahr war dein bestes und welches dein schlechtestes — und was hast du daraus gelernt?',
            hiddenAgenda: null
          },
          {
            id: 'pe_ll2',
            text: 'Wem vertraust du bei der Fondsstrukturierung und LP-Akquise — und was müsste ein Advisor mitbringen, damit du ihn langfristig behältst?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  },

  // ──────────────────────────────────────────────
  // 12. Ideale & Creative Finance
  // ──────────────────────────────────────────────
  {
    id: 'creative-finance',
    label: 'Ideale & Creative Finance',
    emoji: '💡',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          {
            id: 'cf_e1',
            text: 'Wie bist du auf Creative Finance gekommen — war das geboren aus einer Situation, wo die normale Finanzierung nicht funktioniert hat?',
            hiddenAgenda: null
          },
          {
            id: 'cf_e2',
            text: 'Welche kreativen Finanzierungsmodelle nutzt du am häufigsten — Mietkauf, Subject-To, Seller Financing, oder etwas ganz anderes?',
            hiddenAgenda: null
          },
          {
            id: 'cf_e3',
            text: 'Creative Finance hat ja in den USA eine ganz andere Tradition. Wie übersetzt du das auf den deutschen Markt mit seinen Beurkundungspflichten?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          {
            id: 'cf_bp1',
            text: 'Mietkauf ist ja beurkundungspflichtig nach §311b BGB — und trotzdem wird das ständig falsch gemacht. Wie strukturierst du das sauber?',
            hiddenAgenda: null
          },
          {
            id: 'cf_bp2',
            text: 'Subject-To in Deutschland — §415 BGB Schuldübernahme mit Bankzustimmung. Welches konkrete Problem beim Transfer bestehender Finanzierungen ist für dich der größte Knackpunkt?',
            hiddenAgenda: 'WHAT'
          },
          {
            id: 'cf_bp3',
            text: 'Due-on-Sale-Klausel — wie gehst du mit der Bank um, wenn du ein Objekt mit bestehenden Schulden übernehmen willst?',
            hiddenAgenda: null
          },
          {
            id: 'cf_bp4',
            text: 'Cross-Collateralization über mehrere Objekte — nutzt du das und wie strukturierst du das, damit es bei einem Ausfall nicht alles reißt?',
            hiddenAgenda: null
          },
          {
            id: 'cf_bp5',
            text: 'Wirtschaftliches Eigentum vs. rechtliches Eigentum nach §39 AO — wie navigierst du diese Grauzone?',
            hiddenAgenda: null
          }
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          {
            id: 'cf_pp1',
            text: 'Erzähl mir von einem Creative-Finance-Deal, der an der Beurkundungspflicht gescheitert ist — was ist passiert und wie hättest du es anders machen können?',
            hiddenAgenda: null
          },
          {
            id: 'cf_pp2',
            text: 'Was war dein härtester Fall mit der Gläubigeranfechtung nach §129ff InsO — hat mal jemand einen Deal angefochten?',
            hiddenAgenda: null
          },
          {
            id: 'cf_pp3',
            text: 'Steuerliche Grauzone bei kreativen Strukturen — hattest du schon Ärger mit dem Finanzamt, weil die Zuordnung unklar war?',
            hiddenAgenda: null
          },
          {
            id: 'cf_pp4',
            text: 'Wenn du dir das perfekte rechtliche Framework für Creative Finance in Deutschland vorstellen könntest — wie müsste das aussehen, damit kreative Deals sicher und reproduzierbar werden?',
            hiddenAgenda: 'HOW'
          }
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          {
            id: 'cf_ll1',
            text: 'Welchen kreativen Finanzierungsansatz hast du ausprobiert und dann wieder verworfen — und warum?',
            hiddenAgenda: null
          },
          {
            id: 'cf_ll2',
            text: 'Wem vertraust du bei Creative Finance wirklich — Anwalt, Notar, Steuerberater? Und was müsste jemand an Expertise mitbringen, damit du ihn für deine Deals dauerhaft einbindest?',
            hiddenAgenda: 'WHO'
          }
        ]
      }
    ]
  }

];

export function getTopicById(id) {
  return TOPICS.find(t => t.id === id) || null;
}

export function getAllQuestions(topic) {
  return topic.sections.flatMap(s => s.questions);
}

export function countQuestions(topic) {
  return getAllQuestions(topic).length;
}
