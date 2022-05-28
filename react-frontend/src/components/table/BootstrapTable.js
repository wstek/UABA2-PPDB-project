import React from 'react'
import Table from 'react-bootstrap/Table'


function BootstrapTable({columns, data}) {
    return (
        <div className={"col-auto mx-auto my-auto"}>
            <Table responsive className={"border-dark avoid-break-inside border-2 border"}>
                <thead className={"bg-darkpurple"}>
                <tr>
                    {/*<th>#</th>*/}
                    {columns.map((col, index) => <th className={"text-white"} key={index}>{col.Header}</th>)}
                </tr>
                </thead>
                <tbody className={"bg-purple"}>
                {data.map((obj, ind) => (
                        <tr key={ind}>
                            {columns.map((col, index) => <td key={index}>{obj[col.accessor]}</td>)}
                        </tr>
                    )
                )
                }
                </tbody>
            </Table>
        </div>
    )
}

export default BootstrapTable
