import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const data = await req.arrayBuffer();
    if (!data || data.byteLength === 0) {
      return NextResponse.json({ error: "Empty PDF upload." }, { status: 400 });
    }

    const parsed = await pdfParse(Buffer.from(data));
    return NextResponse.json({ text: parsed.text || "" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to parse PDF." }, { status: 400 });
  }
}
