import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "AI drafting is not connected yet. Add OPENAI_API_KEY in Vercel Project Settings → Environment Variables." }, { status: 503 });
  try {
    const body = await req.json();
    const lead = body.lead || {};
    const service = String(body.service || "business services");
    const result = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.5,
        messages: [
          { role: "system", content: "You write concise, respectful B2B outreach for MOBZENOX ENTERPRISES in Nigeria. Never claim a business has a problem unless evidence is supplied. Do not invent personal details, projects, contacts or prior interactions. Mention that this is an introductory message, include a polite opt-out sentence, and return JSON with subject and body." },
          { role: "user", content: JSON.stringify({ sender: "MOBZENOX ENTERPRISES", senderServices: ["Electrical works", "Plumbing", "Aluminium roofing", "Project consultancy", "Event planning", "Conferences and seminars", "Speaker coordination"], selectedService: service, prospect: { name: lead.name, address: lead.address, website: lead.website, category: lead.category }, instruction: "Draft a short, specific first-contact email based only on supplied public business details. Ask whether the service may be relevant; do not imply a confirmed need. Return JSON only: {subject, body}." }) }
        ],
        response_format: { type: "json_object" }
      }),
      cache: "no-store"
    });
    const data = await result.json();
    if (!result.ok) return NextResponse.json({ error: data.error?.message || "Draft generation failed." }, { status: result.status });
    const content = data.choices?.[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "No draft was returned." }, { status: 502 });
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json({ error: "Unable to generate this draft right now." }, { status: 500 });
  }
}