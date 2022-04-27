// import {useEffect} from "react";
import "../index.css";
import React from 'react'

function Overview({ algoritmdict }) {
    // useEffect(() => {
    //     var indents = [];
    //     // tbl.style.width = '500px';
    //     // tbl.style.border = '2px solid black';
    //
    //     for (let i = 0; i < algoritmdict.length; i++) {
    //         indents.push(<div className="row">;
    //             for (let j = 0; j < algoritmdict[i].length; j++) {
    //                 indents.push(<div className="col">)
    //                     <h1>{algoritmdict[i][j]}</h1>
    //                     {/*const td = tr.insertCell();*/}
    //                     {/*    td.appendChild(document.createTextNode(algoritmdict[i][j]));*/}
    //                     {/*td.style.border = '2px solid black';*/}
    //                     indents.push(</div>)
    //             }
    //             indents.push(</div>)
    //
    //     }
    //     // body.appendChild(tbl);
    //     return indents;
    // }, []);


    return (
        <div className="container-fluid bg-lightpurple align-content-center text-center border border-dark rounded-3 border-3">
            <div className="row border border-dark rounded-3 border-1">
                <div className="col ">Algorithm</div>
                <div className="col">retrain</div>
                <div className="col">window</div>
                <div className="col">K</div>
                <div className="col">Normalize</div>
            </div>
            {algoritmdict.map((val, key) => {
                return (
                    <div className="row" key={key}>
                        <div className="col">{val.Algorithm}</div>
                        <div className="col">{val.retrain}</div>
                        <div className="col">{val.window}</div>
                        <div className="col">{val.K}</div>
                        <div className="col">{val.Normalize}</div>
                    </div>
                )
            })}
        </div>
    );
}

export default Overview;