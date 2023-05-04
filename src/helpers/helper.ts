import axios from 'axios';

export class Helper {
  private static endpoint = 'https://ipfs.infura.io:5001/api/v0/add';
  private static infura_endpoint = 'https://ipfs.infura.io:5001/api/v0/add';
  private static headers(restHeaders = {}) {
    return {
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_IPFS_API_KEY}:${process.env.NEXT_PUBLIC_IPFS_SECRET_KEY}`
      ).toString('base64')}`,
      ...restHeaders,
    };
  }

  public static async uploadJsonToIpfs(jsonData: unknown) {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([JSON.stringify(jsonData)], { type: 'application/json' })
    );
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers(),
      body: formData,
    });
    const result = await response.json();
    return result.Hash;
  }

  public static uploadFileToInfura = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(this.infura_endpoint, formData, {
        headers: this.headers({ 'Content-Type': 'multipart/form-data' }),
      });

      return response.data.Hash;
    } catch (error) {
      console.error('Error uploading file to Infura:', error);
    }
  };
}
