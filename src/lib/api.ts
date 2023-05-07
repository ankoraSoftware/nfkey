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

  public updateHeaders(key: string, value: string) {
    this.api.defaults.headers = {
      ...this.api.defaults.headers,
      [key]: value,
    };
  }
}

export const api = new Api();
