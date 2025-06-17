# Análise da API do Senado - Endpoints de Legislação

## Base URL
https://legis.senado.leg.br/dadosabertos

## Endpoints de Legislação Identificados

### 1. Detalhes de Norma
- **GET** `/dadosabertos/legislacao/{codigo}` - Detalhes de uma Norma Jurídica pelo código
- **GET** `/dadosabertos/legislacao/{tipo}/{numdata}/{anoseq}` - Detalhes de uma Norma Jurídica pela identificação (sigla/número/ano)

### 2. Pesquisa e Listagem
- **GET** `/dadosabertos/legislacao/lista` - Pesquisa de Normas Federais
- **GET** `/dadosabertos/legislacao/termos` - Pesquisa de Termos do Catálogo

### 3. Classificações e Tipos
- **GET** `/dadosabertos/legislacao/classes` - Lista Classificação de Normas Jurídicas, Projetos e Pronunciamentos
- **GET** `/dadosabertos/legislacao/tiposNorma` - Lista Tipos de Norma
- **GET** `/dadosabertos/legislacao/tiposPublicacao` - Lista de Tipos de Publicação
- **GET** `/dadosabertos/legislacao/tiposVide` - Lista de Tipos de Declaração
- **GET** `/dadosabertos/legislacao/tiposdeclaracao/detalhe` - Lista de Detalhes de Declaração

### 4. URN
- **GET** `/dadosabertos/legislacao/urn` - Detalhes de uma Norma Jurídica pela URN

## Limitações da API
- Máximo de 10 requisições por segundo (erro HTTP 429 se exceder)
- Evitar requisições em horários arredondados para prevenir picos de acesso

## Formatos Suportados
- JSON (application/json) - sufixo .json
- XML (application/xml) - sufixo .xml  
- CSV (text/csv) - sufixo .csv

## Próximos Passos
1. Testar endpoint `/dadosabertos/legislacao/lista` para entender estrutura dos dados
2. Testar endpoint `/dadosabertos/legislacao/tiposNorma` para obter tipos disponíveis
3. Implementar serviços para consumir estes endpoints
4. Mapear estrutura de resposta para nossos modelos TypeScript



## Estrutura de Resposta da API (Exemplo Real)

### Endpoint Testado
`GET https://legis.senado.leg.br/dadosabertos/legislacao/lista.json?ano=2024`

### Estrutura JSON de Resposta
```json
{
  "ListaDocumento": {
    "noNamespaceSchemaLocation": "https://legis.senado.leg.br/dadosabertos/dados/ListaDocumentov3.xsd",
    "Metadados": {
      "Versao": "16/06/2025 09:55:54",
      "VersaoServico": "3",
      "DataVersaoServico": "2017-02-01",
      "DescricaoDataSet": "Obtém a lista de Legislação Federal com base nos parâmetros informados."
    },
    "documentos": {
      "documento": [
        {
          "id": "39773159",
          "tipo": "ADCon",
          "descricao": "Acórdão da Ação Declaratória de Constitucionalidade",
          "numero": "84",
          "norma": "ADCon-84-2024-10-11",
          "normaNome": "Acórdão da Ação Declaratória de Constitucionalidade nº 84 de 11/10/2024",
          "ementa": "AÇÃO DECLARATÓRIA DE CONSTITUCIONALIDADE...",
          "dataassinatura": "11/10/2024",
          "anoassinatura": "2024",
          "apelido": "ADCon-84-2024-10-11"
        }
      ]
    }
  }
}
```

### Campos Principais Identificados
- **id**: Identificador único do documento
- **tipo**: Tipo da norma (ADCon, ADI, etc.)
- **descricao**: Descrição do tipo de norma
- **numero**: Número da norma
- **norma**: Código da norma
- **normaNome**: Nome completo da norma
- **ementa**: Texto da ementa
- **dataassinatura**: Data de assinatura (formato DD/MM/AAAA)
- **anoassinatura**: Ano de assinatura
- **apelido**: Apelido/identificação curta

### Observações
- A API retorna dados reais de legislação de 2024
- Estrutura aninhada: ListaDocumento > documentos > documento (array)
- Metadados incluem versão e descrição do dataset
- Datas em formato brasileiro (DD/MM/AAAA)

