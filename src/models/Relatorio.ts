import { Aeronave } from "./Aeronave.js"
import { Peca } from "./Peca.js"
import { Etapa } from "./Etapa.js"
import { Teste } from "./Teste.js"
// @ts-ignore
import * as fs from "fs"

export class Relatorio {
  aeronave: Aeronave
  pecas: Peca[]
  etapas: Etapa[]
  testes: Teste[]
  cliente: string
  dataEntrega: string

  constructor(aeronave: Aeronave, pecas: Peca[], etapas: Etapa[], testes: Teste[], cliente: string, dataEntrega: string) {
    this.aeronave = aeronave
    this.pecas = pecas
    this.etapas = etapas
    this.testes = testes
    this.cliente = cliente
    this.dataEntrega = dataEntrega
  }

  gerarTexto(): string {
    let relatorio = `=== Relatório Final da Aeronave ===\n\n`
    relatorio += `Cliente: ${this.cliente}\n`
    relatorio += `Data de entrega: ${this.dataEntrega}\n`
    relatorio += `Código: ${this.aeronave.codigo}\n`
    relatorio += `Modelo: ${this.aeronave.modelo}\n`
    relatorio += `Tipo: ${this.aeronave.tipo}\n`
    relatorio += `Capacidade: ${this.aeronave.capacidade}\n`
    relatorio += `Alcance: ${this.aeronave.alcance}\n\n`

    relatorio += `--- Peças ---\n`
    this.pecas.forEach((p, i) => {
      relatorio += `${i + 1}. ${p.nome} | Tipo: ${p.tipo} | Fornecedor: ${p.fornecedor} | Status: ${p.status}\n`
    })

    relatorio += `\n--- Etapas ---\n`
    this.etapas.forEach((e, i) => {
      relatorio += `${i + 1}. ${e.nome} | Prazo: ${e.prazo} dias | Status: ${e.status} | Funcionários: ${e.funcionarios?.map(f => f.nome).join(", ") || "Nenhum"}\n`
    })

    relatorio += `\n--- Testes ---\n`
    this.testes.forEach((t, i) => {
      relatorio += `${i + 1}. ${t.tipo} | Resultado: ${t.resultado ?? "Não registrado"}\n`
    })

    return relatorio
  }

  salvarEmArquivo(caminho: string) {
    const conteudo = this.gerarTexto()
    fs.writeFileSync(caminho, conteudo, "utf-8")
    console.log(`Relatório salvo em ${caminho}`)
  }
}