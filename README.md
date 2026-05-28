# CarbonLedger

Sistema Web3 para compensação de carbono utilizando blockchain, créditos tokenizados e NFTs ambientais.

O projeto permite que empresas produtoras criem projetos ambientais e vendam créditos de carbono para empresas compradoras que desejam compensar suas emissões de CO₂.

---

# Problema

Empresas possuem dificuldade em comprovar de forma transparente, auditável e descentralizada suas ações de compensação ambiental.

Além disso:

- processos tradicionais possuem baixa rastreabilidade;
- validações dependem de intermediários;
- créditos de carbono possuem pouca transparência;
- comprovação ambiental pode ser manipulada ou centralizada.

O CarbonLedger resolve esse problema utilizando blockchain para registrar projetos ambientais, compras de créditos e certificações verdes de forma pública e imutável.

---

# Solução

A plataforma conecta:

- empresas produtoras de créditos de carbono;
- empresas compradoras que precisam compensar emissões.

Toda operação ocorre em blockchain através de smart contracts.

O sistema permite:

- criação de projetos ambientais;
- compra de créditos tokenizados;
- rastreamento público das operações;
- validação auditável das compensações;
- emissão automática de NFT Verde para empresas sustentáveis.

---

# Funcionalidades

## Empresas Produtoras

- Cadastro de empresa
- Criação de projetos ambientais
- Definição:
  - tipo do projeto
  - duração
  - quantidade de créditos
  - preço por crédito
- Dashboard de vendas
- Receita estimada
- Histórico de vendas

---

## Empresas Compradoras

- Cadastro de empresa
- Registro de emissão de CO₂
- Compra de créditos de carbono
- Controle automático da cota necessária
- Dashboard ambiental
- Histórico de compras
- Recebimento de NFT Verde ao compensar emissões

---

# Tecnologias Utilizadas

## Frontend

- React
- Vite
- TailwindCSS
- React Router DOM
- Ethers.js

---

## Blockchain

- Solidity
- Hardhat
- OpenZeppelin
- MetaMask

---

# Arquitetura da Solução

```txt
Frontend React
      ↓
Ethers.js
      ↓
MetaMask
      ↓
Smart Contracts Solidity
      ↓
Blockchain Ethereum (Testnet)
```

---

# Estrutura do Projeto

```bash
CarbonLedger/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── contracts/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── public/
│   └── package.json
│
├── contracts/
│   ├── CompanyRegistry.sol
│   ├── CarbonProjectManager.sol
│   ├── CarbonMarketplace.sol
│   └── GreenCertificateNFT.sol
│
├── scripts/
│   └── deploy.js
│
├── test/
│   ├── CompanyRegistry.test.js
│   ├── CarbonProjectManager.test.js
│   ├── CarbonMarketplace.test.js
│   └── GreenCertificateNFT.test.js
│
├── hardhat.config.js
├── package.json
└── README.md
```

---

# Smart Contracts

## CompanyRegistry

Responsável pelo cadastro das empresas.

Armazena:

- nome
- tipo da empresa
- emissão de carbono
- data de registro

---

## CarbonProjectManager

Gerencia os projetos ambientais.

Cada projeto possui:

- nome
- produtora
- créditos disponíveis
- preço por crédito
- duração
- tipo do projeto

---

## CarbonMarketplace

Responsável pela compra de créditos de carbono.

Funções:

- compra de créditos
- histórico de compras
- histórico de vendas
- controle da compensação ambiental

---

## GreenCertificateNFT

NFT emitido automaticamente para empresas que compensaram totalmente suas emissões.

---

# Fluxo do Sistema

## 1. Cadastro

A empresa conecta sua carteira MetaMask e realiza cadastro.

Tipos:

- Produtora
- Compradora

---

## 2. Criação de Projeto

Empresas produtoras podem criar projetos ambientais.

Exemplo:

- Conservação florestal
- Reflorestamento
- Energia limpa

---

## 3. Compra de Créditos

Empresas compradoras compram créditos de carbono.

O sistema:

- calcula automaticamente a compensação;
- impede compras após compensar emissão e receber NFT.

Exemplo:

| Emissão | Comprados | Pode Comprar |
|---|---|---|
| 20 | 5 | Sim |
| 20 | 20 | Não |
| 20 | 25 | Não |

---

## 4. NFT Verde

Quando a empresa atinge sua compensação total:

- recebe NFT ambiental;
- status muda para "Empresa Verde".

---

# Funcionamento da Plataforma

## Fluxo Principal

### Empresa Produtora

1. conecta MetaMask;
2. realiza cadastro;
3. cria projeto ambiental;
4. disponibiliza créditos para venda.

---

### Empresa Compradora

1. conecta MetaMask;
2. registra emissão de CO₂;
3. compra créditos ambientais;
4. acompanha compensação;
5. recebe NFT Verde ao atingir neutralização.

---

# Demonstração Funcional

A solução demonstra:

- cadastro de empresas;
- criação de projetos ambientais;
- compra de créditos de carbono;
- validação automática da compensação;
- emissão de NFT sustentável;
- dashboards de acompanhamento.

---

# Demonstração Auditável

A validação da solução pode ser auditada através de:

- transações registradas em blockchain;
- histórico de compras;
- histórico de vendas;
- NFTs emitidos;
- logs públicos da testnet;
- prints e vídeo demonstrativo.

---

# Smart Contract Deployado

## Contratos Deployados

| Contrato | Endereço |
|---|---|
| CompanyRegistry | 0xdb71ed4744592786251b6bEE9D2F031041e3Ea98 |
| CarbonProjectManager | 0x54af3650D1CBB323918Fa2Ad5AB40354a16db61C |
| CarbonMarketplace | 0x65d57482102A560d6A15003Fb698CeC56a05cedB |
| GreenCertificateNFT | 0xd0B90fDF416350a8fa7533740993a21eE8122752 |

---

# Explorador Blockchain

```txt
https://sepolia.etherscan.io/address/0xdb71ed4744592786251b6bEE9D2F031041e3Ea98

https://sepolia.etherscan.io/address/0x54af3650D1CBB323918Fa2Ad5AB40354a16db61C

https://sepolia.etherscan.io/address/0x65d57482102A560d6A15003Fb698CeC56a05cedB

https://sepolia.etherscan.io/address/0xd0B90fDF416350a8fa7533740993a21eE8122752
```

---

# Instalação

## Clonar repositório

```bash
git clone https://github.com/ledutm2010/carbonledger
```

---

## Instalar dependências do frontend

```bash
cd frontend
npm install
```

---

## Rodar frontend

```bash
npm run dev
```

---

# Deploy dos Contratos

## Instalar dependências

```bash
npm install
```

---

## Compilar contratos

```bash
npx hardhat compile
```

---

## Executar testes

```bash
npx hardhat test
```

---

## Deploy local

```bash
npx hardhat node
```

Em outro terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

---

# NFTs Ambientais

O NFT Verde representa:

- compensação ambiental total;
- compromisso sustentável;
- neutralização de emissões.

---

# Regras de Negócio

## Compradoras

- não podem comprar créditos após compensar emissão e receber NFT;
- recebem NFT ao atingir compensação.

---

## Produtoras

- podem criar múltiplos projetos;
- acompanham receitas e vendas.

---

# Interface

## Marketplace

- listagem de projetos;
- compra de créditos;
- disponibilidade em tempo real.

---

## Dashboard Produtora

- projetos criados;
- créditos vendidos;
- receita estimada;
- histórico de vendas.

---

## Dashboard Compradora

- emissão registrada;
- créditos compensados;
- créditos restantes;
- NFT ambiental;
- histórico de compras.

---

# Segurança

- Validações on-chain
- Uso de Solidity ^0.8.x
- Integração com OpenZeppelin
- Transações assinadas via MetaMask

---

# Futuras Melhorias

- Mercado secundário de créditos
- Dashboard analítico
- Certificação de projetos
- DAO de governança
- Integração com IPFS
- Sistema de auditoria ambiental
- Ranking sustentável

---

# Equipe

| Nome | Função |
|---|---|
| Luis Eduardo Teles Mourão | Desenvolvimento e Documentação |

---

# Vídeo de Apresentação

```txt
https://youtu.be/J5Keh8M72BU
```

---

# Slides da Apresentação

```txt
https://drive.google.com/file/d/1mX1KLp-Ji02BsJr_qlBhv45ALVhODADl/view?usp=sharing
```
