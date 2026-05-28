const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonProjectManager", function () {

    let registry;
    let manager;

    let owner;
    let produtora;
    let compradora;

    beforeEach(async function () {

        [owner, produtora, compradora] =
            await ethers.getSigners();

        const Registry =
            await ethers.getContractFactory(
                "CompanyRegistry"
            );

        registry =
            await Registry.deploy();

        await registry.waitForDeployment();

        const Manager =
            await ethers.getContractFactory(
                "CarbonProjectManager"
            );

        manager =
            await Manager.deploy(
                await registry.getAddress()
            );

        await manager.waitForDeployment();
    });

    it("deve criar projeto ambiental", async function () {

        // registra produtora
        await registry.connect(produtora)
            .registrarEmpresa(
                "Eco Producer",
                0,
                0
            );

        // cria projeto
        await manager.connect(produtora)
            .criarProjeto(
                "Projeto Verde",
                0,
                1,
                100,
                ethers.parseEther("0.001")
            );

        const projeto =
            await manager.projetos(1);

        expect(projeto.nome)
            .to.equal("Projeto Verde");

        expect(projeto.totalCreditos)
            .to.equal(100);
    });

    it("deve impedir compradora criar projeto", async function () {

        await registry.connect(compradora)
            .registrarEmpresa(
                "Industria",
                1,
                20
            );

        await expect(

            manager.connect(compradora)
                .criarProjeto(
                    "Projeto",
                    0,
                    1,
                    100,
                    ethers.parseEther("0.001")
                )

        ).to.be.revertedWith(
            "Apenas produtoras"
        );
    });

    it("deve reduzir créditos", async function () {

        await registry.connect(produtora)
            .registrarEmpresa(
                "Produtora",
                0,
                0
            );

        await manager.connect(produtora)
            .criarProjeto(
                "Projeto",
                0,
                1,
                100,
                ethers.parseEther("0.001")
            );

        await manager.reduzirCreditos(
            1,
            30
        );

        const projeto =
            await manager.projetos(1);

        expect(
            projeto.creditosDisponiveis
        ).to.equal(70);
    });

    it("deve finalizar projeto sem créditos", async function () {

        await registry.connect(produtora)
            .registrarEmpresa(
                "Produtora",
                0,
                0
            );

        await manager.connect(produtora)
            .criarProjeto(
                "Projeto Final",
                0,
                1,
                50,
                ethers.parseEther("0.001")
            );

        await manager.reduzirCreditos(
            1,
            50
        );

        const projeto =
            await manager.projetos(1);

        expect(projeto.ativo)
            .to.equal(false);
    });

    it("deve pausar contrato", async function () {

        await manager.pausar();

        await registry.connect(produtora)
            .registrarEmpresa(
                "Produtora",
                0,
                0
            );

        await expect(

            manager.connect(produtora)
                .criarProjeto(
                    "Projeto",
                    0,
                    1,
                    100,
                    ethers.parseEther("0.001")
                )

        ).to.be.reverted;
    });
});