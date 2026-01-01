enum RetryStatus {
    rate_limit = 429,
    internal_server_error = 500,
    server_unavailable = 503
}

export class RetryUtils {
    public validStatus: typeof RetryStatus = RetryStatus;
    public maxTries: number = 5;
    public delayBy: number = 1000;
    public retryAfter: number | null = null;

    constructor(attempts?: number) {
        if (attempts) {
            this.maxTries = attempts;
        }
    }

    public async retryDelay(ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async dynamicFetch(api_url: string, api_headers: Headers): Promise<any> {
        try {
            for (let i = 0; i < this.maxTries; i++) {
                const res: Response = await fetch(api_url, { method: 'GET', headers: api_headers });

                if (!this.validStatus[res.status]) {
                    // return data if request is successful
                    if (res.ok) {
                        return await res.json();
                    }

                    // return status code if not ok, 429, 500, or 503
                    console.warn(`Status: ${res.status}`);
                }

                // internal server error or server unavailable
                this.delayBy = 1000 * Math.pow(2, i); // calculate delay time

                // rate limit
                if (this.validStatus[res.status] == 'rate_limit') {
                    this.retryAfter = Number(res.headers.get("retry-after"));

                    if (this.retryAfter) {
                        this.delayBy = this.retryAfter * 1000; // calculate delay time based on retryAfter
                    }
                }

                console.warn(`${this.validStatus[res.status]}: Retry in ${this.delayBy}ms. Attempt ${i}`);

                await this.retryDelay(this.delayBy);
            }
        }
        catch (err: any) {
            console.log(err.message);
        }
    }
}