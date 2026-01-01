enum RetryStatus {
    rate_limit = 429,
    internal_server_error = 500,
    server_unavailable = 503
}

export class RetryUtils {
    public valid_retry_status: typeof RetryStatus = RetryStatus;
    public max_attempts: number = 5;
    public delay_by: number = 1000;
    public retry_after: number | null = null;

    constructor(max_attempts?: number) {
        if (max_attempts) {
            this.max_attempts = max_attempts;
        }
    }

    public async retryDelay(ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async dynamicFetch(api_url: string, api_headers: Headers): Promise<any> {
        try {
            for (let i = 0; i < this.max_attempts; i++) {
                const res: Response = await fetch(api_url, { method: 'GET', headers: api_headers });

                if (!this.valid_retry_status[res.status]) {
                    if (res.ok) {
                        return await res.json();
                    }

                    console.warn(`Response returned with a status that hasn't been accounted for. (Status: ${res.status})`);
                }

                this.delay_by = 1000 * Math.pow(2, i);

                if (this.valid_retry_status[res.status] == 'rate_limit') {
                    this.retry_after = Number(res.headers.get("retry-after"));

                    if (this.retry_after) {
                        this.delay_by = this.retry_after * 1000;
                    }
                }

                console.warn(`${this.valid_retry_status[res.status]} on ${api_url}. Retrying in ${this.delay_by}ms. Attempt: ${i}`);

                await this.retryDelay(this.delay_by);
            }
        }
        catch (err: any) {
            console.log(err.message);
            return err;
        }
    }
}