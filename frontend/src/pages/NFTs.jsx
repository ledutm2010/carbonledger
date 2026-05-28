import { useEffect, useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { getGreenNFT, getCompanyRegistry } from "../services/contracts";

export default function NFTs() {

    const { signer, wallet } = useWeb3();

    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(true);

    async function carregarNFTs() {

        if (!signer || !wallet) {
            setLoading(false);
            return;
        }

        try {

            const nftContract = getGreenNFT(signer);
            const registryContract = getCompanyRegistry(signer);

            const tokenIds = await nftContract.getCertificadosEmpresa(wallet);

            const lista = [];

            for (let i = 0; i < tokenIds.length; i++) {

                const tokenId = Number(tokenIds[i]);

                try {

                    const cert = await nftContract.getCertificado(tokenId);

                    const empresaData = await registryContract.empresas(cert.empresa);
                    const nomeEmpresa = empresaData[0];

                    lista.push({
                        tokenId: cert.tokenId.toString(),
                        empresa: nomeEmpresa,
                        emissaoCompensada: cert.emissaoCompensada.toString(),
                        validade: Number(cert.validade),
                        dataEmissao: Number(cert.dataEmissao)
                    });

                } catch (err) {
                    console.log("Erro ao ler NFT:", tokenId);
                }
            }

            setNfts(lista);

        } catch (error) {
            console.log("Erro ao carregar NFTs:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregarNFTs();
    }, [signer, wallet]);

    function formatarData(timestamp) {

        if (!timestamp) return "-";

        return new Date(timestamp * 1000)
            .toLocaleString("pt-BR");
    }

    function formatarValidade(valor) {

        switch (valor) {
            case 0:
                return "10 a 100 anos";
            case 1:
                return "100 a 1000 anos";
            case 2:
                return "+1000 anos";
            default:
                return "Desconhecido";
        }
    }

    if (loading) {
        return (
            <div className="text-white p-10 text-xl">
                Carregando NFTs...
            </div>
        );
    }

    return (
        <div className="text-white p-10 space-y-8">

            <div>
                <h1 className="text-5xl font-bold">
                    NFTs ESG 🌱
                </h1>

                <p className="mt-4 text-xl text-gray-300">
                    Certificados ambientais da empresa.
                </p>
            </div>

            {nfts.length === 0 ? (

                <div className="bg-zinc-900 p-6 rounded-xl">
                    Nenhum NFT encontrado para esta carteira.
                </div>

            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {nfts.map((nft) => (

                        <div
                            key={nft.tokenId}
                            className="bg-emerald-900 p-6 rounded-2xl space-y-2"
                        >
                            <h2 className="text-2xl font-bold">
                                Certificado ESG
                            </h2>

                            <p><b>Token ID:</b> {nft.tokenId}</p>
                            <p><b>Empresa:</b> {nft.empresa}</p>
                            <p><b>CO₂ compensado:</b> {nft.emissaoCompensada}</p>
                            <p><b>Validade:</b> {formatarValidade(nft.validade)}</p>
                            <p><b>Emitido:</b> {formatarData(nft.dataEmissao)}</p>
                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}