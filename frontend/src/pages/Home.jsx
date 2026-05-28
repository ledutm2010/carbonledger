import {
    Link
}
from "react-router-dom";

import {
    useWeb3
}
from "../context/Web3Context";

export default function Home() {

    const {
        wallet,
        tipoEmpresa,
        connectWallet
    } = useWeb3();

    return (

        <div
            className="
            flex
            flex-col
            items-center
            justify-center
            text-center
            gap-8
            mt-20
        "
        >

            <h1
                className="
                text-7xl
                font-bold
            "
            >
                CarbonLedger
            </h1>

            <p
                className="
                text-2xl
                max-w-3xl
            "
            >
                Plataforma blockchain
                de compensação
                auditável de carbono.
            </p>

            {
                !wallet && (

                    <button

                        onClick={
                            connectWallet
                        }

                        className="
                        bg-green-500
                        px-8
                        py-4
                        rounded-2xl
                        text-2xl
                    "
                    >
                        Conectar MetaMask
                    </button>
                )
            }

            {
                wallet
                &&
                !tipoEmpresa
                && (

                    <div
                        className="
                        flex
                        flex-col
                        gap-6
                        items-center
                    "
                    >

                        <h2
                            className="
                            text-3xl
                            font-bold
                        "
                        >
                            Empresa não cadastrada
                        </h2>

                        <Link
                            to="/registro"
                        >

                            <button
                                className="
                                bg-blue-500
                                px-8
                                py-4
                                rounded-2xl
                                text-2xl
                            "
                            >
                                Cadastrar Empresa
                            </button>

                        </Link>

                    </div>
                )
            }

            {
                wallet
                &&
                tipoEmpresa
                && (

                    <div
                        className="
                        text-3xl
                        text-green-400
                        font-bold
                    "
                    >

                        Carteira conectada

                    </div>
                )
            }

        </div>
    );
}