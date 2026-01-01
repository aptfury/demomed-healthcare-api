// imports
import "dotenv/config";
import { BloodPressure, Patient, RiskScore, RiskReport } from "@/app/_lib/interfaces/patients";
import { PatientUtils } from "@/app/_lib/utils/patients";
import { RetryUtils } from "@/app/_lib/utils/retry";

// get environment variables
const BASE_URL: string = `${process.env.BASE_URL}`;
const API_KEY: string = `${process.env.API_KEY}`;

// patient services
export class PatientService {
    private static utils: PatientUtils = new PatientUtils();
    private static fetch_utils: RetryUtils = new RetryUtils(5);
    private static endpoint: string = `${BASE_URL}/patients`;
    private static assessmentEndpoint: string = `${BASE_URL}/submit-assessment`;
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
                const res: any = await this.fetch_utils.dynamicFetch(
                    `${this.endpoint}?${this.query}`,
                    this.headers
                );

                // adds patients from this request to the array of patients
                this.patients.push(...res.data);

                // checks if this is the last page to request data for
                if (this.page < res.pagination.totalPages || res.pagination.haxNext) {
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
        /**
         * FIXME: loading issues resulting in rare incomplete responses
         */
        try {
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
            });
        }
        catch (err: any) {
            console.log(err.message);
            return err;
        }

        // return report
        return this.riskReport;
    }

    static async submitRiskReport(): Promise<any> {
        try {
            // generate patient risk report
            const riskReport: RiskReport = await this.getPatientAlerts();

            // send risk report to /submit-assessment endpoint
            const res: Response = await fetch(
                `${this.assessmentEndpoint}`,
                {
                    method: "POST",
                    headers: this.headers,
                    body: JSON.stringify(riskReport)
                }
            );

            return await res.json();
        }
        catch (err: any) {
            console.log(err.messsage);
            return err;
        }
    }

    static async testPatientData(): Promise<Patient[]> {
        try {
            // aggregate patients
            await this.aggregatePatients();

            // run patient utils tests
            this.patients.forEach((patient: Patient, i: number): any => {
                // parseAge()
                this.patients[i].age = this.utils.parseAge(patient.age);
                // parseBloodPressure()
                this.patients[i].blood_pressure = this.utils.parseBloodPressure(patient.blood_pressure);
                // parseTemperature()
                this.patients[i].temperature = this.utils.parseTemperature(patient.temperature);
                // bloodPressureRisk()
                this.patients[i].blood_pressure_risk = this.utils.bloodPressureRisk(patient.blood_pressure);
                // ageRisk()
                this.patients[i].age_risk = this.utils.ageRisk(patient.age);
                // temperatureRisk()
                this.patients[i].temperature_risk = this.utils.temperatureRisk(patient.temperature);
                // generateRiskReport()
                this.patients[i].risk_report = this.utils.generateRiskReport(
                    patient.patient_id,
                    patient.age_risk,
                    patient.blood_pressure_risk,
                    patient.temperature_risk
                );
            });

            return this.patients;
        }
        catch (err: any) {
            console.log(err.message);
            return err;
        }
    }
}