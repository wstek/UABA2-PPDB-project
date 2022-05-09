import * as React from 'react';
import {useEffect, useState} from 'react';
import {DataGrid} from '@mui/x-data-grid';

function DataTable({abtest_id}) {
    const [loaded, setLoaded] = useState(false);
    // const [allUsers, setAllUsers] = useState(null);
    const [allRows, setAllRows] = useState(null);

    const columns = [
        {field: 'id', headerName: 'ID', width: 70}
    ];

    useEffect(() => {
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
                // setAllUsers(data.userlist)

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

    // const getRows = () => {
    //     let a = '/api/users/' + abtest_id
    //     fetch('/api/users/' + abtest_id, {
    //         method: 'GET',
    //         credentials: 'include',
    //         headers: {"Content-Type": "application/json", 'Accept': 'application/json'}
    //     }).then(res => res.json())
    //         .then((data) => {
    //             if (data.error) {
    //                 throw Error(data.error);
    //             }
    //             setLoaded(true)
    //             setAllUsers(data.userlist)
    //             console.log(data.userlist)
    //
    //         }).catch((err) => {
    //         console.log(err);
    //     })
    // }

    // function rows() {
    //     let list = []
    //     let users = allUsers
    //     if (users != null) {
    //         for (let i = 0; i < users.length; i++) {
    //             list.push({id: users[i]})
    //         }
    //         setAllRows(list)
    //         return allRows
    //     }
    //     return []
    // }

    return (
        <div style={{height: 400, width: '100%'}}>
            {/*{!loaded && getRows()}*/}
            {loaded && <DataGrid
                rows={allRows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
            />}
        </div>
    );
}

export default DataTable