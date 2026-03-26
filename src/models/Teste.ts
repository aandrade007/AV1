import { TipoTeste } from '../enums/TipoTeste.js'
import { ResultadoTeste } from '../enums/ResultadoTeste.js'

export class Teste {
    public tipo: TipoTeste
    public resultado: ResultadoTeste

    constructor(tipo: TipoTeste, resultado: ResultadoTeste) {
        this.tipo = tipo
        this.resultado = resultado
    }
}