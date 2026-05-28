import {
    useState
}
from "react";

import {
    useNavigate
}
from "react-router-dom";

import {
    getCompanyRegistry
}
from "../services/contracts";

import {
    useWeb3
}
from "../context/Web3Context";

export default function RegistroEmpresa() {

    const navigate =
        useNavigate();

    const {
        signer,
        setTipoEmpresa
    } = useWeb3();

    const [nome,
        setNome] =
        useState("");

    const [tipo,
        setTipo] =
        useState(0);

    const [emissao,
        setEmissao] =
        useState(0);

    const [loading,
        setLoading] =
        useState(false);

    async function registrar() {

        try {

            setLoading(true);

            const contract =
                getCompanyRegistry(
                    signer
                );

            const tx =
                await contract
                .registrarEmpresa(
                    nome,
                    tipo,
                    emissao
                );

            await tx.wait();

            const tipoTexto =
                tipo == 0
                ? "produtora"
                : "compradora";

            setTipoEmpresa(
                tipoTexto
            );

            localStorage.setItem(
                "tipoEmpresa",
                tipoTexto
            );

            alert(
                "Empresa registrada"
            );

            if(tipo == 0) {

                navigate(
                    "/produtora"
                );

            } else {

                navigate(
                    "/compradora"
                );
            }

        } catch(error) {

            console.log(error);

            alert(
                "Erro registro"
            );

        } finally {

            setLoading(false);
        }
    }

    return (

        <div
            className="
            max-w-xl
            mx-auto
            bg-green-900
            p-8
            rounded-2xl
            space-y-4
        "
        >

            <h1
                className="
                text-4xl
                font-bold
            "
            >
                Registrar Empresa
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
                    setTipo(
                        Number(
                            e.target.value
                        )
                    )
                }
            >

                <option value={0}>
                    Produtora
                </option>

                <option value={1}>
                    Compradora
                </option>

            </select>

            {
                tipo == 1 &&
                <input

                    type="number"

                    placeholder=
                    "Toneladas CO2"

                    className="
                    w-full
                    p-3
                    rounded
                    text-black
                "

                    onChange={(e)=>
                        setEmissao(
                            e.target.value
                        )
                    }
                />
            }

            <button

                onClick={registrar}

                disabled={loading}

                className="
                bg-green-500
                px-6
                py-3
                rounded-xl
                w-full
            "
            >

                {
                    loading
                    ? "Registrando..."
                    : "Registrar"
                }

            </button>

        </div>
    );
}