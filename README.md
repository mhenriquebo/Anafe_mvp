# anafe-mvp-api

# API de Integração com Dados do Senado Federal

Esta aplicação Node.js integra com a API de Dados Abertos do Senado Federal para buscar e armazenar informações sobre legislação brasileira de forma automatizada.

## 🚀 Características

- **TypeScript**: Desenvolvimento com tipagem estática
- **Express**: Framework web para APIs REST
- **Knex.js**: Query builder para PostgreSQL
- **PostgreSQL**: Banco de dados relacional
- **Node-cron**: Agendamento de tarefas automáticas
- **ESLint + Prettier**: Padronização de código
- **Rate Limiting**: Respeita limites da API do Senado (10 req/segundo)

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**

```bash
git clone <url-do-repositorio>
cd senado-api-integration
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure o banco de dados**

```bash
# Crie um banco PostgreSQL com docker
docker run --name integracao-postgres -e POSTGRES_PASSWORD=12345678 -d postgres:16-alpine
```

4. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

5. **Execute as migrations**

```bash
npm run migrate
```

6. **Compile o projeto**

```bash
npm run build
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=senado_api
DB_USER=postgres
DB_PASSWORD=password

# Application Configuration
PORT=3000
NODE_ENV=development

# API Configuration
SENADO_API_BASE_URL=https://legis.senado.leg.br/dadosabertos

# Cron Configuration (6h da manhã todos os dias)
CRON_SCHEDULE=0 6 * * *
```

### Configuração do Cron

O formato do cron segue o padrão de 6 campos:

```
* * * * * *
│ │ │ │ │ │
│ │ │ │ │ └── Dia da semana (0-6, 0=Domingo)
│ │ │ │ └──── Mês (1-12)
│ │ │ └────── Dia do mês (1-31)
│ │ └──────── Hora (0-23)
│ └────────── Minuto (0-59)
└──────────── Segundo (0-59)
```

Exemplos:

- `0 6 * * *` - Todos os dias às 6h
- `0 */6 * * *` - A cada 6 horas
- `0 9 * * 1-5` - Dias úteis às 9h

## 🚀 Execução

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

### Scripts Disponíveis

```bash
npm run build      # Compila TypeScript
npm run dev        # Execução em desenvolvimento
npm start          # Execução em produção
npm run lint       # Verifica código com ESLint
npm run lint:fix   # Corrige problemas do ESLint
npm run format     # Formata código com Prettier
npm run migrate    # Executa migrations
```

## 📡 API Endpoints

### Informações Gerais

- **GET** `/` - Informações da API e endpoints disponíveis
- **GET** `/health` - Status da aplicação

### Legislação

- **GET** `/legislacoes` - Lista todas as legislações
- **GET** `/legislacoes/ano/:ano` - Lista legislações por ano
- **GET** `/legislacoes/tipo/:tipo` - Lista legislações por tipo

### Sincronização

- **POST** `/sync/manual` - Executa sincronização manual
- **GET** `/sync/status` - Status dos jobs de sincronização

### Exemplos de Uso

```bash
# Verificar status da aplicação
curl http://localhost:3000/health

# Listar todas as legislações
curl http://localhost:3000/legislacoes

# Buscar legislações de 2024
curl http://localhost:3000/legislacoes/ano/2024

# Buscar por tipo específico
curl http://localhost:3000/legislacoes/tipo/ADCon

# Executar sincronização manual
curl -X POST http://localhost:3000/sync/manual

# Verificar status dos jobs
curl http://localhost:3000/sync/status
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: legislacoes

| Campo           | Tipo      | Descrição                                       |
| --------------- | --------- | ----------------------------------------------- |
| id              | SERIAL    | Chave primária                                  |
| codigo          | VARCHAR   | Código único da norma (ex: ADCon-84-2024-10-11) |
| tipo            | VARCHAR   | Tipo da norma (ADCon, ADI, etc.)                |
| numero          | VARCHAR   | Número da norma                                 |
| norm_nome       | VARCHAR   | Nome completo da norma                          |
| descricao       | TEXT      | Descrição do tipo de norma                      |
| ementa          | TEXT      | Texto da ementa                                 |
| data_assinatura | DATE      | Data de assinatura                              |
| ano_assinatura  | INTEGER   | Ano de assinatura                               |
| apelido         | VARCHAR   | Apelido/identificação curta                     |
| created_at      | TIMESTAMP | Data de criação                                 |
| updated_at      | TIMESTAMP | Data de atualização                             |

## 🔄 Funcionamento do Sistema

### Sincronização Automática

- Executa diariamente às 6h (configurável)
- Busca legislação dos últimos 3 anos
- Atualiza registros existentes
- Insere novos registros
- Respeita rate limiting da API do Senado

### Sincronização Manual

- Pode ser executada via endpoint `/sync/manual`
- Útil para testes e atualizações pontuais
- Mesma lógica da sincronização automática

### Rate Limiting

- Máximo 10 requisições por segundo
- Intervalo mínimo de 100ms entre requisições
- Implementado automaticamente no serviço

## 🛠️ Arquitetura

```
src/
├── config/          # Configurações (banco de dados)
├── controllers/     # Controladores (não implementado)
├── database/        # Migrations e seeds
├── models/          # Modelos de dados
├── services/        # Lógica de negócio
├── types/           # Interfaces TypeScript
├── utils/           # Utilitários
└── index.ts         # Arquivo principal
```

### Principais Classes

- **SenadoApiService**: Comunicação com API do Senado
- **LegislacaoService**: Processamento de dados de legislação
- **CronService**: Gerenciamento de tarefas agendadas
- **LegislacaoModel**: Operações de banco de dados

## 📊 Monitoramento

### Logs

A aplicação gera logs detalhados sobre:

- Execução de jobs de sincronização
- Requisições à API do Senado
- Operações de banco de dados
- Erros e exceções

### Health Check

O endpoint `/health` retorna:

```json
{
  "status": "OK",
  "timestamp": "2025-06-16T13:03:31.331Z",
  "uptime": 42.753965385,
  "memory": {...},
  "version": "v22.13.0"
}
```

## 🚨 Tratamento de Erros

- Rate limiting automático
- Retry em caso de falhas temporárias
- Logs detalhados de erros
- Continuidade do processamento mesmo com falhas pontuais

## 🔒 Segurança

- CORS configurado para aceitar qualquer origem
- Validação de parâmetros de entrada
- Sanitização de dados
- Tratamento seguro de variáveis de ambiente

## 📈 Performance

- Conexão pool para PostgreSQL
- Rate limiting respeitando limites da API
- Processamento assíncrono
- Índices otimizados no banco de dados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs da aplicação
2. Consulte a documentação da API do Senado
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ para facilitar o acesso aos dados legislativos do Brasil**
