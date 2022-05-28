import * as React from 'react';
import {useEffect, useState} from 'react';
import {DataGrid} from '@mui/x-data-grid';

function DataTable({abtest_id}) {
    const [loaded, setLoaded] = useState(false);
    const [select, setSelection] = React.useState([]);
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

    function openTabs() {
        for (let i = 0; i < select.length; i++) {
            window.open("/api/" + abtest_id + "/" + select[i])
        }
    }

    return (
        <div style={{height: 400, width: '100%'}}>
            {loaded && <DataGrid
                rows={allRows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                onSelectionModelChange={(newSelection) => {
                    setSelection(newSelection);
                    console.log(select)
                }}
            />
            }
            <button onClick={openTabs}>Submit</button>
        </div>
    );
}

export default DataTable