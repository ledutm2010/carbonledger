export default function Alert({
    mensagem,
    tipo
}) {

    return (

        <div
            className={`
                p-4
                rounded-xl
                mb-4
                ${
                    tipo === "erro"
                    ? "bg-red-600"
                    : "bg-green-600"
                }
            `}
        >

            {mensagem}

        </div>
    );
}