import BootstrapTable from "./BootstrapTable";

// import {useEffect} from "react";
import React, {useEffect, useMemo, useState,useContext} from 'react'
import {PurpleSpinner} from "../PurpleSpinner"
import {fetchData} from "../../utils/fetchAndExecuteWithData";
import {DataGrid} from '@mui/x-data-grid';
import {Link, useHistory} from "react-router-dom";
import {ABTestContext} from "../../utils/Contexts";


function GeneralUserOverview({abtest_id, date_start_index, date_end_index}) {
    const columns1 = [{Header: 'Active User Count', accessor: 'user_count'}, {
        Header: 'Revenue Over Period', accessor: 'revenue'
    }]
    // const [activeUserCount,setActiveUserCount] = useState(null)
    const [revenue_per_day, setRevenuePerDay] = useState(null)
    const [activeUserCount, setActiveUserCount] = useState(null)

    const revenue = useMemo(() => {
        let revenue = null
        if (revenue_per_day) {
            revenue = revenue_per_day.slice(date_start_index, date_end_index + 1).reduce((partialSum, a) => partialSum + a[1], 0).toFixed(2)
        }
        return revenue
    }, [revenue_per_day, date_start_index, date_end_index]);

    function fetchActiveUserCount() {
        const abortCont = new AbortController()
        let api = `/api/abtest/${abtest_id}/get_active_usercount/${date_start_index}/${date_end_index}`
        fetchData(api, (data) => {
            setActiveUserCount(data.returnvalue)
        }, abortCont)
        return () => abortCont.abort();
    }

    function fetchRevenuePerDay() {
        const abortCont = new AbortController()
        let api = `/api/abtest/${abtest_id}/get_total_revenue_over_time`
        fetchData(api, (data) => {
            setRevenuePerDay(data.returnvalue)
        }, abortCont)
        return () => abortCont.abort();

    }

    useEffect(() => {
        fetchActiveUserCount()
    }, [abtest_id, date_start_index, date_end_index])
    useEffect(() => {
        fetchRevenuePerDay()
    }, [abtest_id])
    if (activeUserCount == null || revenue_per_day == null) return <PurpleSpinner/>

    return (<BootstrapTable columns={columns1} data={[{
        'user_count': activeUserCount,
        'revenue': revenue
    }]}/>)
}

function CustomerList({abtest_id, date_start_index, date_end_index}) {
    const history = useHistory()
    const columns = [{headerName: 'Customer', field: 'Customer', width: '150', headerAlign: 'center',
        renderCell: (cellValues) => {
            let customer_id = cellValues.row.Customer
            return <Link style={{textDecoration: 'inherit'}} to={`/ABTest/${abtest_id}/Customer/${customer_id}`} > {customer_id} </Link>
      }},
        {
        headerName: 'Purchases', field: 'Purchases', width: '150', headerAlign: 'center',
    }, {headerName: 'Revenue', field: 'Revenue', width: '150', headerAlign: 'center',}, {
        headerName: 'Days Active',
        field: 'Days Active',
        width: '150',
        headerAlign: 'center',
    }]
    const [customerData, setCustomerData] = useState(null)

    function fetchCustomerData() {
        const abortCont = new AbortController()
        const api = `/api/statistics/abtest/${abtest_id}/get_unique_customer_stats/${date_start_index}/${date_end_index}`
        fetchData(api, (data) => {
            setCustomerData(data.returnvalue)
        }, abortCont)
        return () => abortCont.abort()
    }

    useEffect(fetchCustomerData, [abtest_id, date_start_index, date_end_index])
    if (customerData == null) return <PurpleSpinner/>
    return (
        <div style={{height: '80vh', width: '100%'}}>
            <DataGrid
                onCellClick={(params, event) => {
                    if (params.colDef.field === 'Customer') {
                        let customer_id = params.row.Customer
                        history.push(`/ABTest/${abtest_id}/Customer/${customer_id}`)
                    }
                }}
                className={''}
                getRowId={(row) => row.Customer}
                rows={customerData}
                columns={columns}
                autoPageSize
                sx={{
                    boxShadow: 5,
                    border: 3,
                    borderColor: '#7734E7FF',
                }}
            />
        </div>
    )
}


function CustomerOverview() {
    const {abtest_id, start_date_index, end_date_index} = useContext(ABTestContext);

    if (!(abtest_id != null && start_date_index != null && end_date_index != null)) return <PurpleSpinner/>
    return (<>
        <div className={"row text-center align-content-center justify-content-center mx-auto"}>
            <GeneralUserOverview
                abtest_id={abtest_id} date_start_index={start_date_index}
                date_end_index={end_date_index}/>
        </div>
        <div className={"row text-center align-content-center justify-content-center mx-auto"}>
            <CustomerList abtest_id={abtest_id} date_start_index={start_date_index}
                          date_end_index={end_date_index}/>

        </div>
    </>)

}

export default CustomerOverview;