// imports
import "dotenv/config";

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
        "limit": "10"
    })
    private static page: number = 1;

    static async aggregatePatients(): Promise<any[]> {
        this.query.set("page", String(this.page));
        const res: Response = await fetch(`${this.endpoint}?${this.query}`, { headers: this.headers });
        const data: any = await res.json();
        const patients: any[] = [...data.data]

        return patients;
    }
}