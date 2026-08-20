/* ============================================================
   MI DIARIO — lógica de la app
   Todo se guarda en localStorage del navegador (100% privado,
   no sale de tu dispositivo). Para personalizar el comportamiento,
   busca las secciones "PERSONALIZA AQUÍ".
   ============================================================ */

const STORAGE_KEY = "mi-diario-entradas";

const MOODS = ["radiante", "tranquila", "neutral", "cansada", "dificil"];

/* ---------- estado ---------- */
let entries = loadEntries();
let activeId = null;

/* ---------- elementos ---------- */
const $thread      = document.getElementById("entry-thread");
const $searchInput = document.getElementById("search-input");
const $newBtn      = document.getElementById("new-entry-btn");
const $saveBtn     = document.getElementById("save-btn");
const $deleteBtn   = document.getElementById("delete-btn");
const $exportBtn   = document.getElementById("export-btn");
const $importInput = document.getElementById("import-input");
const $statsLine   = document.getElementById("stats-line");

const $title   = document.getElementById("entry-title");
const $date    = document.getElementById("entry-date");
const $tags    = document.getElementById("entry-tags");
const $body    = document.getElementById("entry-body");
const $wordCount = document.getElementById("word-count");
const $moodDots = document.querySelectorAll(".mood-dot");

const $welcome   = document.getElementById("welcome");
const $welcomeBtn = document.getElementById("welcome-btn");
const $pageInner = document.getElementById("page-inner");

const $menuToggle = document.getElementById("menu-toggle");
const $spine       = document.getElementById("spine");
const $scrim        = document.getElementById("scrim");

let selectedMood = null;

/* ---------- almacenamiento ---------- */
function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/* ---------- utilidades ---------- */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-EC", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

function snippet(text) {
  return (text || "").trim().slice(0, 60);
}

/* ---------- render de la lista lateral ---------- */
function renderThread(filter = "") {
  const q = filter.trim().toLowerCase();
  const sorted = [...entries].sort((a, b) => b.createdAt - a.createdAt);
  const visible = q
    ? sorted.filter(e =>
        (e.title + " " + e.body + " " + (e.tags || []).join(" "))
          .toLowerCase().includes(q))
    : sorted;

  $thread.innerHTML = "";

  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-thread";
    empty.textContent = q
      ? "No hay entradas que coincidan con tu búsqueda."
      : "Aún no tienes entradas. Escribe la primera con \"+ Nueva entrada\".";
    $thread.appendChild(empty);
    return;
  }

  visible.forEach(entry => {
    const card = document.createElement("div");
    card.className = "entry-card" + (entry.id === activeId ? " active" : "");
    card.dataset.id = entry.id;

    const mark = document.createElement("span");
    mark.className = "mood-mark";
    mark.style.background = entry.mood
      ? `var(--mood-${entry.mood})`
      : "var(--ink-soft)";

    const titleEl = document.createElement("div");
    titleEl.className = "card-title";
    titleEl.textContent = entry.title || "Sin título";

    const dateEl = document.createElement("div");
    dateEl.className = "card-date";
    dateEl.textContent = new Date(entry.createdAt).toLocaleDateString("es-EC", {
      day: "2-digit", month: "short", year: "numeric"
    });

    const snip = document.createElement("div");
    snip.className = "card-snippet";
    snip.textContent = snippet(entry.body);

    card.append(mark, titleEl, dateEl, snip);
    card.addEventListener("click", () => openEntry(entry.id));
    $thread.appendChild(card);
  });
}

/* ---------- mostrar editor vs. pantalla de bienvenida ---------- */
function showEditor() {
  $welcome.hidden = true;
  $pageInner.hidden = false;
}
function showWelcome() {
  $welcome.hidden = false;
  $pageInner.hidden = true;
}

/* ---------- estadísticas (total de entradas + racha) ---------- */
function updateStats() {
  const total = entries.length;
  if (total === 0) {
    $statsLine.textContent = "";
    return;
  }

  // días únicos con al menos una entrada (formato YYYY-MM-DD local)
  const days = new Set(
    entries.map(e => new Date(e.createdAt).toDateString())
  );

  // racha: cuenta días consecutivos hacia atrás desde hoy (o ayer)
  let streak = 0;
  let cursor = new Date();
  // si hoy no hay entrada, empieza a contar desde ayer
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const entryWord = total === 1 ? "entrada" : "entradas";
  const streakText = streak >= 2 ? ` · racha de ${streak} días` : "";
  $statsLine.textContent = `${total} ${entryWord}${streakText}`;
}

/* ---------- editor ---------- */
function openEntry(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  activeId = id;
  showEditor();

  $title.value = entry.title || "";
  $date.textContent = formatDate(entry.createdAt);
  $tags.value = (entry.tags || []).join(", ");
  $body.value = entry.body || "";
  selectedMood = entry.mood || null;
  updateMoodUI();
  updateWordCount();
  renderThread($searchInput.value);
  closeMobileMenu();
}

function newEntry() {
  const entry = {
    id: uid(),
    title: "",
    body: "",
    tags: [],
    mood: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  entries.push(entry);
  persist();
  openEntry(entry.id);
  updateStats();
  $title.focus();
}

function currentEntry() {
  return entries.find(e => e.id === activeId);
}

function saveCurrent() {
  let entry = currentEntry();
  if (!entry) {
    // si no hay entrada activa, crea una nueva a partir de lo escrito
    entry = {
      id: uid(),
      createdAt: Date.now()
    };
    entries.push(entry);
    activeId = entry.id;
  }
  entry.title = $title.value.trim();
  entry.body = $body.value;
  entry.tags = $tags.value
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);
  entry.mood = selectedMood;
  entry.updatedAt = Date.now();

  persist();
  renderThread($searchInput.value);
  updateStats();
  flashSaved();
}

function deleteCurrent() {
  if (!activeId) return;
  const entry = currentEntry();
  const label = entry?.title || "esta entrada";
  if (!confirm(`¿Eliminar "${label}"? Esta acción no se puede deshacer.`)) return;

  entries = entries.filter(e => e.id !== activeId);
  persist();
  activeId = null;
  clearEditor();
  renderThread($searchInput.value);
  updateStats();

  if (entries.length === 0) {
    showWelcome();
  } else {
    const latest = [...entries].sort((a, b) => b.createdAt - a.createdAt)[0];
    openEntry(latest.id);
  }
}

function clearEditor() {
  $title.value = "";
  $date.textContent = "";
  $tags.value = "";
  $body.value = "";
  selectedMood = null;
  updateMoodUI();
  updateWordCount();
}

/* ---------- menú móvil ---------- */
function openMobileMenu() {
  $spine.classList.add("open");
  $scrim.hidden = false;
  $scrim.classList.add("visible");
  $menuToggle.setAttribute("aria-expanded", "true");
}
function closeMobileMenu() {
  $spine.classList.remove("open");
  $scrim.classList.remove("visible");
  $menuToggle.setAttribute("aria-expanded", "false");
  setTimeout(() => { $scrim.hidden = true; }, 200);
}
$menuToggle.addEventListener("click", () => {
  $spine.classList.contains("open") ? closeMobileMenu() : openMobileMenu();
});
$scrim.addEventListener("click", closeMobileMenu);

function flashSaved() {
  const original = $saveBtn.textContent;
  $saveBtn.textContent = "Guardado ✓";
  setTimeout(() => { $saveBtn.textContent = original; }, 1200);
}

/* ---------- mood picker ---------- */
function updateMoodUI() {
  $moodDots.forEach(dot => {
    dot.classList.toggle("selected", dot.dataset.mood === selectedMood);
  });
}

$moodDots.forEach(dot => {
  dot.addEventListener("click", () => {
    selectedMood = selectedMood === dot.dataset.mood ? null : dot.dataset.mood;
    updateMoodUI();
  });
});

/* ---------- contador de palabras ---------- */
function updateWordCount() {
  const words = $body.value.trim().split(/\s+/).filter(Boolean).length;
  $wordCount.textContent = `${words} ${words === 1 ? "palabra" : "palabras"}`;
}
$body.addEventListener("input", updateWordCount);

/* ---------- exportar / importar ---------- */
function exportEntries() {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mi-diario-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importEntries(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("formato inválido");
      const existingIds = new Set(entries.map(e => e.id));
      const merged = imported.filter(e => !existingIds.has(e.id));
      entries = [...entries, ...merged];
      persist();
      renderThread($searchInput.value);
      alert(`Se importaron ${merged.length} entrada(s).`);
    } catch {
      alert("No se pudo leer el archivo. Asegúrate de que sea un .json exportado desde Mi Diario.");
    }
  };
  reader.readAsText(file);
}

/* ---------- eventos ---------- */
$newBtn.addEventListener("click", newEntry);
$saveBtn.addEventListener("click", saveCurrent);
$deleteBtn.addEventListener("click", deleteCurrent);
$exportBtn.addEventListener("click", exportEntries);
$importInput.addEventListener("change", (e) => {
  if (e.target.files[0]) importEntries(e.target.files[0]);
  e.target.value = "";
});
$searchInput.addEventListener("input", () => renderThread($searchInput.value));

// atajo de teclado: Ctrl/Cmd + S para guardar sin recargar la página
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    saveCurrent();
  }
});

$welcomeBtn.addEventListener("click", newEntry);

/* ---------- arranque ---------- */
renderThread();
updateStats();
if (entries.length > 0) {
  const latest = [...entries].sort((a, b) => b.createdAt - a.createdAt)[0];
  openEntry(latest.id);
} else {
  $date.textContent = formatDate(Date.now());
  showWelcome();
}
