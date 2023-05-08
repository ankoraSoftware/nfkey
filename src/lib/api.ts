import axios, { Axios } from "axios";
import { Metadata, NftAttributes } from "./db/nft";

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

  async createNft(data: Metadata) {
    const res = await this.api.post("/api/nft/create", data);
    return res.data;
  }

  async getNfts() {
    const res = await this.api.get("/api/nft");
    return res.data;
  }

  async getNft(id: string) {
    const res = await this.api.get(`/api/nft/${id}`);
    return res.data;
  }

  async updateNft(id: string, data: any) {
    const res = await this.api.patch(`/api/nft/update/${id}`, data);
    return res.data;
  }

  async deleteNft(id: string) {
    const res = await this.api.delete(`/api/nft/delete/${id}`);
    return res.data;
  }

  public updateHeaders(key: string, value: string) {
    this.api.defaults.headers = {
      ...this.api.defaults.headers,
      [key]: value,
    };
  }
}

export const api = new Api();
