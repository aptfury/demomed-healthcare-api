import "dotenv/config";
import { NextResponse } from "next/server";
import { PatientService } from "@/app/_services/patients";
import { Patient, RiskReport } from "@/app/_lib/interfaces/patients";

// Endpoint Config
const base_url: string = `${process.env.BASE_URL}/patients`;
const headers: Headers = new Headers({
  "Content-Type": "application/json",
  "x-api-key": `${process.env.API_KEY}`
});

export async function GET(): Promise<NextResponse> {
  const riskReport: RiskReport = await PatientService.getPatientAlerts();
  return NextResponse.json({ riskReport });
}