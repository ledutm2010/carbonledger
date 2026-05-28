export default function NFTCard({
    nft
}) {

    return (

        <div
            className="
            bg-green-900
            p-6
            rounded-2xl
        "
        >

            <h2
                className="
                text-2xl
                font-bold
            "
            >
                NFT ESG
            </h2>

            <p>
                Token:
                {nft.tokenId}
            </p>

            <p>
                Emissão compensada:
                {
                    nft
                    .emissaoCompensada
                }
            </p>

            <p>
                Validade:
                {
                    nft.validade
                }
            </p>

        </div>
    );
}