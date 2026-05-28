import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    useWeb3
} from "../context/Web3Context";

export default function Navbar() {

    const navigate = useNavigate();

    const {

        wallet,
        tipoEmpresa,
        disconnectWallet

    } = useWeb3();

    const empresaRegistrada =
        tipoEmpresa === "produtora"
        ||
        tipoEmpresa === "compradora";

    function sair() {

        disconnectWallet();
        navigate("/");
    }

    return (

        <nav className="
            bg-green-900
            p-5
            flex
            justify-between
            items-center
        ">

            <Link to="/">
                <h1 className="
                    text-3xl
                    font-bold
                ">
                    CarbonLedger
                </h1>
            </Link>

            {
                wallet ? (

                    <div className="
                        flex
                        gap-5
                        items-center
                    ">

                        {
                            empresaRegistrada && (

                                <Link to="/marketplace">
                                    Marketplace
                                </Link>
                            )
                        }

                        {
                            tipoEmpresa === "produtora" && (

                                <Link to="/produtora">
                                    Dashboard
                                </Link>
                            )
                        }

                        {
                            tipoEmpresa === "compradora" && (

                                <>
                                    <Link to="/compradora">
                                        Dashboard
                                    </Link>

                                    <Link to="/nfts">
                                        NFTs
                                    </Link>
                                </>
                            )
                        }

                        {
                            wallet && !empresaRegistrada && (

                                <Link to="/registro">
                                    <button className="
                                        bg-blue-500
                                        px-4
                                        py-2
                                        rounded-xl
                                    ">
                                        Cadastrar Empresa
                                    </button>
                                </Link>
                            )
                        }

                        {
                            empresaRegistrada && (

                                <div className="
                                    bg-green-700
                                    px-4
                                    py-2
                                    rounded-xl
                                    capitalize
                                ">
                                    {tipoEmpresa}
                                </div>
                            )
                        }

                        <div className="
                            bg-black
                            px-4
                            py-2
                            rounded-xl
                        ">
                            {wallet.slice(0,6)}...
                        </div>

                        <button
                            onClick={sair}
                            className="
                                bg-red-500
                                px-4
                                py-2
                                rounded-xl
                            "
                        >
                            Sair
                        </button>

                    </div>

                ) : null
            }

        </nav>
    );
}