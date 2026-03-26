# ✈️ AeroCode - Sistema de Gestão de Produção de Aeronaves

Este é um sistema **CLI (Command-Line Interface)** desenvolvido em **TypeScript** para gerenciar todo o ciclo de produção de aeronaves, desde o cadastro de peças e etapas até a geração do relatório final de entrega. 

O projeto foi desenvolvido como requisito acadêmico (AV1) e implementa conceitos de Orientação a Objetos, controle de nível de acesso e persistência de dados em arquivos locais (JSON).

## 🚀 Tecnologias Utilizadas
* **Node.js**
* **TypeScript** (Tipagem estática e compilação)
* **Módulo `fs` nativo** (Leitura e gravação assíncrona de arquivos `.json` e `.txt`)

## ⚙️ Pré-requisitos
Para rodar este projeto, você precisará ter o **[Node.js](https://nodejs.org/)** instalado na sua máquina.
Ou instalar pelo terminal:

`No Windows (usando Winget): winget install OpenJS.NodeJS`

`No Linux (Ubuntu): sudo apt install nodejs npm`

`No Mac (usando Homebrew): brew install node`

## 🛠️ Como Instalar e Executar

### 1. Clone o repositório para a sua máquina:
> git clone [https://github.com/aandrade007/AV1](https://github.com/aandrade007/AV1) <br><br>
> cd AV1

### 2. Instale as dependências do projeto:

> npm install

### 3. Compile o código TypeScript para JavaScript:
Este comando lerá os arquivos da pasta src/ e criará a versão executável na pasta dist/.

> npx tsc

### 4. Inicie o sistema:

> node dist/app.js
<br>

## 🔐 Primeiro Acesso (Login Padrão)
O sistema exige autenticação e esconde as funcionalidades de quem não está logado.

O sistema cria automaticamente um Administrador Mestre na primeira vez que você rodar o projeto.

Utilize as credenciais abaixo para o seu primeiro login:

> Usuário: admin

> Senha: 123

(A partir desse login, você terá permissão máxima para cadastrar aeronaves, peças e criar outros usuários como Engenheiros e Operadores).
