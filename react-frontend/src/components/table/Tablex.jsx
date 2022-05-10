import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import "./tablex.css"

function createData(name, img, calories, fat, carbs, status) {
    return { name, img, calories, fat, carbs, status };
}

const rows = [
    createData('Frozen yoghurt', "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg", 159, 6.0, 24, 'Active'),
    createData('Ice cream sandwich', "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg", 237, 9.0, 37, 'Inactive'),
    createData('Eclair', "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg", 262, 16.0, 24, 'Active'),
    createData('Cupcake', "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg", 305, 3.7, 67, 'Inactive'),
    createData('Gingerbread', "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg", 356, 16.0, 49, 'Active'),
];

const Tablex = () => {
    return (
        <TableContainer component={Paper} className="tablex">
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {/* hier colomen zetten van bv de user metadata info */}
                        <TableCell className='tableCell'>Dessert (100g serving)</TableCell>
                        <TableCell className='tableCell'>Calories</TableCell>
                        <TableCell className='tableCell'>Fat</TableCell>
                        <TableCell className='tableCell'>Carbs</TableCell>
                        <TableCell className='tableCell'>Status</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        // key is unique key van de rows -> neem bv ids van de users fzo
                        <TableRow key={row.name}>
                            <TableCell className='tableCell'>{row.name}</TableCell>
                            <TableCell className='tableCell'>
                                <div className="cellWrapper">
                                    <img src={row.img} alt="" className="image" />
                                    {row.calories}
                                </div>
                            </TableCell>
                            <TableCell className='tableCell'>{row.fat}</TableCell>
                            <TableCell className='tableCell'>{row.carbs}</TableCell>
                            <TableCell className='tableCell'>
                                <span className={`status ${row.status}`}>{row.status}</span>
                                </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default Tablex;