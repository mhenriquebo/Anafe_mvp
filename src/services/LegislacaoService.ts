import { LegislacaoModel } from '../models/LegislacaoModel';
import { DocumentoLegislacao, Legislacao } from '../types/legislacao';
import { SenadoApiService } from './SenadoApiService';

export class LegislacaoService {
  private senadoApi: SenadoApiService;

  constructor() {
    this.senadoApi = new SenadoApiService();
  }

  // Converte data do formato DD/MM/AAAA para Date
  private parseDataAssinatura(dataStr?: string): Date | undefined {
    if (!dataStr) return undefined;

    const [dia, mes, ano] = dataStr.split('/');
    if (dia && mes && ano) {
      return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    }
    return undefined;
  }

  // Mapeia documento da API para interface de banco
  private mapDocumentoToLegislacao(
    doc: DocumentoLegislacao
  ): Omit<Legislacao, 'id'> {
    return {
      codigo: doc.norma,
      tipo: doc.tipo,
      numero: doc.numero,
      normaNome: doc.normaNome,
      descricao: doc.descricao,
      ementa: doc.ementa,
      dataAssinatura: this.parseDataAssinatura(doc.dataassinatura),
      anoAssinatura: doc.anoassinatura
        ? parseInt(doc.anoassinatura)
        : undefined,
      apelido: doc.apelido,
    };
  }

  // Busca e salva legislação por ano
  async buscarESalvarPorAno(
    ano: number
  ): Promise<{ total: number; novos: number; atualizados: number }> {
    try {
      console.log(`Buscando legislação do ano ${ano}...`);

      const response = await this.senadoApi.buscarListaLegislacao({ ano });

      if (!response.ListaDocumento?.documentos?.documento) {
        console.log('Nenhum documento encontrado');
        return { total: 0, novos: 0, atualizados: 0 };
      }

      const documentos = response.ListaDocumento.documentos.documento;
      let novos = 0;
      let atualizados = 0;

      console.log(`Processando ${documentos.length} documentos...`);

      for (const doc of documentos) {
        try {
          const legislacao = this.mapDocumentoToLegislacao(doc);
          if (!legislacao?.codigo || !legislacao?.tipo || !legislacao?.numero) {
            console.log(
              `Documento ${doc.id} ignorado: faltando campos obrigatórios`
            );
            continue;
          }

          const existente = await LegislacaoModel.findByCodigo(
            legislacao.codigo
          );

          if (existente) {
            await LegislacaoModel.update(existente.id!, legislacao);
            atualizados++;
          } else {
            await LegislacaoModel.create(legislacao);
            novos++;
          }
        } catch (error) {
          console.error(`Erro ao processar documento ${doc.id}:`, error);
        }
      }

      console.log(
        `Processamento concluído: ${novos} novos, ${atualizados} atualizados`
      );

      return {
        total: documentos.length,
        novos,
        atualizados,
      };
    } catch (error) {
      console.error(`Erro ao buscar legislação do ano ${ano}:`, error);
      throw error;
    }
  }

  // Busca e salva legislação dos últimos anos
  async buscarESalvarRecentes(): Promise<void> {
    const anoAtual = new Date().getFullYear();
    const anos = [anoAtual, anoAtual - 1, anoAtual - 2]; // Últimos 3 anos

    for (const ano of anos) {
      try {
        await this.buscarESalvarPorAno(ano);
        // Pequena pausa entre requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erro ao processar ano ${ano}:`, error);
      }
    }
  }

  // Busca legislação por tipo
  async buscarESalvarPorTipo(
    tipo: string,
    ano?: number
  ): Promise<{ total: number; novos: number; atualizados: number }> {
    try {
      console.log(
        `Buscando legislação do tipo ${tipo}${ano ? ` do ano ${ano}` : ''}...`
      );

      const params: any = { tipo };
      if (ano) params.ano = ano;

      const response = await this.senadoApi.buscarListaLegislacao(params);

      if (!response.ListaDocumento?.documentos?.documento) {
        console.log('Nenhum documento encontrado');
        return { total: 0, novos: 0, atualizados: 0 };
      }

      const documentos = response.ListaDocumento.documentos.documento;
      let novos = 0;
      let atualizados = 0;

      for (const doc of documentos) {
        try {
          const legislacao = this.mapDocumentoToLegislacao(doc);
          const existente = await LegislacaoModel.findByCodigo(
            legislacao.codigo
          );

          if (existente) {
            await LegislacaoModel.update(existente.id!, legislacao);
            atualizados++;
          } else {
            await LegislacaoModel.create(legislacao);
            novos++;
          }
        } catch (error) {
          console.error(`Erro ao processar documento ${doc.id}:`, error);
        }
      }

      return {
        total: documentos.length,
        novos,
        atualizados,
      };
    } catch (error) {
      console.error(`Erro ao buscar legislação do tipo ${tipo}:`, error);
      throw error;
    }
  }
}
