import {useState, useEffect} from 'react';
import { useHistory } from 'react-router-dom';
import {ColoredLine} from "./coloredLine";
import { Normalize } from './parameters';
import axios, { post } from 'axios';

const InputList = ({abs_algorithms}) => {
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
        var newAlgorithm = {id: id, name: algorithmname, fields: inputFieldsArray, parameters: parametersArray};
        temp.push(newAlgorithm);
        setConAlgorithm(temp);
        setId(id+1);
    }

    const handleRemoveAlgorithm = (id) => {
        const newAlgorithms = con_algorithms.filter(alg => alg.id !== id);
        setConAlgorithm(newAlgorithms)
    }
    useEffect(() => {
        resetInput()
        fetch('http://127.0.0.1:5000/api/get_datasets', {
            method: 'GET',
            headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
            credentials: 'include'
        }).then((res) => res.json())
        .then((data) => {setDatasetsx(data.all_datasets)})
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
    const handleStart = async () => {
        var algorithms_parameters = [];
        for (let i = 0; i < con_algorithms.length; i++) {
            var algorithmParams = {name : con_algorithms[i].name};
            for (let k = 0; k < con_algorithms[i].parameters.length; k++) {
                const val = document.getElementById(con_algorithms[i].parameters[k] + con_algorithms[i].id).value;
                if (!val) {
                    throw Error('Please fill in all the fields')
                }
                algorithmParams[con_algorithms[i].parameters[k]] = val;
            }
            algorithms_parameters.push(algorithmParams);
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
          const abtest_setup = { start, end, topk, stepsize, dataset_name, algorithms_parameters};
          setIsPending(true);
          const jdata = await JSON.stringify(abtest_setup);
          await fetch('http://127.0.0.1:5000/api/abtest_setup', {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
            credentials: 'include',
            body: jdata
          }).then((res) => res.json())
          .then((data) => {
            // if (data.error) {
            //     throw Error(data.error);
            // }
            // history.go(-1);
            setIsPending(false);
            // setError(null);
            history.push('/dashboard');
          })
          .catch((err) => {
            setIsPending(false);
            // setError(err.message);
            console.log(err.message);
          })
          }
    }
    var idx = 0;
    var datasets = []
    const onGo = (dataset, finish) => {
        if (finish) {
            const url = "http://127.0.0.1:5000/api/read_csv";
            const aret = post(url, dataset, {withCredentials: true}).then(response => console.log("response:", response));
            datasets = [];
            return aret;
        }
    }
    const onChange = (e) => {
        console.log(document.getElementById("dataset").value)
        let files = e.target.files;
        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader();
            reader.readAsDataURL(files[i]);
            reader.onload = (e) => {
                const url = "http://127.0.0.1:5000/api/read_cvs";
                var file1 = e.target.result;
                const formData = {dataset_name : document.getElementById("dataset").files[i].name, file : file1.split("base64,").pop()}
                datasets.push(formData);
                return onGo(datasets, i === (files.length-1));
                // return post(url, formData, {withCredentials: true}).then(response => console.log("response:", response));
            }
        }
        // console.log("hello");
        // let files = e.target.files;
        // console.log(document.getElementById("dataset").files[0].name)
        // var datasets = []
        // for (let i = 0; i < files.length; i++) {
        //     let reader = new FileReader();
        //     reader.readAsDataURL(files[i]);
        //     const formData = {dataset_name : document.getElementById("dataset").files[i].name};
        //     datasets.push(formData);
        //     reader.onload = (e)=>{
        //         // const formData={dataset_name : document.getElementById("dataset").files[i].name, file : e.target.result}
        //         datasets[idx]["file"] = e.target.result;
        //         idx += 1;
        //         console.log("begin:",datasets[0]);
        //     }
        // }
        // console.log("after:",datasets[0]);
        // const url="http://127.0.0.1:5000/api/read_cvs";
        // const formData={Data : datasets}
        // console.log("form:",formData);
        // const params = new URLSearchParams();
        // params.append('Data', datasets);
        // axios({
        //     method: 'POST',
        //     url: 'http://127.0.0.1:5000/api/read_cvs',
        //     data: params,
        //     withCredentials: true
        // }).then(res => console.log("response:", res)).catch((err) => {console.log("error:",err.message)})
        // console.log(datasets[0]);
        // console.log(datasets.length);
        // var formData = new FormData();
        // formData.append('Data', datasets);
        // fetch("http://127.0.0.1:5000/api/read_cvs", {
        //     method: 'POST',
        //     headers: {'Accept': 'application/json', "Content-Type": "application/json"},
        //     credentials: 'include',
        //     mode: 'cors',
        //     body: JSON.stringify({formData})
        // }).then(res => console.log("response:", res)).catch((err) => {console.log("error:",err.message)})
    }
    return (
        <div className="container-fluid pt-5 pb-5 pl-5 pr-5" id='algorithms'>
            <div className="row text-center align-items-center">

                <div className="col-6 text-end">
                    <button className="btn-lg button-purple red_onhover" type="reset" onClick={resetInput}>Reset</button>
                </div>
                <div className="col-6 text-start">
                    <button className="btn-lg button-purple green_onhover" type="submit" onClick={handleStart}>Start</button>
                </div>
            </div>
            { isPending && <p>Setting up...</p>}
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
                           placeholder="Enter top-k"/>
                </div>
                <div className="col-4">
                    <br/>
                    <select className="selector form-control" id="dataset_name">
                        {datasetsx.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
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
