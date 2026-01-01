import "dotenv/config";
import { NextResponse } from "next/server";

// Endpoint Config
const base_url: string = `${process.env.BASE_URL}/patients`;
const headers: Headers = new Headers({
  "Content-Type": "application/json",
  "x-api-key": `${process.env.API_KEY}`
});

export async function GET(): Promise<NextResponse> {
  const res: Response = await fetch(base_url, { headers: headers });
  const data: any = await res.json();
  return NextResponse.json({ data });
}
