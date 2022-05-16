import "./datatable.css"
import {DataGrid} from '@mui/x-data-grid';
import React, {useEffect, useState} from "react";


function ItemDatatable({abtest_id, algorithm_id}) {

    const [loaded, setLoaded] = useState(false);
    const [select, setSelection] = React.useState([]);
    const [allRows, setAllRows] = useState(null);


    useEffect(() => {
        fetch('/api/items/' + abtest_id + "/" + algorithm_id, {
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
                for (let i = 0; i < data.itemlist.length; i++) {
                    row_list.push({id: data.itemlist[i]})
                }

                setAllRows(row_list)

                // console.log(data.userlist)

            }).catch((err) => {
            console.log(err);
        })
    }, [abtest_id]);
    const columns = [
        {field: 'id', headerName: 'ID', width: 150}
    ];

    return (
        <div className="page">
            <label>All active Items</label>
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
            </div>

            {/* <button className="position-relative " onClick={showTopkTab}>Topk</button>*/}
            {/*<button className="position-relative " onClick={showPurchasesTab}>Purchases</button>*/}
        </div>
    );
}

export default ItemDatatable;