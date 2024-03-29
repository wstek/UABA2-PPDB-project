import React, {useContext, useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {ColoredLine} from "../../components/ColoredLine";
import {SocketContext} from "../../utils/SocketContext";


const ABTestInputList = ({abs_algorithms}) => {
    const [id, setId] = useState(1);
    const [isPending, setIsPending] = useState(false);
    const history = useHistory();
    const [datasetsx, setDatasetsx] = useState([]);
    const [con_algorithms, setConAlgorithm] = useState(
        []
    )

    const {addTask} = useContext(SocketContext);

    const handleAddAlgorithm = () => {
        const algorithmname = document.getElementById('algorithmname').value;
        const algorithm = abs_algorithms.filter(algorithm => algorithm.name === algorithmname)[0];
        const inputFieldsArray = algorithm.inputFields;
        const parametersArray = algorithm.parameters;
        var newAlgorithm = {id: id, name: algorithmname, fields: inputFieldsArray, parameters: parametersArray};
        setConAlgorithm(con_algorithms => [...con_algorithms, newAlgorithm]);
        setId(id + 1);
    }

    const handleDeleteAlgorithm = (algorithm_id) => {
        setConAlgorithm(con_algorithms.filter((item) => item.id !== algorithm_id));
    }

    useEffect(() => {
        resetInput()
        fetch('/api/get_datasets', {
            method: 'GET',
            headers: {"Content-Type": "application/json", 'Accept': 'application/json'},
            credentials: 'include'
        }).then((res) => res.json())
            .then((data) => {
                setDatasetsx(data.all_datasets)
            })
            .catch((err) => {
                console.log(err.message);
            })
    }, []);

    const resetInput = () => {
        setId(0);
        setConAlgorithm([])
        document.getElementById('stepsize').value = '1'
        document.getElementById('topk').value = '10'
        document.getElementById('start').value = '2020-01-01'
        document.getElementById('end').value = '2020-01-10'
    }

    function handleResetClicked() {
        if (window.confirm("Are you sure you want to reset the input?")) {
            resetInput()
        }
    }

    const renderFields = () => {
        return (
            <div className="algorithms">
                {con_algorithms.map((algorithm) => (
                    <div key={"algorithm" + algorithm.id}>
                        <div className="row text-center justify-content-center align-items-center mt-5 mb-2">

                            <ColoredLine color="purple"/>
                            <h4>{algorithm.name} - Algorithm {algorithm.id} </h4>
                            {algorithm.fields.map((field) => {
                                return field(algorithm.id)
                            })}
                        </div>

                        <div className="row text-center justify-content-center align-items-center mt-2 mb-2">
                            <div>
                                <button className={"red-hover button-purple"}
                                        onClick={() => handleDeleteAlgorithm(algorithm.id)}>Remove Algorithm
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {<ColoredLine color="purple"/>}
            </div>
        )
    }
    const handleStart = async () => {
        setIsPending(true);
        const algorithms = [];
        if (!con_algorithms.length) {
            window.alert("Please select at least one algorithm");
            throw Error('Please select at least one algorithm')
        }
        for (let i = 0; i < con_algorithms.length; i++) {
            const algorithmParams = {name: con_algorithms[i].name, parameters: {}};
            for (let k = 0; k < con_algorithms[i].parameters.length; k++) {
                // console.log(con_algorithms[i].parameters[k] + con_algorithms[i].id)
                const val = document.getElementById(con_algorithms[i].parameters[k] + con_algorithms[i].id).value;
                if (!val) {
                    window.alert("Please fill in all the fields");
                    throw Error('Please fill in all the fields')
                }
                algorithmParams.parameters[con_algorithms[i].parameters[k]] = val;
                // algorithmParams.parameters[con_algorithms[i].parameters[k]] = val;
            }
            algorithms.push(algorithmParams);
        }
        const start = document.getElementById('start').value;
        const end = document.getElementById('end').value;
        const topk = document.getElementById('topk').value;
        const stepsize = document.getElementById('stepsize').value;
        const select = document.getElementById('dataset_name');
        const dataset_name = select.options[select.selectedIndex].value;

        if (!start || !end || !topk || !stepsize || !dataset_name) {
            window.alert("Please fill in all the fields");
            throw Error('Please fill in all the fields');
        } else {
            const abtest_setup = {start, end, topk, stepsize, dataset_name, algorithms};
            const jdata = JSON.stringify(abtest_setup);
            // console.log(algorithms)
            // console.log(jdata)
            console.log("trying to fetch...")

            await fetch('/api/start_simulation', {
                method: 'POST',
                headers: {"Content-Type": "application/json", 'Accept': 'application/json'},
                credentials: 'include',
                body: jdata
            }).then((res) => {
                setIsPending(false);
                if (res.status === 409) {
                    history.push("/sign_in")
                }

                return res.json()
            }).then((data) => {
                addTask(data);
                history.push('/dashboard');
            })
                .catch((err) => {
                    setIsPending(false);
                    // setError(err.message);
                    console.log(err.message);
                })

            console.log("started simulation!")
        }
    }


    return (
        <div className="container-fluid pt-5 pb-5 pl-5 pr-5" id='algorithms'>
            <div className="row text-center align-items-center">

                <div className="col-6 text-end">
                    <button className="btn-lg red-hover button-purple red_onhover" type="reset"
                            onClick={handleResetClicked}>Reset
                    </button>
                </div>
                <div className="col-6 text-start">
                    <button className="btn-lg green-hover button-purple green_onhover" type="submit"
                            onClick={handleStart}>Start
                    </button>
                </div>
            </div>
            {isPending && <p>Setting up...</p>}
            <div className="row text-center align-items-center">


                <div className="col-6">
                    <label htmlFor="start">Start:</label>
                    <input type="date" required className="form-control datefield" id="start"/>
                </div>
                <div className="col-6">
                    <label htmlFor="end">End:</label>
                    <input type="date" required className="form-control datefield" id="end"/>
                </div>
            </div>
            <div className="row text-center align-items-center mb-5">
                <div className="col-4">
                    <label htmlFor="topk">Top-K:</label>
                    <input type="number" required className="form-control" id="topk" min="1"
                           placeholder="Enter top-k"/>
                </div>
                <div className="col-4">
                    <br/>
                    <select className="selector form-control" id="dataset_name" required>
                        {datasetsx.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <div className="col-4 ">
                    <label htmlFor="stepsize">Step size:</label>
                    <input type="number" className="form-control" id="stepsize" min="1" required
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
                            className="green-hover button-purple btn-lg">Add Algorithm
                    </button>
                </div>
            </div>
        </div>
    );
}


export default ABTestInputList
