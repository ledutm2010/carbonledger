import { useEffect, useState } from "react";
import { useWeb3 } from "../context/Web3Context";

import {
    carregarEmpresa,
    carregarHistoricoCompras
}
from "../services/blockchain";

import {
    getMarketplace,
    getGreenNFT,
    getCompanyRegistry
}
from "../services/contracts";

export default function DashboardCompradora() {

    const { signer, wallet } = useWeb3();

    const [empresa, setEmpresa] = useState(null);

    const [
        creditosComprados,
        setCreditosComprados
    ] = useState(0);

    const [faltam, setFaltam] = useState(0);

    const [
        empresaVerde,
        setEmpresaVerde
    ] = useState(false);

    const [historico, setHistorico] = useState([]);

    const [possuiNFT, setPossuiNFT] = useState(false);

    const [loading, setLoading] = useState(true);

    const [
        nomesEmpresas,
        setNomesEmpresas
    ] = useState({});

    async function resolverNomeEmpresa(
        address,
        registry
    ) {

        try {

            if (!address) return "-";

            if (nomesEmpresas[address]) {

                return nomesEmpresas[address];
            }

            const data =
                await registry.empresas(
                    address
                );

            const nome = data[0];

            const nomeFinal =

                nome
                &&
                nome.length > 0

                    ? nome

                    : (
                        address.slice(0, 6)
                        +
                        "..."
                        +
                        address.slice(-4)
                    );

            setNomesEmpresas(prev => ({

                ...prev,

                [address]:
                    nomeFinal
            }));

            return nomeFinal;

        } catch {

            return (
                address.slice(0, 6)
                +
                "..."
                +
                address.slice(-4)
            );
        }
    }

    async function carregar() {

        if (!signer || !wallet) {

            setLoading(false);
            return;
        }

        try {

            const empresaData =
                await carregarEmpresa(
                    signer,
                    wallet
                );

            setEmpresa(empresaData);

            const marketplace =
                getMarketplace(signer);

            let total = 0;

            try {

                total =
                    await marketplace
                        .totalCreditosComprados(
                            wallet
                        );

            } catch (err) {

                console.log(err);
            }

            const totalComprado =
                Number(total || 0);

            setCreditosComprados(
                totalComprado
            );

            const restante =

                Number(
                    empresaData?.emissao || 0
                )
                -
                totalComprado;

            setFaltam(

                restante > 0
                    ? restante
                    : 0
            );

            setEmpresaVerde(
                restante <= 0
            );

            let historicoCompras = [];

            try {

                historicoCompras =
                    await carregarHistoricoCompras(
                        signer,
                        wallet
                    );

                if (
                    !Array.isArray(
                        historicoCompras
                    )
                ) {

                    historicoCompras = [];
                }

            } catch (err) {

                console.log(err);

                historicoCompras = [];
            }

            const registry =
                getCompanyRegistry(signer);

            const historicoEnriquecido =
                await Promise.all(

                    historicoCompras.map(
                        async (item) => {

                            const nomeVendedor =
                                await resolverNomeEmpresa(
                                    item.vendedor,
                                    registry
                                );

                            return {

                                ...item,

                                nomeVendedor
                            };
                        }
                    )
                );

            setHistorico(
                historicoEnriquecido
                    .reverse()
            );

            try {

                const nft =
                    getGreenNFT(signer);

                const balance =
                    await nft.balanceOf(
                        wallet
                    );

                setPossuiNFT(

                    Number(
                        balance?.toString()
                        || 0
                    ) > 0
                );

            } catch (err) {

                console.log(err);

                setPossuiNFT(false);
            }

        } catch (error) {

            console.log(
                "ERRO DASHBOARD:",
                error
            );

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

    useEffect(() => {

        if (!signer || !wallet) return;

        carregar();

    }, [signer, wallet]);

    if (loading) {

        return (

            <div
                className="
                    p-10
                    text-center
                    text-2xl
                "
            >
                Carregando...
            </div>
        );
    }

    return (

        <div
            className="
                p-10
                space-y-10
            "
        >

            <h1
                className="
                    text-5xl
                    font-bold
                "
            >
                Dashboard Compradora
            </h1>

            <div
                className="
                    grid
                    grid-cols-1
                    md:grid-cols-5
                    gap-6
                "
            >

                <div
                    className="
                        bg-green-900
                        p-6
                        rounded-2xl
                    "
                >

                    <h2>
                        Emissão CO₂
                    </h2>

                    <p
                        className="
                            text-4xl
                        "
                    >
                        {
                            empresa?.emissao ?? 0
                        }
                    </p>

                </div>

                <div
                    className="
                        bg-blue-900
                        p-6
                        rounded-2xl
                    "
                >

                    <h2>
                        Comprados
                    </h2>

                    <p
                        className="
                            text-4xl
                        "
                    >
                        {
                            creditosComprados
                        }
                    </p>

                </div>

                <div
                    className="
                        bg-yellow-700
                        p-6
                        rounded-2xl
                    "
                >

                    <h2>
                        Faltam
                    </h2>

                    <p
                        className="
                            text-4xl
                        "
                    >
                        {faltam}
                    </p>

                </div>

                <div
                    className={`
                        p-6
                        rounded-2xl
                        ${
                            empresaVerde
                                ? "bg-green-500"
                                : "bg-red-500"
                        }
                    `}
                >

                    <h2>
                        Status
                    </h2>

                    <p>
                        {
                            empresaVerde
                                ? "Verde"
                                : "Pendente"
                        }
                    </p>

                </div>

                <div
                    className={`
                        p-6
                        rounded-2xl
                        ${
                            possuiNFT
                                ? "bg-emerald-600"
                                : "bg-zinc-700"
                        }
                    `}
                >

                    <h2>
                        NFT
                    </h2>

                    <p>
                        {
                            possuiNFT
                                ? "Emitido"
                                : "Não"
                        }
                    </p>

                </div>

            </div>

            <div
                className="
                    space-y-4
                "
            >

                <h2
                    className="
                        text-3xl
                        font-bold
                    "
                >
                    Histórico de Compras
                </h2>

                {
                    historico.length === 0
                        ? (

                            <div
                                className="
                                    bg-zinc-900
                                    p-6
                                    rounded-2xl
                                "
                            >
                                Nenhuma compra
                            </div>

                        ) : (

                            historico.map(
                                (
                                    item,
                                    index
                                ) => (

                                    <div
                                        key={index}
                                        className="
                                            bg-zinc-900
                                            p-6
                                            rounded-2xl
                                        "
                                    >

                                        <p
                                            className="
                                                font-bold
                                            "
                                        >
                                            {
                                                item.nomeProjeto
                                            }
                                        </p>

                                        <p>
                                            {
                                                Number(
                                                    item.creditosComprados
                                                )
                                            }
                                            {" "}
                                            créditos
                                        </p>

                                        <p
                                            className="
                                                text-green-400
                                            "
                                        >
                                            {
                                                item.nomeVendedor
                                            }
                                        </p>

                                        <p
                                            className="
                                                text-sm
                                                text-gray-400
                                            "
                                        >
                                            {
                                                formatarData(
                                                    item.timestamp
                                                )
                                            }
                                        </p>

                                    </div>
                                )
                            )
                        )
                }

            </div>

        </div>
    );
}