export type BloodPressure = [number, number]; // [systolic, diastolic]

export interface Patient {
    patient_id: string,
    name: string | null,
    age?: number | null,
    gender?: string | null,
    blood_pressure?: BloodPressure | string | null, // [systolic, diastolic]
    temperature?: number | null,
    visit_date?: string | null,
    diagnosis?: string | null,
    medications?: string | null
}

export interface RiskScore {
    points: number,
    invalid: boolean
}

export interface RiskReport {
    high_risk_patients: string[],
    fever_patients: string[],
    data_quality_issues: string[]
}