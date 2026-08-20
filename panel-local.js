const ITEMS = [
  { id: 1,  text: "Creo que sé lo que quiero hacer con mi vida." },
  { id: 2,  text: "Si algo me sale mal puedo aceptarlo, admitirlo." },
  { id: 3,  text: "Me importa pensar qué haré en el futuro." },
  { id: 4,  text: "Puedo decir lo que pienso sin mayores problemas." },
  { id: 5,  text: "Generalmente le caigo bien a la gente." },
  { id: 6,  text: "Siento que podré lograr las metas que me proponga." },
  { id: 7,  text: "Cuento con personas que me ayudan si lo necesito." },
  { id: 8,  text: "Creo que en general me llevo bien con la gente." },
  { id: 9,  text: "En general hago lo que quiero, soy poco influenciable." },
  { id: 10, text: "Soy una persona capaz de pensar en un proyecto para mi vida." },
  { id: 11, text: "Puedo aceptar mis equivocaciones y tratar de mejorar." },
  { id: 12, text: "Puedo tomar decisiones sin dudar mucho." },
  { id: 13, text: "Encaro sin mayores problemas mis obligaciones diarias." },
];

const OPTION_LABELS = { 1: "En desacuerdo", 2: "Ni de acuerdo ni en desacuerdo", 3: "De acuerdo" };

const FACULTADES = {
  "Facultad de Derecho": [
    "Licenciatura en Derecho",
    "Licenciatura en Criminología y Criminalística",
  ],
  "Facultad de Ciencias Económicas Administrativas": [
    "Licenciatura en Administración de Empresas",
    "Licenciatura en Contaduría",
    "Licenciatura en Administración Turística",
    "Licenciatura en Mercadotecnia",
    "Licenciatura en Negocios Internacionales",
  ],
  "Facultad de Ciencias Educativas": [
    "Licenciatura en Educación",
    "Licenciatura en Lengua Inglesa",
    "Licenciatura en Comunicación y Gestión Cultural",
  ],
  "Facultad de Química": [
    "Licenciatura en Ingeniería Química",
    "Licenciatura en Ingeniería Petrolera",
    "Licenciatura en Ingeniería Geológica",
  ],
  "Facultad de Ciencias de la Información": [
    "Licenciatura en Ingeniería en Sistemas Computacionales",
    "Licenciatura en Ingeniería en Diseño Multimedia",
    "Licenciatura en Ingeniería en Tecnologías de Cómputo y Comunicaciones",
  ],
  "Facultad de Ingeniería": [
    "Licenciatura en Ingeniería Mecatrónica",
    "Licenciatura en Ingeniería Civil",
    "Licenciatura en Ingeniería Mecánica",
    "Licenciatura en Ingeniería Geofísica",
    "Licenciatura en Ingeniería en Energía",
    "Licenciatura en Arquitectura Sustentable",
  ],
  "Facultad de Ciencias de la Salud": [
    "Licenciatura en Educación Física y Deporte",
    "Licenciatura en Enfermería",
    "Licenciatura en Nutrición",
    "Licenciatura en Psicología",
    "Licenciatura en Fisioterapia",
    "Licenciatura en Medicina",
  ],
  "Facultad de Ciencias Naturales y Exactas": [
    "Licenciatura en Biología Marina",
  ],
};

const COLUMNAS_REQUERIDAS = [
  "matricula", "nombre", "facultad", "programa",
  "aceptacion_control", "vinculos", "autonomia", "proyectos", "puntaje_total",
  "item_01", "item_02", "item_03", "item_04", "item_05", "item_06", "item_07",
  "item_08", "item_09", "item_10", "item_11", "item_12", "item_13",
];

const COLUMNAS_NUMERICAS = [
  "edad", "aceptacion_control", "vinculos", "autonomia", "proyectos", "puntaje_total",
  "item_01", "item_02", "item_03", "item_04", "item_05", "item_06", "item_07",
  "item_08", "item_09", "item_10", "item_11", "item_12", "item_13",
];

function parseCSV(texto) {
  const filas = [];
  let fila = [];
  let campo = "";
  let entreComillas = false;
  let i = 0;
  const len = texto.length;

  while (i < len) {
    const c = texto[i];

    if (entreComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i += 2;
          continue;
        }
        entreComillas = false;
        i++;
        continue;
      }
      campo += c;
      i++;
      continue;
    }

    if (c === '"') { entreComillas = true; i++; continue; }
    if (c === ',') { fila.push(campo); campo = ""; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ""; i++; continue; }

    campo += c;
    i++;
  }
  if (campo.length > 0 || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas;
}

function csvAObjetos(texto) {
  if (texto.charCodeAt(0) === 0xFEFF) texto = texto.slice(1); // quitar BOM
  const filas = parseCSV(texto).filter((f) => !(f.length === 1 && f[0].trim() === ""));
  if (filas.length === 0) return [];
  const encabezados = filas[0].map((h) => h.trim());
  return filas.slice(1).map((f) => {
    const obj = {};
    encabezados.forEach((h, idx) => { obj[h] = (f[idx] ?? "").trim(); });
    return obj;
  });
}

function normalizarFila(obj) {
  const fila = { ...obj };
  for (const col of COLUMNAS_NUMERICAS) {
    if (fila[col] !== undefined && fila[col] !== "") {
      const n = Number(fila[col]);
      if (!Number.isNaN(n)) fila[col] = n;
    }
  }
  const fecha = new Date(fila.creado_en);
  const fechaValida = !Number.isNaN(fecha.getTime());
  fila._fechaDia = fechaValida ? fecha.toISOString().slice(0, 10) : null;
  fila._fechaObj = fechaValida ? fecha : null;
  return fila;
}

function validarColumnas(filas) {
  if (filas.length === 0) return "El archivo está vacío.";
  const columnas = Object.keys(filas[0]);
  const faltantes = COLUMNAS_REQUERIDAS.filter((c) => !columnas.includes(c));
  if (faltantes.length > 0) {
    return `Este archivo no parece ser una exportación de "respuestas_bieps_a" — faltan columnas como ${faltantes.slice(0, 3).join(", ")}.`;
  }
  return null;
}

function escapeHtml(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

const loaderCard = document.getElementById("loaderCard");
const dashboard = document.getElementById("dashboard");
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const loadError = document.getElementById("loadError");
const fileNameLabel = document.getElementById("fileNameLabel");
const reloadBtn = document.getElementById("reloadBtn");

const filterSearch = document.getElementById("filterSearch");
const filterFacultad = document.getElementById("filterFacultad");
const filterPrograma = document.getElementById("filterPrograma");
const filterDesde = document.getElementById("filterDesde");
const filterHasta = document.getElementById("filterHasta");

let allRows = [];
let filasFiltradas = [];

["dragenter", "dragover"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("dropzone--active");
  });
});
["dragleave", "drop"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dropzone--active");
  });
});
dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) procesarArchivo(file);
});
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) procesarArchivo(file);
});

function mostrarErrorCarga(mensaje) {
  loadError.textContent = mensaje;
  loadError.hidden = false;
}

function procesarArchivo(file) {
  loadError.hidden = true;

  if (!/\.csv$/i.test(file.name)) {
    mostrarErrorCarga("El archivo debe ser un .csv (el que exporta Supabase).");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const filas = csvAObjetos(reader.result).map(normalizarFila);
      const error = validarColumnas(filas);
      if (error) {
        mostrarErrorCarga(error);
        return;
      }
      allRows = filas;
      fileNameLabel.textContent = file.name;
      mostrarDashboard();
    } catch (err) {
      console.error(err);
      mostrarErrorCarga("No se pudo leer el archivo. Verifica que sea el CSV exportado de Supabase.");
    }
  };
  reader.onerror = () => mostrarErrorCarga("No se pudo leer el archivo.");
  reader.readAsText(file, "UTF-8");
}

function mostrarDashboard() {
  loaderCard.hidden = true;
  dashboard.hidden = false;
  aplicarFiltros();
}

reloadBtn.addEventListener("click", () => {
  allRows = [];
  fileInput.value = "";
  dashboard.hidden = true;
  loaderCard.hidden = false;
  loadError.hidden = true;
});

for (const nombreFacultad of Object.keys(FACULTADES)) {
  const opt = document.createElement("option");
  opt.value = nombreFacultad;
  opt.textContent = nombreFacultad;
  filterFacultad.appendChild(opt);
}

filterFacultad.addEventListener("change", () => {
  filterPrograma.innerHTML = '<option value="">Todos</option>';
  const facultad = filterFacultad.value;
  if (facultad && FACULTADES[facultad]) {
    for (const programa of FACULTADES[facultad]) {
      const opt = document.createElement("option");
      opt.value = programa;
      opt.textContent = programa;
      filterPrograma.appendChild(opt);
    }
  }
  aplicarFiltros();
});

filterSearch.addEventListener("input", aplicarFiltros);
filterPrograma.addEventListener("change", aplicarFiltros);
filterDesde.addEventListener("change", aplicarFiltros);
filterHasta.addEventListener("change", aplicarFiltros);

document.getElementById("clearFiltersBtn").addEventListener("click", () => {
  filterSearch.value = "";
  filterFacultad.value = "";
  filterPrograma.innerHTML = '<option value="">Todos</option>';
  filterDesde.value = "";
  filterHasta.value = "";
  aplicarFiltros();
});

function aplicarFiltros() {
  const q = filterSearch.value.trim().toLowerCase();
  const facultad = filterFacultad.value;
  const programa = filterPrograma.value;
  const desde = filterDesde.value;
  const hasta = filterHasta.value;

  filasFiltradas = allRows.filter((fila) => {
    if (q) {
      const texto = `${fila.nombre} ${fila.matricula}`.toLowerCase();
      if (!texto.includes(q)) return false;
    }
    if (facultad && fila.facultad !== facultad) return false;
    if (programa && fila.programa !== programa) return false;
    if (desde && fila._fechaDia && fila._fechaDia < desde) return false;
    if (hasta && fila._fechaDia && fila._fechaDia > hasta) return false;
    return true;
  });

  renderStats(filasFiltradas);
  renderTabla(filasFiltradas);
}

function promedio(valores) {
  const nums = valores.filter((v) => typeof v === "number");
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function renderStats(filas) {
  const cards = [
    { label: "Respuestas", value: String(filas.length), range: null },
    { label: "Puntaje total", value: promedio(filas.map((f) => f.puntaje_total)).toFixed(1), range: "rango 13–39" },
    { label: "Aceptación / Control", value: promedio(filas.map((f) => f.aceptacion_control)).toFixed(1), range: "rango 3–9" },
    { label: "Vínculos", value: promedio(filas.map((f) => f.vinculos)).toFixed(1), range: "rango 3–9" },
    { label: "Autonomía", value: promedio(filas.map((f) => f.autonomia)).toFixed(1), range: "rango 3–9" },
    { label: "Proyectos", value: promedio(filas.map((f) => f.proyectos)).toFixed(1), range: "rango 4–12" },
  ];

  document.getElementById("stats").innerHTML = cards.map((c) => `
    <div class="stat-card">
      <p class="stat-card__value">${c.value}</p>
      <p class="stat-card__label">${c.label}</p>
      ${c.range ? `<p class="stat-card__range">${c.range}</p>` : ""}
    </div>
  `).join("");
}

function formatFecha(fila) {
  if (fila._fechaObj) {
    return fila._fechaObj.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
  }
  return fila.creado_en || "—";
}

function renderTabla(filas) {
  const body = document.getElementById("resultsBody");
  const countEl = document.getElementById("resultsCount");
  const emptyEl = document.getElementById("emptyState");
  const tableWrap = document.querySelector(".table-wrap");

  countEl.textContent = `${filas.length} de ${allRows.length} respuestas`;

  if (filas.length === 0) {
    body.innerHTML = "";
    emptyEl.hidden = false;
    tableWrap.hidden = true;
    return;
  }
  emptyEl.hidden = true;
  tableWrap.hidden = false;

  body.innerHTML = filas.map((f, idx) => `
    <tr>
      <td>${formatFecha(f)}</td>
      <td>${escapeHtml(f.matricula)}</td>
      <td>${escapeHtml(f.nombre)}</td>
      <td>${escapeHtml(f.facultad)}</td>
      <td>${escapeHtml(f.programa)}</td>
      <td>${f.edad ?? ""}</td>
      <td>${escapeHtml(f.sexo)}</td>
      <td>${f.aceptacion_control}</td>
      <td>${f.vinculos}</td>
      <td>${f.autonomia}</td>
      <td>${f.proyectos}</td>
      <td><strong>${f.puntaje_total}</strong></td>
      <td><button type="button" class="btn btn--ghost btn--tiny" data-idx="${idx}">Ver</button></td>
    </tr>
  `).join("");

  body.querySelectorAll("button[data-idx]").forEach((btn) => {
    btn.addEventListener("click", () => abrirDetalle(filas[Number(btn.dataset.idx)]));
  });
}

const modalBackdrop = document.getElementById("modalBackdrop");
document.getElementById("modalClose").addEventListener("click", cerrarDetalle);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) cerrarDetalle();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalBackdrop.hidden) cerrarDetalle();
});

function cerrarDetalle() {
  modalBackdrop.hidden = true;
}

function abrirDetalle(fila) {
  const filasItems = ITEMS.map((item) => {
    const clave = `item_${String(item.id).padStart(2, "0")}`;
    const valor = fila[clave];
    return `
      <li>
        <span class="detalle-item__texto">${escapeHtml(item.text)}</span>
        <span class="detalle-item__valor">${OPTION_LABELS[valor] ?? "—"}</span>
      </li>
    `;
  }).join("");

  document.getElementById("modalTitle").textContent = `${fila.nombre} — ${fila.matricula}`;
  document.getElementById("modalBody").innerHTML = `
    <p class="modal__meta">${escapeHtml(fila.facultad)} · ${escapeHtml(fila.programa)} · ${formatFecha(fila)}</p>
    <div class="modal__scores">
      <span>Aceptación/Control: <strong>${fila.aceptacion_control}</strong></span>
      <span>Vínculos: <strong>${fila.vinculos}</strong></span>
      <span>Autonomía: <strong>${fila.autonomia}</strong></span>
      <span>Proyectos: <strong>${fila.proyectos}</strong></span>
      <span>Total: <strong>${fila.puntaje_total}</strong></span>
    </div>
    <ul class="detalle-items">${filasItems}</ul>
  `;
  modalBackdrop.hidden = false;
}

document.getElementById("exportBtn").addEventListener("click", () => {
  if (filasFiltradas.length === 0) return;

  const columnas = [
    "creado_en", "matricula", "nombre", "facultad", "programa", "edad", "sexo",
    "item_01", "item_02", "item_03", "item_04", "item_05", "item_06", "item_07",
    "item_08", "item_09", "item_10", "item_11", "item_12", "item_13",
    "aceptacion_control", "vinculos", "autonomia", "proyectos", "puntaje_total",
  ];

  const escaparCsv = (valor) => {
    const texto = String(valor ?? "");
    return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };

  const encabezado = columnas.join(",");
  const filasCsv = filasFiltradas.map((f) => columnas.map((c) => escaparCsv(f[c])).join(","));
  const csv = [encabezado, ...filasCsv].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bieps-a_filtrado_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
