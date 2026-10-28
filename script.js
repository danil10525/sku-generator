(() => {
  "use strict";

  // --- УПРАВЛЕНИЕ ТЕМОЙ ---
  const themeToggle = document.getElementById("themeToggle");
  const currentTheme = localStorage.getItem("theme") || "dark";
  
  if (currentTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggle.textContent = "🌝";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "🌚";
  }

  themeToggle.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "🌚";
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌝";
    }
  });

  // --- ДАННЫЕ SABER-TEX ---
  const SABER_DATA = {
    types: [
      { code: "БР", name: "Брюки" }, { code: "БРЮ", name: "Брюки (альт)" },
      { code: "КОС", name: "Костюм" }, { code: "КУР", name: "Куртка" }, { code: "ФУТ", name: "Футболка" }
    ],
    models: [ { code: "БРК", name: "Беркут-К" }, { code: "ГВР", name: "Гвардия" } ],
    seasons: [
      { code: "ЛТ", name: "Лето" }, { code: "ДМ", name: "Демисезонное" },
      { code: "ЗМ", name: "Зима" }, { code: "ВС", name: "Внесезонное" }
    ],
    colors: [
      { code: "001", name: "Черный" }, { code: "002", name: "Белый" },
      { code: "003", name: "X" }, { code: "004", name: "X" }, { code: "005", name: "X" }, { code: "006", name: "X" }
    ],
    sizes: [
      { code: "4042", name: "40-42" }, { code: "4446", name: "44-46" }, { code: "4850", name: "48-50" },
      { code: "5254", name: "52-54" }, { code: "5658", name: "56-58" }, { code: "6062", name: "60-62" }
    ],
    heights: [ { code: "158", name: "158-164" }, { code: "170", name: "170-176" }, { code: "182", name: "182-188" } ]
  };

  // --- ДАННЫЕ ДЛЯ ДРУГИХ БРЕНДОВ ---
  const CATEGORY_TREE = [
    { group: "АКСЕССУАРЫ", items: [
      { name: "БАБОЧКИ", parent: "ГАЛСТУКИ" }, { name: "ГОТОВЫЕ", parent: "ГАЛСТУКИ" },
      { name: "ГОЙСЫ", parent: "ГАЛСТУКИ" }, { name: "ЗАЖИМЫ", parent: "ГАЛСТУКИ" },
      { name: "КЛАССИЧЕСКИЕ", parent: "ГАЛСТУКИ" }, { name: "МЕЛОЧЕВКА" },
      { name: "ОБЛОЖКИ" }, { name: "СУВЕНИРЫ" }
    ]},
    { group: "ГОЛОВНЫЕ УБОРЫ", items: [
      { name: "АРАФАТКИ" }, { name: "БАНДАНЫ" }, { name: "БАФФЫ" }, { name: "БЕРЕТЫ" },
      { name: "КЕПКИ" }, { name: "МАСКИ" }, { name: "ПАНАМЫ" }, { name: "ПИЛОТКИ" },
      { name: "ПРОЧЕЕ" }, { name: "ФУРАЖКИ" }, { name: "ШАПКИ" }, { name: "ШАРФЫ" }
    ]},
    { group: "НОСКИ", items: [
      { name: "ПОРТЯНКИ" }, { name: "РАБОЧИЕ" }, { name: "СПОРТИВНЫЕ" }, { name: "ТЕРМОНОСКИ" }, { name: "ФОРМЕННЫЕ" }
    ]},
    { group: "ОБУВЬ", items: [
      { name: "БЕРЦЫ" }, { name: "БОТИНКИ" }, { name: "КЕДЫ" }, { name: "КРОССОВКИ" },
      { name: "ПОЛУБОТИНКИ" }, { name: "ПРОЧАЯ" }, { name: "ПРОЧЕЕ" }, { name: "САНДАЛИИ" },
      { name: "САПОГИ" }, { name: "ТУФЛИ" }, { name: "УХОД" }, { name: "ШНУРКИ" }
    ]}
  ];

  const LS_COUNTERS = "sku.counters.v2"; // Обновил версию из-за смены формата
  const LS_SETTINGS = "sku.settings.v2";
  const state = { counters: readJSON(LS_COUNTERS, {}), lastBatch: [] };

  function readJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  // --- ЛОГИКА SABER-TEX ---
  function initSaberSelects() {
    const fill = (id, data) => {
      const el = document.getElementById(id);
      el.innerHTML = "";
      data.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.code;
        opt.textContent = `${item.code} (${item.name})`;
        el.appendChild(opt);
      });
    };
    fill("saberType", SABER_DATA.types);
    fill("saberModel", SABER_DATA.models);
    fill("saberSeason", SABER_DATA.seasons);
    fill("saberColor", SABER_DATA.colors);
    fill("saberSize", SABER_DATA.sizes);
    fill("saberHeight", SABER_DATA.heights);
  }

  function generateSaber() {
    const type = document.getElementById("saberType").value;
    const model = document.getElementById("saberModel").value;
    const season = document.getElementById("saberSeason").value;
    const color = document.getElementById("saberColor").value;
    const size = document.getElementById("saberSize").value;
    const height = document.getElementById("saberHeight").value;
    document.getElementById("saberResult").textContent = `${type}-${model}-${season}-${color}-${size}-${height}`;
  }

  // --- ЛОГИКА ДРУГИХ БРЕНДОВ (ОПТИМИЗАЦИЯ ДО 25 СИМВОЛОВ) ---
  function cleanToken(value, maxLen = 15) {
    const s = String(value ?? "").toUpperCase().replace(/[^А-ЯЁ0-9]+/g, "");
    return s.slice(0, maxLen) || "";
  }

  function buildSku(cfg, seq) {
    let parts = [];
    
    // 1. Группа (макс 6 симв)
    if (cfg.useParent && cfg.group) parts.push(cleanToken(cfg.group, 6));
    
    // 2. Категория (макс 10 симв)
    parts.push(cleanToken(cfg.category, 10));
    
    // 3. Бренд (макс 4 симв)
    if (cfg.brand) parts.push(cleanToken(cfg.brand, 4));
    
    // 4. Атрибуты (макс 2 симв на каждый, макс 2 шт)
    if (cfg.attrs.length) {
      const shortAttrs = cfg.attrs.slice(0, 2).map(a => cleanToken(a, 2)).filter(Boolean);
      if (shortAttrs.length) parts.push(shortAttrs.join(""));
    }
    
    // 5. Номер (до 6 цифр)
    parts.push(String(seq).padStart(4, "0"));

    // Собираем и обрезаем, если > 25 символов
    let result = parts.join("-");
    
    // Умная обрезка: если длинно, сначала режем атрибуты, потом бренд
    while (result.length > 25 && parts.length > 2) {
      // Если есть атрибуты (индекс 3), удаляем их
      if (parts[3]) {
        parts.splice(3, 1);
      } 
      // Если нет атрибутов, но есть бренд (индекс 2), удаляем его
      else if (parts[2] && parts.length === 4) { 
        parts.splice(2, 1);
      }
      // Если всё еще длинно, подрезаем категорию (индекс 1)
      else {
        parts[1] = parts[1].slice(0, -1);
      }
      result = parts.join("-");
    }

    return result.slice(0, 25); // Жесткая гарантия
  }

  function nextSeq(key, start) {
    const cur = state.counters[key];
    const seq = (typeof cur === "number") ? cur : start;
    state.counters[key] = seq + 1;
    writeJSON(LS_COUNTERS, state.counters);
    return seq;
  }

  function counterKey(cfg) {
    if (cfg.counterMode === "global") return "GLOBAL";
    return [cfg.group, cfg.category, cfg.brand, ...cfg.attrs].join("|");
  }

  const $ = id => document.getElementById(id);
  const FIELDS = ["brand", "attrs", "qty", "useParentGroup"];

  function initCategorySelect() {
    const select = $("categorySelect"); select.innerHTML = "";
    for (const node of CATEGORY_TREE) {
      const optgroup = document.createElement("optgroup"); optgroup.label = node.group;
      for (const item of node.items) {
        const opt = document.createElement("option");
        opt.value = item.name; opt.dataset.group = node.group;
        opt.textContent = item.parent ? `${item.parent} / ${item.name}` : item.name;
        optgroup.appendChild(opt);
      }
      select.appendChild(optgroup);
    }
  }

  function readForm() {
    const select = $("categorySelect"); const selectedOpt = select.options[select.selectedIndex];
    return {
      group: selectedOpt.dataset.group || "",
      category: selectedOpt.value, useParent: $("useParentGroup").checked,
      brand: $("brand").value, attrs: String($("attrs").value ?? "").split(/[\s,;\/|]+/).filter(Boolean),
      qty: parseInt($("qty").value) || 1, counterMode: "per-combo"
    };
  }

  function persistSettings() {
    const data = {};
    for (const f of FIELDS) { const el = $(f); if (el) data[f] = el.type === "checkbox" ? el.checked : el.value; }
    data["categorySelect"] = $("categorySelect").value; writeJSON(LS_SETTINGS, data);
  }

  function restoreSettings() {
    const data = readJSON(LS_SETTINGS, null); if (!data) return;
    for (const f of FIELDS) {
      const el = $(f);
      if (data[f] !== undefined && el) { if (el.type === "checkbox") el.checked = data[f]; else el.value = data[f]; }
    }
    if (data["categorySelect"]) {
      const sel = $("categorySelect");
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === data["categorySelect"]) { sel.selectedIndex = i; break; }
      }
    }
  }

  function generateOther() {
    const cfg = readForm(), key = counterKey(cfg), rows = [];
    for (let i = 0; i < cfg.qty; i++) {
      const seq = nextSeq(key, 1);
      const sku = buildSku(cfg, seq);
      rows.push({ sku, len: sku.length });
    }
    state.lastBatch = rows; renderResult(rows); renderCounters(); persistSettings();
  }

  function renderResult(rows) {
    const body = $("resultBody"); body.innerHTML = "";
    if (!rows.length) { body.innerHTML = '<tr><td colspan="3" class="hint">Пока пусто</td></tr>'; $("summary").textContent = ""; return; }
    $("summary").textContent = "всего: " + rows.length;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i], tr = document.createElement("tr");
      tr.innerHTML = `<td>${i + 1}</td><td class="mono">${escapeHtml(r.sku)}</td><td style="color:var(--ok)">${r.len} / 25</td>`;
      body.appendChild(tr);
    }
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }

  function copyText(text, btnElement) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btnElement.textContent; btnElement.textContent = "Скопировано!";
      setTimeout(() => btnElement.textContent = orig, 1500);
    });
  }

  function downloadCsv() {
    if (!state.lastBatch.length) return;
    const lines = ["sku;length"];
    for (const r of state.lastBatch) lines.push([r.sku, r.len].join(";"));
    const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "skus.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  function renderCounters() {
    const body = $("countersBody"), keys = Object.keys(state.counters).sort();
    body.innerHTML = keys.length ? "" : '<tr><td colspan="2" class="hint">Счётчиков пока нет</td></tr>';
    for (const k of keys) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td class="mono">${escapeHtml(k)}</td><td>${state.counters[k]}</td>`;
      body.appendChild(tr);
    }
  }

  // --- СОБЫТИЯ ---
  document.querySelectorAll(".main-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".main-tab").forEach(b => b.classList.toggle("active", b === btn));
      $("section-saber").classList.toggle("hidden", btn.dataset.main !== "saber");
      $("section-other").classList.toggle("hidden", btn.dataset.main !== "other");
    });
  });

  document.querySelectorAll(".sub-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sub-tab").forEach(b => b.classList.toggle("active", b === btn));
      $("sub-gen").classList.toggle("hidden", btn.dataset.sub !== "gen");
      $("sub-data").classList.toggle("hidden", btn.dataset.sub !== "data");
      if (btn.dataset.sub === "data") renderCounters();
    });
  });

  $("btnGenSaber").addEventListener("click", generateSaber);
  $("btnCopySaber").addEventListener("click", (e) => copyText($("saberResult").textContent, e.target));
  ["saberType", "saberModel", "saberSeason", "saberColor", "saberSize", "saberHeight"].forEach(id => {
    $(id).addEventListener("change", generateSaber);
  });

  $("btnGenerate").addEventListener("click", generateOther);
  $("btnCopy").addEventListener("click", (e) => { if(state.lastBatch.length) copyText(state.lastBatch.map(r => r.sku).join("\n"), e.target); });
  $("btnCsv").addEventListener("click", downloadCsv);
  
  $("btnExportCounters").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.counters, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sku-counters.json"; a.click();
  });
  
  $("btnImportCounters").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        state.counters = Object.assign({}, state.counters, data);
        writeJSON(LS_COUNTERS, state.counters); renderCounters(); alert("Импортировано!");
      } catch (err) { alert("Ошибка импорта"); }
    };
    reader.readAsText(file); e.target.value = "";
  });

  $("btnResetCounters").addEventListener("click", () => {
    if(confirm("Сбросить все счетчики?")) { state.counters = {}; writeJSON(LS_COUNTERS, state.counters); renderCounters(); }
  });

  FIELDS.forEach(f => {
    const el = $(f); if(el) { el.addEventListener("change", persistSettings); }
  });
  $("categorySelect").addEventListener("change", persistSettings);

  // --- ИНИЦИАЛИЗАЦИЯ ---
  initSaberSelects(); generateSaber(); initCategorySelect(); restoreSettings(); renderCounters();
})();
