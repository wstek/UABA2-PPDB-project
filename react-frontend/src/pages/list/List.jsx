import Datatable from "../../components/datatable/Datatable";
import Sidebar from "../../components/sidebar/Sidebar";
import "./list.css"

const List = () => {
    // const [pending, setPending] = useState(false);
    // useEffect(() => {
    //     return () => {
    //         setPending(true);
    //     }
    // }, [])

    return (
        <div className="list">
            <Sidebar/>
            {/* {!pending && */}
            <div className="listContainer">
                <Datatable/>
            </div>
            {/* } */}
        </div>
    );
}

export default List;