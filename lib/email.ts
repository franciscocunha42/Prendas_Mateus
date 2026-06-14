import { Resend } from "resend";
import type { PaymentMethod } from "./supabase";

// Envio do email de notificação quando alguém marca um item como "já comprei".
// Usa o Resend. Sem domínio verificado, o Resend permite enviar a partir de
// onboarding@resend.dev PARA o email da conta — que é exatamente o destinatário
// pretendido (luciaefrancisco2025@gmail.com).

type NotifyArgs = {
  itemName: string;
  buyerName: string;
  message: string;
  paymentMethod: PaymentMethod;
};

export async function sendBoughtNotification(args: NotifyArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;

  if (!apiKey || !to) {
    // Não bloqueia a marcação do item; apenas regista o aviso.
    console.warn(
      "RESEND_API_KEY ou NOTIFICATION_EMAIL em falta — email não enviado."
    );
    return;
  }

  const resend = new Resend(apiKey);

  const methodLabel =
    args.paymentMethod === "store"
      ? "Comprou na loja"
      : "Vai transferir o valor (Revolut / transferência bancária)";

  const safeMessage = args.message?.trim() || "(sem mensagem)";

  const subject = `🎁 Prenda comprada: ${args.itemName}`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #5B5550; line-height: 1.6;">
      <h2 style="color:#5B5550;">Alguém ajudou com uma prenda do bebé! 🎉</h2>
      <table style="border-collapse: collapse;">
        <tr><td style="padding:4px 12px 4px 0;"><strong>Item</strong></td><td>${escapeHtml(args.itemName)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>De</strong></td><td>${escapeHtml(args.buyerName)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>Como</strong></td><td>${escapeHtml(methodLabel)}</td></tr>
      </table>
      <p style="margin-top:16px;"><strong>Mensagem:</strong></p>
      <blockquote style="margin:0; padding:12px 16px; background:#FBF7F0; border-left:4px solid #CFE6F0; border-radius:8px;">
        ${escapeHtml(safeMessage).replace(/\n/g, "<br/>")}
      </blockquote>
    </div>
  `;

  const text =
    `Alguém ajudou com uma prenda do bebé!\n\n` +
    `Item: ${args.itemName}\n` +
    `De: ${args.buyerName}\n` +
    `Como: ${methodLabel}\n\n` +
    `Mensagem:\n${safeMessage}\n`;

  await resend.emails.send({
    from: "Lista do Bebé <onboarding@resend.dev>",
    to: [to],
    subject,
    html,
    text,
  });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
