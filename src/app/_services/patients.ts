// imports
import "dotenv/config";
import { Patient } from "@/app/_lib/interfaces/patients";

// get environment variables
const BASE_URL: string = `${process.env.BASE_URL}`;
const API_KEY: string = `${process.env.API_KEY}`;

// patient services
export class PatientService {
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