import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ColoredLine } from "../../components/ColoredLine";

const ABTestInputList = ({ abs_algorithms }) => {
    const [id, setId] = useState(1);
    const [isPending, setIsPending] = useState(false);
    const history = useHistory();
    const [datasetsx, setDatasetsx] = useState([]);
    const [con_algorithms, setConAlgorithm] = useState(
        []
    )

    const handleAddAlgorithm = () => {
        const algorithmname = document.getElementById('algorithmname').value;
        const algorithm = abs_algorithms.filter(algorithm => algorithm.name === algorithmname)[0];
        const inputFieldsArray = algorithm.inputFields;
        const parametersArray = algorithm.parameters;
        const temp = con_algorithms.slice();
        var newAlgorithm = { id: id, name: algorithmname, fields: inputFieldsArray, parameters: parametersArray };
        temp.push(newAlgorithm);
        setConAlgorithm(temp);
        setId(id + 1);
    }

    // const handleRemoveAlgorithm = (id) => {
    //     const newAlgorithms = con_algorithms.filter(alg => alg.id !== id);
    //     setConAlgorithm(newAlgorithms)
    // }
    useEffect(() => {
        resetInput()
        fetch('/api/get_datasets', {
            method: 'GET',
            headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
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
        document.getElementById('stepsize').value = ''
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

                        {<ColoredLine color="purple" />}
                        {<h4>{algorithm.name} - Algorithm {algorithm.id} </h4>}
                        {algorithm.fields.map((field) => (
                            field(algorithm.id)
                        ))}
                    </div>
                ))}
                {<ColoredLine color="purple" />}
            </div>
        )
    }
    const handleStart = async () => {
        setIsPending(true);
        const algorithms = [];
        for (let i = 0; i < con_algorithms.length; i++) {
            const algorithmParams = { name: con_algorithms[i].name, parameters: {} };
            for (let k = 0; k < con_algorithms[i].parameters.length; k++) {
                const val = document.getElementById(con_algorithms[i].parameters[k] + con_algorithms[i].id).value;
                if (!val) {
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
            throw Error('Please fill in all the fields');
        } else {
            const abtest_setup = { start, end, topk, stepsize, dataset_name, algorithms };
            const jdata = JSON.stringify(abtest_setup);

            console.log(jdata)
            console.log("trying to fetch...")

            await fetch('/api/start_simulation', {
                method: 'POST',
                headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
                credentials: 'include',
                body: jdata
            }).then((res) => {
                setIsPending(false);
                if (res.status === 409) {
                    history.push("/sign_in")
                }
                return res.json()
            }).then((data) => {
                // if (data.error) {
                //     throw Error(data.error);
                // }
                // history.go(-1);
                // setError(null);
                history.push('/simulation');
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
                    <button className="btn-lg button-purple red_onhover" type="reset" onClick={resetInput}>Reset
                    </button>
                </div>
                <div className="col-6 text-start">
                    <button className="btn-lg button-purple green_onhover" type="submit" onClick={handleStart}>Start
                    </button>
                </div>
            </div>
            {isPending && <p>Setting up...</p>}
            <div className="row text-center align-items-center">


                <div className="col-6">
                    <label htmlFor="start">Start:</label>
                    <input type="date" className="form-control datefield" id="start"/>
                </div>
                <div className="col-6">
                    <label htmlFor="end">End:</label>
                    <input type="date" className="form-control datefield" id="end" />
                </div>
            </div>
            <div className="row text-center align-items-center mb-5">
                <div className="col-4">
                    <label htmlFor="topk">Top-K:</label>
                    <input type="number" className="form-control" id="topk" min="1"
                        placeholder="Enter top-k" />
                </div>
                <div className="col-4">
                    <br />
                    <select className="selector form-control" id="dataset_name">
                        {datasetsx.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <div className="col-4 ">
                    <label htmlFor="stepsize">Step size:</label>
                    <input type="number" className="form-control" id="stepsize" min="1"
                        placeholder="Enter stepsize" />
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


export default ABTestInputList
