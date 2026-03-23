// website/public/interview-tool/export.js

export function downloadJSON(interview) {
  const blob = new Blob([JSON.stringify(interview, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date(interview.datum).toLocaleDateString('de-DE').replace(/\./g, '-');
  a.download = `interview-${interview.thema}-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printInterview() {
  window.print();
}
