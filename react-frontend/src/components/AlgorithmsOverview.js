// import {useEffect} from "react";
import React, {useMemo} from 'react'
import {PurpleSpinner} from "./PurpleSpinner"
import BootstrapTable from "./table/BootstrapTable";


function computeColumns(input_algorithms) {
    if (!input_algorithms) return [null, null]
    let data = []
    let columns = [
        {
            Header: 'ID', accessor: 'algorithm-id',
        },
        {
            Header: 'Name', accessor: 'AlgorithmName',

        },
        {
            Header: 'Type', accessor: 'Type',

        }, {
            Header: 'RetrainInterval', accessor: 'RetrainInterval',

        }
    ]
    let entry
    console.log(input_algorithms)
    for (const [input_algorithm_key, input_algorithm_object] of Object.entries(input_algorithms)) {
        entry = {"algorithm-id": input_algorithm_key}
        for (const [field_key, field_value] of Object.entries(input_algorithm_object)) {
            entry[field_key] = field_value
            if (!columns.map((column) => column.accessor).includes(field_key)) {
                columns.push({Header: field_key, accessor: field_key})
            }
        }
        data.push(entry)
    }
    return [columns, data]
}

function AlgorithmsOverview({input_algorithms}) {
    const [columns, data] = useMemo(() => computeColumns(input_algorithms), [input_algorithms]);
    if (!input_algorithms) return <PurpleSpinner/>
    if (Object.getOwnPropertyNames(input_algorithms).length === 0) return <h2>No Algorithms Provided</h2>

    return (
        <BootstrapTable columns={columns} data={data}/>
    )
}

export default AlgorithmsOverview;