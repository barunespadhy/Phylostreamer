import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Select from "./SelectElement";
import Upload from "./UploadElement";
import Checkbox from "./CheckboxElement";
import String from "./StringElement";
import Label from "./LabelElement";
//import Terminal from "./Terminal";
import cookie from "react-cookies";
import * as ElementUtils from "./Utils/js/elements.js";
import "./Utils/css/styles.css";
import config from '../config.json'

const APIEndpoint = `${config.ssl === true ? "https" : "http"}://${config.host}${config.port === "" ? "" : ":" + config.port}`


const token = localStorage.getItem('token');

function executeETLFunctions(partitions, title) {
    var postData = {
        operation: "create-partition-file",
        postData: title + "|" + partitions,
        oldTitle: ";-;"
    };
    const csrfToken = cookie.load("csrftoken");
    let lookupOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
    };
    fetch(`https://phylostreamer.herokuapp.com/etl-functions/`, lookupOptions)
        .then(function (response) {
            return response.json();
        })
        .then(function (responseData) {
            return responseData;
        })
        .catch(function (error) {
            console.log("error", error);
        });
    return `"${title}.part"`;
}

function clearTerminal(){

}


function execute(parameterValueSet, displayOptions, finalParameter, title, elementValues, setParameterValueSet, setFinalCommand, setTimeStamp) {
    let currentDateTime = new Date();
    let seconds = currentDateTime.getSeconds().toString().padStart(2, '0');
    let milliseconds = currentDateTime.getMilliseconds().toString().padStart(3, '0');
    setTimeStamp(`${seconds}.${milliseconds}`);
    for (const [key, value] of Object.entries(parameterValueSet)) {
        if (key.includes(".part")) {
            if (value[1] !== "") {
                var partPT = value[0];
                var partitionData = value[1];
                parameterValueSet[key] = [
                    partPT,
                    executeETLFunctions(partitionData, title),
                ];
                setParameterValueSet(parameterValueSet);
            }
        }
    }
    runCommand(parameterValueSet, displayOptions, finalParameter, title, elementValues, setFinalCommand);
}

function elementIsVisible(displayOptions, key, elementValues) {
    if (key.includes("."))
        key = (key.split("."))[0]
    var displayArray = displayOptions[key].split("=");
    if (elementValues[displayArray[0]] === displayArray[1]) {
        return true;
    } else {
        return false;
    }
}

function runCommand(parameterValueSet, displayOptions, finalParameter, title, elementValues, setFinalCommand) {
    Object.keys(parameterValueSet).forEach((key) => {
        if (displayOptions[key] === undefined) {
            delete displayOptions[key];
        }
    });
    var files = "";
    var finalParameterBatch = {};
    console.log(finalParameter)
    for (const [key, value] of Object.entries(parameterValueSet)) {
        if (value[1] !== "" && elementIsVisible(displayOptions, key, elementValues)) {
            if (key.includes(".file")) {
                if (value[1].split(",").length > 1) files = value[1].split(",");
            }
            finalParameter = finalParameter.replaceAll(`{${key}}`, value[0] + " " + (value[1] === value[0] ? "" : value[1]));
        }
    }

    try {
        const parameterRegex = /\{\d+}/g;
        const idNumRegex = /\b\d+\b/g;
        var finalParameterArray = finalParameter.match(parameterRegex);
        console.log(finalParameterArray)
        for (var j = 0; j < finalParameterArray.length; j++) {
            var idNum = finalParameterArray[j].match(idNumRegex)[0];
            if (idNum in parameterValueSet)
                finalParameter = finalParameter.replaceAll(`{${idNum}}`, "");
        }
        if (files !== "") {
            for (var i = 0; i < files.length; i++) {
                finalParameterBatch[i] = finalParameter.replace(
                    files.toString(),
                    files[i]
                );
            }
            finalParameter = JSON.stringify(finalParameterBatch);
        }
    }
    catch (error) { }
    //setFinalCommand();

    const csrfToken = cookie.load("csrftoken");
    const postData = {
        finalParameter: finalParameter.trim(),
        nodeName: title
    }
    let lookupOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(postData),
    };

    alert("Execution started, check the terminal window to see the output");
    fetch(`${APIEndpoint}/runcommand/`, lookupOptions)
        .then(function (response) {
            return response.json();
        })
        .then(function (responseData) {
            return responseData;
        })
        .catch(function (error) {
            console.log("error", error);
        });
}

function Node(props) {
    const { slug } = useParams();
    const [title, setTitle] = useState(null);
    const [nodeData, setNodeData] = useState(null);
    const [stateNodeBuilder, setStateNodeBuilder] = useState({});
    const [displayOptions, setDisplayOptions] = useState({});
    const [elementValues, setElementValues] = useState({});
    const [elementProps, setElementProps] = useState({});
    const [parameterValueSet, setParameterValueSet] = useState({});
    const [finalParameter, setFinalParameter] = useState({});
    const [buildMap, setBuildMap] = useState([]);
    const [finalCommand, setFinalCommand] = useState(0);
    const [timeStamp, setTimeStamp] = useState(0)
    const [output, setOutput] = useState([]);

    const getNodeValues = useCallback((elementValue, id, parameterTranslation) => {
        var localElementValues = elementValues;
        var localParameterValueSet = parameterValueSet;
        localElementValues[id] = elementValue;
        try {
            localParameterValueSet[id][1] = elementValue;
        }
        catch (error) {
            localParameterValueSet[id] = [parameterTranslation, elementValue];
        }
        setElementValues(localElementValues);
        setParameterValueSet(localParameterValueSet);
        setTimeout(() => {
            elementRenderResolver()
        }, 10)
    }
    )

    const elementRenderResolver = () => {
        try {
            for (const [key, value] of Object.entries(displayOptions)) {
                if (value !== "" && key) {
                    var displayArray = value.split("=");
                    if (elementValues[displayArray[0]] === displayArray[1]) {
                        document.getElementById(key).style = ""
                    } else {
                        document.getElementById(key).style = "display: none"
                    }
                }
            }
        }
        catch (error) { }
    };

    const returnElementComponent = (currentNodeData, renderParam) => {
        console.log(currentNodeData)
        if (currentNodeData.componentType === "upload") {
            return (
                <Upload
                    title={title}
                    parentType="RunNode"
                    componentParams={currentNodeData}
                    onChange={getNodeValues}
                    renderParam={renderParam}
                />
            );
        }
        if (currentNodeData.componentType === "option") {
            return (
                <Select
                    parentType="RunNode"
                    componentParams={currentNodeData}
                    onChange={getNodeValues}
                    renderParam={renderParam}
                />
            );
        }
        if (currentNodeData.componentType === "checkbox") {
            return (
                <Checkbox
                    parentType="RunNode"
                    componentParams={currentNodeData}
                    onChange={getNodeValues}
                    renderParam={renderParam}
                />
            );
        }
        if (currentNodeData.componentType === "string") {
            return (
                <String
                    parentType="RunNode"
                    componentParams={currentNodeData}
                    onChange={getNodeValues}
                    renderParam={renderParam}
                />
            );
        }
        if (currentNodeData.componentType === "label") {
            return (
                <Label
                    parentType="RunNode"
                    componentParams={currentNodeData}
                    onChange={getNodeValues}
                    renderParam={renderParam}
                />
            );
        }
        if (currentNodeData.componentType === "fpp") {
            currentNodeData["defaultValue"] = currentNodeData["componentName"]
            console.log(currentNodeData)
            return (
                <div className="hideElement"><String
                    parentType="RunNode"
                    componentParams={currentNodeData}
                    onChange={getNodeValues}
                    renderParam="false"
                /></div>
            );
        }
    };

    useEffect(() => {
        if (!ElementUtils.isEmpty(displayOptions) && !ElementUtils.isEmpty(elementProps)) {
            var localBuildMap = [];
            var nodeBuilder = {};
            for (var i = 0; i < nodeData.length; i++) {

                if (nodeData[i].componentID) {
                    var displayProps = displayOptions[nodeData[i].componentID]
                    var displayArray = displayProps.split("=");
                    if (elementValues[displayArray[0]] === displayArray[1])
                        nodeBuilder[nodeData[i].componentID] = returnElementComponent(nodeData[i], "true");
                    else
                        nodeBuilder[nodeData[i].componentID] = returnElementComponent(nodeData[i], "false");
                }


                if (nodeData[i].componentType !== "upload") {
                    getNodeValues("", nodeData[i].componentID, nodeData[i].parameterTranslation)
                }
                if (nodeData[i].componentType === "upload") {
                    var filePT = nodeData[i].parameterTranslation.split(",");
                    var filePTDict = filePT
                    for (var j = 0; j < filePT.length; j++) {
                        filePTDict[filePT[j].split(":")[0]] = filePT[j].split(":")[1]
                    }
                    try {
                        filePTDict.file ? getNodeValues("", nodeData[i].componentID + ".file", filePTDict.file) : getNodeValues("", nodeData[i].componentID + ".file", "")
                        filePTDict.og ? getNodeValues("", nodeData[i].componentID + ".og", filePTDict.og) : getNodeValues("", nodeData[i].componentID + ".og", "")
                        filePTDict.part ? getNodeValues("", nodeData[i].componentID + ".part", filePTDict.part) : getNodeValues("", nodeData[i].componentID + ".part", "")
                    } catch (error) {
                        console.log(error);
                    }
                }
                if (nodeData[i].finalParameter) setFinalParameter(nodeData[i].finalParameter);
                else localBuildMap.push({ order: nodeData[i].componentID });
            }
            setBuildMap(localBuildMap);
            setStateNodeBuilder(nodeBuilder)
        }
    }, [displayOptions, elementProps])

    useEffect(() => {
        if (title && nodeData) {
            var localElementProps = {};
            var localDisplayOptions = {};
            for (var i = 0; i < nodeData.length; i++) {
                localElementProps[nodeData[i].componentID] = nodeData[i];
                localDisplayOptions[nodeData[i].componentID] = nodeData[i].displayOptions;
            }
            delete localDisplayOptions[undefined];
            delete localElementProps[undefined];
            setDisplayOptions(localDisplayOptions);
            setElementProps(localElementProps);
        initiateTerminal()
        }
    }, [title, nodeData]);

    const initiateTerminal = () => {
        const socket = new WebSocket('ws://localhost:8000/ws/terminal/');

        socket.onopen = () => {
            const message = {
                file_path: `../Analysis/${title}/${title}-run.log`,
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
    };

    useEffect(() => {
        const endpoint = `${APIEndpoint}/node/${slug}/`;
        let lookupOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        };
        fetch(endpoint, lookupOptions)
            .then(function (response) {
                return response.json();
            })
            .then(function (responseData) {
                setTitle(responseData["title"]);
                var localNodeData = JSON.parse(responseData["nodeData"])
                for (var i = 0; i < localNodeData.length; i++) {
                    if (localNodeData[i].componentType === "fpp")
                        localNodeData[i].parameterTranslation = ""//localNodeData.splice(i, 1)
                }
                setNodeData(localNodeData);
            })
            .catch(function (error) {
                console.log("error", error);
            });
    }, [slug]);

    useEffect(() => {
        elementRenderResolver()
    }, [parameterValueSet])


    return (
        <React.Fragment>
            <div className="nodeContainer">
                <div className="nodeSection">
                    <h3>{title == null ? "Loading node data" : title}</h3>
                    <br />
                    {buildMap.map((eachComponent) => stateNodeBuilder[eachComponent.order])}
                    <br />
                    <button onClick={() => execute(parameterValueSet, displayOptions, finalParameter, title, elementValues, setParameterValueSet, setFinalCommand, setTimeStamp)}>Execute</button>
                </div>
                {
                    title === null ? "" :
                        <div className="terminalWrapper">
                            <h3 >File Output:</h3>
                            <div className="nodeSection">
                                <div className="terminalColor">
                                  <h5>
                                      {output.map((line, index) => (
                                          <div name={"terminalLine"} key={index}><span>{line}</span></div>
                                      ))}
                                  </h5>
                              </div>
                            </div>
                            <div>
                                <p>{"Final Command Created: " + finalCommand}</p>
                            </div>
                        </div>
                }
            </div>
        </React.Fragment>
    );
}

export default Node;
