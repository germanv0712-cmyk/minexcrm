const crypto = require('crypto');

/**
 * WhatsApp Business API integration (Meta Cloud API).
 *
 * Covers:
 *  - Signature verification for inbound webhooks (Meta calls our server)
 *  - Sending outbound messages through the Graph API
 *  - Webhook challenge/verification handshake
 *
 * Env vars:
 *  WA_VERIFY_TOKEN  — token you set in the Meta App Dashboard
 *  WA_APP_SECRET    — App Secret from Meta App settings (for HMAC sig)
 *  WA_PHONE_ID      — WhatsApp Business phone number ID
 *  WA_ACCESS_TOKEN  — Permanent or long-lived access token
 */

const BASE_URL = 'https://graph.facebook.com/v20.0';

// ─── Inbound webhook helpers ──────────────────────────────────────────────────

/**
 * Verify the GET challenge Meta sends when you first register the webhook.
 */
function verifyChallenge(query) {
  const mode      = query['hub.mode'];
  const token     = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
    return challenge; // echo back to Meta
  }
  throw Object.assign(new Error('Webhook verification failed'), { status: 403 });
}

/**
 * Validate the X-Hub-Signature-256 header on each inbound event.
 * Must be called BEFORE body parsing (needs raw body).
 */
function validateSignature(rawBody, signature) {
  if (!signature) throw Object.assign(new Error('Missing signature'), { status: 401 });

  const expected = 'sha256=' + crypto
    .createHmac('sha256', process.env.WA_APP_SECRET)
    .update(rawBody)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw Object.assign(new Error('Invalid signature'), { status: 401 });
  }
}

/**
 * Parse inbound webhook payload into a normalized event list.
 * Returns an array of { type, from, message, timestamp } objects.
 */
function parseInboundEvents(body) {
  const events = [];

  for (const entry of (body.entry || [])) {
    for (const change of (entry.changes || [])) {
      const value = change.value || {};

      for (const msg of (value.messages || [])) {
        events.push({
          type:      msg.type,
          from:      msg.from,
          waId:      msg.id,
          timestamp: new Date(parseInt(msg.timestamp) * 1000),
          text:      msg.text?.body || null,
          media:     msg.image || msg.document || msg.audio || msg.video || null,
          location:  msg.location || null,
          contacts:  value.contacts?.find(c => c.wa_id === msg.from) || null,
        });
      }
    }
  }

  return events;
}

// ─── Outbound messaging ───────────────────────────────────────────────────────

async function sendRequest(endpoint, body) {
  const res = await fetch(`${BASE_URL}/${process.env.WA_PHONE_ID}/${endpoint}`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) throw Object.assign(new Error(json.error?.message || 'WA API error'), { status: res.status, wa: json });
  return json;
}

/**
 * Send a plain text message.
 */
async function sendText(to, text) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text, preview_url: false },
  });
}

/**
 * Send a template message (pre-approved by Meta).
 * Example: project status update, HSE alert, document signature request.
 */
async function sendTemplate(to, templateName, languageCode, components = []) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name:     templateName,
      language: { code: languageCode },
      components,
    },
  });
}

/**
 * Send a document (uses a public URL or an uploaded media ID).
 */
async function sendDocument(to, { link, filename, caption }) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'document',
    document: { link, filename, caption },
  });
}

/**
 * Send an interactive button message (up to 3 buttons).
 */
async function sendButtons(to, { body, buttons }) {
  return sendRequest('messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body },
      action: {
        buttons: buttons.map((b, i) => ({
          type:  'reply',
          reply: { id: b.id || String(i), title: b.title },
        })),
      },
    },
  });
}

// ─── MinexCRM notification templates ─────────────────────────────────────────

/**
 * Notify a client contact about a new HSE incident on their project.
 */
async function notifyIncident(to, { projectName, incidentType, severity }) {
  return sendText(
    to,
    `⚠️ *MinexCRM — Alerta HSE*\n\nProyecto: ${projectName}\nTipo: ${incidentType}\nSeveridad: ${severity}\n\nNuestro equipo está atendiendo el evento. Te mantendremos informado.`
  );
}

/**
 * Notify when a field report / drill log is ready for review.
 */
async function notifyReportReady(to, { projectName, reportUrl }) {
  return sendText(
    to,
    `📊 *MinexCRM — Reporte disponible*\n\nEl informe del proyecto *${projectName}* ya está listo para revisión.\n\n🔗 ${reportUrl}`
  );
}

/**
 * Notify about a permit that requires approval signature.
 */
async function notifyPermitApproval(to, { permitType, expiresAt }) {
  return sendText(
    to,
    `📋 *MinexCRM — Permiso pendiente de aprobación*\n\nTipo: ${permitType}\nVence: ${new Date(expiresAt).toLocaleDateString('es-CO')}\n\nIngresa a MinexCRM para firmar digitalmente.`
  );
}

module.exports = {
  verifyChallenge,
  validateSignature,
  parseInboundEvents,
  sendText,
  sendTemplate,
  sendDocument,
  sendButtons,
  notifyIncident,
  notifyReportReady,
  notifyPermitApproval,
};
