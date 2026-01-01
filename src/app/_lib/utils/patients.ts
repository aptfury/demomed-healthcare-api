import { BloodPressure, Patient, RiskScore, RiskReport } from "@/app/_lib/interfaces/patients";

export class PatientUtils {
    // DATA PARSING
    parseAge(raw_age: any): number | null {
        if (!raw_age) return null;

        const age: number = parseInt(raw_age);

        if (Number.isNaN(age)) return null;

        return age;
    }

    parseBloodPressure(blood_pressure: any): BloodPressure | null {
        if (!blood_pressure) return null;
        if (typeof blood_pressure == "object") return blood_pressure;

        const arr: string[] = blood_pressure.split("/"); // split string into an array
        const bp: BloodPressure = [parseInt(arr[0]), parseInt(arr[1])]; // cast strings as a number
        // cast with parseInt instead of Number so it casts "" as NaN instead of 0

        if (Number.isNaN(bp[0]) || Number.isNaN(bp[1])) return null; // ensure number is not NaN

        return bp;
    }

    parseTemperature(raw_temp: any): number | null {
        if (!raw_temp) return null;

        const temp: number = parseFloat(raw_temp);

        if (Number.isNaN(temp)) return null;

        return temp;
    }

    // RISK ASSESSMENT
    bloodPressureRisk(bp: any): RiskScore {
        /**
         * bp[0]: systolic
         * bp[1]: diastolic
         */
        const score: RiskScore = {
            points: 0,
            invalid: false
        }

        // Data Missing or Invalid
        if (!bp) {
            score.invalid = true;
            return score;
        }

        // Normal
        if (bp[0] < 120 && bp[1] < 80) {
            return score;
        }

        // Elevated
        if (bp[0] < 130 && bp[1] < 80) {
            score.points = 1;
            return score;
        }

        // Stage 1
        // TODO: Double check that I don't need (80 <= bp[1] && bp[1] < 90) for safety
        if (bp[0] < 140 || bp[1] < 90) {
            score.points = 2;
        }

        // Stage 2
        if (bp[0] >= 140 || bp[1] >= 90) {
            score.points = 3;
        }

        score.invalid = true; // catch all for exceptions that sneak through
        return score;
    }

    ageRisk(age: any): RiskScore {
        const score: RiskScore = {
            points: 0,
            invalid: false
        }

        // Data Missing or Invalid
        if (!age) {
            score.invalid = true;
            return score;
        }

        // Normal
        if (age < 40) {
            return score;
        }

        // Elevated
        if (age <= 65) {
            score.points = 1;
            return score;
        }

        // High
        if (age > 65) {
            score.points = 2;
            return score;
        }

        score.invalid = true; // catch all for exceptions that sneak through
        return score;
    }

    temperatureRisk(temp: any): RiskScore {
        const score: RiskScore = {
            points: 0,
            invalid: false
        }

        if (!temp) {
            score.invalid = true;
            return score;
        }

        // Normal
        if (temp <= 99.5) {
            return score;
        }

        // Low
        if (temp <= 100.9) {
            score.points = 1;
            return score;
        }

        // High
        if (temp >= 101.0) {
            score.points = 2;
            return score;
        }

        score.invalid = true; // catch all for exceptions that sneak through
        return score;
    }

    // RISK REPORTING
    generateRiskReport(patient_id: string, age: RiskScore, bp: RiskScore, temp: RiskScore): RiskReport {
        const report: RiskReport = {
            high_risk_patients: [],
            fever_patients: [],
            data_quality_issues: []
        }
        const totalScore: number = age.points + bp.points + temp.points;

        if (totalScore >= 4) {
            report.high_risk_patients.push(patient_id);
        }

        if (temp.points > 0) {
            report.fever_patients.push(patient_id);
        }

        if (age.invalid || bp.invalid || temp.invalid) {
            report.data_quality_issues.push(patient_id);
        }

        return report;
    }
}