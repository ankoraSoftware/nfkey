import axios, { Axios } from "axios";

export class Api {
  api: Axios;
  constructor() {
    this.api = axios.create({
      withCredentials: true,
      baseURL: "http://localhost:3000",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  async me() {
    const res = await this.api.get("/api/auth/me");
    return res.data.user;
  }

  async getLocks() {
    const res = await this.api.get("/api/lock");
    return res.data.lock;
  }
  async getLock(id: string) {
    const res = await this.api.get(`/api/lock/one/${id}`);
    return res.data.lock;
  }
  async createLock(data: any) {
    const res = await this.api.post("/api/lock/create", data);
    return res.data.lock;
  }
  async updateLock(id: string, data: any) {
    const res = await this.api.patch(`/api/lock/update/${id}`, data);
    return res.data.lock;
  }
  async deleteLock(id: string) {
    const res = await this.api.delete(`/api/lock/delete/${id}`);
    return res.data.lock;
  }

  public updateHeaders(key: string, value: string) {
    this.api.defaults.headers = {
      ...this.api.defaults.headers,
      [key]: value,
    };
  }
}

export const api = new Api();
