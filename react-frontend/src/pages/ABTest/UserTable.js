import * as React from 'react';
import {DataGrid} from '@mui/x-data-grid';
import {useState} from "react";

function DataTable({abtest_id}){
const [loaded,setLoaded] = useState(false);
const [allUsers,setAllUsers] = useState(null);
const [allRows,setAllRows] = useState(null);

const columns = [
    {field: 'id', headerName: 'ID', width: 70}
];

const getRows = () => {
    let a = '/api/users/' + abtest_id
    fetch('/api/users/' + abtest_id, {
        method: 'GET',
        credentials: 'include',
        headers: {"Content-Type": "application/json", 'Accept': 'application/json'}
    }).then(res => res.json())
        .then((data) => {
            if (data.error) {
                throw Error(data.error);
            }
            setLoaded(true)
            setAllUsers(data.userlist)
            console.log(data.userlist)

        }).catch((err) => {
        console.log(err);
    })
}
function rows(){
    let list = []
    let users = allUsers
    if(users != null) {
        for (let i = 0; i < users.length; i++) {
            list.push({id: users[i]})
        }
        setAllRows(list)
        return allRows
    }
    return []
}

    return (
        <div style={{height: 400, width: '100%'}}>
            {!loaded && getRows()}
            <DataGrid
                rows={rows()}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
            />
        </div>
    );
}
export default DataTable