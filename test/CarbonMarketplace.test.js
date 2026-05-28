const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonMarketplace", function () {

    let registry;
    let projectManager;
    let nft;
    let marketplace;

    let owner;
    let produtora;
    let compradora;

    beforeEach(async function () {

        [owner, produtora, compradora] =
            await ethers.getSigners();

        // =========================
        // CompanyRegistry
        // =========================

        const Registry =
            await ethers.getContractFactory(
                "CompanyRegistry"
            );

        registry =
            await Registry.deploy();

        await registry.waitForDeployment();

        // =========================
        // GreenCertificateNFT
        // =========================

        const NFT =
            await ethers.getContractFactory(
                "GreenCertificateNFT"
            );

        nft =
            await NFT.deploy();

        await nft.waitForDeployment();

        // =========================
        // CarbonProjectManager
        // =========================

        const ProjectManager =
            await ethers.getContractFactory(
                "CarbonProjectManager"
            );

        projectManager =
            await ProjectManager.deploy(
                await registry.getAddress()
            );

        await projectManager.waitForDeployment();

        // =========================
        // CarbonMarketplace
        // =========================

        const Marketplace =
            await ethers.getContractFactory(
                "CarbonMarketplace"
            );

        marketplace =
            await Marketplace.deploy(
                await projectManager.getAddress(),
                await registry.getAddress(),
                await nft.getAddress()
            );

        await marketplace.waitForDeployment();

        // =========================
        // GRANT ROLE PARA MARKETPLACE
        // =========================

        const ADMIN_ROLE =
            await nft.ADMIN_ROLE();

        await nft.grantRole(
            ADMIN_ROLE,
            await marketplace.getAddress()
        );
    });

    it("deve permitir compra de créditos", async function () {

        await registry.connect(produtora)
            .registrarEmpresa(
                "Empresa Verde",
                0,
                0
            );

        await registry.connect(compradora)
            .registrarEmpresa(
                "Industria CO2",
                1,
                20
            );

        await projectManager.connect(produtora)
            .criarProjeto(
                "Reflorestamento",
                0,
                1,
                100,
                ethers.parseEther("0.001")
            );

        await marketplace.connect(compradora)
            .comprarCreditos(
                1,
                10,
                {
                    value: ethers.parseEther("0.01")
                }
            );

        const total =
            await marketplace.totalCreditosComprados(
                compradora.address
            );

        expect(total).to.equal(10);
    });

    it("deve impedir pagamento insuficiente", async function () {

        await registry.connect(produtora)
            .registrarEmpresa(
                "Produtora",
                0,
                0
            );

        await registry.connect(compradora)
            .registrarEmpresa(
                "Compradora",
                1,
                20
            );

        await projectManager.connect(produtora)
            .criarProjeto(
                "Projeto",
                0,
                1,
                100,
                ethers.parseEther("1")
            );

        await expect(

            marketplace.connect(compradora)
                .comprarCreditos(
                    1,
                    2,
                    {
                        value: ethers.parseEther("1")
                    }
                )

        ).to.be.revertedWith(
            "Pagamento insuficiente"
        );
    });

    it("deve impedir compra por empresa não compradora", async function () {

        await registry.connect(produtora)
            .registrarEmpresa(
                "Produtora",
                0,
                0
            );

        await projectManager.connect(produtora)
            .criarProjeto(
                "Projeto Verde",
                0,
                1,
                100,
                ethers.parseEther("0.01")
            );

        await expect(

            marketplace.connect(produtora)
                .comprarCreditos(
                    1,
                    1,
                    {
                        value: ethers.parseEther("0.01")
                    }
                )

        ).to.be.revertedWith(
            "Apenas compradoras"
        );
    });

    it("deve impedir compra sem créditos disponíveis", async function () {

        await registry.connect(produtora)
            .registrarEmpresa(
                "Produtora",
                0,
                0
            );

        await registry.connect(compradora)
            .registrarEmpresa(
                "Compradora",
                1,
                20
            );

        await projectManager.connect(produtora)
            .criarProjeto(
                "Projeto Verde",
                0,
                1,
                5,
                ethers.parseEther("0.01")
            );

        await expect(

            marketplace.connect(compradora)
                .comprarCreditos(
                    1,
                    10,
                    {
                        value: ethers.parseEther("0.1")
                    }
                )

        ).to.be.revertedWith(
            "Creditos insuficientes"
        );
    });

    it("deve emitir NFT após compensação total", async function () {

        await registry.connect(produtora)
            .registrarEmpresa(
                "Empresa Verde",
                0,
                0
            );

        await registry.connect(compradora)
            .registrarEmpresa(
                "Industria",
                1,
                10
            );

        await projectManager.connect(produtora)
            .criarProjeto(
                "Projeto Ambiental",
                0,
                2,
                100,
                ethers.parseEther("0.001")
            );

        await marketplace.connect(compradora)
            .comprarCreditos(
                1,
                10,
                {
                    value: ethers.parseEther("0.01")
                }
            );

        const balance =
            await nft.balanceOf(
                compradora.address
            );

        expect(balance).to.equal(1);
    });

    it("deve pausar marketplace", async function () {

        await marketplace.pausar();

        await expect(

            marketplace.comprarCreditos(
                1,
                1
            )

        ).to.be.reverted;
    });

    it("deve despausar marketplace", async function () {

        await marketplace.pausar();

        await marketplace.despausar();

        expect(
            await marketplace.paused()
        ).to.equal(false);
    });
});