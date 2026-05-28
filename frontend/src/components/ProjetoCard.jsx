import { useState, useMemo } from "react";
import { ethers } from "ethers";

export default function ProjetoCard({
    projeto,
    comprar
}) {

    const [
        abrirCompra,
        setAbrirCompra
    ] = useState(false);

    const [
        quantidade,
        setQuantidade
    ] = useState(1);

    const qtd = useMemo(() => {

        const n = Number(quantidade);

        return (
            isNaN(n)
            ||
            n <= 0
        )
            ? 0
            : n;

    }, [quantidade]);

    function safeNumber(value) {

        if (
            value === undefined
            ||
            value === null
        ) {
            return 0;
        }

        try {

            return Number(value);

        } catch {

            return 0;
        }
    }

    function nomeDuracao() {

        const d =
            safeNumber(
                projeto?.duracao
            );

        if (d === 0) {
            return "10-100 anos";
        }

        if (d === 1) {
            return "100-1000 anos";
        }

        return "+1000 anos";
    }

    function nomeTipo() {

        const t =
            safeNumber(
                projeto?.tipoProjeto
            );

        if (t === 0) {
            return "Conservação";
        }

        if (t === 1) {
            return "Reflorestamento";
        }

        return "Energia Limpa";
    }

    function precoETH() {

        try {

            if (
                projeto?.precoPorCredito
            ) {

                return Number(
                    projeto.precoPorCredito
                );
            }

            if (
                projeto?.precoWei
            ) {

                return Number(
                    ethers.formatEther(
                        projeto.precoWei
                    )
                );
            }

            if (
                projeto?.preco
            ) {

                const raw =
                    projeto.preco;

                if (
                    typeof raw
                    === "bigint"
                ) {

                    return Number(
                        ethers.formatEther(
                            raw
                        )
                    );
                }

                if (
                    raw._isBigNumber
                    ||
                    raw.toString
                ) {

                    return Number(
                        ethers.formatEther(
                            raw.toString()
                        )
                    );
                }

                return Number(raw);
            }

            return 0;

        } catch (e) {

            console.log(
                "Erro preço:",
                e
            );

            return 0;
        }
    }

    function calcularTotal() {

        const total =
            precoETH() * qtd;

        return total.toFixed(6);
    }

    function calcularPercentualDisponivel() {

        const total =
            safeNumber(
                projeto?.totalCreditos
            );

        const disponiveis =
            safeNumber(
                projeto?.creditosDisponiveis
            );

        if (!total) {
            return 0;
        }

        return (
            (
                disponiveis / total
            ) * 100
        ).toFixed(0);
    }

    function formatarData(timestamp) {

        if (!timestamp) {
            return "-";
        }

        try {

            return new Date(
                Number(timestamp) * 1000
            ).toLocaleString("pt-BR");

        } catch {

            return "-";
        }
    }

    function handleComprar() {

        if (qtd <= 0) {

            alert(
                "Quantidade inválida"
            );

            return;
        }

        if (
            qtd >
            safeNumber(
                projeto?.creditosDisponiveis
            )
        ) {

            alert(
                "Quantidade maior que os créditos disponíveis"
            );

            return;
        }

        comprar(qtd);

        setAbrirCompra(false);

        setQuantidade(1);
    }

    function nomeEmpresa() {

        if (
            projeto?.nomeProdutora
        ) {

            return projeto.nomeProdutora;
        }

        if (
            projeto?.produtora
        ) {

            return (
                projeto.produtora.slice(0, 6)
                +
                "..."
                +
                projeto.produtora.slice(-4)
            );
        }

        return "Desconhecido";
    }

    if (!projeto) {
        return null;
    }

    return (

        <div
            className="
                bg-gradient-to-b
                from-green-900
                to-zinc-900
                border
                border-green-700
                rounded-2xl
                p-6
                space-y-4
                shadow-xl
            "
        >

            <h2
                className="
                    text-2xl
                    font-bold
                    text-white
                "
            >
                {
                    projeto.nome
                    ||
                    "Sem nome"
                }
            </h2>

            <div
                className="
                    grid
                    grid-cols-2
                    gap-3
                    text-sm
                "
            >

                <div
                    className="
                        bg-zinc-800/70
                        rounded-xl
                        p-3
                    "
                >

                    <p className="text-zinc-400">
                        Tipo
                    </p>

                    <p className="font-bold">
                        {nomeTipo()}
                    </p>

                </div>

                <div
                    className="
                        bg-zinc-800/70
                        rounded-xl
                        p-3
                    "
                >

                    <p className="text-zinc-400">
                        Duração
                    </p>

                    <p className="font-bold">
                        {nomeDuracao()}
                    </p>

                </div>

                <div
                    className="
                        bg-zinc-800/70
                        rounded-xl
                        p-3
                    "
                >

                    <p className="text-zinc-400">
                        Disponíveis
                    </p>

                    <p className="font-bold">
                        {
                            safeNumber(
                                projeto.creditosDisponiveis
                            )
                        }
                    </p>

                </div>

                <div
                    className="
                        bg-zinc-800/70
                        rounded-xl
                        p-3
                    "
                >

                    <p className="text-zinc-400">
                        Total
                    </p>

                    <p className="font-bold">
                        {
                            safeNumber(
                                projeto.totalCreditos
                            )
                        }
                    </p>

                </div>

            </div>

            <div
                className="
                    bg-zinc-800/70
                    rounded-xl
                    p-4
                    space-y-2
                "
            >

                <div className="flex justify-between">

                    <span className="text-zinc-400">
                        Preço por crédito
                    </span>

                    <span
                        className="
                            text-green-400
                            font-bold
                        "
                    >
                        {
                            precoETH().toFixed(6)
                        }
                        {" "}
                        ETH
                    </span>

                </div>

                <div className="flex justify-between">

                    <span className="text-zinc-400">
                        Disponibilidade
                    </span>

                    <span className="font-bold">
                        {
                            calcularPercentualDisponivel()
                        }
                        %
                    </span>

                </div>

            </div>

            <div
                className="
                    bg-zinc-800/50
                    rounded-xl
                    p-4
                    text-sm
                "
            >

                <div className="flex justify-between">

                    <span className="text-zinc-400">
                        Produtora
                    </span>

                    <span
                        className="
                            truncate
                            max-w-[180px]
                        "
                    >
                        {nomeEmpresa()}
                    </span>

                </div>

                <div className="flex justify-between mt-2">

                    <span className="text-zinc-400">
                        Criado
                    </span>

                    <span>
                        {
                            formatarData(
                                projeto.dataCriacao
                            )
                        }
                    </span>

                </div>

            </div>

            {
                comprar
                &&
                !abrirCompra
                && (

                    <button

                        onClick={() =>
                            setAbrirCompra(true)
                        }

                        className="
                            w-full
                            bg-green-500
                            hover:bg-green-600
                            py-3
                            rounded-xl
                            font-bold
                        "
                    >
                        Comprar Créditos
                    </button>
                )
            }

            {
                comprar
                &&
                abrirCompra
                && (

                    <div
                        className="
                            space-y-4
                        "
                    >

                        <input

                            type="number"

                            min="1"

                            max={
                                safeNumber(
                                    projeto.creditosDisponiveis
                                )
                            }

                            value={quantidade}

                            onChange={(e) =>
                                setQuantidade(
                                    e.target.value
                                )
                            }

                            className="
                                w-full
                                p-3
                                bg-zinc-800
                                rounded-xl
                            "
                        />

                        <div
                            className="
                                bg-zinc-800
                                p-4
                                rounded-xl
                            "
                        >

                            <p>

                                Total:
                                {" "}

                                <span
                                    className="
                                        text-green-400
                                    "
                                >
                                    {
                                        calcularTotal()
                                    }
                                    {" "}
                                    ETH
                                </span>

                            </p>

                        </div>

                        <div
                            className="
                                flex
                                gap-2
                            "
                        >

                            <button

                                onClick={
                                    handleComprar
                                }

                                className="
                                    flex-1
                                    bg-blue-600
                                    py-3
                                    rounded-xl
                                    font-bold
                                "
                            >
                                Confirmar
                            </button>

                            <button

                                onClick={() =>
                                    setAbrirCompra(false)
                                }

                                className="
                                    flex-1
                                    bg-zinc-600
                                    py-3
                                    rounded-xl
                                    font-bold
                                "
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>
                )
            }

        </div>
    );
}