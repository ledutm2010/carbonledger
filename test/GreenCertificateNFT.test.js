const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GreenCertificateNFT", function () {

    let nft;

    let owner;
    let empresa;
    let usuario;

    beforeEach(async function () {

        [owner, empresa, usuario] =
            await ethers.getSigners();

        const NFT =
            await ethers.getContractFactory(
                "GreenCertificateNFT"
            );

        nft = await NFT.deploy();

        await nft.waitForDeployment();
    });

    it("deve emitir NFT verde", async function () {

        await nft.emitirCertificado(
            empresa.address,
            100,
            1
        );

        const balance =
            await nft.balanceOf(
                empresa.address
            );

        expect(balance)
            .to.equal(1);

        const certificado =
            await nft.certificados(1);

        expect(
            certificado.emissaoCompensada
        ).to.equal(100);
    });

    it("deve impedir empresa receber dois NFTs", async function () {

        await nft.emitirCertificado(
            empresa.address,
            100,
            1
        );

        await expect(

            nft.emitirCertificado(
                empresa.address,
                200,
                2
            )

        ).to.be.revertedWith(
            "Empresa ja possui NFT"
        );
    });

    it("deve registrar NFT na empresa", async function () {

        await nft.emitirCertificado(
            empresa.address,
            50,
            0
        );

        const lista =
            await nft.getCertificadosEmpresa(
                empresa.address
            );

        expect(lista.length)
            .to.equal(1);

        expect(lista[0])
            .to.equal(1);
    });

    it("deve retornar dados do certificado", async function () {

        await nft.emitirCertificado(
            empresa.address,
            75,
            2
        );

        const certificado =
            await nft.getCertificado(1);

        expect(certificado.empresa)
            .to.equal(
                empresa.address
            );

        expect(
            certificado.emissaoCompensada
        ).to.equal(75);
    });

    it("deve marcar empresa como certificada", async function () {

        await nft.emitirCertificado(
            empresa.address,
            100,
            1
        );

        const possui =
            await nft.possuiCertificado(
                empresa.address
            );

        expect(possui)
            .to.equal(true);
    });

    it("deve impedir emissão sem ADMIN_ROLE", async function () {

        const ADMIN_ROLE =
            await nft.ADMIN_ROLE();

        await nft.revokeRole(
            ADMIN_ROLE,
            owner.address
        );

        await expect(

            nft.connect(usuario)
                .emitirCertificado(
                    empresa.address,
                    100,
                    1
                )

        ).to.be.reverted;
    });

    it("deve possuir nome e símbolo corretos", async function () {

        expect(
            await nft.name()
        ).to.equal(
            "CarbonLedger Green Certificate"
        );

        expect(
            await nft.symbol()
        ).to.equal("CLGC");
    });

    it("deve possuir suporte ERC721", async function () {

        const ERC721_INTERFACE =
            "0x80ac58cd";

        const suporte =
            await nft.supportsInterface(
                ERC721_INTERFACE
            );

        expect(suporte)
            .to.equal(true);
    });

    it("deve permitir grantRole para marketplace", async function () {

        const ADMIN_ROLE =
            await nft.ADMIN_ROLE();

        await nft.grantRole(
            ADMIN_ROLE,
            usuario.address
        );

        expect(

            await nft.hasRole(
                ADMIN_ROLE,
                usuario.address
            )

        ).to.equal(true);
    });
});