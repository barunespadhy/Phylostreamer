import React, { useEffect, useState } from 'react';
import "./Utils/css/styles.css";

const Terminal = (props) => {
    const [output, setOutput] = useState([]);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8000/ws/terminal/');

        socket.onopen = () => {
            const message = {
                file_path: `../Analysis/${props.nodeName}/${props.nodeName}-run.log`,
            };
            socket.send(JSON.stringify(message));
        };

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setOutput((prevOutput) => [...prevOutput, data.message]);
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
        };

        return () => {
            socket.close();
        };
    }, []);

    return (
        <div className="terminalColor">
            <h5>
                {output.map((line, index) => (
                    <div name={"terminalLine"} key={index}><span>{line}</span></div>
                ))}
            </h5>
        </div>
    );
};

export default Terminal;