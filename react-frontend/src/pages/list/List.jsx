import React, {useEffect, useState} from "react";
import "./list.css"
import {fetchData} from "../../utils/fetchAndExecuteWithData";
import InputSelector from "../../components/InputSelector";
import {useParams} from "react-router-dom";
import ReactTable from "../../components/table/ReactTable";
import styled from 'styled-components'


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

const UserList = () => {
    let {abtest_id, customer_id} = useParams();
    const [top_k_per_algorithm, setTopKPerAlgorithm] = useState(null)
    const [dates, setDates] = useState(null)
    const [selectedDate, setSelectedDate] = useState(null)
    const [columns, setColumns] = useState(null)

    const makeColomns = (top_k_per_algorithm) => {
        let columns1
        const keys = Object.keys(top_k_per_algorithm[selectedDate][0])
        if (top_k_per_algorithm) {
            columns1 = [{
                Header: 'Top K Per Algorithm', columns: [{
                    Header: 'Algorithm ID', accessor: '', columns: [{
                        Header: 'Rank', accessor: '', Cell: (row) => <div>{parseInt(row.row.id) + 1}</div>,
                    }]
                }]

            }]
            for (let algorithm_id = 0; algorithm_id < keys.length; algorithm_id++) {
                columns1[0].columns.push({
                    Header: keys[algorithm_id].toString(), columns: [{
                        Header: 'Article ID', accessor: keys[algorithm_id] + '.article'
                    }]
                })
            }
        }
        return columns1
    }

    const fetchTopKPerAlgorithm = () => {
        const abortCont = new AbortController();
        let api = `/api/user/get_top_k_per_algorithm/${abtest_id}/${customer_id}`
        if (abtest_id) fetchData(api, (data) => {
            setTopKPerAlgorithm(data.resp);
            setDates(data.dates)
        }, abortCont)
        return () => abortCont.abort();
    }
    useEffect(fetchTopKPerAlgorithm, [],)


    function setRow() {
        if (selectedDate) {
            const column = makeColomns(top_k_per_algorithm)
            setColumns(column)
        }

    }
    useEffect(setRow, [selectedDate],)

    return (<>
            <div className={'row text-center mt-3'}>
                {top_k_per_algorithm && <InputSelector selected_input={selectedDate} inputs={dates} onChange={setSelectedDate}/>}
            </div>
            { selectedDate !== 0 && columns && top_k_per_algorithm && top_k_per_algorithm[selectedDate] && <div className={'row text-center mt-3'}>
                <Styles>
                    <ReactTable columns={columns} data={top_k_per_algorithm[selectedDate]}/>
                </Styles>
            </div>
            }
        </>
    );
}

export default UserList;
