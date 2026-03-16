# Scout Report: Claude Code & AI-Tools fuer Website-Branding & Builds

> Recherche-Datum: 2026-03-15
> Kontext: brown2green Website-Build, NEXUS-System-Relevanz

---

## 1. GITHUB REPOS — Claude Code + Website/Design

### 1.1 Anthropic Official: Frontend-Design Skill
- **Was:** Offizielles Anthropic Plugin (~400 Tokens), Anti-Slop-Aesthetik. 277k+ Installs.
- **Kern:** Distinctive Fonts (nie Inter/Roboto/Arial), bold Color Palettes via CSS Variables, atmosphaerische Hintergruende statt Solid Colors, purposeful Animations.
- **Link:** [anthropics/claude-code/plugins/frontend-design](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md)
- **Relevanz: 5/5** — Wir nutzen bereits dieselben Prinzipien in unserem Anti-Slop-System. Validiert unseren Ansatz. Abgleichen ob wir etwas uebersehen.
- **Adaptieren:** Impeccable.style erweitert diesen Skill — pruefen ob deren Ergaenzungen fuer uns nuetzlich sind.

### 1.2 LibreUIUX-Claude-Code (HermeticOrmus)
- **Was:** Komplettes UI/UX-System: 70 Plugins, 152 Agents, 76 Commands, 74 Skills, 3 Skill-Level.
- **Domains:** design-mastery, accessibility-compliance, frontend-mobile-dev, backend-dev, cicd-automation.
- **Link:** [HermeticOrmus/LibreUIUX-Claude-Code](https://github.com/HermeticOrmus/LibreUIUX-Claude-Code)
- **Relevanz: 3/5** — Zu gross/generisch fuer uns. Aber einzelne Agents (z.B. Design-Mastery-Agents) koennten als Inspiration dienen.
- **Adaptieren:** Cherry-Pick einzelner Agent-Definitionen fuer spezialisierte Design-Tasks.

### 1.3 Interface-Design (Dammyjay93)
- **Was:** Design Engineering fuer Claude Code — Craft, Memory, Enforcement fuer konsistente UI. Loest das Problem: Spacing, Colors, Depth-Strategy driften ueber Sessions.
- **Link:** [Dammyjay93/interface-design](https://github.com/Dammyjay93/interface-design)
- **Relevanz: 4/5** — Direkt relevant: Design-Konsistenz ueber Sessions hinweg ist genau unser Problem.
- **Adaptieren:** Memory-Pattern fuer Design-Tokens in CLAUDE.md uebernehmen. Design-Decisions persistent machen.

### 1.4 Claude Visual Style Guide (jcmrs)
- **Was:** React Components + Design System Guides + machine-readable Design Tokens.
- **Link:** [jcmrs/claude-visual-style-guide](https://github.com/jcmrs/claude-visual-style-guide)
- **Relevanz: 3/5** — React-spezifisch, aber das Pattern "machine-readable tokens" ist uebertragbar auf Astro.
- **Adaptieren:** Design-Token-Format als JSON fuer CC lesbar machen.

### 1.5 63 Design Skills (Marie Claire Dean / Owl-Listener)
- **Was:** 63 Skills + 27 Commands in 8 Plugins — Research, Systems, Strategy, UI, Interaction, Prototyping, Design Ops, Everyday Toolkit.
- **Link:** [Substack-Artikel](https://marieclairedean.substack.com/p/i-built-63-design-skills-for-claude)
- **Relevanz: 3/5** — Viele Skills sind generisch, aber die Kategorisierung (Research → Strategy → UI → Testing) ist ein gutes Framework.
- **Adaptieren:** Skill-Kategorien als Inspiration fuer unseren Design-Workflow.

---

## 2. MULTI-AGENT WEBSITE BUILD PIPELINES

### 2.1 Agency-Agents (msitarzewski) — TOP FUND
- **Was:** 147 Agents in 12 Divisions. Strukturiert AI wie eine echte Agentur. 10k Stars in 7 Tagen.
- **Divisions:** Engineering, Design, Marketing, Product, Testing, Support etc.
- **Agents:** Frontend Developer, Backend Architect, Brand Strategist, UX Researcher, etc.
- **Workflow-Beispiele:** Landing Page Workflow, Startup MVP Workflow.
- **Link:** [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents)
- **Link Workflow:** [workflow-landing-page.md](https://github.com/msitarzewski/agency-agents/blob/main/examples/workflow-landing-page.md)
- **Relevanz: 4/5** — Das Landing-Page-Workflow-Beispiel ist direkt relevant. Multi-Agent-Koordination fuer Website-Builds.
- **Adaptieren:** Agent-Definitionen als Vorlage fuer brown2green Website-Build-Pipeline. Besonders: Brand Strategist + Frontend Developer + UX Researcher Kombination.

### 2.2 Claude Code Agent Teams (Anthropic, seit Opus 4.6)
- **Was:** Native CC-Funktion seit Feb 2026. CC spinnt Teams von Sub-Agents auf — Research, Write, Review parallel.
- **Link:** [Claude Code Docs](https://code.claude.com/docs/en/common-workflows)
- **Relevanz: 5/5** — Wir nutzen das bereits teilweise. Aber: explizite Agent-Rollen fuer Design-Tasks definieren.
- **Adaptieren:** Dedizierte Agent-Rollen fuer brown2green: Brand-Agent, Layout-Agent, Content-Agent.

### 2.3 shinpr/claude-code-workflows
- **Was:** Production-ready Development Workflows fuer CC, powered by specialized AI Agents.
- **Link:** [shinpr/claude-code-workflows](https://github.com/shinpr/claude-code-workflows)
- **Relevanz: 3/5** — Generische Dev-Workflows, aber die Struktur (wie Workflows definiert werden) ist nuetzlich.

---

## 3. COMMUNITY — Wie Leute Websites mit CC bauen

### 3.1 Reddit r/ClaudeCode (4.200+ weekly contributors)
- **Pattern:** Prompt → Build → Push → Live. Funktionale Prototypen in Minuten.
- **Kritik:** Weekly Caps bei $200/Monat, METR-Studie: erfahrene Devs 19% langsamer MIT CC.
- **Insight:** CC ist stark fuer Prototyping, aber Production-Quality braucht menschliche Steuerung.
- **Link:** [AI Tool Discovery Summary](https://www.aitooldiscovery.com/guides/claude-code-reddit)

### 3.2 Platformer Review — "The project that turned me into a believer"
- **Was:** Detaillierter Erfahrungsbericht ueber Website-Build mit CC.
- **Link:** [Platformer](https://www.platformer.news/claude-code-review-web-design/)
- **Relevanz: 4/5** — Praxis-Erfahrung, nicht Marketing.

### 3.3 Leon Furze — "Building Websites with Claude Code"
- **Was:** Step-by-Step-Guide, ehrlicher Erfahrungsbericht.
- **Link:** [leonfurze.com](https://leonfurze.com/2026/02/14/building-websites-with-claude-code/)
- **Relevanz: 3/5**

### 3.4 Oliur — "How to Build Websites with Claude Code as a Beginner"
- **Was:** Anfaenger-Perspektive, gute UX-Dokumentation.
- **Link:** [oliur.com](https://www.oliur.com/build-websites-with-claude-code)
- **Relevanz: 2/5** — Zu basic fuer uns.

### 3.5 UX Planet — "Claude Code for Web Design"
- **Was:** Design-fokussierte Perspektive, Nick Babich (bekannter UX-Autor).
- **Link:** [UX Planet](https://uxplanet.org/claude-code-for-web-design-338064dbdfc0)
- **Relevanz: 4/5** — Design-Workflow-Perspektive, nicht nur Code.

### 3.6 Starkinsider — "AI Didn't Say WordPress. It Said Astro."
- **Was:** Praxis-Bericht: Claude Code + Astro fuer Website-Build statt WordPress.
- **Link:** [Starkinsider](https://www.starkinsider.com/2026/02/claude-code-astro-web-design.html)
- **Relevanz: 4/5** — Direkt relevant fuer unsere Astro-Projekte.

---

## 4. AWESOME-LISTEN & TOOLKITS

### 4.1 awesome-claude-code (hesreallyhim) — Primaere Liste
- **Was:** Kuratierte Liste von Skills, Hooks, Slash-Commands, Agent Orchestrators, Plugins.
- **Link:** [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- **Relevanz: 4/5** — Referenz-Liste, regelmaessig checken.

### 4.2 awesome-claude-code-toolkit (rohitg00) — Groesstes Toolkit
- **Was:** 135 Agents, 35 Skills (+15k via SkillKit), 42 Commands, 120 Plugins, 19 Hooks, 15 Rules, 7 Templates, 6 MCP Configs.
- **Link:** [rohitg00/awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit)
- **Relevanz: 3/5** — Quantitaet > Qualitaet, aber guter Ueberblick.

### 4.3 awesome-claude-skills (ComposioHQ + travisvn)
- **Was:** Kuratierte Skill-Sammlungen.
- **Links:** [ComposioHQ](https://github.com/ComposioHQ/awesome-claude-skills) | [travisvn](https://github.com/travisvn/awesome-claude-skills)
- **Relevanz: 3/5**

### 4.4 Claude Code Ultimate Guide (FlorianBruniaux)
- **Was:** Beginner → Power User Guide mit Templates, Agentic Workflow Guides, Quizzes.
- **Link:** [FlorianBruniaux/claude-code-ultimate-guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide)
- **Relevanz: 2/5** — Fuer uns zu basic, aber gutes Onboarding-Material fuer Team.

---

## 5. V0.DEV + CLAUDE CODE KOMBINATION

### 5.1 Dokumentierter Workflow
- **Pattern:** v0.dev fuer React/shadcn UI-Komponenten → Claude Code fuer Backend + Integration.
- **Strapi-Artikel:** v0 fuer Frontend-Prototyping, CC fuer Full-Stack-Integration.
- **Link:** [Strapi Blog](https://strapi.io/blog/building-faster-with-v0-and-claude-code-lessons-learned-from-vibe-coding)
- **Relevanz: 3/5** — Fuer Next.js-Projekte relevant, weniger fuer Astro.

### 5.2 v0 Rebuild 2026
- **Was:** v0 importiert GitHub Repos, zieht Vercel-Config, generiert production-ready Code.
- **Link:** [Vercel Blog](https://vercel.com/blog/introducing-the-new-v0)
- **Relevanz: 2/5** — Vercel-locked, nicht unser Stack fuer brown2green.

### 5.3 Trip-Planner Case Study (Claude + CC + v0)
- **Was:** Production-Ready App in 6 Stunden mit kombiniertem Workflow.
- **Link:** [Medium](https://medium.com/@leechanchai/build-a-trip-planner-in-a-weekend-rapid-app-development-with-claude-claudecode-and-v0-dev-aa5080570c5d)
- **Relevanz: 2/5** — App-fokussiert, aber Workflow-Pattern interessant.

---

## 6. CURSOR + CLAUDE — Best Practices

### 6.1 Kontext-Vergleich
- **Cursor/Windsurf:** 60-80K Tokens, 30-50 Dateien.
- **Claude Code:** 150K+ Tokens (jetzt 1M), 100+ Dateien.
- **Fazit:** CC gewinnt bei Cross-Cutting Changes, Cursor bei Quick Edits in einzelnen Files.
- **Link:** [DEV Community Vergleich](https://dev.to/pockit_tools/cursor-vs-windsurf-vs-claude-code-in-2026-the-honest-comparison-after-using-all-three-3gof)

### 6.2 Designer's Guide to Cursor + Claude
- **Was:** Praktischer Guide fuer Designer die mit Cursor/Claude arbeiten.
- **Link:** [Felix Lee Substack](https://adplist.substack.com/p/a-designers-guide-to-cursor-and-claude)
- **Relevanz: 3/5** — Design-Perspektive nuetzlich, Tool-Choice nicht relevant.

### 6.3 Skill-basierter Workflow
- **Pattern:** /frontend-design → /baseline-ui → /fixing-accessibility → /fixing-motion-performance
- **Link:** [DEV Community](https://dev.to/blamsa0mine/claude-code-skills-install-ui-skills-build-a-frontend-design-workflow-claude-code-cursorvs-4n43)
- **Relevanz: 5/5** — Wir nutzen EXAKT diesen Workflow bereits. Validierung.

---

## 7. ASTRO + CLAUDE CODE

### 7.1 Publishing Astro Websites Skill (SpillwaveSolutions)
- **Was:** Umfassender CC-Skill fuer Astro: SSG, Content Collections, MDX, Mermaid, Pagefind, i18n, Deploy.
- **Link:** [SpillwaveSolutions/publishing-astro-websites-agentic-skill](https://github.com/spillwavesolutions/publishing-astro-websites-agentic-skill)
- **Relevanz: 5/5** — Direkt nutzbar fuer brown2green (Astro-Stack).
- **Adaptieren:** Skill installieren und testen. Besonders Content Collections + i18n.

### 7.2 AstroDeck — AI-friendly Starter Kit
- **Was:** 15+ pre-built Sections (Hero, CTA, Pricing, Testimonials etc.), AI-friendly gebaut.
- **Link:** [holger1411/astrodeck](https://github.com/holger1411/astrodeck)
- **Relevanz: 4/5** — Als Starter evaluieren. "AI-friendly" bedeutet: gute Komponentenstruktur fuer CC.
- **Adaptieren:** Nicht als Template verwenden, aber Komponentenstruktur studieren.

### 7.3 Astro Official AI Guide
- **Was:** Offizielle Astro-Docs fuer AI-Tool-Integration, inkl. MCP Server.
- **Link:** [docs.astro.build/en/guides/build-with-ai](https://docs.astro.build/en/guides/build-with-ai/)
- **Relevanz: 4/5** — Astro MCP Server aktivieren fuer bessere CC-Ergebnisse.
- **Adaptieren:** Astro Docs MCP Server in settings.json eintragen.

### 7.4 Jekyll→Astro Migration mit CC
- **Was:** Kompletter Migrations-Workflow, CC hat "practically everything" gemacht.
- **Link:** [staffordwilliams.com](https://staffordwilliams.com/blog/2025/12/21/porting-jekyll-to-astro-with-claude-code/)
- **Relevanz: 3/5** — Migration-spezifisch, aber zeigt CC+Astro-Kompetenz.

---

## 8. DESIGN SYSTEM AS CODE + AI

### 8.1 Figma MCP Server — Bidirektionaler Workflow
- **Was:** Figma Design-Daten direkt in CC. Design Tokens, Components, Layouts. PLUS: CC-Code zurueck nach Figma als editierbare Layer.
- **Tool:** generate_figma_design (CC-exklusiv, seit Feb 2026).
- **Links:** [Figma Blog](https://www.figma.com/blog/introducing-figma-mcp-server/) | [Claude Code + Figma](https://www.builder.io/blog/claude-code-figma-mcp-server)
- **Relevanz: 4/5** — Wenn brown2green Figma nutzt: sofort einsetzen. Tailwind-Config-Export aus Figma-Tokens.
- **Adaptieren:** Figma MCP Server einrichten, Design Tokens als Single Source of Truth.

### 8.2 Figma MCP: Design Tokens → Tailwind
- **Was:** Design-Token-Management + Conversion: Tokens extrahieren, updaten, in Tailwind CSS Config umwandeln.
- **Link:** [Figma MCP Guide](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- **Relevanz: 4/5** — Perfekt fuer Astro + Tailwind Stack.

### 8.3 Supernova.io — AI-powered Design System Platform
- **Was:** Design Tokens als Code, Multi-Platform-Output, AI-gestuetzte Konsistenz.
- **Link:** [supernova.io](https://www.supernova.io/)
- **Relevanz: 2/5** — Enterprise-Tool, Overkill fuer uns.

### 8.4 AI Design Systems Conference 2026
- **Was:** Konferenz zu AI-powered Design Systems + Vibe Coding. Cases von WhatsApp, Miro, Atlassian, GitHub.
- **Link:** [intodesignsystems.com](https://www.intodesignsystems.com)
- **Relevanz: 2/5** — Inspiration, keine direkte Anwendung.

### 8.5 Statistik: AI in Design Systems (2025 Studie)
- 62% weniger Design-Inkonsistenzen
- 78% bessere Workflow-Effizienz
- 56% schnellere Time-to-Market
- 82% weniger Design-bezogene Technical Debt

---

## 9. AI BRANDING-WORKFLOWS

### 9.1 Full-Stack Branding Plattformen

| Tool | Was es macht | Link | Relevanz |
|------|-------------|------|----------|
| **Looka** | AI Logo + Brand Kit (Colors, Fonts, Marketing Materials) | [looka.com](https://looka.com/) | 3/5 |
| **uBrand** | Brand Identity Formation + Social Media Content | [ubrand.com](https://ubrand.com) | 2/5 |
| **LogoAI** | Logo + Matching Brand Identity + Social Content | [logoai.com](https://www.logoai.com) | 2/5 |
| **Brandmark** | AI Logo Design + Brand Guidelines | [brandmark.io](https://brandmark.io/) | 3/5 |
| **Zoviz** | Logo + komplettes Brand Kit (Cards, Social, Letterhead) | [zoviz.com](https://zoviz.com/) | 2/5 |
| **Lovart** | AI Design Agent — Logos, Social, Marketing Campaigns | [lovart.ai](https://www.lovart.ai/) | 3/5 |

**Fazit:** Diese Tools sind gut fuer schnelle Brand-Kits, aber nicht fuer distinktives Premium-Branding. Fuer brown2green: hoechstens als Startpunkt/Moodboard, dann manuell verfeinern.

### 9.2 Brand Guideline Automation
- **Akrivi Guideit:** Logo-Grids, Bento Layouts, Brand Guidelines direkt in Illustrator.
- **LogoDiffusion:** AI-gestuetzte Brand Guideline Verwaltung + Konsistenz-Check.
- **Link:** [LogoDiffusion Blog](https://logodiffusion.com/blog/how-ai-simplifies-brand-guideline-management)
- **Relevanz: 2/5** — Wir machen Brand Guidelines besser manuell + CC.

---

## 10. AI FONT PAIRING

| Tool | Mechanismus | Link | Relevanz |
|------|------------|------|----------|
| **Fontjoy** | Deep Learning, Contrast/Legibility/Balance | [fontjoy.com](https://fontjoy.com/) | 4/5 |
| **Monotype AI Pairing** | Enterprise Font Pairing, Brand-Voice-Match | [monotype.com](https://www.monotype.com/font-pairing) | 3/5 |
| **Designs.ai Fonts** | Visual Font Pairing Browser | [designs.ai/fonts](https://designs.ai/fonts/) | 3/5 |
| **PaletteMaker** | Font + Farbe Kombination Preview | [palettemaker.com](https://palettemaker.com/) | 3/5 |

**Bester Workflow fuer brown2green:**
1. Fontjoy fuer initiale Pairing-Vorschlaege
2. CC mit Anti-Slop-Regeln filtert (keine Inter, Roboto, Arial, Geist, Space Grotesk)
3. Manuelle Entscheidung von Stefan
4. Design Tokens in JSON → CC liest bei jedem Build

---

## 11. AI FARBPALETTEN-GENERIERUNG

| Tool | Feature | Link | Relevanz |
|------|---------|------|----------|
| **HueHive** | Industrie-spezifische Paletten (inkl. Real Estate) | [huehive.co](https://huehive.co/ai_generated_palettes/18687) | 4/5 |
| **Extract Color Palettes** | Brand Evolution — modernisiert bestehende Paletten | [extractcolorpalettes.com](https://extractcolorpalettes.com/brand-evolution) | 3/5 |
| **PaletteMaker** | Live Preview auf echten Designs | [palettemaker.com](https://palettemaker.com/) | 4/5 |
| **Produkto** | 46+ Real Estate Color Paletten | [produkto.io](https://produkto.io/color-palettes/real-estate) | 4/5 |

**Real Estate Farbpsychologie:**
- Blau: 67%+ der fuehrenden Immobilien-Logos (Vertrauen, Stabilitaet)
- Gruen: ~26% (Nachhaltigkeit, Wachstum) — **PERFEKT fuer brown2green**
- Rot: ~29% (Energie, Dringlichkeit)

**brown2green Empfehlung:** Gruen-dominant (Nachhaltigkeit = Kern-Narrativ) + Braun-Akzente (Transformation "brown→green") + ein scharfer Akzent-Ton.

---

## 12. TOP-EMPFEHLUNGEN FUER NEXUS/BROWN2GREEN

### Sofort umsetzbar (Woche 1)

| # | Aktion | Quelle |
|---|--------|--------|
| 1 | **Astro Publishing Skill installieren** | SpillwaveSolutions Repo |
| 2 | **Astro Docs MCP Server aktivieren** | Astro Official Guide |
| 3 | **Fontjoy + HueHive fuer initiales Branding** | Tools oben |
| 4 | **Interface-Design Repo studieren** — Design-Memory-Pattern | Dammyjay93 |
| 5 | **Agency-Agents Landing Page Workflow** als Vorlage | msitarzewski |

### Mittelfristig (Monat 1)

| # | Aktion | Quelle |
|---|--------|--------|
| 6 | **Figma MCP Server** einrichten (falls Figma genutzt wird) | Figma Official |
| 7 | **Design Tokens als JSON** — Single Source of Truth fuer CC | claude-visual-style-guide Pattern |
| 8 | **Agent-Rollen definieren** fuer brown2green Build | Agency-Agents + CC Agent Teams |
| 9 | **AstroDeck Komponenten-Struktur** studieren | holger1411/astrodeck |

### Validierungen

| Unser System | Community-Validierung |
|---|---|
| Anti-Slop Design Rules in CLAUDE.md | Anthropic's offizieller Frontend-Design Skill macht dasselbe |
| Skill-Reihenfolge (design → baseline → a11y → motion → meta) | DEV Community dokumentiert exakt diesen Workflow |
| CLAUDE.md als Design-Kontext | Interface-Design Repo + Agency-Agents nutzen selbes Pattern |
| Astro fuer Marketing-Sites | Astro Official AI Guide + Community bevorzugt Astro fuer statische Sites |

---

## FAZIT

**Wir sind ahead of community** bei:
- Anti-Slop-Design (unser System ist detaillierter als Anthropic's Skill)
- Skill-Reihenfolge fuer Frontend-Commits
- CLAUDE.md als persistenter Design-Kontext

**Wir koennen lernen von:**
- **Agency-Agents:** Multi-Agent-Koordination mit definierten Rollen fuer Website-Builds
- **Interface-Design:** Design-Memory-Pattern fuer Session-uebergreifende Konsistenz
- **Figma MCP:** Bidirektionaler Design→Code→Design Workflow
- **Astro Publishing Skill:** Spezialisierter Skill fuer Astro-Builds mit Content Collections

**Groesster Gap:** Wir haben keinen formalisierten Multi-Agent-Workflow fuer Website-Builds. Agency-Agents zeigt wie das aussehen koennte: Brand Strategist → UX Researcher → Frontend Developer → QA als koordinierte Pipeline.
