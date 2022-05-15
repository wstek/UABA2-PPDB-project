import {Spinner} from "react-bootstrap";

export function PurpleSpinner() {
    return (
        <div className={"my-auto mx-auto"}>
            <Spinner animation="border" className="purple-color" variant="danger"/>
        </div>
    )
}