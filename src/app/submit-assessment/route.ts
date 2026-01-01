import { NextResponse } from "next/server";
import { PatientService } from "@/app/_services/patients";

export async function GET(): Promise<NextResponse> {
    const data: any = await PatientService.submitRiskReport();

    console.log(data);
    return NextResponse.json({ data });
}