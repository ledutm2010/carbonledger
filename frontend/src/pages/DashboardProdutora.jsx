import {
    useEffect,
    useState
}
from "react";

import {
    ethers
}
from "ethers";

import {
    useWeb3
}
from "../context/Web3Context";

import {
    carregarProjetosProdutora,
    carregarVendasProdutora
}
from "../services/blockchain";

import {
    getCompanyRegistry
}
from "../services/contracts";

export default function DashboardProdutora() {

    const {
        signer,
        wallet
    } = useWeb3();

    const [
        projetos,
        setProjetos
    ] = useState([]);

    const [
        vendas,
        setVendas
    ] = useState([]);

    const [
        nomesEmpresas,
        setNomesEmpresas
    ] = useState({});

    const [
        loading,
        setLoading
    ] = useState(true);

    async function resolverNomeEmpresa(address) {

        try {

            if (!address) {
                return "-";
            }

            if (nomesEmpresas[address]) {
                return nomesEmpresas[address];
            }

            const registry =
                getCompanyRegistry(signer);

            const empresa =
                await registry.empresas(address);

            const nome =
                empresa[0];

            const nomeFinal =
                nome && nome.length > 0
                ? nome
                : (
                    address.slice(0,6)
                    +
                    "..."
                    +
                    address.slice(-4)
                );

            setNomesEmpresas(prev => ({
                ...prev,
                [address]: nomeFinal
            }));

            return nomeFinal;

        } catch {

            return (
                address.slice(0,6)
                +
                "..."
                +
                address.slice(-4)
            );
        }
    }

    async function carregar() {

        try {

            const projetosData =
                await carregarProjetosProdutora(
                    signer,
                    wallet
                );

            const vendasData =
                await carregarVendasProdutora(
                    signer,
                    wallet
                );

            const vendasEnriquecidas =
                await Promise.all(

                    vendasData.map(
                        async(venda)=>{

                            const nomeComprador =
                                await resolverNomeEmpresa(
                                    venda.comprador
                                );

                            return {
                                ...venda,
                                nomeComprador
                            };
                        }
                    )
                );

            setProjetos(projetosData);

            setVendas(
                vendasEnriquecidas
            );

        } catch(error) {

            console.log(error);

        } finally {

            setLoading(false);
        }
    }

    function formatarData(timestamp) {

        if (!timestamp) return "-";

        return new Date(
            Number(timestamp) * 1000
        ).toLocaleString("pt-BR");
    }

    function formatarETH(valor) {

        try {

            if (!valor) {
                return "0.000000";
            }

            return Number(
                ethers.formatEther(
                    valor.toString()
                )
            ).toFixed(6);

        } catch {

            try {

                return Number(valor)
                    .toFixed(6);

            } catch {

                return "0.000000";
            }
        }
    }

    function obterPrecoProjeto(projeto) {

        if (
            projeto.precoPorCredito !== undefined
            &&
            projeto.precoPorCredito !== null
        ) {
            return projeto.precoPorCredito;
        }

        if (
            projeto.precoWei !== undefined
            &&
            projeto.precoWei !== null
        ) {
            return projeto.precoWei;
        }

        if (
            projeto.preco !== undefined
            &&
            projeto.preco !== null
        ) {

            try {

                return ethers.parseEther(
                    projeto.preco.toString()
                );

            } catch {

                return 0;
            }
        }

        return 0;
    }

    function calcularTotalVendido() {

        return vendas.reduce(
            (acc, venda) =>
                acc + Number(venda.creditosComprados),
            0
        );
    }

    function calcularReceitaTotal() {

        let total = 0;

        projetos.forEach((projeto) => {

            const vendidos =
                Number(projeto.totalCreditos) -
                Number(projeto.creditosDisponiveis);

            const precoRaw =
                obterPrecoProjeto(projeto);

            let preco = 0;

            try {

                preco = Number(
                    ethers.formatEther(
                        precoRaw.toString()
                    )
                );

            } catch {

                preco = Number(
                    projeto.preco || 0
                );
            }

            total += vendidos * preco;
        });

        return total.toFixed(6);
    }

    function calcularProjetosAtivos() {

        return projetos.filter(
            (p) => p.ativo
        ).length;
    }

    useEffect(() => {

        if (signer && wallet) {
            carregar();
        }

    }, [signer, wallet]);

    return (

        <div
            className="
                p-10
                space-y-10
            "
        >

            <div
                className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-4
                "
            >

                <div>

                    <h1
                        className="
                            text-5xl
                            font-bold
                        "
                    >
                        Dashboard Produtora
                    </h1>

                    <p className="text-zinc-400 mt-2">
                        Gerencie seus projetos e acompanhe suas vendas.
                    </p>

                </div>

            </div>

            {
                loading ? (

                    <div
                        className="
                            text-center
                            text-2xl
                            py-10
                        "
                    >
                        Carregando...
                    </div>

                ) : (

                    <>

                        <div
                            className="
                                grid
                                grid-cols-1
                                md:grid-cols-3
                                gap-6
                            "
                        >

                            <div
                                className="
                                    bg-green-900
                                    rounded-2xl
                                    p-6
                                    border
                                    border-green-700
                                "
                            >

                                <p className="text-zinc-300">
                                    Projetos Ativos
                                </p>

                                <h2
                                    className="
                                        text-5xl
                                        font-bold
                                        mt-2
                                    "
                                >
                                    {
                                        calcularProjetosAtivos()
                                    }
                                </h2>

                            </div>

                            <div
                                className="
                                    bg-blue-900
                                    rounded-2xl
                                    p-6
                                    border
                                    border-blue-700
                                "
                            >

                                <p className="text-zinc-300">
                                    Créditos Vendidos
                                </p>

                                <h2
                                    className="
                                        text-5xl
                                        font-bold
                                        mt-2
                                    "
                                >
                                    {
                                        calcularTotalVendido()
                                    }
                                </h2>

                            </div>

                            <div
                                className="
                                    bg-yellow-700
                                    rounded-2xl
                                    p-6
                                    border
                                    border-yellow-500
                                "
                            >

                                <p className="text-zinc-100">
                                    Receita Estimada
                                </p>

                                <h2
                                    className="
                                        text-4xl
                                        font-bold
                                        mt-2
                                    "
                                >
                                    {
                                        calcularReceitaTotal()
                                    }
                                    {" "}
                                    ETH
                                </h2>

                            </div>

                        </div>

                        <div className="space-y-6">

                            <h2
                                className="
                                    text-3xl
                                    font-bold
                                "
                            >
                                Projetos Criados
                            </h2>

                            {
                                projetos.length === 0 ? (

                                    <div
                                        className="
                                            bg-zinc-900
                                            rounded-2xl
                                            p-6
                                        "
                                    >
                                        Nenhum projeto criado.
                                    </div>

                                ) : (

                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            md:grid-cols-2
                                            xl:grid-cols-3
                                            gap-6
                                        "
                                    >

                                        {
                                            projetos.map((projeto) => {

                                                const vendidos =
                                                    Number(projeto.totalCreditos) -
                                                    Number(projeto.creditosDisponiveis);

                                                return (

                                                    <div
                                                        key={projeto.id}
                                                        className="
                                                            bg-gradient-to-b
                                                            from-green-900
                                                            to-zinc-900
                                                            border
                                                            border-green-700
                                                            rounded-2xl
                                                            p-6
                                                            space-y-4
                                                        "
                                                    >

                                                        <div>

                                                            <h2
                                                                className="
                                                                    text-3xl
                                                                    font-bold
                                                                "
                                                            >
                                                                {
                                                                    projeto.nome
                                                                }
                                                            </h2>

                                                        </div>

                                                        <div
                                                            className="
                                                                grid
                                                                grid-cols-2
                                                                gap-3
                                                            "
                                                        >

                                                            <div
                                                                className="
                                                                    bg-zinc-800/70
                                                                    rounded-xl
                                                                    p-3
                                                                "
                                                            >

                                                                <p className="text-zinc-400 text-sm">
                                                                    ID
                                                                </p>

                                                                <p className="font-bold">
                                                                    {
                                                                        projeto.id
                                                                    }
                                                                </p>

                                                            </div>

                                                            <div
                                                                className="
                                                                    bg-zinc-800/70
                                                                    rounded-xl
                                                                    p-3
                                                                "
                                                            >

                                                                <p className="text-zinc-400 text-sm">
                                                                    Status
                                                                </p>

                                                                <p
                                                                    className={`
                                                                        font-bold
                                                                        ${
                                                                            projeto.ativo
                                                                            ? "text-green-400"
                                                                            : "text-red-400"
                                                                        }
                                                                    `}
                                                                >
                                                                    {
                                                                        projeto.ativo
                                                                        ? "Ativo"
                                                                        : "Inativo"
                                                                    }
                                                                </p>

                                                            </div>

                                                            <div
                                                                className="
                                                                    bg-zinc-800/70
                                                                    rounded-xl
                                                                    p-3
                                                                "
                                                            >

                                                                <p className="text-zinc-400 text-sm">
                                                                    Totais
                                                                </p>

                                                                <p className="font-bold">
                                                                    {
                                                                        projeto.totalCreditos
                                                                    }
                                                                </p>

                                                            </div>

                                                            <div
                                                                className="
                                                                    bg-zinc-800/70
                                                                    rounded-xl
                                                                    p-3
                                                                "
                                                            >

                                                                <p className="text-zinc-400 text-sm">
                                                                    Disponíveis
                                                                </p>

                                                                <p className="font-bold">
                                                                    {
                                                                        projeto.creditosDisponiveis
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                        <div
                                                            className="
                                                                bg-zinc-800/60
                                                                rounded-xl
                                                                p-4
                                                                space-y-2
                                                            "
                                                        >

                                                            <div className="flex justify-between">

                                                                <span className="text-zinc-400">
                                                                    Preço por crédito
                                                                </span>

                                                                <strong className="text-green-400">
                                                                    {
                                                                        formatarETH(
                                                                            obterPrecoProjeto(
                                                                                projeto
                                                                            )
                                                                        )
                                                                    }
                                                                    {" "}
                                                                    ETH
                                                                </strong>

                                                            </div>

                                                            <div className="flex justify-between">

                                                                <span className="text-zinc-400">
                                                                    Vendidos
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        vendidos
                                                                    }
                                                                </strong>

                                                            </div>

                                                        </div>

                                                        <div
                                                            className="
                                                                bg-zinc-800/40
                                                                rounded-xl
                                                                p-4
                                                                text-sm
                                                                space-y-2
                                                            "
                                                        >

                                                            <div className="flex justify-between">

                                                                <span className="text-zinc-400">
                                                                    Criado em
                                                                </span>

                                                                <span>
                                                                    {
                                                                        formatarData(
                                                                            projeto.dataCriacao
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </div>
                                                );
                                            })
                                        }

                                    </div>
                                )
                            }

                        </div>

                        <div
                            className="
                                space-y-6
                            "
                        >

                            <h2
                                className="
                                    text-3xl
                                    font-bold
                                "
                            >
                                Histórico de Vendas
                            </h2>

                            {
                                vendas.length === 0
                                ? (

                                    <div
                                        className="
                                            bg-zinc-900
                                            rounded-2xl
                                            p-6
                                        "
                                    >
                                        Nenhuma venda realizada.
                                    </div>

                                ) : (

                                    <div
                                        className="
                                            space-y-4
                                        "
                                    >

                                        {
                                            vendas.map(
                                                (
                                                    venda,
                                                    index
                                                ) => (

                                                    <div
                                                        key={
                                                            index
                                                        }

                                                        className="
                                                            bg-zinc-900
                                                            border
                                                            border-zinc-800
                                                            p-6
                                                            rounded-2xl
                                                            space-y-3
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                flex-col
                                                                md:flex-row
                                                                md:items-center
                                                                md:justify-between
                                                                gap-2
                                                            "
                                                        >

                                                            <div>

                                                                <p className="text-zinc-400 text-sm">
                                                                    Projeto
                                                                </p>

                                                                <h3
                                                                    className="
                                                                        text-2xl
                                                                        font-bold
                                                                    "
                                                                >
                                                                    {
                                                                        venda.nomeProjeto
                                                                    }
                                                                </h3>

                                                            </div>

                                                            <div
                                                                className="
                                                                    bg-green-700
                                                                    px-4
                                                                    py-2
                                                                    rounded-xl
                                                                    font-bold
                                                                "
                                                            >

                                                                {
                                                                    venda.creditosComprados
                                                                }
                                                                {" "}
                                                                créditos

                                                            </div>

                                                        </div>

                                                        <div
                                                            className="
                                                                grid
                                                                grid-cols-1
                                                                md:grid-cols-2
                                                                gap-4
                                                                text-sm
                                                            "
                                                        >

                                                            <div
                                                                className="
                                                                    bg-zinc-800
                                                                    rounded-xl
                                                                    p-4
                                                                "
                                                            >

                                                                <p className="text-zinc-400">
                                                                    Compradora
                                                                </p>

                                                                <p>
                                                                    {
                                                                        venda.nomeComprador
                                                                    }
                                                                </p>

                                                            </div>

                                                            <div
                                                                className="
                                                                    bg-zinc-800
                                                                    rounded-xl
                                                                    p-4
                                                                "
                                                            >

                                                                <p className="text-zinc-400">
                                                                    Data da Venda
                                                                </p>

                                                                <p>
                                                                    {
                                                                        formatarData(
                                                                            venda.timestamp
                                                                        )
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </div>
                                                )
                                            )
                                        }

                                    </div>
                                )
                            }

                        </div>

                    </>
                )
            }

        </div>
    );
}