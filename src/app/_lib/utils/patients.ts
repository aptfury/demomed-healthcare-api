import { BloodPressure, Patient, RiskScore, RiskReport } from "@/app/_lib/interfaces/patients";

export class PatientUtils {
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

        const temp: number = parseInt(raw_temp);

        if (Number.isNaN(temp)) return null;

        return temp;
    }
}