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
    types: [{ code: "БР", name: "Брюки" }, { code: "БРЮ", name: "Брюки (альт)" }, { code: "КОС", name: "Костюм" }, { code: "КУР", name: "Куртка" }, { code: "ФУТ", name: "Футболка" }],
    models: [{ code: "БРК", name: "Беркут-К" }, { code: "ГВР", name: "Гвардия" }],
    seasons: [{ code: "ЛТ", name: "Лето" }, { code: "ДМ", name: "Демисезонное" }, { code: "ЗМ", name: "Зима" }, { code: "ВС", name: "Внесезонное" }],
    colors: [{ code: "001", name: "Черный" }, { code: "002", name: "Белый" }, { code: "003", name: "X" }, { code: "004", name: "X" }, { code: "005", name: "X" }, { code: "006", name: "X" }],
    sizes: [{ code: "4042", name: "40-42" }, { code: "4446", name: "44-46" }, { code: "4850", name: "48-50" }, { code: "5254", name: "52-54" }, { code: "5658", name: "56-58" }, { code: "6062", name: "60-62" }],
    heights: [{ code: "158", name: "158-164" }, { code: "170", name: "170-176" }, { code: "182", name: "182-188" }]
  };

  // =====================================================================
  // НАШ ДЕРЕВО КАТЕГОРИЙ (ИЗ ВАШИХ СКРИНШОТОВ)
  // =====================================================================
  const CATEGORY_TREE = [
    { 
      group: "АКСЕССУАРЫ", 
      items: [
        { name: "ГАЛСТУКИ" }, { name: "ГОЙСЫ" }, { name: "МАНИШКИ" }, 
        { name: "ПОДВОРОТНИЧКИ" }, { name: "ОБЛОЖКИ И КОРОЧКИ" }, 
        { name: "БЕЙДЖИ И ШНУРЫ" }, { name: "ГАЛАНТЕРЕЯ" }
      ]
    },
    { 
      group: "СУВЕНИРЫ", 
      items: [
        { name: "ПОСУДА" }, { name: "ФЛАГИ И ВЫМПЕЛЫ" }, { name: "БРЕЛОКИ И МАГНИТЫ" }, 
        { name: "ЧАСЫ" }, { name: "ПОДАРОЧНЫЕ НАБОРЫ" }
      ]
    },
    { 
      group: "ФУРНИТУРА", 
      items: [
        { name: "ФУРНИТУРА" }, { name: "ПОГОНЫ" }, { name: "ШЕВРОНЫ И ПАТЧИ" }, 
        { name: "КОКАРДЫ" }, { name: "ЗНАЧКИ И МЕДАЛИ" }, { name: "ЗВЕЗДЫ И ЛЫЧКИ" }, 
        { name: "АКСЕЛЬБАНТЫ" }, { name: "ПУГОВИЦЫ И ПРЯЖКИ" }, 
        { name: "ЛИПУЧКИ И СТРОПЫ" }, { name: "ЗАЖИМЫ ДЛЯ ГАЛСТУКОВ" }
      ]
    },
    { 
      group: "СНАРЯЖЕНИЕ", 
      items: [
        { name: "РАЗГРУЗОЧНЫЕ СИСТЕМЫ" }, { name: "ПОЯСА И ПЛАТФОРМЫ" }, { name: "ПОДСУМКИ И ЧЕХЛЫ" }, 
        { name: "КОБУРЫ" }, { name: "СУМКИ И РЮКЗАКИ" }, { name: "СПЕЦСРЕДСТВА" }, 
        { name: "АПТЕЧКИ И МЕДИЦИНА" }, { name: "ТУРИЗМ И КЕМПИНГ" }, { name: "ФЛЯГИ И КОТЕЛКИ" }, 
        { name: "ФОНАРИКИ" }, { name: "ИНСТРУМЕНТЫ" }, { name: "ЭЛЕКТРОНИКА И СВЯЗЬ" }
      ]
    },
    { 
      group: "СИЗ", 
      items: [
        { name: "ПЕРЧАТКИ" }, { name: "ТАКТИЧЕСКИЕ ПЕРЧАТКИ" }, { name: "ЗИМНИЕ ПЕРЧАТКИ И РУКАВИЦЫ" }, 
        { name: "КАСКИ И ШЛЕМЫ" }, { name: "ОЧКИ" }, { name: "НАКОЛЕННИКИ И НАЛОКОТНИКИ" }
      ]
    },
    { 
      group: "ГОЛОВНЫЕ УБОРЫ", 
      items: [
        { name: "ШАПКИ" }, { name: "КЕПКИ" }, { name: "БЕСКОЗЫРКИ" }, { name: "БЕРЕТЫ" }, 
        { name: "ФУРАЖКИ" }, { name: "АРАФАТКИ" }, { name: "ПИЛОТКИ" }, { name: "ПАНАМЫ" }, 
        { name: "БАЛАКЛАВЫ (МАСКИ)" }, { name: "БАНДАНЫ И КОСЫНКИ" }, { name: "БАФФЫ" }, 
        { name: "ШАРФЫ" }, { name: "ЧЕХЛЫ НА ГОЛОВНЫЕ УБОРЫ" }
      ]
    },
    { 
      group: "ОБУВЬ", 
      items: [
        { name: "БЕРЦЫ" }, { name: "БОТИНКИ" }, { name: "ГАЛОШИ" }, { name: "КЕДЫ" }, 
        { name: "КРОССОВКИ" }, { name: "ПОЛУБОТИНКИ" }, { name: "САНДАЛИИ" }, { name: "САПОГИ" }, 
        { name: "СТЕЛЬКИ" }, { name: "ТУФЛИ" }, { name: "УХОД ЗА ОБУВЬЮ" }, { name: "ШНУРКИ" }
      ]
    },
    { 
      group: "ОДЕЖДА", 
      items: [
        { name: "КОСТЮМЫ" }, { name: "КУРТКИ" }, { name: "БРЮКИ И ШОРТЫ" }, 
        { name: "ЖИЛЕТЫ" }, { name: "МАЙКИ" }, { name: "ФУТБОЛКИ И ПОЛО" }, 
        { name: "РУБАШКИ" }, { name: "НИЖНЕЕ БЕЛЬЕ" }, { name: "СВИТЕРЫ" }, { name: "ТЕРМОБЕЛЬЕ" }
      ]
    },
    { 
      group: "РЕМНИ", 
      items: [
        { name: "РЕМНИ" }, { name: "БЛЯХИ И ПРЯЖКИ" }, { name: "ШЛЕВКИ" }
      ]
    }
  ];

  const LS_HISTORY = "sku.history.v4";
  const state = { history: readJSON(LS_HISTORY, []), lastBatch: [] };

  function readJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  // --- ГЕНЕРАЦИЯ РАНДОМНОГО КОДА ---
  function generateRandomCode(length = 4) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // --- ЛОГИКА SABER-TEX ---
  function initSaberSelects() {
    const fill = (id, data) => {
      const el = document.getElementById(id); el.innerHTML = "";
      data.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.code; opt.textContent = `${item.code} (${item.name})`;
        el.appendChild(opt);
      });
    };
    fill("saberType", SABER_DATA.types); fill("saberModel", SABER_DATA.models);
    fill("saberSeason", SABER_DATA.seasons); fill("saberColor", SABER_DATA.colors);
    fill("saberSize", SABER_DATA.sizes); fill("saberHeight", SABER_DATA.heights);
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
    const s = String(value ?? "").toUpperCase().replace(/[^А-ЯЁA-Z0-9]+/g, "");
    return s.slice(0, maxLen) || "";
  }

  function buildSku(cfg) {
    let parts = [];
    if (cfg.useParent && cfg.group) parts.push(cleanToken(cfg.group, 6));
    parts.push(cleanToken(cfg.category, 10));
    if (cfg.brand) parts.push(cleanToken(cfg.brand, 4));
    
    if (cfg.attrs.length) {
      const shortAttrs = cfg.attrs.slice(0, 2).map(a => cleanToken(a, 2)).filter(Boolean);
      if (shortAttrs.length) parts.push(shortAttrs.join(""));
    }

    let result = parts.join("-");
    
    // Умная обрезка до 25 символов
    if (result.length > 25 && cfg.attrs.length && parts.length > 2) {
      parts.pop(); // убираем атрибуты
      result = parts.join("-");
    }
    if (result.length > 25 && cfg.brand && parts.length > 2) {
      const brandClean = cleanToken(cfg.brand, 4);
      const idx = parts.indexOf(brandClean);
      if (idx !== -1) parts.splice(idx, 1);
      result = parts.join("-");
    }
    
    if (result.length > 25) {
      result = result.slice(0, 25).replace(/-$/, ""); 
    }
    
    return result;
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
      qty: parseInt($("qty").value) || 1
    };
  }

  function persistSettings() {
    const data = {};
    for (const f of FIELDS) { const el = $(f); if (el) data[f] = el.type === "checkbox" ? el.checked : el.value; }
    data["categorySelect"] = $("categorySelect").value; writeJSON("sku.settings.v4", data);
  }

  function restoreSettings() {
    const data = readJSON("sku.settings.v4", null); if (!data) return;
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
    if (!$("brand").value) $("brand").value = generateRandomCode(4);
  }

  function generateOther() {
    const cfg = readForm();
    const rows = [];
    const now = new Date().toLocaleString("ru-RU");

    for (let i = 0; i < cfg.qty; i++) {
      cfg.brand = generateRandomCode(4);
      const sku = buildSku(cfg);
      rows.push({ sku, len: sku.length });
      state.history.unshift({ sku, date: now });
    }

    if (state.history.length > 500) state.history = state.history.slice(0, 500);
    
    writeJSON(LS_HISTORY, state.history);
    $("brand").value = generateRandomCode(4);
    state.lastBatch = rows; 
    renderResult(rows); 
    renderHistory(); 
    persistSettings();
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

  function renderHistory() {
    const body = $("historyBody"); body.innerHTML = "";
    if (!state.history.length) { body.innerHTML = '<tr><td colspan="2" class="hint">История пуста</td></tr>'; return; }
    state.history.slice(0, 50).forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td class="mono">${escapeHtml(item.sku)}</td><td style="color:var(--muted); font-size:12px;">${item.date}</td>`;
      body.appendChild(tr);
    });
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

  function downloadHistory() {
    if (!state.history.length) return alert("История пуста");
    const lines = ["sku;date"];
    for (const r of state.history) lines.push([r.sku, r.date].join(";"));
    const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sku-history.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
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
      if (btn.dataset.sub === "data") renderHistory();
    });
  });

  $("btnGenSaber").addEventListener("click", generateSaber);
  $("btnCopySaber").addEventListener("click", (e) => copyText($("saberResult").textContent, e.target));
  ["saberType", "saberModel", "saberSeason", "saberColor", "saberSize", "saberHeight"].forEach(id => {
    $(id).addEventListener("change", generateSaber);
  });

  $("btnRandBrand").addEventListener("click", () => { $("brand").value = generateRandomCode(4); });
  $("btnGenerate").addEventListener("click", generateOther);
  $("btnCopy").addEventListener("click", (e) => { if(state.lastBatch.length) copyText(state.lastBatch.map(r => r.sku).join("\n"), e.target); });
  $("btnCsv").addEventListener("click", downloadCsv);
  
  $("btnExportHistory").addEventListener("click", downloadHistory);
  $("btnClearHistory").addEventListener("click", () => {
    if(confirm("Очистить всю историю?")) { state.history = []; writeJSON(LS_HISTORY, []); renderHistory(); }
  });

  FIELDS.forEach(f => {
    const el = $(f); if(el) { el.addEventListener("change", persistSettings); }
  });
  $("categorySelect").addEventListener("change", persistSettings);

  // --- ИНИЦИАЛИЗАЦИЯ ---
  initSaberSelects(); generateSaber(); initCategorySelect(); restoreSettings(); renderHistory();
})();
