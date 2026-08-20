// ============================================================
// BIEPS-A · Escala de Bienestar Psicológico para Adultos
// María Martina Casullo (2002) — Facultad de Psicología, UBA
// ============================================================

// ---- Datos del instrumento -----------------------------------

// Los 13 ítems, en el orden y la redacción del instrumento original.
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

// Las 3 opciones de respuesta y su valor (1-3), tal como en el original.
const OPTIONS = [
  { value: 1, label: "En desacuerdo" },
  { value: 2, label: "Ni de acuerdo ni en desacuerdo" },
  { value: 3, label: "De acuerdo" },
];

// Qué ítems componen cada dimensión.
const DIMENSIONS = {
  aceptacion_control: [2, 11, 13],
  vinculos:           [5, 7, 8],
  autonomia:          [4, 9, 12],
  proyectos:          [1, 3, 6, 10],
};

// Facultades y programas educativos de licenciatura, campus presencial
// (tomado de unacar.mx/ofertaeducativa/licenciatura.php). Si tu unidad
// también aplica la prueba a programas de UNACAR Virtual (a distancia),
// avísame y agrego ese bloque aparte.
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

// ---- Referencias del DOM --------------------------------------
const form = document.getElementById("biepsForm");
const stepEls = Array.from(document.querySelectorAll(".step"));
const stepIndicator = document.getElementById("stepIndicator");
const tideline = document.getElementById("tideline");
const tidelineFill = document.getElementById("tidelineFill");

const facultadSelect = document.getElementById("facultad");
const programaSelect = document.getElementById("programa");
const itemsContainer = document.getElementById("itemsContainer");
const progressLabel = document.getElementById("progressLabel");

const toStep2Btn = document.getElementById("toStep2");
const backToStep1Btn = document.getElementById("backToStep1");
const toStep3Btn = document.getElementById("toStep3");
const backToStep2Btn = document.getElementById("backToStep2");
const submitBtn = document.getElementById("submitBtn");
const submitHint = document.getElementById("submitHint");
const errorMessage = document.getElementById("errorMessage");

const STEP_LABELS = ["Tus datos", "Instrucciones", "Cuestionario"];
let currentStep = 0;

// ------------------------------------------------------------
// Facultad → Programa (selector en cascada)
// ------------------------------------------------------------
for (const nombreFacultad of Object.keys(FACULTADES)) {
  const opt = document.createElement("option");
  opt.value = nombreFacultad;
  opt.textContent = nombreFacultad;
  facultadSelect.appendChild(opt);
}

function limpiarProgramas(mensaje, deshabilitado) {
  programaSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = mensaje;
  programaSelect.appendChild(placeholder);
  programaSelect.disabled = deshabilitado;
}

facultadSelect.addEventListener("change", () => {
  const facultad = facultadSelect.value;
  if (!facultad) {
    limpiarProgramas("Elige primero tu facultad", true);
    return;
  }
  limpiarProgramas("Selecciona tu programa educativo", false);
  for (const programa of FACULTADES[facultad]) {
    const opt = document.createElement("option");
    opt.value = programa;
    opt.textContent = programa;
    programaSelect.appendChild(opt);
  }
});

// ------------------------------------------------------------
// Render de los 13 ítems (paso 3)
// ------------------------------------------------------------
for (const item of ITEMS) {
  const wrapper = document.createElement("div");
  wrapper.className = "item";
  wrapper.dataset.itemId = item.id;

  const optionsHtml = OPTIONS.map((opt) => `
    <label class="option">
      <input type="radio" name="item_${item.id}" value="${opt.value}" required />
      <span>${opt.label}</span>
    </label>
  `).join("");

  wrapper.innerHTML = `
    <div class="item__row">
      <span class="item__number">${String(item.id).padStart(2, "0")}</span>
      <span class="item__text">${item.text}</span>
    </div>
    <div class="options" role="radiogroup" aria-label="${item.text}">
      ${optionsHtml}
    </div>
  `;

  itemsContainer.appendChild(wrapper);
}

// ------------------------------------------------------------
// Navegación entre pasos
// ------------------------------------------------------------
function renderStepIndicator() {
  stepIndicator.textContent = `Paso ${currentStep + 1} de ${stepEls.length} · ${STEP_LABELS[currentStep]}`;
}

function goToStep(index) {
  stepEls[currentStep].hidden = true;
  currentStep = index;
  stepEls[currentStep].hidden = false;
  renderStepIndicator();
  updateAll();
  document.getElementById("card").scrollIntoView({ behavior: "smooth", block: "start" });
}

toStep2Btn.addEventListener("click", () => goToStep(1));
backToStep1Btn.addEventListener("click", () => goToStep(0));
toStep3Btn.addEventListener("click", () => goToStep(2));
backToStep2Btn.addEventListener("click", () => goToStep(1));

// Evita que la tecla Enter envíe el formulario antes de llegar al
// último paso (por ejemplo, al presionarla dentro de "Matrícula").
form.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && currentStep !== 2) {
    e.preventDefault();
  }
});

// ------------------------------------------------------------
// Progreso
// ------------------------------------------------------------
function datosCompletos() {
  const matricula = form.matricula.value.trim();
  const nombre = form.nombre.value.trim();
  const facultad = form.facultad.value;
  const programa = form.programa.value;
  const edad = form.edad.value.trim();
  const sexo = form.querySelector('input[name="sexo"]:checked');
  return (
    matricula.length > 0 &&
    nombre.length > 0 &&
    facultad.length > 0 &&
    programa.length > 0 &&
    edad.length > 0 &&
    !!sexo
  );
}

function datosFraction() {
  const checks = [
    form.matricula.value.trim().length > 0,
    form.nombre.value.trim().length > 0,
    !!form.facultad.value,
    !!form.programa.value,
    form.edad.value.trim().length > 0,
    !!form.querySelector('input[name="sexo"]:checked'),
  ];
  return checks.filter(Boolean).length / checks.length;
}

function countAnsweredItems() {
  let answered = 0;
  for (const item of ITEMS) {
    const checked = form.querySelector(`input[name="item_${item.id}"]:checked`);
    const row = itemsContainer.querySelector(`.item[data-item-id="${item.id}"]`);
    if (checked) {
      answered++;
      row.classList.add("item--answered");
    } else {
      row.classList.remove("item--answered");
    }
  }
  return answered;
}

// La "marea" refleja el avance de TODO el formulario (3 pasos), no solo
// el cuestionario: pasos 1 y 3 aportan su fracción según lo llenado;
// el paso 2 (instrucciones) avanza de golpe al pasar al cuestionario.
function updateTideline() {
  let within = 0;
  if (currentStep === 0) within = datosFraction();
  else if (currentStep === 2) within = countAnsweredItems() / ITEMS.length;
  const pct = Math.round(((currentStep + within) / stepEls.length) * 100);
  tidelineFill.style.width = pct + "%";
  tideline.setAttribute("aria-valuenow", String(pct));
}

function updateAll() {
  toStep2Btn.disabled = !datosCompletos();

  const answered = countAnsweredItems();
  progressLabel.textContent = `${answered} de ${ITEMS.length} frases respondidas`;
  const ready = answered === ITEMS.length;
  submitBtn.disabled = !ready;
  submitHint.textContent = ready
    ? "Todo listo. Revisa tus respuestas y envía."
    : "Responde todas las frases para poder enviar.";

  updateTideline();
}

form.addEventListener("input", updateAll);
form.addEventListener("change", updateAll);

renderStepIndicator();
updateAll();

// ------------------------------------------------------------
// Cálculo de puntajes
// ------------------------------------------------------------
function calcularPuntajes(respuestas) {
  const puntajesDimension = {};
  for (const [dimension, itemIds] of Object.entries(DIMENSIONS)) {
    puntajesDimension[dimension] = itemIds.reduce((sum, id) => sum + respuestas[id], 0);
  }
  const puntaje_total = Object.values(respuestas).reduce((a, b) => a + b, 0);
  return { ...puntajesDimension, puntaje_total };
}

// ------------------------------------------------------------
// Envío a Supabase
// ------------------------------------------------------------
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (currentStep !== 2) return; // solo se envía desde el último paso

  errorMessage.hidden = true;

  const respuestas = {};
  for (const item of ITEMS) {
    const checked = form.querySelector(`input[name="item_${item.id}"]:checked`);
    respuestas[item.id] = Number(checked.value);
  }
  const puntajes = calcularPuntajes(respuestas);

  const fila = {
    matricula: form.matricula.value.trim(),
    nombre: form.nombre.value.trim(),
    facultad: form.facultad.value,
    programa: form.programa.value,
    edad: Number(form.edad.value),
    sexo: form.querySelector('input[name="sexo"]:checked').value,
    item_01: respuestas[1],  item_02: respuestas[2],  item_03: respuestas[3],
    item_04: respuestas[4],  item_05: respuestas[5],  item_06: respuestas[6],
    item_07: respuestas[7],  item_08: respuestas[8],  item_09: respuestas[9],
    item_10: respuestas[10], item_11: respuestas[11], item_12: respuestas[12],
    item_13: respuestas[13],
    aceptacion_control: puntajes.aceptacion_control,
    vinculos: puntajes.vinculos,
    autonomia: puntajes.autonomia,
    proyectos: puntajes.proyectos,
    puntaje_total: puntajes.puntaje_total,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando…";

  const { error } = await supabaseClient.from("respuestas_bieps_a").insert([fila]);

  if (error) {
    console.error(error);
    errorMessage.textContent =
      "No se pudieron guardar tus respuestas. Revisa tu conexión a internet e inténtalo de nuevo.";
    errorMessage.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar respuestas";
    return;
  }

  document.getElementById("mainHeader").hidden = true;
  form.hidden = true;
  document.getElementById("doneScreen").hidden = false;
});
