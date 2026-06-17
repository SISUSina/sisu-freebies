/* SISU Strategy-Check — Frauen-Gesundheit
   Spec: vault/05_Projekte/strategy-check-frauengesundheit/2026-06-17-design-spec.md
*/

// ============ Daten ============

const DIMENSIONS = [
  { key: 'bewusstsein', name: 'Bewusstsein & Sprache' },
  { key: 'strukturen', name: 'Strukturen & Angebote' },
  { key: 'fuehrung', name: 'Führungskräfte & Kultur' },
  { key: 'strategie', name: 'Strategische Verankerung' },
];

const LIKERT = [
  { v: 1, label: 'Trifft gar nicht zu' },
  { v: 2, label: 'Eher nicht' },
  { v: 3, label: 'Teils / teils' },
  { v: 4, label: 'Eher schon' },
  { v: 5, label: 'Trifft voll zu' },
];

// 12 Likert-Fragen + 3 Spezial-Fragen
const QUESTIONS = [
  // Dimension 1 — Bewusstsein & Sprache
  { type: 'likert', dim: 'bewusstsein', text: 'Bei uns kann eine Mitarbeiterin ihrer Führungskraft offen sagen, dass sie gerade eine <em>Fehlgeburt</em> hatte oder einen Kinderwunsch durchläuft.' },
  { type: 'likert', dim: 'bewusstsein', text: 'Wechseljahresbeschwerden sind bei uns <em>kein Tabuthema</em> — Mitarbeiterinnen und Führungskräfte sprechen darüber, ohne sich rechtfertigen zu müssen.' },
  { type: 'likert', dim: 'bewusstsein', text: 'Auf Führungsebene wird <em>aktiv</em> über Themen wie Mental Load, Care-Arbeit oder zyklusbedingte Leistungsschwankungen gesprochen.' },
  // Dimension 2 — Strukturen & Angebote
  { type: 'likert', dim: 'strukturen', text: 'Wir haben <em>konkrete</em> Anlaufstellen oder Programme zu Frauen-Gesundheit — z. B. Fertility-Coverage, Menopause-Coaching, Mental-Health-Begleitung speziell für Frauen.' },
  { type: 'likert', dim: 'strukturen', text: 'Bei uns gibt es flexible Zeit- und Raumregelungen für Mitarbeiterinnen mit <em>besonderen Belastungen</em> (IVF-Termine, starke Wechseljahresbeschwerden, postnatale Phasen).' },
  { type: 'likert', dim: 'strukturen', text: 'Wir haben <em>aktiv überprüft</em>, ob unser EAP- oder BGM-Angebot die Themen Fertility, Mental Health bei Frauen und Menopause überhaupt abdeckt — und nicht nur generisch ist.' },
  // Dimension 3 — Führungskräfte & Kultur
  { type: 'likert', dim: 'fuehrung', text: 'Unsere Führungskräfte sind <em>sensibilisiert</em> dafür, wie sich Wechseljahre, Kinderwunsch oder Mental Load auf Leistungsfähigkeit und Stimmung auswirken können.' },
  { type: 'likert', dim: 'fuehrung', text: 'Eine Mitarbeiterin würde sich <em>trauen</em>, ihrer Führungskraft von einer Fehlgeburt, einem IVF-Zyklus oder schweren Wechseljahresbeschwerden zu erzählen — ohne Angst vor Konsequenzen.' },
  { type: 'likert', dim: 'fuehrung', text: 'Wenn eine Mitarbeiterin sich mit einem lebensphasen-bedingten Anliegen an HR wendet, <em>wissen wir konkret</em>, was wir tun und welche Ressourcen wir anbieten können.' },
  // Dimension 4 — Strategische Verankerung
  { type: 'likert', dim: 'strategie', text: 'Frauen-Gesundheit ist <em>expliziter Bestandteil</em> unserer People-Strategy — nicht nur ein nachgereihter Wellbeing-Punkt unter vielen.' },
  { type: 'likert', dim: 'strategie', text: 'Wir messen relevante KPIs wie <em>Fluktuation, Krankheitstage oder Aufstiegsquoten</em> differenziert nach Geschlecht und Lebensphase.' },
  { type: 'likert', dim: 'strategie', text: 'Unsere Geschäftsführung hat sich mit der <em>ökonomischen Dimension</em> von Frauen-Gesundheit befasst (z. B. Kosten wechseljahresbedingter Fehlzeiten, Retention von Senior-Frauen).' },
  // Frage 13 — Current Reality
  {
    type: 'multi', dim: null,
    text: 'In welcher Lebens- oder Karrierephase sind die meisten eurer Mitarbeiterinnen? <span class="q-hint">(mehrere möglich)</span>',
    options: [
      'Junge Berufseinsteigerinnen (20–30)',
      'Karriere-Aufbauphase / oft mit Kinderwunsch (30–40)',
      'Doppelbelastungs-Phase mit kleinen Kindern (35–45)',
      'Karriere-Peak (40–55)',
      'Perimenopause / Menopause (45–58)',
      'Späte Karrierephase / Vor-Renten-Übergang (55+)',
    ],
  },
  // Frage 14 — Preferred Solution
  {
    type: 'multi', dim: null, key: 'preferred',
    text: 'Wenn ihr aktuell etwas in Richtung Frauen-Gesundheit aufbauen würdet — was wäre der richtige nächste Schritt? <span class="q-hint">(mehrere möglich)</span>',
    options: [
      'Ein strategisches Audit unserer aktuellen Situation (3–6 Wochen)',
      'Ein gezielter Workshop für unser Führungsteam (1 Tag)',
      'Eine Vortrags-Reihe für Mitarbeiterinnen (z. B. Quartals-Format)',
      'Persönliche Begleitung unserer People-Lead (1:1, mehrere Monate)',
      'Aufbau eines internen Programms (Beratung über 6+ Monate)',
      'Wissen wir noch nicht, was am besten passt',
    ],
  },
  // Frage 15 — Anything Else
  {
    type: 'freetext', dim: null,
    text: 'Gibt es etwas, das wir wissen sollten — was euch aktuell besonders beschäftigt oder wo ihr Druck spürt? <span class="q-hint">(optional)</span>',
  },
];

// Index der "qualifizierenden" Optionen in Frage 14 (alles außer "wissen noch nicht")
const QUALIFYING_PREFERRED = [0, 1, 2, 3, 4];

const BUCKETS = {
  early:    { name: 'Frühphase', pointe: 'Frauen-Gesundheit ist bei euch noch unbearbeitet. Hier liegt euer größter Hebel.' },
  building: { name: 'Im Aufbau', pointe: 'Ihr habt erste Bausteine. Jetzt geht’s um die Verbindung zwischen ihnen — und um strategische Verankerung.' },
  leader:   { name: 'Vorreiter', pointe: 'Ihr seid weit. Jetzt geht’s um Schärfung, Skalierung und die Sichtbarkeit eurer Vorreiterrolle nach außen.' },
};

// Insights pro Bucket. {strongestDim} / {weakestDim} werden eingesetzt.
const INSIGHTS = {
  early: [
    { h: 'Ihr seid nicht spät dran — ihr seid früh.', t: 'Die allermeisten Unternehmen in DACH haben Frauen-Gesundheit nicht strategisch durchdacht. Das heißt: Wer jetzt anfängt, ist Vorreiter, nicht Nachzügler. Ihr könnt klein und richtig starten, statt groß und schief.' },
    { h: 'Euer Hebel liegt in <em>{weakestDim}</em>.', t: 'Hier ist eure niedrigste Bewertung — und genau hier entsteht der schnellste sichtbare Fortschritt. Nicht alles auf einmal. Eine Dimension, ein klarer erster Schritt.' },
    { h: 'Sprache kommt vor Struktur.', t: 'Bevor Programme wirken, muss über die Themen überhaupt gesprochen werden dürfen. 52 % der Frauen sagen, Wechseljahre seien am Arbeitsplatz ein Tabu (MenoSupport 2023). Das aufzubrechen kostet kein Budget — nur Haltung.' },
  ],
  building: [
    { h: 'Ihr habt mehr Bausteine als ihr denkt.', t: 'Eure Stärke in <em>{strongestDim}</em> zeigt: ihr habt verstanden, dass es nicht reicht, „Yoga im Pausenraum" anzubieten. Das ist mehr als bei den meisten Mittelständlern.' },
    { h: 'Eure schwächste Dimension ist <em>{weakestDim}</em> — und das ist kein Zufall.', t: 'Genau dort liegt der typische Bruch: Man baut Angebote, vergisst aber, die Führungskräfte mitzunehmen. 47 % der Führungskräfte halten Wechseljahre für Privatsache (the-change.org 2024). Das wirkt jedem Programm entgegen.' },
    { h: 'Strategisch verankern ist der Hebel, den niemand auf dem Schirm hat.', t: 'Solange Frauen-Gesundheit kein Thema der Geschäftsführung ist, bleibt es ein gut gemeintes HR-Side-Project. McKinsey beziffert das wirtschaftliche Potenzial 2024 auf 1 Billion Dollar weltweit — das ist Vorstands-Sprache, nicht BGM-Sprache.' },
  ],
  leader: [
    { h: 'Ihr gehört zur Spitze — nutzt das.', t: 'Euer Score zeigt: ihr habt Frauen-Gesundheit strategisch durchdacht. Eure Stärke in <em>{strongestDim}</em> ist ein echter Wettbewerbsvorteil im Recruiting weiblicher Talente. Macht ihn sichtbar.' },
    { h: 'Selbst Vorreiter haben eine schwächste Stelle: <em>{weakestDim}</em>.', t: 'Auf eurem Niveau geht es nicht mehr um „haben wir das?", sondern um Konsistenz und Tiefe. Genau hier lohnt der nächste Feinschliff.' },
    { h: 'Euer nächster Schritt ist Sichtbarkeit, nicht Aufbau.', t: 'Was ihr intern lebt, sollte extern Teil eurer Employer-Brand sein. Vorreiter-Unternehmen ziehen genau die Senior-Frauen an, die anderen verloren gehen.' },
  ],
};

// ============ State ============

const state = {
  capture: { name: '', email: '', size: '', consent: false, newsletter: false },
  current: 0,
  answers: new Array(QUESTIONS.length).fill(null),
};

// ============ Helpers ============

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function switchView(name) {
  $$('.view').forEach((el) => { el.hidden = el.dataset.view !== name; });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function firstName() {
  return (state.capture.name || '').trim().split(/\s+/)[0] || '';
}

// ============ Landing → Capture ============

function initLanding() {
  $$('[data-action="to-capture"]').forEach((b) =>
    b.addEventListener('click', () => switchView('capture')));
}

// ============ Capture ============

function initCapture() {
  $('[data-action="back-to-landing"]').addEventListener('click', () => switchView('landing'));

  $('#capture-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#cap-name').value.trim();
    const email = $('#cap-email').value.trim();
    const size = $('#cap-size').value;
    const consent = $('#cap-consent').checked;

    // Email-Validierung
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const errEl = $('#err-email');
    if (!emailOk) { errEl.hidden = false; return; }
    errEl.hidden = true;

    if (!name || !size || !consent) return; // native required greift zusätzlich

    state.capture = {
      name, email, size,
      consent,
      newsletter: $('#cap-newsletter').checked,
    };

    state.current = 0;
    state.answers = new Array(QUESTIONS.length).fill(null);
    renderQuestion();
    switchView('quiz');
  });
}

// ============ Quiz ============

function renderQuestion() {
  const i = state.current;
  const q = QUESTIONS[i];

  $('#quiz-progress').textContent = `Frage ${i + 1} von ${QUESTIONS.length}`;
  $('#quiz-dim').textContent = q.dim ? DIMENSIONS.find((d) => d.key === q.dim).name : '';
  $('#quiz-bar-fill').style.width = `${((i + 1) / QUESTIONS.length) * 100}%`;
  $('#question-text').innerHTML = q.text;

  // alle Answer-Container verstecken
  $('#answers-likert').hidden = true;
  $('#answers-multi').hidden = true;
  $('#answers-freetext').hidden = true;

  if (q.type === 'likert') renderLikert(i);
  else if (q.type === 'multi') renderMulti(i, q);
  else if (q.type === 'freetext') renderFreetext(i);

  // Navigation
  $('#quiz-back').hidden = i === 0;
  $('#quiz-next').textContent = i === QUESTIONS.length - 1 ? 'Auswertung ansehen →' : 'Weiter →';
  updateNextButton();
}

function renderLikert(i) {
  const cont = $('#answers-likert');
  cont.hidden = false;
  cont.innerHTML = '';
  const current = state.answers[i];
  LIKERT.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'likert-opt' + (current === opt.v ? ' selected' : '');
    btn.innerHTML = `<span class="likert-dot"></span><span>${opt.label}</span>`;
    btn.addEventListener('click', () => {
      state.answers[i] = opt.v;
      renderLikert(i);
      updateNextButton();
    });
    cont.appendChild(btn);
  });
}

function renderMulti(i, q) {
  const cont = $('#answers-multi');
  cont.hidden = false;
  cont.innerHTML = '';
  const current = Array.isArray(state.answers[i]) ? state.answers[i] : [];
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'multi-opt' + (current.includes(idx) ? ' selected' : '');
    btn.innerHTML = `<span class="multi-box"></span><span>${opt}</span>`;
    btn.addEventListener('click', () => {
      let arr = Array.isArray(state.answers[i]) ? [...state.answers[i]] : [];
      if (arr.includes(idx)) arr = arr.filter((x) => x !== idx);
      else arr.push(idx);
      state.answers[i] = arr;
      renderMulti(i, q);
      updateNextButton();
    });
    cont.appendChild(btn);
  });
}

function renderFreetext(i) {
  const cont = $('#answers-freetext');
  cont.hidden = false;
  const ta = $('#freetext-input');
  ta.value = state.answers[i] || '';
  ta.oninput = () => { state.answers[i] = ta.value; };
}

function updateNextButton() {
  const i = state.current;
  const q = QUESTIONS[i];
  const a = state.answers[i];
  let ok = false;
  if (q.type === 'likert') ok = a !== null;
  else if (q.type === 'multi') ok = Array.isArray(a) && a.length > 0;
  else if (q.type === 'freetext') ok = true; // optional
  $('#quiz-next').disabled = !ok;
}

function initQuiz() {
  $('#quiz-next').addEventListener('click', () => {
    if (state.current < QUESTIONS.length - 1) {
      state.current++;
      renderQuestion();
    } else {
      finishQuiz();
    }
  });
  $('#quiz-back').addEventListener('click', () => {
    if (state.current > 0) { state.current--; renderQuestion(); }
  });
}

// ============ Score & Results ============

function computeResults() {
  // Sub-Scores pro Dimension (je 3 Fragen, 1–5 → 3–15)
  const sub = {};
  DIMENSIONS.forEach((d) => { sub[d.key] = 0; });
  QUESTIONS.forEach((q, i) => {
    if (q.type === 'likert') sub[q.dim] += state.answers[i] || 0;
  });
  const total = Object.values(sub).reduce((a, b) => a + b, 0); // 12–60

  let bucket = 'building';
  if (total <= 24) bucket = 'early';
  else if (total >= 45) bucket = 'leader';

  // stärkste / schwächste Dimension
  const sorted = [...DIMENSIONS].sort((a, b) => sub[b.key] - sub[a.key]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  // qualifiziert? (Frage 14 = Index 13)
  const prefAns = state.answers[13];
  const qualified = Array.isArray(prefAns) && prefAns.some((x) => QUALIFYING_PREFERRED.includes(x));

  return { sub, total, bucket, strongest, weakest, qualified };
}

function fillTemplate(str, r) {
  return str
    .replace(/\{strongestDim\}/g, r.strongest.name)
    .replace(/\{weakestDim\}/g, r.weakest.name)
    .replace(/\{score\}/g, r.total);
}

function renderResults() {
  const r = computeResults();
  state.results = r;
  const b = BUCKETS[r.bucket];

  $('#result-hero').innerHTML = firstName()
    ? `${firstName()}, hier steht ihr <em>heute</em>.`
    : 'Hier steht ihr <em>heute</em>.';

  $('#spectrum-score').textContent = r.total;
  const pct = ((r.total - 12) / (60 - 12)) * 100;
  requestAnimationFrame(() => { $('#spectrum-marker').style.left = `${pct}%`; });

  $('#bucket-pointe').innerHTML = `<span class="bucket-name">Ihr seid: ${b.name}</span>${b.pointe}`;

  // Sub-Scores
  const list = $('#subscore-list');
  list.innerHTML = '';
  DIMENSIONS.forEach((d) => {
    const val = r.sub[d.key]; // 3–15
    const p = (val / 15) * 100;
    const isHebel = d.key === r.weakest.key && val < 9;
    const level = val >= 12 ? 'hoch' : val >= 8 ? 'mittel' : 'niedrig';
    const row = document.createElement('div');
    row.className = 'subscore-row' + (isHebel ? ' is-hebel' : '');
    row.innerHTML = `
      <div class="subscore-head">
        <span class="subscore-name">${d.name}${isHebel ? ' <span class="hebel-tag">← Hebel</span>' : ''}</span>
        <span class="subscore-val">${val}/15 · ${level}</span>
      </div>
      <div class="subscore-track"><div class="subscore-fill" style="width:${p}%"></div></div>`;
    list.appendChild(row);
  });

  // Insights
  const ins = $('#insights');
  ins.innerHTML = '<h3 class="insights-title">Drei Erkenntnisse aus eurem Score</h3>';
  INSIGHTS[r.bucket].forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'insight';
    el.innerHTML = `<span class="insight-num">${idx + 1}</span>
      <div><h4>${fillTemplate(item.h, r)}</h4><p>${fillTemplate(item.t, r)}</p></div>`;
    ins.appendChild(el);
  });

  // Sina Intro
  renderSinaIntro(r);
}

function renderSinaIntro(r) {
  const useIntro1 = r.qualified || r.bucket !== 'early';
  const el = $('#sina-intro');
  if (useIntro1) {
    el.innerHTML = `
      <p class="sina-hello"><em>Hallo, ich bin Sina.</em></p>
      <p>Eure Antworten zeigen: ihr seid bereit, das Thema strategisch zu denken. Ich bin Menopause Coach, Mental Health First Aid Trainerin und Systemische Coachin — aber wichtiger: ich denke wie eine Strategieberaterin, nicht wie eine Coach. Mein Job: Frauen-Gesundheit aus dem Wellbeing-Topf in die People-Strategy zu heben.</p>
      <p>Wenn ihr wollt, schauen wir uns euer Ergebnis in einem 30-Minuten-Gespräch konkret an. <strong>Kein Pitch.</strong> Wir besprechen euer Ergebnis, ich gebe euch eine Einschätzung, und ihr entscheidet, ob ein nächster Schritt für euch passt.</p>`;
  } else {
    el.innerHTML = `
      <p class="sina-hello"><em>Hallo, ich bin Sina.</em></p>
      <p>Euer Ergebnis zeigt: ihr seid am Anfang. Das ist nichts, was sich in einem 30-Minuten-Gespräch lösen lässt — eher ein längerer Aufbau. Lade dir den PDF-Report herunter: darin findest du die drei Schritte, die jedes Unternehmen ohne Budget gehen kann, plus eine Vorlage für eure Geschäftsführung.</p>
      <p>Und wenn du magst: mein monatlicher Strategie-Brief teilt genau für diese Phase konkrete Schritte.</p>`;
  }
}

function finishQuiz() {
  renderResults();
  switchView('result');
  submitLead(); // Brevo / Backend (failsafe)
}

// ============ Lead-Submit (failsafe — funktioniert auch ohne Backend) ============

function submitLead() {
  const r = state.results;
  const payload = {
    name: state.capture.name,
    email: state.capture.email,
    companySize: state.capture.size,
    newsletter: state.capture.newsletter,
    score: r.total,
    bucket: BUCKETS[r.bucket].name,
    subScores: r.sub,
    answers: state.answers,
  };
  // Best-effort POST. Schlägt es fehl (noch kein Backend), bricht nichts.
  fetch('/api/submit-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => { /* Backend noch nicht aktiv — kein Problem für v1-Test */ });
}

// ============ Boot ============

document.addEventListener('DOMContentLoaded', () => {
  initLanding();
  initCapture();
  initQuiz();
  if (typeof initPdf === 'function') initPdf();
});
