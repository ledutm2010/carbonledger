// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Controle de permissões
import "@openzeppelin/contracts/access/AccessControl.sol";

// Permite pausar funcionalidades críticas
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CompanyRegistry is
    AccessControl,
    Pausable
{
    // Papel administrativo
    bytes32 public constant ADMIN_ROLE =
        keccak256("ADMIN_ROLE");

    // Papel de empresas produtoras
    bytes32 public constant PRODUTORA_ROLE =
        keccak256("PRODUTORA_ROLE");

    // Papel de empresas compradoras
    bytes32 public constant COMPRADORA_ROLE =
        keccak256("COMPRADORA_ROLE");

    // Tipos disponíveis de empresa
    enum TipoEmpresa {
        Produtora,
        Compradora
    }

    // Estrutura principal da empresa
    struct Empresa {

        // Nome fantasia
        string nome;

        // Tipo da empresa
        TipoEmpresa tipo;

        // Quantidade de emissão de CO2
        uint256 emissaoCarbono;

        // Controle de cadastro
        bool registrada;

        // Timestamp do cadastro
        uint256 dataCadastro;
    }

    // Dados das empresas
    mapping(address => Empresa)
        public empresas;

    // Controle de emissão restante
    mapping(address => uint256)
        public emissaoRestante;

    // Evento de cadastro
    event EmpresaRegistrada(
        address indexed carteira,
        string nome,
        TipoEmpresa tipo
    );

    // Evento de redução de emissão
    event EmissaoReduzida(
        address indexed empresa,
        uint256 restante
    );

    constructor() {

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

    // Registra empresa na plataforma
    function registrarEmpresa(
        string memory _nome,
        TipoEmpresa _tipo,
        uint256 _emissaoCarbono
    )
        external
        whenNotPaused
    {
        // Impede cadastro duplicado
        require(
            !empresas[msg.sender].registrada,
            "Empresa ja registrada"
        );

        // Nome obrigatório
        require(
            bytes(_nome).length > 0,
            "Nome invalido"
        );

        // Compradoras precisam informar emissão
        if(
            _tipo == TipoEmpresa.Compradora
        ) {

            require(
                _emissaoCarbono > 0,
                "Emissao invalida"
            );
        }

        // Armazena empresa
        empresas[msg.sender] = Empresa({

            nome: _nome,

            tipo: _tipo,

            emissaoCarbono:
                _emissaoCarbono,

            registrada: true,

            dataCadastro:
                block.timestamp
        });

        // Inicializa saldo de emissão
        emissaoRestante[msg.sender] =
            _emissaoCarbono;

        // Define permissões
        if (
            _tipo == TipoEmpresa.Produtora
        ) {

            _grantRole(
                PRODUTORA_ROLE,
                msg.sender
            );

        } else {

            _grantRole(
                COMPRADORA_ROLE,
                msg.sender
            );
        }

        emit EmpresaRegistrada(
            msg.sender,
            _nome,
            _tipo
        );
    }

    // Reduz emissão restante da empresa
    function reduzirEmissao(
        address empresa,
        uint256 quantidade
    )
        external
    {
        // Empresa precisa existir
        require(
            empresas[empresa].registrada,
            "Empresa invalida"
        );

        // Verifica saldo de emissão
        require(
            emissaoRestante[empresa]
                >= quantidade,
            "Emissao insuficiente"
        );

        // Atualiza saldo
        emissaoRestante[empresa]
            -= quantidade;

        emit EmissaoReduzida(
            empresa,
            emissaoRestante[empresa]
        );
    }

    // Verifica se empresa é produtora
    function ehProdutora(address user)
        external
        view
        returns(bool)
    {
        return hasRole(
            PRODUTORA_ROLE,
            user
        );
    }

    // Verifica se empresa é compradora
    function ehCompradora(address user)
        external
        view
        returns(bool)
    {
        return hasRole(
            COMPRADORA_ROLE,
            user
        );
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