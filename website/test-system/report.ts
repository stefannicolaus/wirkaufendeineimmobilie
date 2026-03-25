// test-system/report.ts
import type { ContentAuditResult } from './layer1-content.js';
import type { WorkflowResult } from './layer2-workflow.js';
import { writeFileSync } from 'node:fs';

export function generateReport(
  layer1: ContentAuditResult[],
  layer2: WorkflowResult[],
  outputPath = '/tmp/wkdi-dau-report.html'
) {
  const l1Pass = layer1.filter(r => r.score >= 3).length;
  const l2Pass = layer2.filter(r => r.passed).length;
  const totalTests = layer1.length + layer2.length;
  const totalPass = l1Pass + l2Pass;

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>WKDI DAU Report — ${new Date().toLocaleDateString('de-DE')}</title>
  <style>
    body { font-family: system-ui; padding: 2rem; max-width: 960px; margin: 0 auto; color: #111; }
    h1 { font-size: 1.5rem; }
    .summary { display: flex; gap: 1.5rem; margin: 1.5rem 0; }
    .stat { background: #f9fafb; border-radius: 8px; padding: 1rem 1.5rem; text-align: center; }
    .stat .num { font-size: 2rem; font-weight: 700; }
    .stat .label { font-size: 0.8rem; color: #6b7280; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem; }
    th { background: #f3f4f6; font-weight: 600; }
    .pass { color: #16a34a; }
    .fail { color: #dc2626; font-weight: 600; }
    .score-4 { color: #16a34a; } .score-3 { color: #ca8a04; }
    .score-2, .score-1, .score-0 { color: #dc2626; }
  </style>
</head>
<body>
  <h1>WKDI DAU Report — ${new Date().toLocaleString('de-DE')}</h1>
  <div class="summary">
    <div class="stat"><div class="num">${totalPass}/${totalTests}</div><div class="label">Tests bestanden</div></div>
    <div class="stat"><div class="num">${l1Pass}/${layer1.length}</div><div class="label">Layer 1 (Content)</div></div>
    <div class="stat"><div class="num">${l2Pass}/${layer2.length}</div><div class="label">Layer 2 (E2E)</div></div>
  </div>

  <h2>Layer 1 — Content Audit</h2>
  <table>
    <thead><tr><th>Seite</th><th>Persona</th><th>Klar</th><th>Benefits</th><th>E-Mail</th><th>Vertrauen</th><th>Score</th><th>Issues</th></tr></thead>
    <tbody>
      ${layer1.map(r => `
        <tr>
          <td>${r.page}</td>
          <td>${r.persona}</td>
          <td>${r.klar_was_zu_tun ? '✓' : '✗'}</td>
          <td>${r.benefits_sichtbar ? '✓' : '✗'}</td>
          <td>${r.email_adresse_sichtbar ? '✓' : '✗'}</td>
          <td>${r.vertrauen_aufgebaut ? '✓' : '✗'}</td>
          <td class="score-${r.score}">${r.score}/4</td>
          <td style="font-size:0.8rem;color:#6b7280">${r.issues.join('; ')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Layer 2 — E2E Workflow</h2>
  <table>
    <thead><tr><th>Persona</th><th>Segment</th><th>Schritt</th><th>Ergebnis</th><th>Detail</th></tr></thead>
    <tbody>
      ${layer2.map(r => `
        <tr>
          <td>${r.persona}</td>
          <td>${r.segment}</td>
          <td>${r.step}</td>
          <td class="${r.passed ? 'pass' : 'fail'}">${r.passed ? '✓ Pass' : '✗ Fail'}</td>
          <td style="font-size:0.8rem;color:#6b7280">${r.detail}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  writeFileSync(outputPath, html);
  console.log(`\n📊 Report gespeichert: ${outputPath}`);
  return outputPath;
}
