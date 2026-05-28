const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CompanyRegistry", function () {

    let registry;

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
    });

    it("deve registrar empresa produtora", async function () {

        await registry.connect(produtora)
            .registrarEmpresa(
                "Eco Producer",
                0,
                0
            );

        const empresa =
            await registry.empresas(
                produtora.address
            );

        expect(empresa.nome)
            .to.equal("Eco Producer");

        expect(empresa.registrada)
            .to.equal(true);
    });

    it("deve registrar empresa compradora", async function () {

        await registry.connect(compradora)
            .registrarEmpresa(
                "Industria Verde",
                1,
                100
            );

        const empresa =
            await registry.empresas(
                compradora.address
            );

        expect(empresa.emissaoCarbono)
            .to.equal(100);
    });

    it("deve impedir cadastro duplicado", async function () {

        await registry.connect(produtora)
            .registrarEmpresa(
                "Empresa",
                0,
                0
            );

        await expect(

            registry.connect(produtora)
                .registrarEmpresa(
                    "Empresa 2",
                    0,
                    0
                )

        ).to.be.revertedWith(
            "Empresa ja registrada"
        );
    });

    it("deve impedir compradora sem emissao", async function () {

        await expect(

            registry.connect(compradora)
                .registrarEmpresa(
                    "Compradora",
                    1,
                    0
                )

        ).to.be.revertedWith(
            "Emissao invalida"
        );
    });

    it("deve reduzir emissao", async function () {

        await registry.connect(compradora)
            .registrarEmpresa(
                "Industria",
                1,
                100
            );

        await registry.reduzirEmissao(
            compradora.address,
            30
        );

        const restante =
            await registry.emissaoRestante(
                compradora.address
            );

        expect(restante)
            .to.equal(70);
    });

    it("deve impedir reduzir emissao maior que saldo", async function () {

        await registry.connect(compradora)
            .registrarEmpresa(
                "Industria",
                1,
                50
            );

        await expect(

            registry.reduzirEmissao(
                compradora.address,
                100
            )

        ).to.be.revertedWith(
            "Emissao insuficiente"
        );
    });

    it("deve identificar produtora", async function () {

        await registry.connect(produtora)
            .registrarEmpresa(
                "Produtora",
                0,
                0
            );

        const resultado =
            await registry.ehProdutora(
                produtora.address
            );

        expect(resultado)
            .to.equal(true);
    });

    it("deve identificar compradora", async function () {

        await registry.connect(compradora)
            .registrarEmpresa(
                "Compradora",
                1,
                100
            );

        const resultado =
            await registry.ehCompradora(
                compradora.address
            );

        expect(resultado)
            .to.equal(true);
    });

    it("deve pausar contrato", async function () {

        await registry.pausar();

        await expect(

            registry.connect(produtora)
                .registrarEmpresa(
                    "Empresa",
                    0,
                    0
                )

        ).to.be.reverted;
    });

    it("deve despausar contrato", async function () {

        await registry.pausar();

        await registry.despausar();

        await registry.connect(produtora)
            .registrarEmpresa(
                "Empresa",
                0,
                0
            );

        const empresa =
            await registry.empresas(
                produtora.address
            );

        expect(empresa.registrada)
            .to.equal(true);
    });
});