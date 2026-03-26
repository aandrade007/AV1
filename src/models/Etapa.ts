import { StatusEtapa } from '../enums/StatusEtapa.js'
import { Funcionario } from './Funcionario.js'

export class Etapa {
    public nome: string
    public prazo: string
    public status: StatusEtapa
    public funcionarios: Array<Funcionario> = []

    constructor(nome: string, prazo: string) {
        this.nome = nome
        this.prazo = prazo
        this.status = StatusEtapa.PENDENTE
    }

    public iniciar(): void {
        if (this.status !== StatusEtapa.PENDENTE) {
            throw new Error(`A etapa '${this.nome}' não pode ser iniciada pois está com status: ${this.status}`)
        }
        this.status = StatusEtapa.ANDAMENTO
        console.log(`Etapa '${this.nome}' iniciada.`)
    }

    public finalizar(): void {
        if (this.status !== StatusEtapa.ANDAMENTO) {
            throw new Error(`A etapa '${this.nome}' precisa estar em andamento para ser finalizada.`)
        }
        this.status = StatusEtapa.CONCLUIDA
        console.log(`Etapa '${this.nome}' concluída.`)
    }

    public associarFuncionario(f: Funcionario): void {
        const existe = this.funcionarios.find(func => func.id === f.id)
        if (!existe) {
            this.funcionarios.push(f)
            console.log(`Funcionário ${f.nome} associado à etapa ${this.nome}.`)
        } else {
            console.log(`Funcionário ${f.nome} já está associado a esta etapa.`)
        }
    }

    public listarFuncionarios(): Array<Funcionario> {
        return this.funcionarios
    }
}