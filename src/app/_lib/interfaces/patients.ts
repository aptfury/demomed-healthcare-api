export type BloodPressure = [number, number]; // [systolic, diastolic]

export interface Patient {
    patient_id: string,
    name: string | null,
    age?: number | null,
    age_risk?: RiskScore,
    gender?: string | null,
    blood_pressure?: BloodPressure | null, // [systolic, diastolic]
    blood_pressure_risk?: RiskScore,
    temperature?: number | null,
    temperature_risk?: RiskScore,
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