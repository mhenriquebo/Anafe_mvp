import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { LegislacaoModel } from './models/LegislacaoModel';
import { CronService } from './services/CronService';
import { LegislacaoService } from './services/LegislacaoService';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Instâncias dos serviços
const cronService = new CronService();
const legislacaoService = new LegislacaoService();

// Rotas da API
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API de Integração com Dados do Senado Federal',
    version: '1.0.0',
    endpoints: {
      '/legislacoes': 'GET - Lista todas as legislações',
      '/legislacoes/ano/:ano': 'GET - Lista legislações por ano',
      '/legislacoes/tipo/:tipo': 'GET - Lista legislações por tipo',
      '/sync/manual': 'POST - Executa sincronização manual',
      '/sync/status': 'GET - Status dos jobs de sincronização',
      '/health': 'GET - Status da aplicação',
    },
  });
});

// Rota para listar todas as legislações
app.get('/legislacoes', async (req: Request, res: Response) => {
  try {
    const legislacoes = await LegislacaoModel.findAll();
    res.json({
      total: legislacoes.length,
      data: legislacoes,
    });
  } catch (error) {
    console.error('Erro ao buscar legislações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar legislações por ano
app.get('/legislacoes/ano/:ano', async (req: Request, res: Response) => {
  try {
    const ano = parseInt(req.params.ano);
    if (isNaN(ano)) {
      return res.status(400).json({ error: 'Ano inválido' });
    }

    const legislacoes = await LegislacaoModel.findByAno(ano);
    return res.json({
      ano,
      total: legislacoes.length,
      data: legislacoes,
    });
  } catch (error) {
    console.error('Erro ao buscar legislações por ano:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar legislações por tipo
app.get('/legislacoes/tipo/:tipo', async (req: Request, res: Response) => {
  try {
    const tipo = req.params.tipo;
    const legislacoes = await LegislacaoModel.findByTipo(tipo);
    res.json({
      tipo,
      total: legislacoes.length,
      data: legislacoes,
    });
  } catch (error) {
    console.error('Erro ao buscar legislações por tipo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para sincronização manual
app.post('/sync/manual', async (req: Request, res: Response) => {
  try {
    await cronService.executarBuscaManual();
    res.json({ message: 'Sincronização manual executada com sucesso' });
  } catch (error) {
    console.error('Erro na sincronização manual:', error);
    res.status(500).json({ error: 'Erro na sincronização manual' });
  }
});

// Rota para status dos jobs
app.get('/sync/status', (req: Request, res: Response) => {
  try {
    const jobs = cronService.listarJobs();
    res.json({
      jobs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao obter status dos jobs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  });
});

// Middleware de tratamento de erros
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Função para inicializar a aplicação
async function iniciarAplicacao() {
  try {
    console.log('Iniciando aplicação...');

    // Inicia o servidor
    app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${port}`);
      console.log(`Acesse: http://localhost:${port}`);
    });

    // Inicia os jobs de cron
    cronService.iniciarJobDiario();
    console.log('Jobs de cron iniciados');

    // Tratamento de sinais para encerramento gracioso
    process.on('SIGTERM', () => {
      console.log('Recebido SIGTERM, encerrando aplicação...');
      cronService.pararTodosJobs();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('Recebido SIGINT, encerrando aplicação...');
      cronService.pararTodosJobs();
      process.exit(0);
    });
  } catch (error) {
    console.error('Erro ao iniciar aplicação:', error);
    process.exit(1);
  }
}

// Inicia a aplicação
iniciarAplicacao();
