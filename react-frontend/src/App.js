import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        fetch('/api/time').then(res => res.json()).then(data => {
            setCurrentTime(data.time);
        });
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Recommendation Algorithms
                </p>

                <h6>Under construction</h6>

                <h6>The current time is {currentTime}.</h6>
            </header>
        </div>
    );
}

export default App;
