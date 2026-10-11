import { NextResponse } from "next/server";
import { insert } from "@/lib/db/server";
export async function POST() { const r = await insert("consults", { type: "education", source: "web" }); return NextResponse.json(r); }
