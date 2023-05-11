import axios, { AxiosInstance } from 'axios';

export class Nuki {
  private api: AxiosInstance;
  private baseUri = 'https://api.nuki.io/';

  constructor(private readonly apiKey: string) {
    this.api = axios.create({
      baseURL: this.baseUri,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });
  }

  async getLocks(): Promise<any[]> {
    const res = await this.api.get(`smartlock`);
    return res.data.map((l: any) => this.lockMapper(l));
  }

  private lockMapper(lock: any) {
    return {
      id: lock.smartlockId,
      name: lock.name,
      lat: lock.config.latitude,
      long: lock.config.longitude,
    };
  }

  async lock(lockId: string) {
    return this.api.post(`smartlock/${lockId}/action/lock`);
  }
}
