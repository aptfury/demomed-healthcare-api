import { NextResponse } from "next/server";
import { PatientService } from "@/app/_services/patients";
import { Patient } from "@/app/_lib/interfaces/patients";

export async function GET(): Promise<NextResponse> {
    const patients: Patient[] = await PatientService.testPatientData();
    return NextResponse.json({ patients });
}