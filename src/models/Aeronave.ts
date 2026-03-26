import { TipoAeronave } from '../enums/TipoAeronave.js'
import { Peca } from './Peca.js'
import { Etapa } from './Etapa.js'
import { Teste } from './Teste.js'

export class Aeronave {
    public codigo: string
    public modelo: string
    public tipo: TipoAeronave
    public capacidade: number
    public alcance: number

    public pecas: Array<Peca> = []
    public etapas: Array<Etapa> = []
    public testes: Array<Teste> = []

    constructor(codigo: string, modelo: string, tipo: TipoAeronave, capacidade: number, alcance: number) {
        this.codigo = codigo
        this.modelo = modelo
        this.tipo = tipo
        this.capacidade = capacidade
        this.alcance = alcance
    }

    public detalhes(): void {
        console.log(`\n=== Detalhes da Aeronave [${this.codigo}] ===`) 
        console.log(`Modelo: ${this.modelo} | Tipo: ${this.tipo}`) 
        console.log(`Capacidade: ${this.capacidade} passageiros | Alcance: ${this.alcance} km`) 
        console.log(`Total de Peças: ${this.pecas.length}`) 
        console.log(`Total de Etapas: ${this.etapas.length}`) 
        console.log(`Total de Testes: ${this.testes.length}`) 
        console.log(`=========================================\n`) 
    }
}