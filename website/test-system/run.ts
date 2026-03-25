// test-system/run.ts
import { runLayer1 } from './layer1-content.js';
import { runLayer2 } from './layer2-workflow.js';
import { generateReport } from './report.js';

async function main() {
  console.log('🚀 WKDI DAU Test System\n');
  const startTime = Date.now();

  console.log('📋 Layer 1: Content Audit starten...');
  let layer1Results: any[] = [];
  try {
    layer1Results = await runLayer1();
    const pass = layer1Results.filter((r: any) => r.score >= 3).length;
    console.log(`✓ Layer 1: ${pass}/${layer1Results.length} Seiten bestanden\n`);
  } catch (err) {
    console.error('Layer 1 Fehler:', err);
  }

  console.log('🔄 Layer 2: E2E Workflow-Tests starten...');
  console.log('   (Dev-Server muss auf http://localhost:4321 laufen)');
  let layer2Results: any[] = [];
  try {
    layer2Results = await runLayer2();
    const pass = layer2Results.filter((r: any) => r.passed).length;
    console.log(`✓ Layer 2: ${pass}/${layer2Results.length} Schritte bestanden\n`);
  } catch (err) {
    console.error('Layer 2 Fehler:', err);
  }

  const reportPath = generateReport(layer1Results, layer2Results);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n⏱  Dauer: ${duration}s`);
  console.log(`📊 Report: ${reportPath}`);

  const gmailChecks = layer2Results.filter((r: any) =>
    r.detail && r.detail.startsWith('CHECK_GMAIL:')
  );
  if (gmailChecks.length) {
    console.log('\n📧 Gmail-Checks (via CC/Gmail MCP):');
    gmailChecks.forEach((r: any) => console.log(`   ${r.detail}`));
    console.log('   → In CC-Session: mcp__google-workspace__search_gmail_messages für info@hempura.de');
  }
}

main().catch(console.error);
