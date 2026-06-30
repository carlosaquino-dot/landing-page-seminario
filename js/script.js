/* ===================================================================
   EMIGRAFÁCIL ESPAÑA — Landing Page del Seminario
   Lógica de interacción: configuración central, validación de
   formulario, acordeón FAQ, menú móvil, header dinámico y flujo
   hacia el pago con Stripe.
   =================================================================== */

/* -------------------------------------------------------------------
   1. CONFIGURACIÓN CENTRAL
   Edita ÚNICAMENTE estos valores para actualizar enlaces, fecha,
   hora, WhatsApp, Stripe, legales y datos de la empresa en TODA
   la página. Los elementos del HTML que llevan los atributos
   data-cfg-href / data-cfg-text se rellenan automáticamente.
   ------------------------------------------------------------------- */
const CONFIG = {
  // Enlace de pago de Stripe (Payment Link o Checkout Session URL).
  stripeLink: "[PEGAR_AQUI_LINK_DE_STRIPE]",

  // Número de WhatsApp en formato internacional, solo dígitos
  // (sin "+", espacios ni guiones). Ejemplo real: "18095551234".
  whatsappNumber: "[NUMERO_DE_WHATSAPP]",

  // Mensaje precargado del botón de WhatsApp.
  whatsappMessage: "Hola, quiero información sobre el Seminario Profesional de Residencia de Familiar de Ciudadano Español",

  // Enlace de acceso a la sesión en vivo (Google Meet).
  meetLink: "[LINK_DE_GOOGLE_MEET]",

  // Fecha y hora del seminario, tal como se mostrarán en la página.
  seminarDate: "14 de agosto de 2026",
  seminarTime: "4:30 p. m. (hora de Santo Domingo, RD)",

  // Correo de contacto.
  contactEmail: "[EMAIL_DE_CONTACTO]",

  // URLs legales.
  privacyUrl: "[POLITICA_DE_PRIVACIDAD_URL]",
  termsUrl: "[TERMINOS_Y_CONDICIONES_URL]",

  // Datos fiscales de la empresa organizadora.
  companyName: "[NOMBRE_EMPRESA]",
  companyNIF: "[NIF_EMPRESA]",

  // OPCIONAL: URL de un webhook (Zapier, Make, Google Apps Script, etc.)
  // para recibir automáticamente los datos del formulario de inscripción.
  // Déjalo vacío ("") si todavía no tienes uno configurado.
  webhookUrl: ""
};

/* -------------------------------------------------------------------
   2. INYECCIÓN DE CONFIGURACIÓN EN EL DOM
   ------------------------------------------------------------------- */
function buildWhatsAppLink() {
  const text = encodeURIComponent(CONFIG.whatsappMessage);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
}

function applyConfig() {
  document.querySelectorAll(".js-whatsapp-link").forEach((el) => {
    el.setAttribute("href", buildWhatsAppLink());
  });
  document.querySelectorAll(".js-stripe-link").forEach((el) => {
    el.setAttribute("href", CONFIG.stripeLink);
  });
  document.querySelectorAll(".js-privacy-link").forEach((el) => {
    el.setAttribute("href", CONFIG.privacyUrl);
  });
  document.querySelectorAll(".js-terms-link").forEach((el) => {
    el.setAttribute("href", CONFIG.termsUrl);
  });
  document.querySelectorAll(".js-email-link").forEach((el) => {
    el.setAttribute("href", `mailto:${CONFIG.contactEmail}`);
    if (el.textContent.trim().startsWith("[")) {
      el.textContent = CONFIG.contactEmail;
    }
  });
  document.querySelectorAll("[data-cfg-text]").forEach((el) => {
    const key = el.getAttribute("data-cfg-text");
    if (CONFIG[key]) el.textContent = CONFIG[key];
  });
}

/* -------------------------------------------------------------------
   3. HEADER FIJO CON FONDO DINÁMICO AL HACER SCROLL
   ------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  const toggleHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  toggleHeader();
  window.addEventListener("scroll", toggleHeader, { passive: true });
}

/* -------------------------------------------------------------------
   4. MENÚ MÓVIL
   ------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* -------------------------------------------------------------------
   5. ACORDEÓN DE PREGUNTAS FRECUENTES
   ------------------------------------------------------------------- */
function initAccordion() {
  const items = document.querySelectorAll(".accordion__item");
  items.forEach((item) => {
    const trigger = item.querySelector(".accordion__trigger");
    const panel = item.querySelector(".accordion__panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      // Cierra los demás ítems para un acordeón más limpio.
      items.forEach((other) => {
        if (other === item) return;
        const otherTrigger = other.querySelector(".accordion__trigger");
        const otherPanel = other.querySelector(".accordion__panel");
        otherTrigger.setAttribute("aria-expanded", "false");
        otherPanel.style.maxHeight = null;
      });

      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = isOpen ? null : `${panel.scrollHeight}px`;
    });
  });
}

/* -------------------------------------------------------------------
   6. VALIDACIÓN Y ENVÍO DEL FORMULARIO DE INSCRIPCIÓN
   ------------------------------------------------------------------- */
function showFieldError(field, show) {
  const wrapper = field.closest(".form__field");
  if (!wrapper) return;
  wrapper.classList.toggle("has-error", show);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return /^[+\d][\d\s().-]{6,}$/.test(value);
}

function validateForm(form) {
  let valid = true;
  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    let fieldValid = true;

    if (field.type === "checkbox") {
      fieldValid = field.checked;
    } else {
      fieldValid = field.value.trim() !== "";
      if (fieldValid && field.type === "email") {
        fieldValid = isValidEmail(field.value.trim());
      }
      if (fieldValid && field.id === "whatsapp") {
        fieldValid = isValidPhone(field.value.trim());
      }
    }

    showFieldError(field, !fieldValid);
    if (!fieldValid) valid = false;
  });

  return valid;
}

function collectFormData(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = value;
  });
  data.seminario = "Residencia de Familiar de Ciudadano Español — España y Vía Consular";
  data.fecha_registro = new Date().toISOString();
  return data;
}

// Envía los datos del formulario a un webhook externo (Zapier, Make,
// Google Apps Script, CRM, etc.) si CONFIG.webhookUrl está configurado.
// El envío es "best effort": si falla, no bloquea el paso al pago.
async function sendToWebhook(data) {
  if (!CONFIG.webhookUrl) return;
  try {
    await fetch(CONFIG.webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn("No se pudo enviar el formulario al webhook configurado.", err);
  }
}

function initInscripcionForm() {
  const form = document.getElementById("inscripcionForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm(form)) {
      const firstError = form.querySelector(".has-error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Procesando…";

    const data = collectFormData(form);
    await sendToWebhook(data);

    // Guarda una copia local de respaldo de la inscripción.
    try {
      window.localStorage.setItem("emigrafacil_inscripcion", JSON.stringify(data));
    } catch (err) {
      /* localStorage no disponible: se omite sin afectar el flujo. */
    }

    revealGracias();

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;

    // Redirige a Stripe para completar el pago.
    if (CONFIG.stripeLink && !CONFIG.stripeLink.includes("[")) {
      window.location.href = CONFIG.stripeLink;
    } else {
      console.warn("Configura CONFIG.stripeLink en js/script.js antes de salir a producción.");
    }
  });
}

function revealGracias() {
  const gracias = document.getElementById("gracias");
  if (!gracias) return;
  gracias.hidden = false;
  gracias.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Formulario alternativo: visitantes que aún no quieren completar la
// inscripción/pago pueden dejar solo sus datos básicos de contacto para
// que el equipo de Emigrafácil España los contacte directamente.
function initContactoForm() {
  const form = document.getElementById("contactoForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm(form)) {
      const firstError = form.querySelector(".has-error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";

    const data = collectFormData(form);
    data.tipo_solicitud = "Solo contacto (sin inscripción ni pago)";
    await sendToWebhook(data);

    // Guarda una copia local de respaldo de la solicitud de contacto.
    try {
      window.localStorage.setItem("emigrafacil_contacto", JSON.stringify(data));
    } catch (err) {
      /* localStorage no disponible: se omite sin afectar el flujo. */
    }

    revealGraciasContacto();

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    form.reset();
  });
}

function revealGraciasContacto() {
  const gracias = document.getElementById("graciasContacto");
  if (!gracias) return;
  gracias.hidden = false;
  gracias.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Si Stripe redirige de vuelta con ?success=true (configurando la
// success_url del Payment Link a esta misma página), se muestra
// automáticamente el mensaje de confirmación.
function checkPaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("success") === "true") {
    revealGracias();
  }
}

/* -------------------------------------------------------------------
   7. AÑO ACTUAL EN EL FOOTER
   ------------------------------------------------------------------- */
function setCurrentYear() {
  const el = document.getElementById("currentYear");
  if (el) el.textContent = new Date().getFullYear();
}

/* -------------------------------------------------------------------
   8. INICIALIZACIÓN
   ------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initHeaderScroll();
  initMobileNav();
  initAccordion();
  initInscripcionForm();
  initContactoForm();
  checkPaymentReturn();
  setCurrentYear();
});
