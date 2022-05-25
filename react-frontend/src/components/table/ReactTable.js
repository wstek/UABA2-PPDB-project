import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {useTable} from 'react-table'

import {fetchData} from "../../utils/fetchAndExecuteWithData";
import {PurpleSpinner} from "../PurpleSpinner";
import Table from 'react-bootstrap/Table'

const Styles = styled.div`

  Table {
    
    border-spacing: 0;
    border: 1px solid black;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
      }
    }
  }
`

function ReactTable({columns, data}) {
    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps, getTableBodyProps, headerGroups, rows, prepareRow,
    } = useTable({
        columns, data,
    })
    // Render the UI for your table
    return (
        <div className="row justify-content-center">
            <div className="col-auto">
        <Table responsive className={"border-dark avoid-break-inside border-2 border"} {...getTableProps()}>
        <thead className={"bg-darkpurple"}>
        {headerGroups.map(headerGroup => (<tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (<th className={"text-white"} {...column.getHeaderProps()}>{column.render('Header')}</th>))}
        </tr>))}
        </thead >
        <tbody className={"bg-purple"} {...getTableBodyProps()}>
        {rows.map((row, i) => {
            prepareRow(row)
            return (<tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
            </tr>)
        })}
        </tbody>
    </Table>
            </div>
            </div>
                )
}

export function TopKPurchasedTable({abtest_id, start_date, end_date}) {
    const [top_k_purchased, setTopKPurchased] = useState()
     const fetchTopKPerAlgorithm = () => {
        const abortCont = new AbortController();
        let api = '/api/abtest/statistics/get_top_k_purchased/' + abtest_id + '/2020-01-01/2020-01-10'
        if (abtest_id) fetchData(api, (data) => setTopKPurchased(data.returnvalue), abortCont)

        return () => abortCont.abort();
    }
    useEffect(fetchTopKPerAlgorithm, [abtest_id],)
    const makeColomns = (top_k_purchased) => {
        let columns
        if (top_k_purchased) {
            columns = [
                {Header: 'Article', accessor: 'article'}, {Header: 'Times Purchased', accessor: 'count'}
            ]
        }
        return columns
    }
    const columns = React.useMemo(() => makeColomns(top_k_purchased), [top_k_purchased])
    if (!top_k_purchased) return <PurpleSpinner/>
    return (

        <Styles>
        <ReactTable columns={columns} data={top_k_purchased}/>
     </Styles>
    )
}
export function TopKPerAlgorithmTable({abtest_id, start_date, end_date}) {
    const [top_k_per_algorithm, setTopKPerAlgorithm] = useState()
    const fetchTopKPerAlgorithm = () => {
        const abortCont = new AbortController();
        let api = `/api/abtest/statistics/get_top_k_per_algorithm/${abtest_id}/${start_date}/${end_date}`
        if (abtest_id) fetchData(api, (data) => setTopKPerAlgorithm(data.returnvalue), abortCont)
        console.log(top_k_per_algorithm)
        return () => abortCont.abort();
    }
    useEffect(fetchTopKPerAlgorithm, [start_date,end_date,abtest_id],)
    const makeColomns = (top_k_per_algorithm) => {
        let columns
        if (top_k_per_algorithm) {
            columns = [{
            Header: 'Top K Per Algorithm', columns: [{
                Header: 'Algorithm ID', accessor: '', columns: [{
                    Header: 'Rank', accessor: '',Cell: (row) => <div>{parseInt(row.row.id) + 1}</div>,
                }]
            }]

        }]
            for (let algorithm_id in top_k_per_algorithm[0]) {
                columns[0].columns.push({
                    Header: algorithm_id.toString(), columns: [{
                        Header: 'Article ID', accessor: algorithm_id.toString() + '.article'
                    }, {
                        Header: 'Count', accessor: algorithm_id.toString() + '.count'
                    }]
                })
            }
        }
        return columns
    }
    const columns = React.useMemo(() => makeColomns(top_k_per_algorithm), [top_k_per_algorithm])
    if (!top_k_per_algorithm) return <PurpleSpinner/>
    return (

        <Styles>
        <ReactTable columns={columns} data={top_k_per_algorithm}/>
     </Styles>
    )
}

export default ReactTable
