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

  // --- ДАННЫЕ ДРУГИХ БРЕНДОВ ---
  const CATEGORY_TREE = [
    { group: "Аксессуары", items: [
      { name: "Бабочки", parent: "Галстуки" }, { name: "Готовые", parent: "Галстуки" },
      { name: "Гойсы", parent: "Галстуки" }, { name: "Зажимы", parent: "Галстуки" },
      { name: "Классические", parent: "Галстуки" }, { name: "Мелочевка" },
      { name: "Обложки" }, { name: "Сувениры" }
    ]},
    { group: "Головные уборы", items: [
      { name: "Арафатки" }, { name: "Банданы" }, { name: "Баффы" }, { name: "Береты" },
      { name: "Кепки" }, { name: "Маски" }, { name: "Панамы" }, { name: "Пилотки" },
      { name: "Прочее" }, { name: "Фуражки" }, { name: "Шапки" }, { name: "Шарфы" }
    ]},
    { group: "Носки", items: [
      { name: "Портянки" }, { name: "Рабочие" }, { name: "Спортивные" }, { name: "Термоноски" }, { name: "Форменные" }
    ]},
    { group: "Обувь", items: [
      { name: "Берцы" }, { name: "Ботинки" }, { name: "Кеды" }, { name: "Кроссовки" },
      { name: "Полуботинки" }, { name: "Прочая" }, { name: "Прочее" }, { name: "Сандалии" },
      { name: "Сапоги" }, { name: "Туфли" }, { name: "Уход" }, { name: "Шнурки" }
    ]}
  ];

  const LS_COUNTERS = "sku.counters.v1";
  const LS_SETTINGS = "sku.settings.v1";
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

  // --- ЛОГИКА ДРУГИХ БРЕНДОВ ---
  function cleanToken(value, maxLen = 15) {
    const s = String(value ?? "").toUpperCase().replace(/[^А-ЯЁ0-9]+/g, "");
    return s.slice(0, maxLen) || "ХЗ";
  }
  function checksum(payload) {
    let hash = 0;
    for (let i = 0; i < payload.length; i++) { hash = (hash * 31 + payload.charCodeAt(i)) % 97; }
    return String(hash).padStart(2, "0");
  }
  function splitAttrs(value) { return String(value ?? "").split(/[\s,;\/|]+/).filter(Boolean); }

  function buildSku({ prefix, group, category, brand, attrs, seq, seqWidth, useParent }) {
    const parts = [cleanToken(prefix, 8)];
    if (useParent && group) parts.push(cleanToken(group, 10));
    parts.push(cleanToken(category, 12));
    if (brand) parts.push(cleanToken(brand, 10));
    const ca = attrs.map(a => cleanToken(a, 8)).filter(Boolean);
    if (ca.length) parts.push(ca.join("-"));
    parts.push(String(seq).padStart(seqWidth, "0"));
    const payload = parts.filter(Boolean).join("-");
    return payload + "-" + checksum(payload);
  }

  function validateSku(sku) {
    const s = String(sku ?? "").trim().toUpperCase();
    if (!s) return { ok: false, reason: "пустая строка" };
    const idx = s.lastIndexOf("-");
    if (idx <= 0) return { ok: false, reason: "нет контрольной суммы" };
    const payload = s.slice(0, idx), chk = s.slice(idx + 1);
    if (!/^[0-9]{2}$/.test(chk)) return { ok: false, reason: "КС должна быть 2 цифры" };
    return checksum(payload) === chk ? { ok: true, reason: "КС совпадает" } : { ok: false, reason: "ожидалось ...-" + checksum(payload) };
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
    return [cleanToken(cfg.prefix, 8), cfg.useParent ? cleanToken(cfg.group, 10) : "",
      cleanToken(cfg.category, 12), cleanToken(cfg.brand, 10),
      ...cfg.attrs.map(a => cleanToken(a, 8))].filter(Boolean).join("|");
  }

  const $ = id => document.getElementById(id);
  const FIELDS = ["prefix", "brand", "attrs", "qty", "seqWidth", "counterMode", "maxLen", "useParentGroup"];

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
      prefix: $("prefix").value, group: selectedOpt.dataset.group || "",
      category: selectedOpt.value, useParent: $("useParentGroup").checked,
      brand: $("brand").value, attrs: splitAttrs($("attrs").value),
      qty: clampInt($("qty").value, 1, 1000, 1), seqWidth: clampInt($("seqWidth").value, 1, 10, 5),
      counterMode: $("counterMode").value, maxLen: clampInt($("maxLen").value, 8, 120, 40)
    };
  }

  function clampInt(v, min, max, fallback) {
    const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
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
      const seq = nextSeq(key, 1), sku = buildSku({ ...cfg, seq });
      rows.push({ sku, len: sku.length });
    }
    state.lastBatch = rows; renderResult(rows, cfg); renderCounters(); persistSettings();
  }

  function renderResult(rows, cfg) {
    const body = $("resultBody"); body.innerHTML = "";
    if (!rows.length) { body.innerHTML = '<tr><td colspan="3" class="hint">Пока пусто</td></tr>'; $("summary").textContent = ""; return; }
    $("summary").textContent = "всего: " + rows.length + " · макс. длина: " + cfg.maxLen;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i], tr = document.createElement("tr");
      tr.innerHTML = `<td>${i + 1}</td><td class="mono">${escapeHtml(r.sku)}</td><td>${r.len}</td>`;
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
      $("sub-val").classList.toggle("hidden", btn.dataset.sub !== "val");
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
  $("btnValidate").addEventListener("click", () => {
    const res = validateSku($("validateInput").value);
    $("validateResult").innerHTML = res.ok ? `<span style="color:var(--ok)">✔ ${res.reason}</span>` : `<span style="color:var(--err)">✖ ${res.reason}</span>`;
  });
  
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
    const el = $(f); if(el) { el.addEventListener("change", persistSettings); if(el.tagName === "SELECT") el.addEventListener("change", persistSettings); }
  });
  $("categorySelect").addEventListener("change", persistSettings);

  // --- ИНИЦИАЛИЗАЦИЯ ---
  initSaberSelects(); generateSaber(); initCategorySelect(); restoreSettings(); renderCounters();
})();
