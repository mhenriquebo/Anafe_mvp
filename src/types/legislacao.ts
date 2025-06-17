export interface DocumentoLegislacao {
  id: string;
  tipo: string;
  descricao: string;
  numero: string;
  norma: string;
  normaNome: string;
  ementa: string;
  dataassinatura?: string;
  anoassinatura?: string;
  apelido?: string;
}

export interface MetadadosApi {
  Versao: string;
  VersaoServico: string;
  DataVersaoServico: string;
  DescricaoDataSet: string;
}

export interface ListaDocumento {
  noNamespaceSchemaLocation: string;
  Metadados: MetadadosApi;
  documentos: {
    documento: DocumentoLegislacao[];
  };
}

export interface ApiResponse<T> {
  ListaDocumento?: ListaDocumento;
}

// Interface para banco de dados (mapeamento dos dados da API)
export interface Legislacao {
  id?: number;
  codigo: string; // campo 'norma' da API
  tipo: string;
  numero: string;
  normaNome: string;
  descricao?: string;
  ementa?: string;
  dataAssinatura?: Date;
  anoAssinatura?: number;
  apelido?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
