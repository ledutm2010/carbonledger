import { useEffect, useState } from "react";
import { ethers } from "ethers";

import ProjetoCard from "../components/ProjetoCard";

import {
    getProjectManager,
    getMarketplace,
    getGreenNFT,
    getCompanyRegistry
}
from "../services/contracts";

import { useWeb3 } from "../context/Web3Context";

export default function Marketplace() {

    const {
        signer,
        tipoEmpresa,
        wallet
    } = useWeb3();

    const [projetos, setProjetos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [possuiNFT, setPossuiNFT] = useState(false);

    const [nome, setNome] = useState("");
    const [tipoProjeto, setTipoProjeto] = useState(0);
    const [duracao, setDuracao] = useState(0);
    const [totalCreditos, setTotalCreditos] = useState("");
    const [preco, setPreco] = useState("");
    const [criando, setCriando] = useState(false);

    async function carregarProjetos() {

        if (!signer) return;

        setLoading(true);

        try {

            const projectContract = getProjectManager(signer);
            const registry = getCompanyRegistry(signer);

            const total = await projectContract.proximoProjetoId();

            let lista = [];

            for (let i = 1; i <= Number(total); i++) {

                try {

                    const projeto =
                        await projectContract.projetos(i);

                    if (projeto.ativo) {

                        const empresaData =
                            await registry.empresas(
                                projeto.produtora
                            );

                        const nomeProdutora =
                            empresaData[0];

                        lista.push({

                            id:
                                Number(projeto.id),

                            nome:
                                projeto.nome,

                            produtora:
                                projeto.produtora,

                            nomeProdutora,

                            ativo:
                                projeto.ativo,

                            tipoProjeto:
                                Number(
                                    projeto.tipoProjeto
                                ),

                            duracao:
                                Number(
                                    projeto.duracao
                                ),

                            totalCreditos:
                                Number(
                                    projeto.totalCreditos
                                ),

                            creditosDisponiveis:
                                Number(
                                    projeto.creditosDisponiveis
                                ),

                            preco:
                                ethers.formatEther(
                                    projeto.precoPorCredito
                                ),

                            precoWei:
                                projeto.precoPorCredito.toString(),

                            dataCriacao:
                                Number(
                                    projeto.dataCriacao
                                )
                        });
                    }

                } catch (err) {

                    console.log(
                        "Erro projeto",
                        i,
                        err
                    );
                }
            }

            console.log(
                "Projetos carregados:",
                lista
            );

            setProjetos(lista);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);
        }
    }

    async function verificarNFT() {

        try {

            if (!signer || !wallet) return;

            const contract =
                getGreenNFT(signer);

            const total =
                await contract.proximoTokenId();

            let encontrou = false;

            for (let i = 1; i <= Number(total); i++) {

                try {

                    const dono =
                        await contract.ownerOf(i);

                    if (
                        dono.toLowerCase()
                        ===
                        wallet.toLowerCase()
                    ) {

                        encontrou = true;
                        break;
                    }

                } catch {}
            }

            setPossuiNFT(encontrou);

        } catch (error) {

            console.log(error);
        }
    }

    async function criarProjeto() {

        try {

            setCriando(true);

            const contract =
                getProjectManager(signer);

            const tx =
                await contract.criarProjeto(
                    nome,
                    Number(tipoProjeto),
                    Number(duracao),
                    Number(totalCreditos),
                    ethers.parseEther(preco)
                );

            await tx.wait();

            alert("Projeto criado!");

            setNome("");
            setTotalCreditos("");
            setPreco("");

            await carregarProjetos();

        } catch (error) {

            console.log(error);

            alert(
                "Erro ao criar projeto"
            );

        } finally {

            setCriando(false);
        }
    }

    async function comprar(projetoId, precoWei, quantidade) {

        try {

            if (!quantidade || quantidade <= 0) {

                alert("Quantidade inválida");
                return;
            }

            const registry =
                getCompanyRegistry(signer);

            const marketplace =
                getMarketplace(signer);

            const empresa =
                await registry.empresas(wallet);

            const emissaoEmpresa =
                Number(empresa[2]);

            const totalComprado =
                Number(
                    await marketplace.totalCreditosComprados(
                        wallet
                    )
                );

            const restante =
                emissaoEmpresa - totalComprado;

            if (restante <= 0) {

                alert(
                    "Sua empresa já compensou toda a emissão de carbono."
                );

                return;
            }

            if (quantidade > restante) {

                alert(
                    `Você só pode comprar mais ${restante} créditos.`
                );

                return;
            }

            const valorTotal =
                BigInt(precoWei) *
                BigInt(quantidade);

            const contract =
                getMarketplace(signer);

            const tx =
                await contract.comprarCreditos(
                    projetoId,
                    quantidade,
                    {
                        value: valorTotal
                    }
                );

            await tx.wait();

            alert(
                "Compra realizada com sucesso!"
            );

            await carregarProjetos();

            await verificarNFT();

        } catch (error) {

            console.log(error);

            alert(
                error.shortMessage
                ||
                "Erro na compra"
            );
        }
    }

    useEffect(() => {

        if (signer) {

            carregarProjetos();
            verificarNFT();
        }

    }, [signer]);

    if (loading) {

        return (

            <div
                className="
                    p-10
                    text-center
                    text-2xl
                "
            >
                Carregando marketplace...
            </div>
        );
    }

    return (

        <div className="p-10">

            <div
                className="
                    flex
                    items-center
                    justify-between
                    mb-10
                "
            >

                <h1
                    className="
                        text-5xl
                        font-bold
                    "
                >
                    Marketplace Carbono
                </h1>

            </div>

            {
                tipoEmpresa === "produtora"
                && (

                    <div
                        className="
                            mb-10
                            bg-zinc-900
                            p-6
                            rounded-xl
                            space-y-3
                        "
                    >

                        <h2
                            className="
                                text-2xl
                                font-bold
                            "
                        >
                            Criar Projeto
                        </h2>

                        <input
                            className="
                                w-full
                                p-2
                                bg-zinc-800
                                rounded
                            "
                            placeholder="Nome do projeto"
                            value={nome}
                            onChange={(e)=>
                                setNome(
                                    e.target.value
                                )
                            }
                        />

                        <select
                            className="
                                w-full
                                p-2
                                bg-zinc-800
                                rounded
                            "
                            value={tipoProjeto}
                            onChange={(e)=>
                                setTipoProjeto(
                                    e.target.value
                                )
                            }
                        >

                            <option value={0}>
                                Conservação
                            </option>

                            <option value={1}>
                                Reflorestamento
                            </option>

                            <option value={2}>
                                Energia Limpa
                            </option>

                        </select>

                        <select
                            className="
                                w-full
                                p-2
                                bg-zinc-800
                                rounded
                            "
                            value={duracao}
                            onChange={(e)=>
                                setDuracao(
                                    e.target.value
                                )
                            }
                        >

                            <option value={0}>
                                10-100 anos
                            </option>

                            <option value={1}>
                                100-1000 anos
                            </option>

                            <option value={2}>
                                +1000 anos
                            </option>

                        </select>

                        <input
                            className="
                                w-full
                                p-2
                                bg-zinc-800
                                rounded
                            "
                            placeholder="Total de créditos"
                            value={totalCreditos}
                            onChange={(e)=>
                                setTotalCreditos(
                                    e.target.value
                                )
                            }
                        />

                        <input
                            className="
                                w-full
                                p-2
                                bg-zinc-800
                                rounded
                            "
                            placeholder="Preço por crédito (ETH)"
                            value={preco}
                            onChange={(e)=>
                                setPreco(
                                    e.target.value
                                )
                            }
                        />

                        <button
                            onClick={criarProjeto}
                            disabled={criando}
                            className="
                                bg-blue-600
                                px-4
                                py-2
                                rounded-xl
                                w-full
                            "
                        >

                            {
                                criando
                                ? "Criando..."
                                : "Criar Projeto"
                            }

                        </button>

                    </div>
                )
            }

            <div
                className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    lg:grid-cols-3
                    gap-6
                "
            >

                {
                    projetos.map((projeto)=>(

                        <ProjetoCard
                            key={projeto.id}
                            projeto={projeto}
                            comprar={
                                tipoEmpresa === "compradora"
                                    ? (qtd)=>
                                        comprar(
                                            projeto.id,
                                            projeto.precoWei,
                                            qtd
                                        )
                                    : undefined
                            }
                        />
                    ))
                }

            </div>

        </div>
    );
}