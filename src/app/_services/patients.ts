// imports
import "dotenv/config";
import { BloodPressure, Patient, RiskScore, RiskReport } from "@/app/_lib/interfaces/patients";
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
    private static riskReport: RiskReport = {
        high_risk_patients: [],
        fever_patients: [],
        data_quality_issues: []
    };

    static async aggregatePatients(): Promise<any[]> {
        try {
            this.patients = [];
            this.page = 1;
            while (true) {
                this.query.set("page", String(this.page)); // page number for query params

                // http request
                const res: Response = await fetch(`${this.endpoint}?${this.query}`, { headers: this.headers });
                const data: any = await res.json();

                // adds patients from this request to the array of patients
                this.patients.push(...data.data);

                /**
                 * START - Remove after util testing
                 * FIXME: Missing DEMO011 - Appears to not populate even without data validation and manipulation
                 * TODO: Account for missing DEMO011?
                 */
                // this.patients.forEach((patient: Patient, i: number): any => {
                //     // parseAge()
                //     this.patients[i].age = this.utils.parseAge(patient.age);
                //     // parseBloodPressure()
                //     this.patients[i].blood_pressure = this.utils.parseBloodPressure(patient.blood_pressure);
                //     // parseTemperature()
                //     this.patients[i].temperature = this.utils.parseTemperature(patient.temperature);
                //     // bloodPressureRisk()
                //     this.patients[i].blood_pressure_risk = this.utils.bloodPressureRisk(patient.blood_pressure);
                //     // ageRisk()
                //     this.patients[i].age_risk = this.utils.ageRisk(patient.age);
                //     // temperatureRisk()
                //     this.patients[i].temperature_risk = this.utils.temperatureRisk(patient.temperature);
                //     // generateRiskReport()
                //     this.patients[i].risk_report = this.utils.generateRiskReport(patient.patient_id, patient.age_risk, patient.blood_pressure_risk, patient.temperature_risk);
                // });
                /**
                 * END - Remove after util testing
                 */

                // checks if this is the last page to request data for
                if (this.page < data.pagination.totalPages || data.pagination.haxNext) {
                    this.hasNext = true;
                    this.page++;
                }
                else {
                    this.hasNext = false;
                }

                // loop ends if last page was received
                if (!this.hasNext) break;
            }
        }
        catch (err: any) {
            console.log(err);
            return err;
        }

        return this.patients;
    }

    static async getPatientAlerts(): Promise<RiskReport> {
        // reset report
        this.riskReport = {
            high_risk_patients: [],
            fever_patients: [],
            data_quality_issues: []
        }

        // aggregate patients
        await this.aggregatePatients();

        // sort into risk report by patient
        this.patients.forEach((patient: Patient): void => {
            // parse values
            const parsedAge: number | null = this.utils.parseAge(patient.age);
            const parsedBP: BloodPressure | null = this.utils.parseBloodPressure(patient.blood_pressure);
            const parsedTemp: number | null = this.utils.parseTemperature(patient.temperature);

            // risk assessment
            const age: RiskScore = this.utils.ageRisk(parsedAge);
            const bp: RiskScore = this.utils.bloodPressureRisk(parsedBP);
            const temp: RiskScore = this.utils.temperatureRisk(parsedTemp);

            // generate report
            const report: RiskReport = this.utils.generateRiskReport(patient.patient_id, age, bp, temp);

            // add patient risk report to aggregate risk reports
            this.riskReport.high_risk_patients.push(...report.high_risk_patients);
            this.riskReport.fever_patients.push(...report.fever_patients);
            this.riskReport.data_quality_issues.push(...report.data_quality_issues);

            // // total risk score
            // const totalRiskScore: number = age.points + bp.points + temp.points;
            //
            // // High Risk Patient
            // if (totalRiskScore >= 4) {
            //     this.riskReport.high_risk_patients.push(patient.patient_id);
            // }
            //
            // // Fever Patient
            // if (temp.points > 0) {
            //     this.riskReport.fever_patients.push(patient.patient_id);
            // }
            //
            // // Data Quality Issue
            // if (age.invalid || bp.invalid || temp.invalid) {
            //     this.riskReport.data_quality_issues.push(patient.patient_id);
            // }
        });

        // return report
        return this.riskReport;
    }
}