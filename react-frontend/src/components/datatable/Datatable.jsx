import "./datatable.css"
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Link } from "react-router-dom";
import React, {useEffect, useState} from "react";
import ABTestPicker from "../ABTestpicker";


function Datatable({abtest_id,algorithm_id}) {

    const [loaded, setLoaded] = useState(false);
    const [select, setSelection] = React.useState([]);
    const [allRows, setAllRows] = useState(null);
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


    function openTabs(){
        for (let i = 0; i < select.length; i++){
            window.open("/api/" + abtest_id + "/" + select[i])
        }
    }

    return (
        <div className="datatable">
            <div className="datatableTitle">
                All users
            </div>
            <DataGrid
                rows={allRows}
                // columns={columns.concat(actionColumn)}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                checkboxSelection
                onSelectionModelChange={(newSelection) => {
                    setSelection(newSelection);
                }}
            />
            <button onClick={openTabs}>Submit</button>
        </div>
    );
}

export default Datatable;