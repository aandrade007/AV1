import { TipoPeca } from '../enums/TipoPeca.js'
import { StatusPeca } from '../enums/StatusPeca.js'

export class Peca {
    public nome: string
    public tipo: TipoPeca
    public fornecedor: string
    public status: StatusPeca

    constructor(nome: string, tipo: TipoPeca, fornecedor: string, status: StatusPeca = StatusPeca.EM_PRODUCAO) {
        this.nome = nome
        this.tipo = tipo
        this.fornecedor = fornecedor
        this.status = status
    }

    public atualizarStatus(novoStatus: StatusPeca): void {
        this.status = novoStatus
        console.log(`Status da peça ${this.nome} atualizado para: ${this.status}`)
    }
}