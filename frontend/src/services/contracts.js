import { ethers }
from "ethers";

import CompanyRegistryABI
from "../contracts/CompanyRegistry.json";

import CarbonProjectManagerABI
from "../contracts/CarbonProjectManager.json";

import CarbonMarketplaceABI
from "../contracts/CarbonMarketplace.json";

import GreenCertificateNFTABI
from "../contracts/GreenCertificateNFT.json";

const COMPANY_REGISTRY =
    import.meta.env
    .VITE_COMPANY_REGISTRY;

const PROJECT_MANAGER =
    import.meta.env
    .VITE_PROJECT_MANAGER;

const MARKETPLACE =
    import.meta.env
    .VITE_MARKETPLACE;

const GREEN_NFT =
    import.meta.env
    .VITE_GREEN_NFT;

export function getCompanyRegistry(
    signer
) {

    if (!COMPANY_REGISTRY) {

        console.error(
            "VITE_COMPANY_REGISTRY não definido"
        );
    }

    return new ethers.Contract(
        COMPANY_REGISTRY,
        CompanyRegistryABI,
        signer
    );
}

export function getProjectManager(
    signer
) {

    if (!PROJECT_MANAGER) {

        console.error(
            "VITE_PROJECT_MANAGER não definido"
        );
    }

    return new ethers.Contract(
        PROJECT_MANAGER,
        CarbonProjectManagerABI,
        signer
    );
}

export function getMarketplace(
    signer
) {

    if (!MARKETPLACE) {

        console.error(
            "VITE_MARKETPLACE não definido"
        );
    }

    return new ethers.Contract(
        MARKETPLACE,
        CarbonMarketplaceABI,
        signer
    );
}

export function getGreenNFT(
    signer
) {

    if (!GREEN_NFT) {

        console.error(
            "VITE_GREEN_NFT não definido"
        );
    }

    return new ethers.Contract(
        GREEN_NFT,
        GreenCertificateNFTABI,
        signer
    );
}

export function formatarWei(
    valor
) {

    try {

        return ethers.formatEther(
            valor.toString()
        );

    } catch {

        return "0";
    }
}

export function parseEther(
    valor
) {

    try {

        return ethers.parseEther(
            valor.toString()
        );

    } catch {

        return 0n;
    }
}

export function formatarData(
    timestamp
) {

    if (!timestamp) {
        return "-";
    }

    return new Date(
        Number(timestamp) * 1000
    ).toLocaleString("pt-BR");
}