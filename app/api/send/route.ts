import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return NextResponse.json({ error: "Email sending is not connected. Add RESEND_API_KEY and EMAIL_FROM in Vercel. No email was sent." }, { status: 503 });
  try {
    const body = await req.json();
    const to = String(body.to || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const approved = body.approved === true;
    if (!approved) return NextResponse.json({ error: "Manual approval is required before sending." }, { status: 403 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return NextResponse.json({ error: "Enter a valid recipient email address." }, { status: 400 });
    if (!subject || !message) return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text: message }),
      cache: "no-store"
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.message || "Email provider rejected the message." }, { status: response.status });
    return NextResponse.json({ ok: true, id: data.id, message: "Email accepted by the email provider." });
  } catch {
    return NextResponse.json({ error: "Email sending failed. Check the integration settings." }, { status: 500 });
  }
}