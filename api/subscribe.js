// api/subscribe.js
// Vercel Serverless Function — recebe { email, lang } do formulário da landing,
// adiciona o contato ao Segment "waitlist" do Resend e envia e-mail de confirmação.
//
// Modo demo: se RESEND_API_KEY não estiver configurada, só loga no console
// e responde sucesso — a página funciona normalmente sem a env var.
// Ver Decisão de Stack Técnica, seção 7.2 e 9.1 (LGPD) no Notion.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID; // ID do Segment "waitlist"
const FROM_EMAIL = 'take-o.io <hello@take-o.io>';

const CONFIRM_COPY = {
  pt: {
    subject: 'Você está na lista — take-o.io',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#141413">
        <p>Recebemos seu e-mail.</p>
        <p>Você está na lista de acesso antecipado do <strong>take-o.io</strong>. Avisamos assim que houver novidade.</p>
        <p style="color:#8A8984;font-size:13px;margin-top:32px">take-o.io</p>
      </div>`,
  },
  en: {
    subject: "You're on the list — take-o.io",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#141413">
        <p>We got your email.</p>
        <p>You're on the early access list for <strong>take-o.io</strong>. We'll reach out as soon as there's news.</p>
        <p style="color:#8A8984;font-size:13px;margin-top:32px">take-o.io</p>
      </div>`,
  },
};

function isValidEmail(email) {
  return typeof email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const email = (body && body.email || '').trim().toLowerCase();
  const lang = body && body.lang === 'pt' ? 'pt' : 'en';

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'invalid_email' });
  }

  // Modo demo — sem credencial, só loga e responde sucesso.
  if (!RESEND_API_KEY) {
    console.log('[subscribe:DEMO MODE] sem RESEND_API_KEY — contato não enviado de verdade:', { email, lang });
    return res.status(200).json({ ok: true, demo: true });
  }

  try {
    // 1. Adiciona o contato ao Segment "waitlist"
    //    Endpoint clássico de Audiences — ainda funcional (deprecated em favor de
    //    Segments, mas sem prazo de remoção anunciado). audience_id aceita o ID
    //    do Segment normalmente.
    if (RESEND_AUDIENCE_ID) {
      const contactRes = await fetch(
        `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, unsubscribed: false }),
        }
      );
      if (!contactRes.ok) {
        const errText = await contactRes.text();
        console.error('[subscribe] falha ao criar contato no Resend:', contactRes.status, errText);
        // não interrompe o fluxo — ainda tenta mandar o e-mail de confirmação
      }
    } else {
      console.warn('[subscribe] RESEND_AUDIENCE_ID ausente — contato não associado a nenhum segment');
    }

    // 2. Envia e-mail de confirmação
    const copy = CONFIRM_COPY[lang];
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: copy.subject,
        html: copy.html,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('[subscribe] falha ao enviar e-mail de confirmação:', emailRes.status, errText);
      // contato já foi salvo (ou tentado); não falha a requisição só por causa do e-mail
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[subscribe] erro inesperado:', err);
    // Mesmo em erro, não trava a experiência do usuário — o form já esconde
    // e mostra a confirmação no frontend independente da resposta (ver index.html).
    return res.status(200).json({ ok: true, warning: 'partial_failure' });
  }
}
