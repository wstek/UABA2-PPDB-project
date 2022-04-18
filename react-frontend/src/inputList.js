import {useState, useEffect} from 'react';
import {ColoredLine} from "./coloredLine";


const InputList = ({abs_algorithms}) => {
    var id = 1;

    const [con_algorithms, setConAlgorithm] = useState(
        []
    )

    const handleAddAlgorithm = () => {
        const algorithmname = document.getElementById('algorithmname').value;

        const algorithm = abs_algorithms.filter(algorithm => algorithm.name === algorithmname)[0];
        const inputFieldsArray = algorithm.inputFields;
        const temp = con_algorithms.slice();
        const newAlgorithm = {id: id, name: algorithmname, fields: inputFieldsArray};

        temp.push(newAlgorithm);
        setConAlgorithm(temp);
        id += 1;

    }

    const handleRemoveAlgorithm = (id) => {
        const newAlgorithms = con_algorithms.filter(alg => alg.id !== id);
        setConAlgorithm(newAlgorithms)
    }
    useEffect(() => {
        resetInput()
    }, []);

    const resetInput = () => {
        id = 0;
        setConAlgorithm([])
        document.getElementById('stepsize').value = ''
        document.getElementById('interval').value = ''
        document.getElementById('topk').value = ''
        document.getElementById('start').value = ''
        document.getElementById('end').value = ''
    }

    const renderFields = () => {
        return (
            <div className="algorithms">
                {con_algorithms.map((algorithm) => (
                    <div className="row text-center justify-content-center align-items-center mt-5 mb-2"
                         key={"algorithm" + algorithm.id}>

                        {<ColoredLine color="purple"/>}
                        {<h4>{algorithm.name} - Algorithm {algorithm.id} </h4>}
                        {algorithm.fields.map((field) => (
                            field(algorithm.id)
                        ))}
                    </div>
                ))}
                {<ColoredLine color="purple"/>}
            </div>
        )
    }

    return (
        <div className="container-fluid pt-5 pb-5 pl-5 pr-5" id='algorithms'>
            <div className="row text-center align-items-center">

                <div className="col-6 text-end">
                    <button className="btn-lg button-purple red_onhover" type="reset" onClick={resetInput}>Reset</button>
                </div>
                <div className="col-6 text-start">
                    <button className="btn-lg button-purple green_onhover" type="submit">Start</button>
                </div>
            </div>
            <div className="row text-center align-items-center">


                <div className="col-6">
                    <label htmlFor="start">Start:</label>
                    <input type="date" className="form-control datefield" id="start"/>
                </div>
                <div className="col-6">
                    <label htmlFor="end">End:</label>
                    <input type="date" className="form-control datefield" id="end"/>
                </div>
            </div>
            <div className="row text-center align-items-center mb-5">
                <div className="col-4">
                    <label htmlFor="topk">Top-K:</label>
                    <input type="number" className="form-control" id="topk" min="1"
                           placeholder="Enter trainings-interval"/>
                </div>
                <div className="col-4">
                    <label htmlFor="interval">Interval:</label>
                    <input type="number" className="form-control" id="interval" placeholder="Enter interval"/>
                </div>
                <div className="col-4 ">
                    <label htmlFor="stepsize">Step size:</label>
                    <input type="number" className="form-control" id="stepsize" min="1"
                           placeholder="Enter stepsize"/>
                </div>
            </div>
            {renderFields()}
            <div className="row text-center justify-content-center align-items-center mt-5 mb-2">
                <div className="col-6">
                    <select className="selector form-control" id="algorithmname">
                        {abs_algorithms.map((algorithm) => (
                            <option key={algorithm.name}>{algorithm.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="row text-center justify-content-center align-items-center mb-5">
                <div>
                <button id="addRow" type="submit" onClick={() => handleAddAlgorithm()}
                        className="button-purple btn-lg">Add
                    Algorithm
                </button>
            </div>
            </div>
        </div>
    );
}


export default InputList
