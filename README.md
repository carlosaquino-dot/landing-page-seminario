# Landing Page — Seminario Profesional Emigrafácil España

Landing page completa para la venta del seminario **"Residencia de Familiar de Ciudadano Español — España y Vía Consular"**.

---

## Estructura de archivos

```
landing-page-seminario/
├── index.html          ← Página completa
├── css/
│   └── style.css       ← Todos los estilos
├── js/
│   └── script.js       ← Toda la lógica + configuración central
└── images/
    ├── README.md        ← Lista de imágenes necesarias
    ├── logo-emigrafacil.png
    ├── mar-carlos.jpg
    ├── carlos.jpg
    ├── mar.jpg
    └── equipo-emigrafacil.jpg
```

---

## 1. Cómo cambiar el enlace de Stripe

Abre `js/script.js` y localiza el objeto `CONFIG` al principio del archivo:

```js
const CONFIG = {
  stripeLink: "[PEGAR_AQUI_LINK_DE_STRIPE]",
  ...
};
```

Sustituye `"[PEGAR_AQUI_LINK_DE_STRIPE]"` por la URL de tu Payment Link o Checkout Session de Stripe. Ejemplo:

```js
stripeLink: "https://buy.stripe.com/xxxxxxxxxxxx",
```

El botón de pago en la sección de precio y el botón final del formulario se actualizarán automáticamente. La redirección tras enviar el formulario también usará este enlace.

---

## 2. Cómo cambiar el número de WhatsApp

En el mismo objeto `CONFIG` de `js/script.js`:

```js
whatsappNumber: "[NUMERO_DE_WHATSAPP]",
```

Escribe el número en formato internacional sin "+", espacios ni guiones. Ejemplo para República Dominicana:

```js
whatsappNumber: "18095551234",
```

Todos los botones de WhatsApp de la página (header, hero, CTA final, botón flotante) se actualizarán automáticamente.

---

## 3. Otros valores editables en `CONFIG`

Todos los textos y enlaces variables están en el mismo objeto `CONFIG`:

| Variable | Qué controla |
|---|---|
| `zoomLink` | Enlace a la sesión en vivo |
| `seminarDate` | Fecha que aparece en la sección Modalidad |
| `seminarTime` | Hora del seminario |
| `contactEmail` | Correo en el footer |
| `privacyUrl` | Enlace a la Política de Privacidad |
| `termsUrl` | Enlace a los Términos y Condiciones |
| `companyName` | Nombre fiscal de la empresa (footer) |
| `companyNIF` | NIF/CIF de la empresa (footer) |
| `webhookUrl` | URL de automatización (ver sección 5) |

---

## 4. Dónde colocar las imágenes

Sube los siguientes archivos a la carpeta `images/` con los nombres exactos:

| Archivo | Descripción | Tamaño recomendado |
|---|---|---|
| `logo-emigrafacil.png` | Logo en header y footer | PNG transparente, ~120px de alto |
| `mar-carlos.jpg` | Foto del hero (Mar y Carlos) | 1200×1500 px (vertical) |
| `carlos.jpg` | Foto individual de Carlos | 600×600 px |
| `mar.jpg` | Foto individual de Mar | 600×600 px |
| `equipo-emigrafacil.jpg` | Foto de equipo / banner | 1200×900 px |

Si alojas la página en un servidor o Netlify/Vercel, asegúrate de subir también la carpeta `images/` con estos archivos.

---

## 5. Conectar el formulario a Google Sheets, Make, Zapier o CRM

### Opción A — Google Apps Script (gratuito, sin cuentas externas)

1. Crea una Hoja de Cálculo en Google Sheets.
2. En el menú **Extensiones → Apps Script**, pega el siguiente código y despliégalo como aplicación web (acceso: cualquier persona):

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.fecha_registro, data.nombre, data.tipoDocumento,
    data.numeroDocumento, data.pais, data.provincia,
    data.direccionFiscal, data.email, data.whatsapp,
    data.perfilProfesional, data.nombreCertificado, data.seminario
  ]);
  return ContentService.createTextOutput("ok");
}
```

3. Copia la URL del despliegue y pégala en `CONFIG.webhookUrl` de `js/script.js`.

### Opción B — Zapier

1. Crea un Zap con el disparador **Webhooks by Zapier → Catch Hook**.
2. Copia la URL del webhook y pégala en `CONFIG.webhookUrl`.
3. Configura la acción: **Google Sheets → Create Spreadsheet Row**, **HubSpot → Create Contact**, ActiveCampaign, etc.

### Opción C — Make (ex-Integromat)

1. Crea un escenario con el módulo **Webhooks → Custom webhook**.
2. Copia la URL y pégala en `CONFIG.webhookUrl`.
3. Añade módulos para Google Sheets, Airtable, Notion, CRM, etc.

> **Nota:** el envío al webhook es "best-effort" — si el webhook falla, el usuario igualmente es redirigido a Stripe. Los datos también se guardan localmente en `localStorage` del navegador como respaldo.

---

## 6. Medir conversiones con Meta Pixel y Google Analytics 4

### Meta Pixel (Facebook/Instagram Ads)

Abre `index.html` y busca el comentario `<!-- Meta Pixel (Facebook Ads) -->` dentro del `<head>`. Descomenta el bloque y reemplaza `TU_PIXEL_ID` por tu ID real:

```html
<script>
  !function(f,b,e,v,n,t,s){...}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'TU_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

Para registrar conversiones al pagar, añade en `js/script.js` dentro de `revealGracias()`:

```js
if (typeof fbq !== 'undefined') {
  fbq('track', 'Purchase', { value: 250, currency: 'USD' });
}
```

### Google Analytics 4

Abre `index.html` y busca el comentario `<!-- Google Analytics 4 -->` dentro del `<head>`. Descomenta el bloque y reemplaza `G-XXXXXXXXXX` por tu Measurement ID:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Para registrar el evento de conversión al pagar, añade en `revealGracias()`:

```js
if (typeof gtag !== 'undefined') {
  gtag('event', 'purchase', { currency: 'USD', value: 250 });
}
```

También puedes configurar **Google Tag Manager** e insertar ambos píxeles desde ahí sin tocar el código, que es la opción más recomendada para gestión a largo plazo.

---

## Despliegue recomendado

La página es 100% estática (HTML + CSS + JS). Puedes alojarla en:

- **Netlify**: arrastra la carpeta al dashboard de Netlify — despliegue en segundos, HTTPS automático.
- **Vercel**: `vercel deploy` desde la terminal.
- **GitHub Pages**: activa Pages en el repositorio apuntando a la rama `main`.
- **Tu propio hosting**: sube todos los archivos por FTP manteniendo la misma estructura de carpetas.
