import { useState }
from "react";

import {
    getProjectManager
}
from "../services/contracts";

import { useWeb3 }
from "../context/Web3Context";

export default function CriarProjeto() {

    const { signer } = useWeb3();

    const [nome, setNome] =
        useState("");

    const [tipoProjeto,
        setTipoProjeto] =
        useState(0);

    const [duracao,
        setDuracao] =
        useState(0);

    const [creditos,
        setCreditos] =
        useState(0);

    const [preco,
        setPreco] =
        useState(0);

    async function criarProjeto() {

        try {

            const contract =
                getProjectManager(
                    signer
                );

            const tx =
                await contract.criarProjeto(
                    nome,
                    tipoProjeto,
                    duracao,
                    creditos,
                    preco
                );

            await tx.wait();

            alert("Projeto criado");

        } catch(error) {
            console.log(error);
        }
    }

    return (

        <div
            className="
            max-w-xl
            space-y-4
        "
        >

            <h1
                className="
                text-4xl
                font-bold
            "
            >
                Criar Projeto
            </h1>

            <input
                placeholder="Nome"

                className="
                w-full
                p-3
                rounded
                text-black
            "

                onChange={(e)=>
                    setNome(
                        e.target.value
                    )
                }
            />

            <select
                className="
                w-full
                p-3
                rounded
                text-black
            "

                onChange={(e)=>
                    setTipoProjeto(
                        Number(
                            e.target.value
                        )
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
                p-3
                rounded
                text-black
            "

                onChange={(e)=>
                    setDuracao(
                        Number(
                            e.target.value
                        )
                    )
                }
            >

                <option value={0}>
                    10 a 100 anos
                </option>

                <option value={1}>
                    100 a 1000 anos
                </option>

                <option value={2}>
                    Mais de 1000 anos
                </option>

            </select>

            <input
                type="number"

                placeholder=
                "Quantidade créditos"

                className="
                w-full
                p-3
                rounded
                text-black
            "

                onChange={(e)=>
                    setCreditos(
                        e.target.value
                    )
                }
            />

            <input
                type="number"

                placeholder=
                "Preço por crédito"

                className="
                w-full
                p-3
                rounded
                text-black
            "

                onChange={(e)=>
                    setPreco(
                        e.target.value
                    )
                }
            />

            <button
                onClick={criarProjeto}

                className="
                bg-green-500
                px-6
                py-3
                rounded-xl
            "
            >
                Criar Projeto
            </button>

        </div>
    );
}