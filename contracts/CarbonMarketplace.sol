// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Proteção contra reentrância
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Controle de permissões
import "@openzeppelin/contracts/access/AccessControl.sol";

// Permite pausar operações críticas
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IProjetoManager {

    enum DuracaoProjeto {
        DezACemAnos,
        CemAMilAnos,
        MaisDeMilAnos
    }

    struct ProjetoCarbono {

        uint256 id;

        string nome;

        address produtora;

        uint8 tipoProjeto;

        DuracaoProjeto duracao;

        uint256 totalCreditos;

        uint256 creditosDisponiveis;

        uint256 precoPorCredito;

        bool ativo;

        uint256 dataCriacao;
    }

    function projetos(uint256)
        external
        view
        returns(
            uint256,
            string memory,
            address,
            uint8,
            DuracaoProjeto,
            uint256,
            uint256,
            uint256,
            bool,
            uint256
        );

    // Reduz os créditos disponíveis após compra
    function reduzirCreditos(
        uint256 projetoId,
        uint256 quantidade
    ) external;
}

interface IRegistry {

    function ehCompradora(address user)
        external
        view
        returns(bool);

    function empresas(address user)
        external
        view
        returns(
            string memory,
            uint8,
            uint256,
            bool,
            uint256
        );
}

interface IGreenNFT {

    enum DuracaoProjeto {
        DezACemAnos,
        CemAMilAnos,
        MaisDeMilAnos
    }

    // Emite NFT ambiental para empresa compensada
    function emitirCertificado(
        address empresa,
        uint256 emissaoCompensada,
        DuracaoProjeto validade
    ) external;
}

contract CarbonMarketplace is
    ReentrancyGuard,
    AccessControl,
    Pausable
{
    bytes32 public constant ADMIN_ROLE =
        keccak256("ADMIN_ROLE");

    // Estrutura de transação de compra/venda
    struct Transacao {

        uint256 projetoId;

        string nomeProjeto;

        address vendedor;

        address comprador;

        uint256 creditosComprados;

        uint256 timestamp;

        uint8 duracao;
    }

    // Histórico de compras por empresa
    mapping(address => Transacao[])
        public comprasPorEmpresa;

    // Histórico de vendas por empresa
    mapping(address => Transacao[])
        public vendasPorEmpresa;

    // Histórico por projeto
    mapping(uint256 => Transacao[])
        public transacoesPorProjeto;

    // Total comprado por empresa
    mapping(address => uint256)
        public totalCreditosComprados;

    // Menor duração ambiental utilizada
    mapping(address => uint8)
        public menorDuracao;

    // Controle para evitar múltiplos NFTs
    mapping(address => bool)
        public certificadoEmitido;

    IProjetoManager public projectManager;

    IRegistry public registry;

    IGreenNFT public greenNFT;

    // Evento emitido após compra
    event CreditosComprados(
        uint256 indexed projetoId,
        address indexed comprador,
        uint256 quantidade
    );

    constructor(
        address carbonProjectManagerAddress,
        address companyRegistryAddress,
        address greenCertificateNFTAddress
    ) {

        projectManager =
            IProjetoManager(
                carbonProjectManagerAddress
            );

        registry =
            IRegistry(
                companyRegistryAddress
            );

        greenNFT =
            IGreenNFT(
                greenCertificateNFTAddress
            );

        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            ADMIN_ROLE,
            msg.sender
        );
    }

    // Compra créditos de carbono
    function comprarCreditos(
        uint256 projetoId,
        uint256 quantidade
    )
        external
        payable
        nonReentrant
        whenNotPaused
    {
        // Apenas empresas compradoras
        require(
            registry.ehCompradora(
                msg.sender
            ),
            "Apenas compradoras"
        );

        (
            uint256 id,
            string memory nome,
            address produtora,
            ,
            IProjetoManager.DuracaoProjeto duracao,
            ,
            uint256 creditosDisponiveis,
            uint256 precoPorCredito,
            bool ativo,

        ) = projectManager.projetos(
            projetoId
        );

        // Projeto precisa estar ativo
        require(
            ativo,
            "Projeto inativo"
        );

        // Deve haver créditos suficientes
        require(
            creditosDisponiveis >= quantidade,
            "Creditos insuficientes"
        );

        uint256 valorTotal =
            quantidade * precoPorCredito;

        // Verifica pagamento enviado
        require(
            msg.value >= valorTotal,
            "Pagamento insuficiente"
        );

        // Atualiza créditos do projeto
        projectManager.reduzirCreditos(
            projetoId,
            quantidade
        );

        // Soma créditos comprados pela empresa
        totalCreditosComprados[
            msg.sender
        ] += quantidade;

        // Armazena menor duração ambiental
        if (
            menorDuracao[msg.sender] == 0
            ||
            uint8(duracao)
                < menorDuracao[msg.sender]
        ) {

            menorDuracao[msg.sender]
                = uint8(duracao);
        }

        // Cria registro da transação
        Transacao memory txData =
            Transacao({

                projetoId: id,

                nomeProjeto: nome,

                vendedor: produtora,

                comprador: msg.sender,

                creditosComprados:
                    quantidade,

                timestamp:
                    block.timestamp,

                duracao:
                    uint8(duracao)
            });

        comprasPorEmpresa[
            msg.sender
        ].push(txData);

        vendasPorEmpresa[
            produtora
        ].push(txData);

        transacoesPorProjeto[
            projetoId
        ].push(txData);

        // Envia pagamento para produtora
        (bool success, ) =
            payable(produtora).call{
                value: valorTotal
            }("");

        require(
            success,
            "Falha pagamento"
        );

        (
            ,
            ,
            uint256 emissao,
            bool registrada,

        ) = registry.empresas(
            msg.sender
        );

        require(
            registrada,
            "Empresa invalida"
        );

        // Emite NFT se compensou totalmente
        if (
            totalCreditosComprados[
                msg.sender
            ] >= emissao
            &&
            !certificadoEmitido[
                msg.sender
            ]
        ) {

            certificadoEmitido[
                msg.sender
            ] = true;

            greenNFT.emitirCertificado(
                msg.sender,
                emissao,
                IGreenNFT.DuracaoProjeto(
                    menorDuracao[
                        msg.sender
                    ]
                )
            );
        }

        emit CreditosComprados(
            projetoId,
            msg.sender,
            quantidade
        );
    }

    function listarComprasEmpresa(
        address empresa
    )
        external
        view
        returns(
            Transacao[] memory
        )
    {
        return comprasPorEmpresa[
            empresa
        ];
    }

    function listarVendasEmpresa(
        address empresa
    )
        external
        view
        returns(
            Transacao[] memory
        )
    {
        return vendasPorEmpresa[
            empresa
        ];
    }

    function listarTransacoesProjeto(
        uint256 projetoId
    )
        external
        view
        returns(
            Transacao[] memory
        )
    {
        return transacoesPorProjeto[
            projetoId
        ];
    }

    // Pausa marketplace
    function pausar()
        external
        onlyRole(ADMIN_ROLE)
    {
        _pause();
    }

    // Reativa marketplace
    function despausar()
        external
        onlyRole(ADMIN_ROLE)
    {
        _unpause();
    }
}