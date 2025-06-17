import db from '../config/database';
import { Legislacao } from '../types/legislacao';

export class LegislacaoModel {
  static async findAll(): Promise<Legislacao[]> {
    return db('legislacoes').select('*');
  }

  static async findById(id: number): Promise<Legislacao | undefined> {
    return db('legislacoes').where({ id }).first();
  }

  static async findByCodigo(codigo: string): Promise<Legislacao | undefined> {
    return db('legislacoes').where({ codigo }).first();
  }

  static async create(legislacao: Omit<Legislacao, 'id'>): Promise<Legislacao> {
    const [created] = await db('legislacoes')
      .insert({
        codigo: legislacao.codigo,
        tipo: legislacao.tipo,
        numero: legislacao.numero,
        norm_nome: legislacao.normaNome,
        descricao: legislacao.descricao,
        ementa: legislacao.ementa,
        data_assinatura: legislacao.dataAssinatura,
        ano_assinatura: legislacao.anoAssinatura,
        apelido: legislacao.apelido,
      })
      .returning('*');
    return created;
  }

  static async update(
    id: number,
    legislacao: Partial<Legislacao>
  ): Promise<Legislacao | undefined> {
    const [updated] = await db('legislacoes')
      .where({ id })
      .update({
        codigo: legislacao.codigo,
        tipo: legislacao.tipo,
        numero: legislacao.numero,
        norm_nome: legislacao.normaNome,
        descricao: legislacao.descricao,
        ementa: legislacao.ementa,
        data_assinatura: legislacao.dataAssinatura,
        ano_assinatura: legislacao.anoAssinatura,
        apelido: legislacao.apelido,
        updated_at: new Date(),
      })
      .returning('*');
    return updated;
  }

  static async delete(id: number): Promise<boolean> {
    const deleted = await db('legislacoes').where({ id }).del();
    return deleted > 0;
  }

  static async upsertByCodigo(
    legislacao: Omit<Legislacao, 'id'>
  ): Promise<Legislacao> {
    const existing = await this.findByCodigo(legislacao.codigo);

    if (existing) {
      return this.update(existing.id!, legislacao) as Promise<Legislacao>;
    } else {
      return this.create(legislacao);
    }
  }

  static async findByAno(ano: number): Promise<Legislacao[]> {
    return db('legislacoes').where({ ano_assinatura: ano });
  }

  static async findByTipo(tipo: string): Promise<Legislacao[]> {
    return db('legislacoes').where({ tipo });
  }
}
