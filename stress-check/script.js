/* SISU Stress-Check — Logik
   Spec: vault/05_Projekte/linkedin-freebie-stresscheck/2026-05-27-design-spec.md
*/

// ============ Daten ============

// Slider-Logik: links = wenig Stress, rechts = viel Stress (konsistent über alle Fragen).
// Score = einfache Summe der 5 Werte (0–50).
const QUESTIONS = [
  {
    text: 'Wie <em>angespannt</em> fühlst du dich gerade im Körper?',
    low: 'Ganz weich',
    high: 'Wie ein Knoten',
  },
  {
    text: 'Wie <em>erholt</em> bist du heute Morgen aufgewacht?',
    low: 'Wie neu',
    high: 'Noch müder als gestern',
  },
  {
    text: 'Wie viele Gedanken kreisen gerade <em>parallel</em> in dir?',
    low: 'Klar & leer',
    high: 'Karussell',
  },
  {
    text: 'Wie viel <em>Kraft</em> hast du für den Rest des Tages?',
    low: 'Volle Batterie',
    high: 'Reservetank leer',
  },
  {
    text: 'Wann hattest du zuletzt eine echte Pause — <em>ohne Handy, ohne To-do</em>?',
    low: 'Heute',
    high: 'Kann mich nicht erinnern',
  },
];

const NARRATIVES = {
  green: 'Schön — dein Nervensystem geht heute gut. Das ist nicht selbstverständlich. Nimm dir einen Moment, das auch wirklich zu spüren.',
  yellow: 'Dein Körper hält. Aber er meldet sich. Kein Drama. Aber auch kein Zustand, der sich von allein auflöst.',
  red: 'Du läufst auf Reserve. Das ist keine Schwäche, das ist Information. Dein Body Budget ist im Minus. Die nächsten 60 Sekunden sind ein Anfang.',
};

const BODYSCAN_LINES = [
  { text: 'Schultern …', delay: 0 },
  { text: '… fallen lassen.', delay: 5000 },
  { text: 'Kiefer …', delay: 12000 },
  { text: '… locker werden.', delay: 17000 },
  { text: 'Hände …', delay: 24000 },
  { text: '… öffnen.', delay: 29000 },
  { text: 'Bauch …', delay: 36000 },
  { text: '… weich.', delay: 41000 },
  { text: 'Atem …', delay: 48000 },
  { text: '… darf einfach kommen.', delay: 53000 },
];

// ============ State ============

const state = {
  currentQuestion: 0,
  answers: [], // raw slider values (0–10) in question order
};

// ============ Helpers ============

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function getFirstName() {
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get('n') || '').trim();
  if (!raw) return null;
  // Capitalize first letter, lowercase rest
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function switchView(name) {
  $$('.view').forEach((el) => {
    el.hidden = el.dataset.view !== name;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ Intro ============

function initIntro() {
  const name = getFirstName();
  if (name) {
    $('#greeting').textContent = `Hallo ${name},`;
  }
  $('[data-action="start"]').addEventListener('click', () => {
    state.currentQuestion = 0;
    state.answers = [];
    renderQuestion();
    switchView('question');
  });
}

// ============ Questions ============

function renderQuestion() {
  const i = state.currentQuestion;
  const q = QUESTIONS[i];
  $('#progress').textContent = `Frage ${i + 1} von ${QUESTIONS.length}`;
  $('#question-text').innerHTML = q.text;
  $('#label-low').textContent = q.low;
  $('#label-high').textContent = q.high;
  const slider = $('#slider');
  slider.value = 5;
  $('#slider-value').textContent = '5';
}

function initQuestions() {
  const slider = $('#slider');
  slider.addEventListener('input', () => {
    $('#slider-value').textContent = slider.value;
  });

  $('[data-action="next"]').addEventListener('click', () => {
    state.answers[state.currentQuestion] = parseInt(slider.value, 10);
    advance();
  });

  $('[data-action="skip"]').addEventListener('click', () => {
    state.answers[state.currentQuestion] = 5; // mid-value per spec §5
    advance();
  });
}

function advance() {
  if (state.currentQuestion < QUESTIONS.length - 1) {
    state.currentQuestion++;
    renderQuestion();
    // sanfte Fade-Animation: re-trigger
    const view = $('.view-question');
    view.style.animation = 'none';
    void view.offsetWidth; // reflow
    view.style.animation = '';
  } else {
    renderResult();
    switchView('result');
  }
}

// ============ Score & Result ============

function calcScore() {
  return state.answers.reduce((sum, v) => sum + (v ?? 5), 0); // 0–50
}

function bucketOf(score) {
  if (score <= 18) return 'green';
  if (score <= 32) return 'yellow';
  return 'red';
}

function renderResult() {
  const score = calcScore();
  const bucket = bucketOf(score);

  // Score-Zahl
  $('#spectrum-score').textContent = score;

  // Marker-Position (0–50 → 0–100%)
  const pct = (score / 50) * 100;
  // Geben dem Browser einen Tick, dann animieren
  requestAnimationFrame(() => {
    $('#spectrum-marker').style.left = `${pct}%`;
  });

  // Narrativ
  $('#narrative').textContent = NARRATIVES[bucket];

  // Adaptive Übung
  $$('.exercise').forEach((el) => (el.hidden = true));
  if (bucket === 'green') $('#exercise-gratitude').hidden = false;
  if (bucket === 'yellow') { initBreath(); $('#exercise-breath').hidden = false; }
  if (bucket === 'red') { initBodyScan(); $('#exercise-bodyscan').hidden = false; }

  // Adaptive CTA
  $$('.cta').forEach((el) => (el.hidden = true));
  $(`.cta-${bucket}`).hidden = false;
}

// ============ Übung: Atemkreis 4-7-8 ============

let breathTimer = null;
let breathRunning = false;

function initBreath() {
  const toggle = $('#breath-toggle');
  toggle.onclick = () => {
    if (breathRunning) {
      stopBreath();
    } else {
      startBreath();
    }
  };
}

function startBreath() {
  breathRunning = true;
  $('#breath-toggle').textContent = 'Stopp';
  let cycle = 0;
  const maxCycles = 3;

  const runCycle = () => {
    if (!breathRunning || cycle >= maxCycles) {
      stopBreath();
      $('#breath-phase').textContent = 'Fertig. Spür einen Moment nach.';
      return;
    }
    cycle++;
    const circle = $('#breath-circle');
    const phase = $('#breath-phase');

    // Einatmen 4s
    circle.className = 'breath-circle inhale';
    phase.textContent = 'Einatmen … 4';
    breathTimer = setTimeout(() => {
      if (!breathRunning) return;
      // Halten 7s
      circle.className = 'breath-circle hold';
      phase.textContent = 'Halten … 7';
      breathTimer = setTimeout(() => {
        if (!breathRunning) return;
        // Ausatmen 8s
        circle.className = 'breath-circle exhale';
        phase.textContent = 'Ausatmen … 8';
        breathTimer = setTimeout(runCycle, 8000);
      }, 7000);
    }, 4000);
  };

  runCycle();
}

function stopBreath() {
  breathRunning = false;
  clearTimeout(breathTimer);
  $('#breath-toggle').textContent = 'Start';
  $('#breath-circle').className = 'breath-circle';
}

// ============ Übung: Body-Scan ============

let bodyTimers = [];
let bodyRunning = false;

function initBodyScan() {
  const audio = $('#bodyscan-audio');
  const audioUI = $('#bodyscan-audio-ui');
  const textUI = $('#bodyscan-text-ui');

  // Audio-UI standardmäßig zeigen, Text-Fallback verstecken.
  // Bei Lade-Fehler wird umgeschaltet.
  audioUI.hidden = false;
  textUI.hidden = true;
  initAudioPlayer(audio);

  // Falls Audio nicht lädt: zurück zum Text-Fallback
  audio.addEventListener('error', () => {
    audioUI.hidden = true;
    textUI.hidden = false;
  }, { once: true });

  const toggle = $('#bodyscan-toggle');
  toggle.onclick = () => {
    if (bodyRunning) {
      stopBodyScan();
    } else {
      startBodyScan();
    }
  };
}

function initAudioPlayer(audio) {
  const playBtn = $('#audio-play');
  const progress = $('#audio-progress');
  const timeEl = $('#audio-time');

  const fmt = (s) => {
    if (!s || isNaN(s)) return '–:––';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const updateTime = () => {
    if (audio.duration && !isNaN(audio.duration)) {
      timeEl.textContent = fmt(audio.duration - audio.currentTime);
    } else {
      timeEl.textContent = '–:––';
    }
  };

  // Anzeige initialisieren (auch wenn metadata noch nicht geladen)
  updateTime();
  audio.addEventListener('loadedmetadata', updateTime);
  audio.addEventListener('durationchange', updateTime);

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch((err) => {
        console.warn('Audio konnte nicht starten:', err);
      });
      playBtn.classList.add('playing');
    } else {
      audio.pause();
      playBtn.classList.remove('playing');
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration && !isNaN(audio.duration)) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progress.style.width = `${pct}%`;
      timeEl.textContent = fmt(audio.duration - audio.currentTime);
    }
  });

  audio.addEventListener('ended', () => {
    playBtn.classList.remove('playing');
    progress.style.width = '0%';
    updateTime();
  });
}

function startBodyScan() {
  bodyRunning = true;
  $('#bodyscan-toggle').textContent = 'Stopp';
  const textEl = $('#bodyscan-text');

  BODYSCAN_LINES.forEach((line) => {
    const showTimer = setTimeout(() => {
      if (!bodyRunning) return;
      textEl.classList.remove('show');
      setTimeout(() => {
        textEl.textContent = line.text;
        textEl.classList.add('show');
      }, 250);
    }, line.delay);
    bodyTimers.push(showTimer);
  });

  const endTimer = setTimeout(() => {
    if (!bodyRunning) return;
    textEl.classList.remove('show');
    setTimeout(() => {
      textEl.textContent = 'Fertig.';
      textEl.classList.add('show');
      stopBodyScan();
    }, 500);
  }, 60000);
  bodyTimers.push(endTimer);
}

function stopBodyScan() {
  bodyRunning = false;
  bodyTimers.forEach(clearTimeout);
  bodyTimers = [];
  $('#bodyscan-toggle').textContent = 'Start';
}

// ============ Share ============

function initShare() {
  $('#share-btn').addEventListener('click', async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(url);
      $('#share-confirm').textContent = '✓ Link kopiert';
      setTimeout(() => ($('#share-confirm').textContent = ''), 3000);
    } catch {
      $('#share-confirm').textContent = url;
    }
  });
}

// ============ Boot ============

document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  initQuestions();
  initShare();
});
