import { ethers } from "ethers";

import {
    getCompanyRegistry,
    getProjectManager,
    getMarketplace,
    getGreenNFT
} from "./contracts";

export async function carregarEmpresa(signer, wallet) {

    try {

        const registry = getCompanyRegistry(signer);

        const empresa = await registry.empresas(wallet);

        return {
            nome: empresa[0],
            tipo: Number(empresa[1]),
            emissao: Number(empresa[2]),
            registrada: empresa[3],
            dataRegistro: Number(empresa[4])
        };

    } catch (error) {

        console.log("carregarEmpresa erro:", error);

        return {
            nome: "",
            tipo: 0,
            emissao: 0,
            registrada: false,
            dataRegistro: 0
        };
    }
}

export async function carregarProjetosProdutora(signer, wallet) {

    try {

        const manager = getProjectManager(signer);

        const projetos = [];

        const total = await manager.proximoProjetoId();

        for (let i = 1; i <= Number(total); i++) {

            try {

                const projeto = await manager.projetos(i);

                if (
                    projeto.produtora.toLowerCase() === wallet.toLowerCase()
                ) {

                    const vendas =
                        await carregarVendasProdutora(
                            signer,
                            wallet
                        );

                    projetos.push({

                        id: Number(projeto.id),

                        nome: projeto.nome,

                        produtora: projeto.produtora,

                        totalCreditos: Number(
                            projeto.totalCreditos
                        ),

                        creditosDisponiveis: Number(
                            projeto.creditosDisponiveis
                        ),

                        preco: ethers.formatEther(
                            projeto.precoPorCredito
                        ),

                        precoPorCredito:
                            projeto.precoPorCredito.toString(),

                        precoWei:
                            projeto.precoPorCredito.toString(),

                        ativo: projeto.ativo,

                        tipoProjeto: Number(
                            projeto.tipoProjeto
                        ),

                        duracao: Number(
                            projeto.duracao
                        ),

                        dataCriacao: Number(
                            projeto.dataCriacao
                        ),

                        vendas
                    });
                }

            } catch (err) {

                console.log(
                    "erro projeto:",
                    i,
                    err
                );
            }
        }

        return projetos;

    } catch (error) {

        console.log(
            "carregarProjetosProdutora erro:",
            error
        );

        return [];
    }
}

export async function carregarMarketplace(signer) {

    try {

        const manager = getProjectManager(signer);

        const registry =
            getCompanyRegistry(signer);

        const projetos = [];

        const total =
            await manager.proximoProjetoId();

        for (
            let i = 1;
            i <= Number(total);
            i++
        ) {

            try {

                const projeto =
                    await manager.projetos(i);

                if (projeto.ativo) {

                    const empresa =
                        await registry.empresas(
                            projeto.produtora
                        );

                    projetos.push({

                        id: Number(projeto.id),

                        nome: projeto.nome,

                        produtora:
                            projeto.produtora,

                        nomeProdutora:
                            empresa[0],

                        totalCreditos: Number(
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

                        precoPorCredito:
                            projeto.precoPorCredito.toString(),

                        precoWei:
                            projeto.precoPorCredito.toString(),

                        duracao: Number(
                            projeto.duracao
                        ),

                        tipoProjeto: Number(
                            projeto.tipoProjeto
                        ),

                        dataCriacao: Number(
                            projeto.dataCriacao
                        )
                    });
                }

            } catch (err) {

                console.log(
                    "erro marketplace projeto:",
                    i,
                    err
                );
            }
        }

        return projetos;

    } catch (error) {

        console.log(
            "carregarMarketplace erro:",
            error
        );

        return [];
    }
}

export async function carregarHistoricoCompras(
    signer,
    wallet
) {

    try {

        const marketplace =
            getMarketplace(signer);

        const lista =
            await marketplace
                .listarComprasEmpresa(wallet);

        return lista.map((item) => ({

            projetoId: Number(
                item.projetoId
            ),

            nomeProjeto:
                item.nomeProjeto,

            vendedor:
                item.vendedor,

            comprador:
                item.comprador,

            creditosComprados: Number(
                item.creditosComprados
            ),

            timestamp: Number(
                item.timestamp
            ),

            duracao: Number(
                item.duracao
            )
        }));

    } catch (error) {

        console.log(
            "carregarHistoricoCompras erro:",
            error
        );

        return [];
    }
}

export async function carregarVendasProdutora(
    signer,
    wallet
) {

    try {

        const marketplace =
            getMarketplace(signer);

        const lista =
            await marketplace
                .listarVendasEmpresa(wallet);

        return lista.map((item) => ({

            projetoId: Number(
                item.projetoId
            ),

            nomeProjeto:
                item.nomeProjeto,

            vendedor:
                item.vendedor,

            comprador:
                item.comprador,

            creditosComprados: Number(
                item.creditosComprados
            ),

            timestamp: Number(
                item.timestamp
            ),

            duracao: Number(
                item.duracao
            )
        }));

    } catch (error) {

        console.log(
            "carregarVendasProdutora erro:",
            error
        );

        return [];
    }
}

export async function verificarNFTVerde(
    signer,
    wallet
) {

    try {

        const nft =
            getGreenNFT(signer);

        const balance =
            await nft.balanceOf(wallet);

        return Number(balance) > 0;

    } catch (error) {

        console.log(
            "verificarNFTVerde erro:",
            error
        );

        return false;
    }
}