import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../types/legislacao';

export class SenadoApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.SENADO_API_BASE_URL ||
      'https://legis.senado.leg.br/dadosabertos';

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Senado-API-Integration/1.0.0',
      },
    });

    // Interceptor para rate limiting (máximo 10 req/segundo)
    this.setupRateLimiting();
  }

  private setupRateLimiting(): void {
    let lastRequestTime = 0;
    const minInterval = 100; // 100ms entre requisições (10 req/segundo)

    this.api.interceptors.request.use(async config => {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;

      if (timeSinceLastRequest < minInterval) {
        const delay = minInterval - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      lastRequestTime = Date.now();
      return config;
    });
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.get(endpoint, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao fazer requisição para ${endpoint}:`, error);
      throw error;
    }
  }

  // Método específico para buscar lista de legislação
  async buscarListaLegislacao(
    params: {
      tipo?: string;
      numero?: string;
      ano?: number;
      data?: string;
    } = {}
  ): Promise<ApiResponse<any>> {
    const endpoint = '/legislacao/lista.json';
    return this.get<ApiResponse<any>>(endpoint, params);
  }
}
