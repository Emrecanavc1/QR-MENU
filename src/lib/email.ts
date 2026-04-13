// E-posta servisi — Resend
// npm install resend

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = process.env.SMTP_FROM ?? "noreply@qrmenu.com";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "QR Menü";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY tanımlı değil, e-posta gönderilmedi.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[Email] Resend API hatası:", err);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[Email] Gönderim hatası:", error);
    return false;
  }
}

// ─── Şablon fonksiyonları ──────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, businessName: string, slug: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return sendEmail({
    to,
    subject: `${APP_NAME}'e Hoş Geldiniz — ${businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:#f97316;color:#fff;font-weight:bold;font-size:18px;padding:10px 20px;border-radius:12px;">${APP_NAME}</div>
        </div>
        <h1 style="font-size:22px;color:#111;">Merhaba, ${businessName}! 🎉</h1>
        <p style="color:#555;line-height:1.6;">Platformumuza hoş geldiniz. 14 günlük deneme süreniz başladı.</p>
        <a href="${appUrl}/login" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#f97316;color:#fff;border-radius:10px;text-decoration:none;font-weight:bold;">
          Panele Git
        </a>
        <p style="margin-top:24px;color:#888;font-size:13px;">
          Menü URL'niz: <a href="${appUrl}/${slug}/masa/1" style="color:#f97316;">${appUrl}/${slug}/masa/1</a>
        </p>
      </div>
    `,
  });
}

export async function sendOrderNotificationEmail(to: string, tableNumber: number, itemCount: number, total: string) {
  return sendEmail({
    to,
    subject: `Yeni Sipariş — Masa ${tableNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;">
        <h2 style="color:#111;">🔔 Yeni Sipariş Geldi</h2>
        <p style="color:#555;"><strong>Masa:</strong> ${tableNumber}</p>
        <p style="color:#555;"><strong>Kalem sayısı:</strong> ${itemCount}</p>
        <p style="color:#555;"><strong>Tutar:</strong> ${total}</p>
        <p style="color:#888;font-size:12px;margin-top:24px;">Bu e-posta ${APP_NAME} tarafından otomatik gönderilmiştir.</p>
      </div>
    `,
  });
}

export async function sendPaymentReceiptEmail(to: string, orderDetails: { tableNumber: number; total: string; items: { name: string; qty: number; price: string }[] }) {
  const itemRows = orderDetails.items.map((i) => `<tr><td style="padding:6px 0;color:#555;">${i.qty}x ${i.name}</td><td style="padding:6px 0;text-align:right;color:#555;">${i.price}</td></tr>`).join("");
  return sendEmail({
    to,
    subject: "Ödeme Makbuzunuz",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;">
        <h2 style="color:#111;">✅ Ödemeniz Alındı</h2>
        <p style="color:#555;">Masa ${orderDetails.tableNumber} — teşekkür ederiz!</p>
        <table style="width:100%;margin-top:16px;border-top:1px solid #eee;">
          ${itemRows}
          <tr style="border-top:1px solid #eee;">
            <td style="padding:10px 0;font-weight:bold;color:#111;">Toplam</td>
            <td style="padding:10px 0;text-align:right;font-weight:bold;color:#f97316;">${orderDetails.total}</td>
          </tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px;">Bu makbuz ${APP_NAME} tarafından otomatik oluşturulmuştur.</p>
      </div>
    `,
  });
}

export async function sendSubscriptionRenewalEmail(to: string, businessName: string, plan: string, nextDate: string) {
  return sendEmail({
    to,
    subject: `Abonelik Yenilendi — ${businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;">
        <h2 style="color:#111;">Aboneliğiniz Yenilendi</h2>
        <p style="color:#555;">Plan: <strong>${plan}</strong></p>
        <p style="color:#555;">Sonraki yenileme: <strong>${nextDate}</strong></p>
      </div>
    `,
  });
}
