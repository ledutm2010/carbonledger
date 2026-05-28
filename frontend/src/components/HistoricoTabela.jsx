export default function HistoricoTabela({
    dados
}) {

    return (

        <table
            className="
            w-full
            mt-8
            border-collapse
        "
        >

            <thead>

                <tr
                    className="
                    bg-green-800
                "
                >

                    <th className="p-3">
                        Projeto
                    </th>

                    <th className="p-3">
                        Comprador
                    </th>

                    <th className="p-3">
                        Créditos
                    </th>

                </tr>

            </thead>

            <tbody>

                {
                    dados.map(
                        (item, index)=>(
                            <tr
                                key={index}

                                className="
                                bg-green-900
                            "
                            >

                                <td className="p-3">
                                    {
                                        item
                                        .nomeProjeto
                                    }
                                </td>

                                <td className="p-3">
                                    {
                                        item
                                        .comprador
                                    }
                                </td>

                                <td className="p-3">
                                    {
                                        item
                                        .creditosComprados
                                    }
                                </td>

                            </tr>
                        )
                    )
                }

            </tbody>

        </table>
    );
}