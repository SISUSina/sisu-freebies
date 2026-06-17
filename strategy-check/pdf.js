/* SISU Strategy-Check — PDF-Report-Generierung (html2pdf, client-side)
   Baut aus dem aktuellen Ergebnis ein 4-seitiges A4-PDF im SISU-Editorial-Look.
*/

function initPdf() {
  const btn = document.getElementById('download-pdf');
  if (!btn) return;
  btn.addEventListener('click', generatePdf);
}

function dimRowsHtml(r) {
  return DIMENSIONS.map((d) => {
    const val = r.sub[d.key];
    const p = Math.round((val / 15) * 100);
    const isHebel = d.key === r.weakest.key && val < 9;
    const level = val >= 12 ? 'hoch' : val >= 8 ? 'mittel' : 'niedrig';
    return `
      <div class="pdf-sub">
        <div class="pdf-sub-head">
          <span>${d.name}${isHebel ? ' &nbsp;←&nbsp;Hebel' : ''}</span>
          <span>${val}/15 · ${level}</span>
        </div>
        <div class="pdf-track"><div class="pdf-fill" style="width:${p}%"></div></div>
      </div>`;
  }).join('');
}

function insightsHtml(r) {
  return INSIGHTS[r.bucket].map((item, idx) => `
    <div class="pdf-insight">
      <strong>${idx + 1}. ${fillTemplate(item.h, r)}</strong>
      <p>${fillTemplate(item.t, r)}</p>
    </div>`).join('');
}

function generatePdf() {
  const r = state.results;
  if (!r) return;
  const b = BUCKETS[r.bucket];
  const pct = Math.round(((r.total - 12) / (60 - 12)) * 100);
  const company = state.capture.size;

  const root = document.getElementById('pdf-root');
  root.innerHTML = `
  <div class="pdf-page">
    <div class="pdf-brand">SISU — Fertility &amp; Mental Health</div>
    <h1 class="pdf-h1">Frauen-Gesundheit.<br>Strategisch gedacht.</h1>
    <p class="pdf-lead">Euer Strategy-Check — Ergebnis</p>
    <div class="pdf-meta">
      <span><b>Name:</b> ${escapeHtml(state.capture.name)}</span>
      <span><b>Unternehmensgröße:</b> ${escapeHtml(company)}</span>
    </div>
    <div class="pdf-score-block">
      <div class="pdf-score-num">${r.total}<span>/ 60</span></div>
      <div class="pdf-spectrum">
        <div class="pdf-spectrum-bar"></div>
        <div class="pdf-spectrum-marker" style="left:${pct}%"></div>
      </div>
      <div class="pdf-spectrum-labels"><span>Frühphase</span><span>Im Aufbau</span><span>Vorreiter</span></div>
    </div>
    <div class="pdf-bucket">
      <strong>Ihr seid: ${b.name}</strong>
      <p>${b.pointe}</p>
    </div>
  </div>

  <div class="pdf-page">
    <h2 class="pdf-h2">Eure vier Dimensionen</h2>
    ${dimRowsHtml(r)}
    <h2 class="pdf-h2" style="margin-top:28px">Drei Erkenntnisse</h2>
    ${insightsHtml(r)}
  </div>

  <div class="pdf-page">
    <h2 class="pdf-h2">Eine Seite für euer nächstes GF-Meeting</h2>
    <p class="pdf-intro">Diese Argumente könnt ihr direkt in eurer Geschäftsführung verwenden.</p>

    <div class="pdf-arg">
      <strong>1 · Die wirtschaftliche Dimension</strong>
      <p>Wechseljahresbedingte Beschwerden kosten die deutsche Volkswirtschaft 9,4 Mrd. € pro Jahr und fast 40 Mio. Fehltage (HWR Berlin 2024). McKinsey beziffert das weltweite wirtschaftliche Potenzial verbesserter Frauengesundheit auf 1 Billion Dollar (2024).</p>
    </div>
    <div class="pdf-arg">
      <strong>2 · Retention &amp; Fachkräftemangel</strong>
      <p>2 von 5 Frauen in den Wechseljahren erwägen einen Arbeitgeberwechsel (Society for Women's Health Research). 85 % der Kinderwunsch-Frauen würden zu einem familienfreundlicheren Arbeitgeber wechseln (peaches 2024). Das trifft genau eure erfahrenen Leistungsträgerinnen.</p>
    </div>
    <div class="pdf-arg">
      <strong>3 · Wettbewerbs-Differenzierung</strong>
      <p>Nur 0,8 % der Unternehmen in Deutschland bieten Fertility-Benefits an (peaches 2024). Wer hier handelt, differenziert sich im Recruiting weiblicher Talente — bevor es alle tun.</p>
    </div>

    <div class="pdf-steps">
      <strong>Euer Hebel laut Check: ${r.weakest.name}</strong>
      <p>Genau hier liegt euer schnellster sichtbarer Fortschritt. Ein klar umrissener erster Schritt in dieser Dimension wirkt mehr als fünf parallele Initiativen.</p>
    </div>
  </div>

  <div class="pdf-page">
    <h2 class="pdf-h2">Wie es weitergehen kann</h2>
    <p class="pdf-intro"><strong>Sina Valkonen</strong> begleitet Unternehmen dabei, Frauen-Gesundheit aus dem Wellbeing-Topf in die People-Strategy zu heben. Menopause Coach · Mental Health First Aid Trainerin · Systemische Coachin · NLP-Practitioner · Schlafcoach.</p>
    <div class="pdf-next">
      <p><b>Strategie-Gespräch</b> — 30 Min, kostenfrei: calendly.com/sisu-coaching/30min</p>
      <p><b>Vorträge &amp; Workshops</b> — sisu-coaching.de</p>
      <p><b>Kontakt</b> — mail@sisu-coaching.de · linkedin.com/in/sinavalkonen</p>
    </div>
    <p class="pdf-foot">SISU — Fertility &amp; Mental Health · Frankfurt · sisu-coaching.de/datenschutz.html</p>
  </div>
  `;

  const safeName = (state.capture.name || 'SISU').replace(/[^a-zA-Z0-9]/g, '-');
  const opt = {
    margin: 0,
    filename: `SISU-Strategy-Check_${safeName}.pdf`,
    image: { type: 'jpeg', quality: 0.96 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ECE6E3' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] },
  };

  const btn = document.getElementById('download-pdf');
  const orig = btn.textContent;
  btn.textContent = 'PDF wird erstellt …';
  btn.disabled = true;

  html2pdf().set(opt).from(root).save().then(() => {
    btn.textContent = orig;
    btn.disabled = false;
  }).catch(() => {
    btn.textContent = orig;
    btn.disabled = false;
  });
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
