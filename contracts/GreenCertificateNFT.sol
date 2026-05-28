// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Implementação ERC721
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Controle de permissões
import "@openzeppelin/contracts/access/AccessControl.sol";

contract GreenCertificateNFT is
    ERC721,
    AccessControl
{
    // Papel administrativo
    bytes32 public constant ADMIN_ROLE =
        keccak256("ADMIN_ROLE");

    // Contador incremental dos NFTs
    uint256 public proximoTokenId;

    // Classificação de validade ambiental
    enum DuracaoProjeto {
        DezACemAnos,
        CemAMilAnos,
        MaisDeMilAnos
    }

    // Estrutura do certificado verde
    struct CertificadoVerde {

        // ID do NFT
        uint256 tokenId;

        // Empresa dona do NFT
        address empresa;

        // Quantidade compensada
        uint256 emissaoCompensada;

        // Duração do impacto ambiental
        DuracaoProjeto validade;

        // Data de emissão
        uint256 dataEmissao;
    }

    // Certificados por tokenId
    mapping(uint256 => CertificadoVerde)
        public certificados;

    // NFTs de cada empresa
    mapping(address => uint256[])
        public certificadosPorEmpresa;

    // Controle para evitar múltiplos certificados
    mapping(address => bool)
        public possuiCertificado;

    // Evento emitido ao gerar NFT
    event NFTVerdeEmitido(
        address indexed empresa,
        uint256 indexed tokenId
    );

    constructor()
        ERC721(
            "CarbonLedger Green Certificate",
            "CLGC"
        )
    {
        // Admin principal
        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );

        // Papel administrativo customizado
        _grantRole(
            ADMIN_ROLE,
            msg.sender
        );
    }

    // Emite NFT ambiental
    function emitirCertificado(
        address empresa,
        uint256 emissaoCompensada,
        DuracaoProjeto validade
    )
        external
        onlyRole(ADMIN_ROLE)
    {
        // Impede múltiplos NFTs
        require(
            !possuiCertificado[empresa],
            "Empresa ja possui NFT"
        );

        // Incrementa ID
        proximoTokenId++;

        // Mint NFT
        _safeMint(
            empresa,
            proximoTokenId
        );

        // Salva metadados do certificado
        certificados[proximoTokenId] =
            CertificadoVerde({

                tokenId:
                    proximoTokenId,

                empresa:
                    empresa,

                emissaoCompensada:
                    emissaoCompensada,

                validade:
                    validade,

                dataEmissao:
                    block.timestamp
            });

        // Relaciona NFT à empresa
        certificadosPorEmpresa[empresa]
            .push(proximoTokenId);

        // Marca empresa como certificada
        possuiCertificado[empresa] =
            true;

        emit NFTVerdeEmitido(
            empresa,
            proximoTokenId
        );
    }

    // Lista NFTs da empresa
    function getCertificadosEmpresa(
        address empresa
    )
        external
        view
        returns(uint256[] memory)
    {
        return certificadosPorEmpresa[
            empresa
        ];
    }

    // Retorna dados completos do NFT
    function getCertificado(
        uint256 tokenId
    )
        external
        view
        returns(CertificadoVerde memory)
    {
        return certificados[tokenId];
    }

    // Compatibilidade de interfaces
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}