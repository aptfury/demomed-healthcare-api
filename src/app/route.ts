import "dotenv/config";
import { NextResponse } from "next/server";
import { PatientService } from "@/app/_services/patients";

// Endpoint Config
const base_url: string = `${process.env.BASE_URL}/patients`;
const headers: Headers = new Headers({
  "Content-Type": "application/json",
  "x-api-key": `${process.env.API_KEY}`
});

// export async function GET(): Promise<NextResponse> {
//   const res: Response = await fetch(base_url, { headers: headers });
//   const data: any = await res.json();
//   return NextResponse.json({ data });
// }

export async function GET(): Promise<NextResponse> {
  const patients: any[] = await PatientService.aggregatePatients();
  return NextResponse.json({ populated: patients });
}