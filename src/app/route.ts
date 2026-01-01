import { NextResponse } from "next/server";
import { PatientService } from "@/app/_services/patients";
import { RiskReport } from "@/app/_lib/interfaces/patients";

export async function GET(): Promise<NextResponse> {
  const riskReport: RiskReport = await PatientService.getPatientAlerts();
  return NextResponse.json({ riskReport });
}