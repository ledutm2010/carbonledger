export default function DashboardCard({
    titulo,
    valor
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
                text-xl
                mb-2
            "
            >
                {titulo}
            </h2>

            <p
                className="
                text-4xl
                font-bold
            "
            >
                {valor}
            </p>

        </div>
    );
}