// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Controle de permissões
import "@openzeppelin/contracts/access/AccessControl.sol";

// Permite pausar o contrato
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IRegistry {

    // Verifica se empresa é produtora
    function ehProdutora(address user)
        external
        view
        returns(bool);
}

contract CarbonProjectManager is
    AccessControl,
    Pausable
{
    // Papel administrativo
    bytes32 public constant ADMIN_ROLE =
        keccak256("ADMIN_ROLE");

    // Tipos de projetos ambientais
    enum TipoProjeto {
        ConservacaoFlorestas,
        Reflorestamento,
        EnergiaLimpa
    }

    // Tempo estimado de impacto ambiental
    enum DuracaoProjeto {
        DezACemAnos,
        CemAMilAnos,
        MaisDeMilAnos
    }

    // Estrutura principal do projeto
    struct ProjetoCarbono {

        uint256 id;

        string nome;

        address produtora;

        TipoProjeto tipoProjeto;

        DuracaoProjeto duracao;

        uint256 totalCreditos;

        uint256 creditosDisponiveis;

        uint256 precoPorCredito;

        bool ativo;

        uint256 dataCriacao;
    }

    // Contador incremental de IDs
    uint256 public proximoProjetoId;

    // Armazena projetos por ID
    mapping(uint256 => ProjetoCarbono)
        public projetos;

    // Relaciona produtora aos projetos criados
    mapping(address => uint256[])
        public projetosPorProdutora;

    IRegistry public registry;

    // Evento emitido ao criar projeto
    event ProjetoCriado(
        uint256 indexed projetoId,
        address indexed produtora,
        string nome
    );

    // Evento emitido após venda de créditos
    event CreditosAtualizados(
        uint256 indexed projetoId,
        uint256 restantes
    );

    // Evento emitido quando projeto acaba créditos
    event ProjetoFinalizado(
        uint256 indexed projetoId
    );

    constructor(address registryAddress) {

        registry = IRegistry(
            registryAddress
        );

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

    // Cria novo projeto ambiental
    function criarProjeto(
        string memory _nome,
        TipoProjeto _tipoProjeto,
        DuracaoProjeto _duracao,
        uint256 _totalCreditos,
        uint256 _precoPorCredito
    )
        external
        whenNotPaused
    {
        // Apenas empresas produtoras
        require(
            registry.ehProdutora(msg.sender),
            "Apenas produtoras"
        );

        // Nome obrigatório
        require(
            bytes(_nome).length > 0,
            "Nome invalido"
        );

        // Deve possuir créditos
        require(
            _totalCreditos > 0,
            "Creditos invalidos"
        );

        // Preço precisa ser válido
        require(
            _precoPorCredito > 0,
            "Preco invalido"
        );

        // Incrementa ID
        proximoProjetoId++;

        // Cria projeto
        projetos[proximoProjetoId] =
            ProjetoCarbono({

                id: proximoProjetoId,

                nome: _nome,

                produtora: msg.sender,

                tipoProjeto: _tipoProjeto,

                duracao: _duracao,

                totalCreditos: _totalCreditos,

                creditosDisponiveis:
                    _totalCreditos,

                precoPorCredito:
                    _precoPorCredito,

                ativo: true,

                dataCriacao:
                    block.timestamp
            });

        // Relaciona projeto à produtora
        projetosPorProdutora[msg.sender]
            .push(proximoProjetoId);

        emit ProjetoCriado(
            proximoProjetoId,
            msg.sender,
            _nome
        );
    }

    // Reduz créditos após compra
    function reduzirCreditos(
        uint256 projetoId,
        uint256 quantidade
    )
        external
    {
        ProjetoCarbono storage projeto =
            projetos[projetoId];

        // Projeto precisa estar ativo
        require(
            projeto.ativo,
            "Projeto inativo"
        );

        // Verifica disponibilidade
        require(
            projeto.creditosDisponiveis
            >= quantidade,
            "Sem creditos"
        );

        // Atualiza saldo
        projeto.creditosDisponiveis
            -= quantidade;

        // Finaliza projeto se zerar créditos
        if (
            projeto.creditosDisponiveis == 0
        ) {
            projeto.ativo = false;

            emit ProjetoFinalizado(
                projetoId
            );
        }

        emit CreditosAtualizados(
            projetoId,
            projeto.creditosDisponiveis
        );
    }

    // Lista IDs dos projetos da produtora
    function getProjetosProdutora(
        address produtora
    )
        external
        view
        returns(uint256[] memory)
    {
        return projetosPorProdutora[
            produtora
        ];
    }

    // Retorna dados completos do projeto
    function getProjeto(
        uint256 projetoId
    )
        external
        view
        returns(ProjetoCarbono memory)
    {
        return projetos[projetoId];
    }

    // Pausa o contrato
    function pausar()
        external
        onlyRole(ADMIN_ROLE)
    {
        _pause();
    }

    // Reativa o contrato
    function despausar()
        external
        onlyRole(ADMIN_ROLE)
    {
        _unpause();
    }
}