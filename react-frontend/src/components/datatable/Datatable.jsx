import "./datatable.css"
import {DataGrid} from '@mui/x-data-grid';
import React, {useEffect, useState} from "react";


function Datatable({abtest_id, algorithm_id}) {

    const [loaded, setLoaded] = useState(false);
    const [select, setSelection] = React.useState([]);
    const [allRows, setAllRows] = useState(null);
    const [selectedTopkCustomer, setSelectedTopkCustomer] = useState(false)
    const [selectedPurchasesCustomer, setSelectedPurchasesCustomer] = useState(false)
    const [topk, setTopk] = useState(null)
    const [purchases, setPurchases] = useState(null)

    useEffect(() => {
        fetch('/api/users/' + abtest_id + "/" + algorithm_id, {
            method: 'GET',
            credentials: 'include',
            headers: {"Content-Type": "application/json", 'Accept': 'application/json'}
        }).then(res => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                setLoaded(true)

                let row_list = []
                for (let i = 0; i < data.userlist.length; i++) {
                    row_list.push({id: data.userlist[i]})
                }

                setAllRows(row_list)

                // console.log(data.userlist)

            }).catch((err) => {
            console.log(err);
        })
    }, [abtest_id]);
    const columns = [
        {field: 'id', headerName: 'ID', width: 70}
    ];

    // const actionColumn = [
    //     {ield:"action", headerName:"Action", width:200, renderCell:()=>{
    //         return (
    //             <div className="cellAction">
    //                 <Link to="/users/test" style={{textDecoration: "none"}}>
    //                     <div className="viewButton">View</div>
    //                 </Link>
    //             </div>
    //         )
    //     }}
    // ]


    function showTopkTab() {
        fetch('/api/' + abtest_id + '/' + algorithm_id + '/' + select[0], {
            method: 'GET',
            credentials: 'include',
            headers: {"Content-Type": "application/json", 'Accept': 'application/json'}
        }).then(res => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                setSelectedTopkCustomer(true)
                setSelectedPurchasesCustomer(false)
                setTopk(data)

            }).catch((err) => {
            console.log(err);
        })
    }

    function showPurchasesTab() {
        fetch('/api/purchases/' + abtest_id + '/' + select[0], {
            method: 'GET',
            credentials: 'include',
            headers: {"Content-Type": "application/json", 'Accept': 'application/json'}
        }).then(res => res.json())
            .then((data) => {
                if (data.error) {
                    throw Error(data.error);
                }
                setSelectedTopkCustomer(false)
                setSelectedPurchasesCustomer(true)
                setPurchases(data)

            }).catch((err) => {
            console.log(err);
        })
    }

    function showTopk() {
        let string = ""
        for (let key in topk) {
            string += key + ": "
            for (let value = 0; value < topk[key].length; value++) {
                string += topk[key][value]
                string += ", "
            }
            string += '\n'
        }
        return string
    }

    function showPurchases() {
        let string = ""
        for (let key in purchases) {
            string += key + ": "
            for (let value = 0; value < purchases[key].length; value++) {
                string += purchases[key][value]
                string += ", "
            }
            string += '\n'
        }
        return string
    }

    return (
        <div className="page">
            <label>All active Users</label>
            <div className="row text-left align-content-left justify-content-left">
                <div className="datatable" style={{height: 400, width: '50%'}}>
                    <div className="datatableTitle">
                        <DataGrid style={{height: 400, width: '50%'}} className="col-12 col-lg-6 col-xl-6 col-xxl-6 "
                                  rows={allRows}
                            // columns={columns.concat(actionColumn)}
                                  columns={columns}
                                  pageSize={5}
                                  checkboxSelection
                                  onSelectionModelChange={(newSelection) => {
                                      setSelection(newSelection);
                                  }}
                        />
                    </div>
                </div>
                {selectedTopkCustomer &&
                    <div className="col-12 col-lg-6 col-xl-6 col-xxl-6 ">
                        <label>Topk </label>
                        <div style={{flex: 1, padding: 20, backgroundColor: "grey", height: 400, width: '100%'}}>
                            {showTopk()}
                        </div>
                    </div>}
                {selectedPurchasesCustomer &&
                    <div className="col-12 col-lg-6 col-xl-6 col-xxl-6 ">
                        <label>Purchases </label>
                        <div style={{flex: 1, padding: 20, backgroundColor: "grey", height: 400, width: '100%'}}>
                            {showPurchases()}
                        </div>
                    </div>}
            </div>

            <button className="position-relative " onClick={showTopkTab}>Topk</button>
            <button className="position-relative " onClick={showPurchasesTab}>Purchases</button>
        </div>
    );
}

export default Datatable;