// imports
import "dotenv/config";
import { Patient } from "@/app/_lib/interfaces/patients";
import { PatientUtils } from "@/app/_lib/utils/patients";

// get environment variables
const BASE_URL: string = `${process.env.BASE_URL}`;
const API_KEY: string = `${process.env.API_KEY}`;

// patient services
export class PatientService {
    private static utils: PatientUtils = new PatientUtils();
    private static endpoint: string = `${BASE_URL}/patients`;
    private static headers: Headers = new Headers({
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    });
    private static query: URLSearchParams = new URLSearchParams({
        "page": "",
        "limit": "20"
    })
    private static page: number = 1;
    private static hasNext: boolean = false;
    private static patients: Patient[] = [];

    static async aggregatePatients(): Promise<any[]> {
        try {
            this.patients = [];
            this.page = 1;
            while (true) {
                this.query.set("page", String(this.page));
                const res: Response = await fetch(`${this.endpoint}?${this.query}`, { headers: this.headers });
                const data: any = await res.json();
                this.patients.push(...data.data);

                /**
                 * START - Remove after util testing
                 * FIXME: Missing DEMO011
                 */
                // test parseAge()
                // Expected: null for DEMO043 ("fifty-three") - Success
                this.patients.forEach((patient: Patient, i: number): any =>
                    this.patients[i].age = this.utils.parseAge(patient.age));

                // test parseBloodPressure()
                this.patients.forEach((patient: Patient, i: number): any =>
                    this.patients[i].blood_pressure = this.utils.parseBloodPressure(patient.blood_pressure));

                // test parseTemperature()
                // Expected: null for DEMO007 (TEMP_ERROR) - Success
                this.patients.forEach((patient: Patient, i: number): any =>
                    this.patients[i].temperature = this.utils.parseTemperature(patient.temperature));

                // test bloodPressureRisk()
                // Expected: 0 points for DEMO025 (110; 65) - Success
                // Expected: 1 points for DEMO018 (128; 75) - Success
                // Expected: 2 points for DEMO029 (130; 82) - Success
                // Expected: 2 points for DEMO021 (125; 80) - Success
                // Expected: 3 points for DEMO028 (142; 88) - Success
                this.patients.forEach((patient: Patient, i: number): any =>
                    this.patients[i].blood_pressure_risk = this.utils.bloodPressureRisk(patient.blood_pressure));

                // test ageRisk()
                // Expected: 0 points for DEMO003 (34) - Success
                // Expected: 0 points for DEMO043 (null) - Success
                // Expected: 1 points for DEMO001 (45) - Success
                // Expected: 2 points for DEMO002 (67) - Success
                this.patients.forEach((patient: Patient, i: number): any =>
                    this.patients[i].age_risk = this.utils.ageRisk(patient.age));
                /**
                 * END - Remove after util testing
                 */

                if (this.page < data.pagination.totalPages || data.pagination.haxNext) {
                    this.hasNext = true;
                    this.page++;
                }
                else {
                    this.hasNext = false;
                }

                if (!this.hasNext) break;
            }
        }
        catch (err: any) {
            console.log(err);
            return err;
        }

        return this.patients;
    }
}