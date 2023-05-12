import axios, { Axios } from 'axios';
import { Metadata, NftAttributes } from './db/nft';
import { ContractDocument } from './db/contract';

export class Api {
  api: Axios;
  constructor() {
    this.api = axios.create({
      withCredentials: true,
      baseURL: 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async me() {
    const res = await this.api.get('/api/auth/me');
    return res.data.user;
  }
  async logout() {
    const res = await this.api.delete('/api/auth/logout');
    return res.data.message;
  }

  async getLocks() {
    const res = await this.api.get('/api/lock');
    return res.data.lock;
  }
  async getLock(id: string) {
    const res = await this.api.get(`/api/lock/one/${id}`);
    return res.data.lock;
  }
  async createLock(data: any) {
    const res = await this.api.post('/api/lock/create', data);
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

  async createNft(data: Metadata) {
    const res = await this.api.post('/api/nft/create', data);
    return res.data;
  }

  async getNfts() {
    const res = await this.api.get('/api/nft');
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

  async createContract(data: any) {
    return this.api.post('/api/contract', data);
  }

  async getContracts(): Promise<{ contracts: ContractDocument[] }> {
    const res = await this.api.get('/api/contract');
    return res.data;
  }

  public updateHeaders(key: string, value: string) {
    this.api.defaults.headers = {
      ...this.api.defaults.headers,
      [key]: value,
    };
  }

  async getContract(id: string): Promise<{ contract: ContractDocument }> {
    const res = await this.api.get(`/api/contract/${id}`);
    return res.data;
  }

  async createKeyAccess(data: any) {
    const res = await this.api.post(`/api/key-access`, data);
    return res.data;
  }

  async claim(data: any) {
    const res = await this.api.put(`/api/key-access/claim`, data);
    return res.data;
  }

  async updateKeyAccess(data: any) {
    const res = await this.api.put(`/api/key-access`, data);
    return res.data;
  }

  async getKeyAccesses(contract: string) {
    const res = await this.api.get(`/api/key-access?contract=${contract}`);
    return res.data;
  }

  async getKeyAccess(id: string) {
    const res = await this.api.get(`/api/key-access/claim?id=${id}`);
    return res.data;
  }

  async getWalletNfts() {
    const res = await this.api.get(`/api/nft/wallet`);
    return res.data;
  }

  async unlock(data: any) {
    const res = await this.api.post(`/api/unlock`, data);
    return res.data;
  }

  async lockAction(contract: any) {
    const res = await this.api.post('/api/unlock/status', contract);
    return res.data;
  }
}

export const api = new Api();
