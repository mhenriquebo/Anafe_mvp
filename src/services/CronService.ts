import * as cron from 'node-cron';
import { LegislacaoService } from './LegislacaoService';

export class CronService {
  private legislacaoService: LegislacaoService;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.legislacaoService = new LegislacaoService();
  }

  // Inicia o job diário para buscar legislação
  iniciarJobDiario(): void {
    const cronExpression = process.env.CRON_SCHEDULE || '0 6 * * *'; // 6h da manhã por padrão

    console.log(`Configurando job diário com expressão: ${cronExpression}`);

    const job = cron.schedule(
      cronExpression,
      async () => {
        console.log('=== Iniciando busca diária de legislação ===');
        const inicio = new Date();

        try {
          await this.executarBuscaDiaria();

          const fim = new Date();
          const duracao = fim.getTime() - inicio.getTime();
          console.log(`=== Busca diária concluída em ${duracao}ms ===`);
        } catch (error) {
          console.error('Erro na busca diária de legislação:', error);
        }
      },
      {
        timezone: 'America/Sao_Paulo',
      }
    );

    this.jobs.set('busca-diaria', job);
    job.start();

    console.log('Job diário de busca de legislação iniciado');
  }

  // Executa a busca diária de legislação
  private async executarBuscaDiaria(): Promise<void> {
    try {
      // Busca legislação dos últimos 3 anos
      await this.legislacaoService.buscarESalvarRecentes();

      // Log de sucesso
      console.log('Busca diária de legislação executada com sucesso');
    } catch (error) {
      console.error('Erro ao executar busca diária:', error);
      throw error;
    }
  }

  // Executa busca manual (para testes)
  async executarBuscaManual(): Promise<void> {
    console.log('=== Iniciando busca manual de legislação ===');
    const inicio = new Date();

    try {
      await this.executarBuscaDiaria();

      const fim = new Date();
      const duracao = fim.getTime() - inicio.getTime();
      console.log(`=== Busca manual concluída em ${duracao}ms ===`);
    } catch (error) {
      console.error('Erro na busca manual de legislação:', error);
      throw error;
    }
  }

  // Para todos os jobs
  pararTodosJobs(): void {
    this.jobs.forEach((job, nome) => {
      job.stop();
      console.log(`Job ${nome} parado`);
    });
  }

  // Inicia todos os jobs
  iniciarTodosJobs(): void {
    this.jobs.forEach((job, nome) => {
      job.start();
      console.log(`Job ${nome} iniciado`);
    });
  }

  // Lista status dos jobs
  listarJobs(): { nome: string; ativo: boolean }[] {
    const status: { nome: string; ativo: boolean }[] = [];

    this.jobs.forEach((job, nome) => {
      status.push({
        nome,
        ativo: true, // Simplificado - assume que jobs estão ativos se estão no Map
      });
    });

    return status;
  }

  // Configura job para buscar por tipo específico
  configurarJobPorTipo(tipo: string, cronExpression: string): void {
    const jobName = `busca-${tipo}`;

    // Para job existente se houver
    if (this.jobs.has(jobName)) {
      this.jobs.get(jobName)?.stop();
    }

    const job = cron.schedule(
      cronExpression,
      async () => {
        console.log(`=== Iniciando busca de legislação tipo ${tipo} ===`);

        try {
          const anoAtual = new Date().getFullYear();
          const resultado = await this.legislacaoService.buscarESalvarPorTipo(
            tipo,
            anoAtual
          );
          console.log(`Busca tipo ${tipo} concluída:`, resultado);
        } catch (error) {
          console.error(`Erro na busca tipo ${tipo}:`, error);
        }
      },
      {
        timezone: 'America/Sao_Paulo',
      }
    );

    this.jobs.set(jobName, job);
    job.start();

    console.log(
      `Job para tipo ${tipo} configurado com expressão: ${cronExpression}`
    );
  }
}
