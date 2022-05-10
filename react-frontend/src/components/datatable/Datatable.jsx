import "./datatable.css"
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Link } from "react-router-dom";

const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First name', width: 130 },
    { field: 'lastName', headerName: 'Last name', width: 130 },
    {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 50,
    },
    {
        field: 'fullName',
        headerName: 'Full name',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 160,
        renderCell: (params) => {
            return (
                <div className="cellWithImg">
                    <img className="cellImg" src={params.row.img} alt="avater" />
                    {params.row.username}
                </div>
            );
        }
    },
    {
        field: "status",
        headerName: "Status",
        width: 160,
        renderCell: (params) => {
            return (
                <div className={`cellWithStatus ${params.row.status}`}>
                    {params.row.status}
                </div>
            );
        }
    }
];

const rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35, status: 'Active', img: "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg" },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42, status: 'Active', img: "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg" },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45, status: 'Active', img: "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg" },
    { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16, status: 'Inactive', img: "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg" },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null, status: 'Inactive', img: "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg" },
    { id: 6, lastName: 'Melisandre', firstName: null, age: 150, status: 'Inactive', img: "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg" },
    { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44, status: 'Active', img: "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg" },
    { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36, status: 'Active', img: "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg" },
    { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65, status: 'Inactive', img: "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg" },
];

const Datatable = () => {

    const actionColumn = [
        {ield:"action", headerName:"Action", width:200, renderCell:()=>{
            return (
                <div className="cellAction">
                    <Link to="/users/test" style={{textDecoration: "none"}}>
                        <div className="viewButton">View</div>
                    </Link>
                </div>
            )
        }}
    ]
    return (
        <div className="datatable">
            <div className="datatableTitle">
                All users
            </div>
            <DataGrid
                rows={rows}
                columns={columns.concat(actionColumn)}
                pageSize={10}
                rowsPerPageOptions={[10]}
                checkboxSelection
            />
        </div>
    );
}

export default Datatable;