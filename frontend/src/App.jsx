import {
    BrowserRouter,
    Routes,
    Route,
    useLocation,
    useNavigate
} from "react-router-dom";

import { useEffect } from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import RegistroEmpresa from "./pages/RegistroEmpresa";
import DashboardProdutora from "./pages/DashboardProdutora";
import DashboardCompradora from "./pages/DashboardCompradora";
import NFTs from "./pages/NFTs";

function RouterHandler() {

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {

        if (location.pathname !== "/") {
            navigate("/", { replace: true });
        }

    }, []);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />

            <div className="p-10">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/registro" element={<RegistroEmpresa />} />
                    <Route path="/produtora" element={<DashboardProdutora />} />
                    <Route path="/compradora" element={<DashboardCompradora />} />
                    <Route path="/nfts" element={<NFTs />} />
                </Routes>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <RouterHandler />
        </BrowserRouter>
    );
}