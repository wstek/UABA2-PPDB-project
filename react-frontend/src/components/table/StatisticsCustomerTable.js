import BootstrapTable from "./BootstrapTable";

// import {useEffect} from "react";
import React, {useContext, useEffect, useMemo, useState} from 'react'
import {PurpleSpinner} from "../PurpleSpinner"
import {fetchData} from "../../utils/fetchAndExecuteWithData";
import {DataGrid} from '@mui/x-data-grid';
import {Link, useHistory} from "react-router-dom";
import {ABTestContext} from "../../utils/Contexts";


function GeneralUserOverview() {
    const columns1 = [{Header: 'Active User Count', accessor: 'user_count'}, {
        Header: 'Revenue Over Period', accessor: 'revenue'
    }]
    // const [activeUserCount,setActiveUserCount] = useState(null)
    const [revenue_per_day, setRevenuePerDay] = useState(null)
    const [activeUserCount, setActiveUserCount] = useState(null)
    const {abtest_id, start_date, end_date,start_date_index, end_date_index} = useContext(ABTestContext);

    const revenue = useMemo(() => {
        let revenue = null
        if (revenue_per_day && start_date_index !== null && end_date_index !== null) {
            revenue = revenue_per_day.slice(start_date_index, end_date_index + 1).reduce((partialSum, a) => partialSum + a[1], 0).toFixed(2)
        }
        return revenue
    }, [revenue_per_day, start_date_index, end_date_index]);

    function fetchActiveUserCount() {
        const abortCont = new AbortController()
        let api = `/api/statistics/abtest/${abtest_id}/get_active_usercount/${start_date}/${end_date}`
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
        if (abtest_id && start_date && end_date ) fetchActiveUserCount()
    }, [abtest_id, start_date, end_date])
    useEffect(() => {
        if (abtest_id) fetchRevenuePerDay()
    }, [abtest_id])
    if (activeUserCount == null || revenue_per_day == null) return <PurpleSpinner/>

    return (<BootstrapTable columns={columns1} data={[{
        'user_count': activeUserCount,
        'revenue': revenue
    }]}/>)
}

function CustomerList() {
    const history = useHistory()
    const [customerData, setCustomerData] = useState(null)
    const {abtest_id, start_date,end_date} = useContext(ABTestContext)
    const columns = useMemo( () => {
        let temp = [{
            headerName: 'Customer', field: 'Customer', width: '150', headerAlign: 'center',
            renderCell: (cellValues) => {
                let customer_id = cellValues.row.Customer
                return <Link style={{textDecoration: 'inherit'}}
                             to={`/Statistics/ABTest/${abtest_id}/Customer/${customer_id}`}> {customer_id} </Link>
            }
        },
            {
                headerName: 'Purchases', field: 'Purchases', headerAlign: 'center',
            }, {headerName: 'Revenue', field: 'Revenue', headerAlign: 'center',}, {
            headerName: 'Days Active',
            field: 'Days Active',
            headerAlign: 'center',
        }]
        if (customerData) {
            let fields = temp.map((field) => field.headerName)
            for (const [field, value] of Object.entries(customerData[0])) {
                if (!fields.includes(field))
                    temp.push({headerName: field, field: field, headerAlign: value,})
            }
        }
        return temp
    }, [abtest_id,customerData])


    function fetchCustomerData() {
        if (abtest_id && start_date && end_date) {
            const abortCont = new AbortController()
            const api = `/api/statistics/abtest/${abtest_id}/get_unique_customer_stats/${start_date}/${end_date}`
            fetchData(api, (data) => {
                setCustomerData(data.returnvalue)
            }, abortCont)
            return () => abortCont.abort()
        }
    }

    useEffect(fetchCustomerData, [abtest_id, start_date,end_date])
    if (customerData == null) return <PurpleSpinner/>
    return (
        <div style={{height: '80vh', width: '100%'}}>
            <DataGrid
                onCellClick={(params, event) => {
                    if (params.colDef.field === 'Customer') {
                        let customer_id = params.row.Customer
                        history.push(`/Statistics/ABTest/${abtest_id}/Customer/${customer_id}`)
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

    return (<>
        <div className={"row text-center align-content-center justify-content-center mx-auto"}>
            <GeneralUserOverview
                />
        </div>
        <div className={"row text-center align-content-center justify-content-center mx-auto"}>
            <CustomerList />

        </div>
    </>)

}

export default CustomerOverview;