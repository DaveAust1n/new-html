import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return NextResponse.json({ error: "Business discovery is not connected yet. Add GOOGLE_PLACES_API_KEY in Vercel Project Settings → Environment Variables." }, { status: 503 });

  try {
    const body = await req.json();
    const service = String(body.service || "electrical contractors").slice(0, 120);
    const city = String(body.city || "Nigeria").slice(0, 100);
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,places.primaryType,places.businessStatus" },
      body: JSON.stringify({ textQuery: `${service} in ${city}, Nigeria`, pageSize: 20, regionCode: "NG" }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error?.message || "Places search failed." }, { status: response.status });
    const leads = (data.places || []).map((p: any) => ({
      id: p.id,
      name: p.displayName?.text || "Unnamed business",
      address: p.formattedAddress || "",
      website: p.websiteUri || "",
      phone: p.nationalPhoneNumber || "",
      mapsUrl: p.googleMapsUri || "",
      category: p.primaryType || service,
      status: p.businessStatus || "UNKNOWN",
      email: "",
      source: "Google Places",
      stage: "New",
      emailSubject: "",
      emailDraft: "",
    }));
    return NextResponse.json({ leads, count: leads.length, note: "Public business listings are prospects, not proof that they currently need MOBZENOX services. Email addresses are not inferred." });
  } catch {
    return NextResponse.json({ error: "Could not complete the discovery search. Please try again." }, { status: 500 });
  }
}