import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { ethers } from "ethers";
import { getCompanyRegistry } from "../services/contracts";

const Web3Context = createContext();

export function Web3Provider({ children }) {

    const [wallet, setWallet] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [tipoEmpresa, setTipoEmpresa] = useState(null);

    async function verificarEmpresa(signerInstance, address) {

        try {

            const contract = getCompanyRegistry(signerInstance);

            const ehProdutora = await contract.ehProdutora(address);
            const ehCompradora = await contract.ehCompradora(address);

            if (ehProdutora) {
                setTipoEmpresa("produtora");
                return;
            }

            if (ehCompradora) {
                setTipoEmpresa("compradora");
                return;
            }

            setTipoEmpresa(null);

        } catch (error) {
            console.log(error);
        }
    }

    async function carregarCarteira() {

        try {

            if(!window.ethereum)
                return;

            const web3Provider =
                new ethers.BrowserProvider(
                    window.ethereum
                );

            const web3Signer =
                await web3Provider
                .getSigner();

            const address =
                await web3Signer
                .getAddress();

            setWallet(address);

            setProvider(
                web3Provider
            );

            setSigner(
                web3Signer
            );

            await verificarEmpresa(
                web3Signer,
                address
            );

        } catch(error) {

            console.log(error);
        }
    }

    async function connectWallet() {

        try {

            if(!window.ethereum) {

                alert(
                    "Instale MetaMask"
                );

                return;
            }

            await window.ethereum.request({

                method:
                "wallet_requestPermissions",

                params: [{

                    eth_accounts: {}

                }]
            });

            await window.ethereum.request({

                method:
                "eth_requestAccounts"
            });

            await carregarCarteira();

        } catch(error) {

            console.log(error);
        }
    }

    function disconnectWallet() {
        setWallet(null);
        setProvider(null);
        setSigner(null);
        setTipoEmpresa(null);
    }

    useEffect(() => {

        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts) => {

            if (!accounts || accounts.length === 0) {
                disconnectWallet();
                return;
            }

            setWallet(accounts[0]);
        };

        const handleChainChanged = () => {
            window.location.reload();
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        return () => {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum.removeListener("chainChanged", handleChainChanged);
        };

    }, []);

    return (
        <Web3Context.Provider value={{
            wallet,
            provider,
            signer,
            tipoEmpresa,
            setTipoEmpresa,
            connectWallet,
            disconnectWallet
        }}>
            {children}
        </Web3Context.Provider>
    );
}

export function useWeb3() {
    return useContext(Web3Context);
}