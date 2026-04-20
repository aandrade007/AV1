// O 'readline' é usado para interagir com o usuário na linha de comando.
// O 'fs/promises' e 'path' são usados para manipulação de arquivos e caminhos.
import * as readline from "readline"
import { promises as fs } from "fs"
import * as path from "path"
import { Aeronave } from "./models/Aeronave.js"
import { Peca } from "./models/Peca.js"
import { Etapa } from "./models/Etapa.js"
import { Funcionario } from "./models/Funcionario.js"
import { Teste } from "./models/Teste.js"
import { Relatorio } from "./models/Relatorio.js"
import { TipoTeste } from "./enums/TipoTeste.js"
import { ResultadoTeste } from "./enums/ResultadoTeste.js"
import { TipoAeronave } from "./enums/TipoAeronave.js"
import { TipoPeca } from "./enums/TipoPeca.js"
import { StatusPeca } from "./enums/StatusPeca.js"
import { StatusEtapa } from "./enums/StatusEtapa.js"
import { NivelPermissao } from "./enums/NivelPermissao.js"

// Interface para leitura
const rl = readline.createInterface ({
	input: process.stdin,
	output: process.stdout,
})

function perguntar(question: string): Promise<string> {
	return new Promise((resolve) => rl.question(question, resolve))
}

//caminhos para os arquivos de dados
const DATA_DIR = path.resolve(process.cwd(), "data")
const AERONAVES_FILE = path.join(DATA_DIR, "aeronaves.json")
const PECAS_FILE = path.join(DATA_DIR, "pecas.json")
const ETAPAS_FILE = path.join(DATA_DIR, "etapas.json")
const FUNCIONARIOS_FILE = path.join(DATA_DIR, "funcionarios.json")
const TESTES_FILE = path.join(DATA_DIR, "testes.json")

// Arrays em memória para armazenar os dados
// Eles agem como um banco de dados temporário.
let aeronaves: any[] = []
let pecas: any[] = []
let etapas: any[] = []
let funcionarios: any[] = []
let testes: any[] = []
let currentUser: any = null

async function ensureDataDir() {
	try {
		await fs.mkdir(DATA_DIR, { recursive: true })
	} 
	catch (err) {
		// Ignora o erro se o diretório já existir.
	}
}

// Salva os dados em um arquivo JSON.
async function salvarArquivo(file: string, data: any) {
	await ensureDataDir()
	await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8")
}

async function carregarArquivo(file: string): Promise<any[]> {
	try {
		const txt = await fs.readFile(file, "utf-8")
		return JSON.parse(txt)
	} 
	catch (err) {
		return []
	}
}

// Salva todos os arrays de dados em seus arquivos.
async function salvarTodos() {
	await Promise.all([
		salvarArquivo(AERONAVES_FILE, aeronaves),
		salvarArquivo(PECAS_FILE, pecas),
		salvarArquivo(ETAPAS_FILE, etapas),
		salvarArquivo(FUNCIONARIOS_FILE, funcionarios),
		salvarArquivo(TESTES_FILE, testes),
	])
}

// Carrega os dados de todos os arquivos JSON para os arrays em memória.
async function carregarTodos() {
	aeronaves = await carregarArquivo(AERONAVES_FILE)
	pecas = await carregarArquivo(PECAS_FILE)
	etapas = await carregarArquivo(ETAPAS_FILE)
	funcionarios = await carregarArquivo(FUNCIONARIOS_FILE)
	testes = await carregarArquivo(TESTES_FILE)

	if (funcionarios.length === 0) {
		const adminPadrao = new Funcionario("0", "Admin", "000", "Sede", "admin", "123", NivelPermissao.ADMINISTRADOR)
		funcionarios.push(adminPadrao)
		await salvarTodos()
	}
}

async function cadastrarFuncionario() {
	if (!exigirNivel([NivelPermissao.ADMINISTRADOR])()) return
	console.log("\n=== Cadastro de Funcionário ===")

	let novoIdNum = 1
	if (funcionarios.length > 0) {
		const maxId = Math.max(...funcionarios.map(f => parseInt(f.id) || 0))
		novoIdNum = maxId + 1
	}
	const id = novoIdNum.toString()
	const nome = (await perguntar("Nome: ")).trim()
	const telefone = (await perguntar("Telefone: ")).trim()
	const endereco = (await perguntar("Endereço: ")).trim()
	const usuario = (await perguntar("Usuário (login): ")).trim()
	if (funcionarios.find((f) => f.usuario === usuario)) {
		console.log("Usuário já existe!")
		return
	}
	const senha = (await perguntar("Senha: ")).trim()

	if (!nome || !usuario || !senha || !telefone || !endereco) {
		console.log("Erro: todos os campos são obrigatórios!")
		return
	}

	console.log("Nível: 1) ADMINISTRADOR  2) ENGENHEIRO  3) OPERADOR")
	const nivelStr = await perguntar("Escolha nível: ")
	let nivel: NivelPermissao
	if (nivelStr === "1") nivel = NivelPermissao.ADMINISTRADOR
	else if (nivelStr === "2") nivel = NivelPermissao.ENGENHEIRO
	else nivel = NivelPermissao.OPERADOR

	let f: any
	try {
		f = new Funcionario(id, nome, telefone, endereco, usuario, senha, nivel)
	} 
	catch (err) {
		f = { id, nome, telefone, endereco, usuario, senha, nivelPermissao: nivel }
	}
	funcionarios.push(f)
	await salvarTodos()

	console.log(`Funcionário cadastrado com sucesso! O ID gerado foi: ${id}`)
}

async function excluirFuncionario() {
	if (!exigirNivel([NivelPermissao.ADMINISTRADOR])()) return
	console.log("\n=== Excluir Funcionário ===")

	if (funcionarios.length === 0) {
		console.log("Nenhum funcionário cadastrado.")
		return
	}

	console.log("\nFuncionários cadastrados:")
	funcionarios.forEach(f => {
		console.log(`  [${f.id}] ${f.nome} - ${f.usuario} (${f.nivelPermissao})`)
	})

	const idBusca = (await perguntar("\nDigite o ID do funcionário a excluir: ")).trim()

	if (!idBusca) {
		console.log("ID inválido.")
		return
	}

	const index = funcionarios.findIndex(f => f.id === idBusca)

	if (index === -1) {
		console.log("Funcionário não encontrado.")
		return
	}

	const funcionario = funcionarios[index]

	if (funcionario.usuario === currentUser?.usuario) {
		console.log("Você não pode excluir sua própria conta.")
		return
	}

	const confirmacao = (await perguntar(`Confirma exclusão de "${funcionario.nome}"? (s/n): `)).trim().toLowerCase()

	if (confirmacao !== "s") {
		console.log("Exclusão cancelada.")
		return
	}

	funcionarios[index].ativo = false
	await salvarTodos()

	console.log(`Funcionário "${funcionario.nome}" excluído com sucesso!`)
}

function listarFuncionarios() {
	const ativos = funcionarios.filter(f => f.ativo !== false)
	console.log("\n=== Listagem de Funcionários ===")
	if (ativos.length === 0) {
		console.log("Nenhum funcionário cadastrado.")
		return
	}

	console.log("------------------------------------------------------------")
	console.log("ID | Nome | Usuário | Nível de Permissão")
	console.log("------------------------------------------------------------")
	
	ativos.forEach((f) => {
		const nivelNome =  f.nivelPermissao
		console.log(`${f.id} | ${f.nome} | ${f.usuario} | ${nivelNome}`)
	})
	console.log("------------------------------------------------------------")
}

async function autenticar() {
	console.log("\n=== Autenticação ===")
	while (true) {
		const usuario = await perguntar("Usuário (ou digite 'sair' para voltar): ")
		
		if (usuario.toLowerCase() === "sair") {
			console.log("Autenticação cancelada.")
			return
		}

		const senha = await perguntar("Senha: ")
		const f = funcionarios.find((x) => x.usuario === usuario && x.senha === senha)
		
		if (!f) {
			console.log("Usuário ou senha inválidos! Tente novamente\n")
		} 
		else {
			currentUser = f
			console.log(`Autenticado como ${f.nome}`)
			return
		}
	}
}

function exigirAutenticacao() {
	if (!currentUser) {
		console.log("Ação restrita: faça login primeiro.")
		return false
	}
	return true
}

function exigirNivel(minNivel: NivelPermissao | NivelPermissao[]) {
	return (): boolean => {
		if (!exigirAutenticacao()) return false
		const allowed = Array.isArray(minNivel) ? minNivel : [minNivel]

		if (!allowed.includes(currentUser.nivelPermissao)) {
			console.log("Permissão insuficiente para executar essa ação.")
			return false
		}
		return true
	}
}

async function cadastrarAeronave() {
	if (!exigirNivel([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])()) return

	console.log("\n=== Cadastro de Aeronave ===")
	const codigo = await perguntar("Código único: ")
	if (aeronaves.find((a) => a.codigo === codigo)) {
		console.log("Já existe aeronave com esse código!")
		return
	}
	const modelo = await perguntar("Modelo: ")
	console.log("Tipo: 1) COMERCIAL  2) MILITAR")
	const tipoStr = await perguntar("Escolha o tipo: ")
	let tipo: TipoAeronave
	if (tipoStr === "1") tipo = TipoAeronave.COMERCIAL
	else if (tipoStr === "2") tipo = TipoAeronave.MILITAR
	else { console.log("Tipo inválido"); return }

	const capacidadeStr = await perguntar("Capacidade (número): ")
	const alcanceStr = await perguntar("Alcance (km): ")
	const capacidade = Number(capacidadeStr) || 0
	const alcance = Number(alcanceStr) || 0

	let a: any
	try {
		a = new Aeronave(codigo, modelo, tipo, capacidade, alcance)
	} 
	catch (err) {
		a = { codigo, modelo, tipo, capacidade, alcance, pecas: [], etapas: [], testes: [] }
	}

	aeronaves.push(a)
	await salvarTodos()
	console.log("Aeronave cadastrada.")
}

function listarAeronaves() {
	console.log("\n=== Listagem de Aeronaves ===")
	if (aeronaves.length === 0) {
		console.log("Nenhuma aeronave cadastrada.")
		return
	}
	for (const a of aeronaves) {
		console.log("-------------")
		console.log(`Código: ${a.codigo}`)
		console.log(`Modelo: ${a.modelo}`)
		console.log(`Tipo: ${a.tipo}`)
		console.log(`Capacidade: ${a.capacidade}`)
		console.log(`Alcance: ${a.alcance}`)

		const pecasQtd = pecas.filter((p) => p.aeronaveCodigo === a.codigo).length
		const etapasQtd = etapas.filter((e) => e.aeronaveCodigo === a.codigo).length
		console.log(`Peças: ${pecasQtd}  Etapas: ${etapasQtd}`)
	}
}

async function cadastrarPeca() {
	if (!exigirNivel([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])()) return

	console.log("\n=== Cadastro de Peça ===")
	const aeronaveCodigo = await perguntar("Código da aeronave que receberá a peça (ou ENTER para cadastrar sem vínculo): ")
	if (aeronaveCodigo && !aeronaves.find((a) => a.codigo === aeronaveCodigo)) {
		console.log("Aeronave não encontrada!")
		return
	}
	const nome = await perguntar("Nome da peça: ")
	console.log("Tipo: 1) NACIONAL  2) IMPORTADA")
	const tipoStr = await perguntar("Escolha tipo: ")
	let tipo: TipoPeca
	if (tipoStr === "1") tipo = TipoPeca.NACIONAL
	else if (tipoStr === "2") tipo = TipoPeca.IMPORTADA
	else { console.log("Tipo inválido"); return }

	const fornecedor = await perguntar("Fornecedor: ")
	console.log("Status: 1) EM PRODUCAO  2) EM TRANSPORTE  3) PRONTA")
	const statusStr = await perguntar("Escolha status: ")
	let status: StatusPeca
	if (statusStr === "1") status = StatusPeca.EM_PRODUCAO
	else if (statusStr === "2") status = StatusPeca.EM_TRANSPORTE
	else status = StatusPeca.PRONTA

	let p: any
	try {
		p = new Peca(nome, tipo, fornecedor, status)
		p.aeronaveCodigo = aeronaveCodigo || null
	} catch (err) {
		p = { nome, tipo, fornecedor, status, aeronaveCodigo: aeronaveCodigo || null }
	}

	pecas.push(p)
	await salvarTodos()
	console.log("Peça cadastrada.")
}

async function atualizarStatusPeca() {
	if (!exigirNivel([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])()) return

	console.log("\n=== Atualizar Status da Peça ===")
	
	// se a peça for "solta" (estoque geral)
	const codigoAero = await perguntar("Código da aeronave (ou aperte ENTER se a peça não estiver vinculada): ")

	if (codigoAero) {
		const aero = aeronaves.find((a) => a.codigo === codigoAero)
		if (!aero) {
			console.log("Aeronave não encontrada.")
			return
		}
	}

	const nome = await perguntar("Nome da peça (exato): ")
	const p = pecas.find((x) => x.nome === nome && (x.aeronaveCodigo || "") === codigoAero)
	
	if (!p) {
		if (codigoAero) {
			console.log(`Peça '${nome}' não encontrada na aeronave '${codigoAero}'.`)
		} else {
			console.log(`Peça '${nome}' sem vínculo não encontrada no estoque.`)
		}
		return
	}

	console.log(`Status atual: ${p.status}`)
	console.log("Novo status: 1) EM PRODUCAO  2) EM TRANSPORTE  3) PRONTA")
	const s = await perguntar("Escolha: ")
	
	if (s === "1") p.status = StatusPeca.EM_PRODUCAO
	else if (s === "2") p.status = StatusPeca.EM_TRANSPORTE
	else if (s === "3") p.status = StatusPeca.PRONTA
	else { 
		console.log("Valor inválido")
		return 
	}
	
	await salvarTodos()
	console.log("Status atualizado com sucesso.")
}

async function gerenciarEtapas() {
	if (!exigirNivel([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])()) return

	const cod = await perguntar("Código da Aeronave: ")
	const aero = aeronaves.find(a => a.codigo === cod)
	if (!aero) return console.log("Aeronave não encontrada.")

	console.log("\n1-Nova Etapa | 2-Iniciar | 3-Finalizar | 4-Excluir")
	const op = await perguntar("Escolha: ")

	if (!aero.etapas) aero.etapas = []

	if (op === "1") {
		const nome = await perguntar("Nome: ")
		const prazo = await perguntar("Prazo (dias): ")
		const novaEtapa = new Etapa(nome, prazo)
		
		aero.etapas.push(novaEtapa)
		etapas.push({ ...novaEtapa, aeronaveCodigo: cod })
		
		console.log("Etapa cadastrada com sucesso.")
	} 
	else {
		const nome = await perguntar("Nome da etapa: ")
		const etapa = aero.etapas.find((e: any) => e.nome === nome)
		
		if (!etapa) return console.log("Etapa não encontrada nesta aeronave.")

		try {
			if (op === "2") {
				const idx = aero.etapas.indexOf(etapa)
				if (idx > 0 && aero.etapas[idx - 1].status !== StatusEtapa.CONCLUIDA) {
					throw new Error("A etapa anterior deve estar concluída.")
				}
				etapa.status = StatusEtapa.ANDAMENTO
				console.log("Etapa iniciada.")
			} 
			else if (op === "3") {
				const idx = aero.etapas.indexOf(etapa)
				if (idx > 0 && aero.etapas[idx - 1].status !== StatusEtapa.CONCLUIDA) {
					throw new Error("A etapa anterior deve estar concluída antes de finalizar esta.")
				}
				if (etapa.status !== StatusEtapa.ANDAMENTO) {
					throw new Error("A etapa precisa estar em andamento para ser concluída.")
				}
				etapa.status = StatusEtapa.CONCLUIDA
				console.log("Etapa concluída.")
			}
			else if (op === "4") {
				aero.etapas = aero.etapas.filter((e: any) => e.nome !== nome)
				etapas = etapas.filter((e: any) => !(e.nome === nome && e.aeronaveCodigo === cod))
				console.log("Etapa excluída com sucesso.")
			}
			else {
				console.log("Opção inválida.")
			}
		} 
		catch (e: any) {
			console.log(`\n ${e.message}`)
		}
	}
	await salvarTodos()
}

async function listarEtapasDaAeronave() {
	const codigo = await perguntar("Código da aeronave: ")
	const aero = aeronaves.find(a => a.codigo === codigo)
	
	if (!aero || !aero.etapas || aero.etapas.length === 0) {
		console.log("Nenhuma etapa encontrada para esta aeronave.")
		return
	}

	console.log(`\n=== Etapas da Aeronave ${codigo} ===`)
	aero.etapas.forEach((e: any, i: number) => {
		console.log(`${i + 1}. Nome: ${e.nome} | Status: ${e.status} | Prazo: ${e.prazo}`)
		if (e.funcionarios && e.funcionarios.length > 0) {
				console.log(`   Funcionários: ${e.funcionarios.map((f: any) => f.nome).join(", ")}`)
		}
	})
}

async function associarFuncionarioEtapa() {
	if (!exigirNivel([NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO])()) return

	const codAero = await perguntar("Código da aeronave: ")
	const aero = aeronaves.find(a => a.codigo === codAero)
	if (!aero) {
		console.log("Aeronave não encontrada.")
		return
	}

	const nomeEtapa = await perguntar("Nome da etapa: ")
	const etapa = aero.etapas.find((e: any) => e.nome === nomeEtapa)
	if (!etapa) {
		console.log("Etapa não encontrada nesta aeronave.")
		return
	}

    const idFuncionario = await perguntar("ID do funcionário para associar: ")
	const funcionario = funcionarios.find((f) => f.id === idFuncionario)
	if (!funcionario) {
		console.log("Funcionário não encontrado.")
		return
	}

	if (!etapa.funcionarios) etapa.funcionarios = []

	if (etapa.funcionarios.find((f: any) => f.id === funcionario.id)) {
		console.log("Funcionário já está associado a esta etapa.")
		return
	}

	etapa.funcionarios.push(funcionario)

	const etapaGlobal = etapas.find((e: any) => e.nome === nomeEtapa && e.aeronaveCodigo === codAero)
	if (etapaGlobal) {
		if (!etapaGlobal.funcionarios) etapaGlobal.funcionarios = []
		etapaGlobal.funcionarios.push(funcionario)
	}

	await salvarTodos()
	console.log("Funcionário associado à etapa com sucesso.")
}

async function cadastrarTeste() {
	console.log("\n=== Cadastro de Teste ===")
	console.log("1. Elétrico")
	console.log("2. Hidráulico")
	console.log("3. Aerodinâmico")
	const tipoStr: string = await perguntar("Escolha o tipo: ")
	let tipo: TipoTeste
	switch (tipoStr) {
		case "1":
			tipo = TipoTeste.ELETRICO
			break
		case "2":
			tipo = TipoTeste.HIDRAULICO
			break
		case "3":
			tipo = TipoTeste.AERODINAMICO
			break
		default:
			console.log("Tipo inválido!")
			return
	}

	console.log("\nResultado do teste:")
	console.log("1. Aprovado")
	console.log("2. Reprovado")
	const resStr: string = await perguntar("Digite o resultado: ")
	let resultado: ResultadoTeste
	if (resStr === "1") resultado = ResultadoTeste.APROVADO
	else if (resStr === "2") resultado = ResultadoTeste.REPROVADO
	else {
		console.log("Resultado inválido!")
		return
	}

	const aeronaveCodigo = await perguntar("Código da aeronave testada: ")
	if (!aeronaves.find((a) => a.codigo === aeronaveCodigo)) {
		console.log("Aeronave não encontrada!")
		return
	}

	let t: any
	try {
		t = new Teste(tipo, resultado)
		t.aeronaveCodigo = aeronaveCodigo
		t.data = new Date().toISOString()
	} 
	catch (err) {
		t = { tipo, resultado, aeronaveCodigo, data: new Date().toISOString() }
	}

	testes.push(t)
	await salvarTodos()
	console.log("Teste registrado com sucesso!")
}

async function gerarRelatorio() {
	console.log("\n=== Gerar Relatório Final ===")
	const codigo = await perguntar("Código da aeronave para gerar relatório: ")
	const aeronave = aeronaves.find((a) => a.codigo === codigo)
	if (!aeronave) {
		console.log("Aeronave não encontrada.")
		return
	}

	const pecasDaAeronave = pecas.filter((p) => p.aeronaveCodigo === codigo)
	const etapasDaAeronave = etapas.filter((e) => e.aeronaveCodigo === codigo)
	const testesDaAeronave = testes.filter((t) => t.aeronaveCodigo === codigo)

	const lines: string[] = []
	lines.push("=== Relatório Final de Aeronave ===")
	lines.push(`Gerado em: ${new Date().toLocaleString()}`)
	lines.push("")
	lines.push("-- Aeronave --")
	lines.push(`Código: ${aeronave.codigo}`)
	lines.push(`Modelo: ${aeronave.modelo}`)
	lines.push(`Tipo: ${aeronave.tipo}`)
	lines.push(`Capacidade: ${aeronave.capacidade}`)
	lines.push(`Alcance: ${aeronave.alcance}`)
	lines.push("")

	lines.push("-- Peças --")
    if (pecasDaAeronave.length === 0) lines.push("Nenhuma peça associada.")
	else pecasDaAeronave.forEach((p, i) => {
		lines.push(`${i + 1}. Nome: ${p.nome}  Tipo: ${p.tipo}  Fornecedor: ${p.fornecedor}  Status: ${p.status}`)
	})
	lines.push("")

	lines.push("-- Etapas --")
	if (etapasDaAeronave.length === 0) lines.push("Nenhuma etapa.")
	else etapasDaAeronave.forEach((e, i) => {
		lines.push(`${i + 1}. Nome: ${e.nome}  Prazo: ${e.prazo}  Status: ${e.status}`)
		lines.push(`   Funcionários: ${e.funcionarios?.map((f: any) => f.nome || f.id || f).join(", ") || "Nenhum"}`)
	})
	lines.push("")

	lines.push("-- Testes --")
	if (testesDaAeronave.length === 0) lines.push("Nenhum teste registrado.")
	else testesDaAeronave.forEach((t, i) => {
		lines.push(`${i + 1}. Tipo: ${t.tipo}  Resultado: ${t.resultado}  Data: ${t.data || "N/A"}`)
	})

	const cliente = await perguntar("Nome do cliente: ")
	const dataEntrega = await perguntar("Data de entrega (xx/xx/xxxx): ")
	const relatorioTxt = lines.join("\n")
	const outFile = path.join(DATA_DIR, `relatorio_${codigo}.txt`)
	await fs.writeFile(outFile, relatorioTxt, "utf-8")
	console.log(`Relatório salvo em ${outFile}`)
	try {
		const r = new Relatorio(aeronave, pecasDaAeronave, etapasDaAeronave, testesDaAeronave, cliente, dataEntrega)
		if (typeof r.salvarEmArquivo === "function") {
			r.salvarEmArquivo(outFile)
		}
	} 
	catch (err) {
		// Apenas ignora se a classe Relatorio não tiver o método 'salvarEmArquivo'.
	}
}

(async () => {
	await carregarTodos()
})()

async function resetarSistema() {
	if (!exigirNivel([NivelPermissao.ADMINISTRADOR])()) return

	console.log("\n⚠️  CUIDADO: ÁREA DE PERIGO ⚠️")
	console.log("Isso apagará todas as aeronaves, peças, etapas, testes e funcionários!")
	console.log("Caso Reset o sistema o login para acessar será:")
    console.log("ID: 0")
    console.log("Usuário: admin")
    console.log("Senha: 123")
    console.log("\n")
	const confirmacao = await perguntar("Tem CERTEZA ABSOLUTA que deseja resetar o sistema? (S/N): ")
	
	if (confirmacao.toUpperCase() !== "S") {
		console.log("Operação de reset cancelada.")
		return
	}

	aeronaves = []
	pecas = []
	etapas = []
	testes = []
	currentUser = null

	//Recria o Admin
	const adminPadrao = new Funcionario(
		"0", 
		"Admin", 
		"000000000", 
		"Sede Aerocode", 
		"admin", 
		"123", 
		NivelPermissao.ADMINISTRADOR
	)
	
	funcionarios = [adminPadrao]
	await salvarTodos()

	console.log("Sistema resetado com sucesso!")
	console.log("Para entrar novamente, use o usuário 'admin' e senha '123'!")
}

async function menu() {
	console.log("\n=== Sistema de Produção de Aeronaves (Aerocode) ===")
	
	if (currentUser) {
		console.log(`Usuário atual: ${currentUser.nome} - Nível: ${currentUser.nivelPermissao}`)
	} 
	else {
		console.log("Usuário atual: Nenhum")
	}

	if (!currentUser) {
		console.log("1. Login")
		console.log("0. Sair do Projeto")
		
		const opcao = await perguntar("Escolha: ")
		if (opcao === "1") {
			await autenticar()
		} 
		else if (opcao === "0") {
			console.log("Saindo do sistema...")
			rl.close()
			return
		} 
		else {
			console.log("Opção inválida, faça login.")
		}
		
		await menu()
		return
	}

	const nivel = currentUser.nivelPermissao
	const isAdmin = nivel === NivelPermissao.ADMINISTRADOR || nivel === "ADMINISTRADOR"
	const isEngenheiro = nivel === NivelPermissao.ENGENHEIRO || nivel === "ENGENHEIRO"

	if (isAdmin) {
		console.log("2. Cadastrar Funcionário")
		console.log("3. Excluir Funcionário")
	}

	console.log("4. Listar Funcionários")

	if (isAdmin || isEngenheiro) {
		console.log("5. Cadastrar Aeronave")
	}

	console.log("6. Listar Aeronaves")

	if (isAdmin || isEngenheiro) {
		console.log("7. Cadastrar Peça")
		console.log("8. Atualizar Status da Peça")
		console.log("9. Gerenciar Etapas (Nova/Iniciar/Fim/Excluir)")
	}

	console.log("10. Listar Etapas de Aeronave")

	if (isAdmin || isEngenheiro) {
		console.log("11. Associar Funcionário a Etapa")
	}

	console.log("12. Registrar Teste")
	console.log("13. Gerar Relatório Final")
	console.log("14. Sair da Conta")
	console.log("0. Sair do Projeto")

	if (isAdmin) {
		console.log("99. Apagar todos os dados")
	}

	const opcao = await perguntar("Escolha: ")
	
	switch (opcao) {
		case "2": 
			await cadastrarFuncionario()
			break
		case "3": 
			await excluirFuncionario()
			break
		case "4": 
			listarFuncionarios()
			break
		case "5": 
			await cadastrarAeronave()
			break
		case "6": 
			listarAeronaves()
			break
		case "7": 
			await cadastrarPeca()
			break
		case "8": 
			await atualizarStatusPeca()
			break
		case "9": 
			await gerenciarEtapas()
			break
		case "10": 
			await listarEtapasDaAeronave()
			break
		case "11": 
			await associarFuncionarioEtapa()
			break
		case "12": 
			await cadastrarTeste()
			break
		case "13": 
			await gerarRelatorio()
			break
		case "14": 
			console.log("Saindo da conta...")
			currentUser = null
			console.clear()
			break
		case "99": 
			await resetarSistema()
			break
		case "0":
			console.log("Saindo...")
			rl.close()
			return
		default:
			console.log("Opção inválida.")
	}

	await menu()
}
menu()