import { Navigate }
from "react-router-dom";

import Loading
from "./Loading";

import { useWeb3 }
from "../context/Web3Context";

export default function RouteGuard({
    children,
    tipo
}) {

    const {
        wallet,
        empresa,
        loading
    } = useWeb3();

    if(loading) {
        return <Loading />;
    }

    if(!wallet) {
        return <Navigate to="/" />;
    }

    if(!empresa?.registrada) {
        return (
            <Navigate to="/registro" />
        );
    }

    if(
        tipo === "produtora"
        &&
        Number(empresa.tipo)
        !== 0
    ) {
        return <Navigate to="/" />;
    }

    if(
        tipo === "compradora"
        &&
        Number(empresa.tipo)
        !== 1
    ) {
        return <Navigate to="/" />;
    }

    return children;
}