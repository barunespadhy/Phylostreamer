import React, { useEffect, useState, useContext } from "react";
import GlobalContext from "../GlobalContext";
import Select from "./SelectElement";
import * as ElementUtils from "./Utils/js/elements.js";
import cookie from "react-cookies";
import config from '../config.json'

const APIEndpoint = `${config.ssl === true ? "https" : "http"}://${config.host}${config.port === "" ? "" : ":"+config.port}`  


const token = localStorage.getItem('token');

const hideElement = {
  display: "none",
};

function handleChange(
  e,
  props,
  uploadOptions,
  detectOutgroups,
  fileProps,
  setFileProps,
  setOutGroupComponents,
  setFileUploadMessage,
  preferredFormat
) {
  var file = new FormData();
  var fileNames = [];
  for (var i = 0; i < e.target.files.length; i++) {
    file.append("file", e.target.files[i]); // Assuming the backend expects "file"
    fileNames.push(`"${e.target.files[i].name}"`);
  }
  file.append("nodeName", props.title)
  file.append("preferredFormat", preferredFormat)
  props.onChange(
    fileNames[0],
    `${props.componentParams.componentID}.file`,
  );
  console.log(file)
  let lookupOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: file,  // 'body', not 'file'
  };
  fetch(`${APIEndpoint}/upload/`, lookupOptions)
    .then(function(response) {
      return response.json();
    })
    .then(function(responseData) {
      setFileUploadMessage("File uploaded successfully!")
      if (detectOutgroups)
        ogDetector(e, props, fileProps, setFileProps, setOutGroupComponents);
      return responseData;
    })
    .catch(function(error) {
      setFileUploadMessage("File upload failed! Please make sure the format is supported")
      console.log("error", error);
    });
    try{
  	this.props.onChange("", this.props.componentParams.componentID)
    }
    catch (error){}
}

function changeComponent(e, setSelectedComponent) {
  var selectedComponent = e.target.value;
  setSelectedComponent(selectedComponent);
}

function addOG(e, props, fileProps, setFileProps) {
  console.log(e)
  var fileProps = fileProps;
  var selectedOptions = fileProps[1];
  if (e.target.checked) {
    selectedOptions.push(e.target.value);
    fileProps[1] = selectedOptions;
  } else {
    var index = selectedOptions.indexOf(e.target.value);
    if (index > -1) {
      selectedOptions.splice(index, 1);
      fileProps[1] = selectedOptions;
    }
  }
  setFileProps(fileProps);
  props.onChange(
    selectedOptions.toString(),
    `${props.componentParams.componentID}.og`
  );
}

function hideOGDiv(hideOG, setHideOG) {
  if (hideOG) {
    setHideOG(false);
  } else {
    setHideOG(true);
  }
}

function ogDetector(e, props, fileProps, setFileProps, setOutGroupComponents) {
  var outGroupComponents = [];
  var outGroups = [];
  const endpoint = `${APIEndpoint}/biotools/?function=getFileProps;${props.title};${e.target.files[0].name}/`;
  let lookupOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  fetch(endpoint, lookupOptions)
    .then(function(response) {
      return response.json();
    })
    .then(function(responseData) {
      var localFileProps = [e.target.files[0].name, []]
      outGroups = responseData.outgroups;
      setFileProps([e.target.files[0].name, []]);
      for (var i = 0; i < outGroups.length; i++) {
        outGroupComponents.push({
          element: (
            <div>
              <input
                id={"ogc_" + i}
                type="checkbox"
                value={outGroups[i]}
                name={outGroups[i]}
                onChange={(e) => addOG(e, props, localFileProps, setFileProps)}
              />{" "}
              <label for={outGroups[i]}>{outGroups[i]}</label>
            </div>
          ),
        });
      }
      setOutGroupComponents(outGroupComponents);
    })
    .catch(function(error) {
      console.log("error", error);
    });
}

function rangeIsValid(from, to, type, setPartitionMessage) {
  if (type == "none") {
    if (from <= to) {
      setPartitionMessage("Partition Added!");
      return true;
    } else {
      setPartitionMessage("Error, Check Interval!");
      return false;
    }
  }

  if (type == "codon-specific" || type == "third-codon") {
    if (to >= from + 2) {
      setPartitionMessage("Partition Added!");
      return true;
    } else {
      setPartitionMessage("Error, Check Interval!");
      return false;
    }
  }
}

function setPartition(
  props,
  uploadComponent,
  selectedComponent,
  PartitionModel,
  setPartitionMessage
) {
  console.log(PartitionModel)
  var partitionRangeFrom = parseInt(
    document.getElementById("eptrf_" + uploadComponent.componentID).value
  );
  var textAreaValue = document.getElementById("PartitionArea").value;
  var partitionName = document.getElementById(
    "ept_" + uploadComponent.componentID
  ).value;
  var partitionRangeTo = parseInt(
    document.getElementById("eptrt_" + uploadComponent.componentID).value
  );
  var rangeFlag = rangeIsValid(
    partitionRangeFrom,
    partitionRangeTo,
    selectedComponent,
    setPartitionMessage
  );
  if (selectedComponent == "none" && rangeFlag) {
    var valueToAdd =
      PartitionModel +
      ",\t" +
      partitionName +
      " = " +
      partitionRangeFrom +
      "-" +
      partitionRangeTo +
      "\n";
    textAreaValue += valueToAdd;
    document.getElementById("PartitionArea").value = textAreaValue;
  }
  if (selectedComponent == "codon-specific" && rangeFlag) {
    for (var i = 0; i < 3; i++) {
      var valueToAdd =
        PartitionModel +
        ",\t" +
        partitionName +
        "_codon" +
        parseInt(i + 1) +
        " = " +
        parseInt(partitionRangeFrom + i) +
        "-" +
        partitionRangeTo +
        "\\3" +
        "\n";
      textAreaValue += valueToAdd;
      document.getElementById("PartitionArea").value = textAreaValue;
    }
  }
  if (selectedComponent == "third-codon" && rangeFlag) {
    var valueToAdd =
      PartitionModel +
      ",\t" +
      partitionName +
      "_codon1and2 " +
      " = " +
      partitionRangeFrom +
      "-" +
      partitionRangeTo +
      ", " +
      parseInt(partitionRangeFrom + 1) +
      "-" +
      partitionRangeTo +
      "\\3" +
      "\n" +
      PartitionModel +
      ",\t" +
      partitionName +
      "_codon3 " +
      "= " +
      parseInt(partitionRangeFrom + 2) +
      "-" +
      partitionRangeTo +
      "\\3" +
      "\n";
    textAreaValue += valueToAdd;
    document.getElementById("PartitionArea").value = textAreaValue;
  }

  if (rangeFlag) {
    props.onChange(textAreaValue, `${props.componentParams.componentID}.part`);
    document.getElementById("eptrf_" + uploadComponent.componentID).value =
      partitionRangeTo + 1;
    document.getElementById("eptrt_" + uploadComponent.componentID).value = "";
  }
}

function Upload(props) {
  const [detectOutgroups, setDetectOutgroups] = useState(false);
  const [editPartitions, setEditPartitions] = useState(false);
  const [fileUploadMessage, setFileUploadMessage] = useState("");
  const [preferredFormat, setPreferredFormat] = useState("");
  const [outGroupComponents, setOutGroupComponents] = useState([
    { element: <p>Please upload a file to detect outgroups</p> },
  ]);
  const [hideOG, setHideOG] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("none");
  const [componentParams, setComponentParams] = useState({
    componentID: "dummy",
    compParams: [""],
  });
  const [pModels, setPModels] = useState("loading");
  const [PartitionModel, setPartitionModel] = useState("");
  const [partitionMessage, setPartitionMessage] = useState("");
  const [uploadComponent, setUploadComponent] = useState();
  const [uploadOptions, setUploadOptions] = useState();
  const [fileProps, setFileProps] = useState();
  const [slug, setSlug] = useState();
  const { componentSet, setComponentSet } = useContext(GlobalContext);
  const { swapMap, setSwapMap } = useContext(GlobalContext);

  const fetchPartitionModels = () => {
    const slug = "PartitionModelsJKHGGVBDS2134KJHB";
    setSlug(slug);
    const endpoint = `${APIEndpoint}/common-params/${slug}/`;
    let lookupOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    fetch(endpoint, lookupOptions)
      .then(function(response) {
        return response.json();
      })
      .then(function(responseData) {
        setPModels(responseData.paramData);
      })
      .catch(function(error) {
        console.log("error", error);
      });
  };

  useEffect(() => {
    if (props.parentType === "RunNode") {
      var uploadComponent = props.componentParams;
      setUploadComponent(uploadComponent);

      var uploadOptions = uploadComponent.compParams;
      var len = uploadOptions.length;
      if (uploadOptions.includes("do")) {
        var sid = uploadOptions.indexOf("do");
        setDetectOutgroups(true);
        uploadOptions.splice(sid, 1);
      }
      if (uploadOptions.includes("ep")) {
        var sid = uploadOptions.indexOf("ep");
        setEditPartitions(true);
        uploadOptions.splice(sid, 1);
        fetchPartitionModels();
      }
      if (uploadOptions.length > 0) {
        setPreferredFormat(uploadOptions[0]);
      }
      var componentParams = {
        componentID: "eps_" + "54as6d54",
        compParams: [pModels],
      };
      setComponentParams(componentParams);
      setUploadOptions(uploadOptions.toString());
      
    }
  }, [props]);
  const setPModel = (element) => {
    setPartitionModel(element.target.value);
  }
  if (props.parentType === "CreateNode")
    return (
      <div id={props.id}>
        <div className="nodeID">
          ID: <span className="grabber" onMouseEnter={(event) => ElementUtils.selectRange(event, "select")} onMouseLeave={(event) => ElementUtils.selectRange(event)}>{props.id}</span> (Upload){" "}
          <a
            className="upArrow"
            href="#"
            onClick={() =>
              ElementUtils.swapComponent(
                props.id,
                "up",
                componentSet,
                setComponentSet,
                swapMap,
                setSwapMap
              )
            }
          >
            &#8593;
          </a>
          &nbsp;&nbsp;
          <a
            className="nodeOps"
            href="#"
            onClick={() =>
              ElementUtils.swapComponent(
                props.id,
                "down",
                componentSet,
                setComponentSet,
                swapMap,
                setSwapMap
              )
            }
          >
            &#8595;
          </a>
          &nbsp;&nbsp;
          <a
            href="#"
            className="nodeOps"
            onClick={() =>
              ElementUtils.removeComponent(
                props.id,
                componentSet,
                setComponentSet,
                swapMap,
                setSwapMap
              )
            }
          >
            &#215;
          </a>
          <input 
            type="checkbox"
            id={"removeFromCommandQuery" + props.id}
            name="removeFromCommandQuery"
          />
          <label htmlFor="removeFromCommandQuery" style={{fontSize: "14px"}}>Remove from final command query</label>
        </div>
        <div className="createMarginBottom15">
          <input
            defaultValue={
              props.updateProps === ""
                ? ""
                : props.updateProps.parameterTranslation
            }
            type="text"
            id={"pt" + props.id}
            placeholder="Parameter Translation"
            size="20"
          />
          {"    "}
          <input
            defaultValue={
              props.updateProps === "" ? "" : props.updateProps.displayOptions
            }
            id={"dops" + props.id}
            type="text"
            placeholder="Display When"
            size="20"
            onDrop={() => ElementUtils.handleDrop("dops"+props.id)}
          />
          {"    "}
          <input
            defaultValue={
              props.updateProps === "" ? "" : props.updateProps.componentName
            }
            id={"comTitle" + props.id}
            type="text"
            placeholder="Enter name"
            size="20"
          />
        </div>
        <input
          type="checkbox"
          id={"ep" + props.id}
          name="ep"
          defaultChecked={
            props.updateProps === ""
              ? ""
              : props.updateProps.compParams.includes("ep")
              ? true
              : false
          }
        />
        <label htmlFor="ep">Enable Partioning</label>
        <input
          type="checkbox"
          id={"do" + props.id}
          name="do"
          defaultChecked={
            props.updateProps === ""
              ? ""
              : props.updateProps.compParams.includes("do")
              ? true
              : false
          }
        />
        <label htmlFor="do">Detect Outgroups</label>
        <input
          defaultValue={
            props.updateProps === ""
              ? ""
              : props.updateProps.compParams
                  .filter((item) => item !== "do" && item !== "ep")
                  .toString()
          }
          type="text"
          id={"pf" + props.id}
          placeholder="Preferred File Format"
          size="20"
        />
        <h4>Formats supported: Fasta, Nexus</h4>
      </div>
    );
  if (props.parentType === "RunNode" && uploadComponent !== undefined)
    return (
      <React.Fragment>
        <div id={uploadComponent.componentID} style={props.renderParam === "true" ? null : hideElement}>
          <h4 className="runNodeElementTitle">{props.componentParams.componentName}{" "}
          <input
            onChange={(e) =>
              handleChange(
                e,
                props,
                uploadOptions,
                detectOutgroups,
                fileProps,
                setFileProps,
                setOutGroupComponents,
                setFileUploadMessage,
                preferredFormat
              )
            }
            type="file"
            multiple
          /></h4><h5 className="errorText" style={fileUploadMessage === "" ? hideElement : null}>! {fileUploadMessage} !</h5>

          <a
            className="Button createMarginBottom25"
            onClick={() => hideOGDiv(hideOG, setHideOG)}
            style={detectOutgroups === false ? hideElement : null}
          >
            {"  "}
            {hideOG === true ? "Show Outgroups" : "Hide Outgroups"}
          </a>
          <div id="ogDiv" style={hideOG === true ? hideElement : null}>
            {detectOutgroups === false
              ? <h5 style={{color: "white"}}>Outgroup Detection is not supported for this node</h5>
              : outGroupComponents.map(
                  (eachComponent) => eachComponent.element
                )}
          </div>
          <div style={editPartitions === true ? hideElement : null}>
            <h5 style={{color: "white"}}>Editing Partitions is not supported for this node</h5>
          </div>
          <div style={editPartitions === true ? null : hideElement}>
            <p>
              Partition Model:{" "}
              {pModels === "loading" ? (
                <span>Loading Partion Models</span>
              ) : (
                <select
                  value={PartitionModel}
                  onChange={(e) => setPModel(e)}
                >
                {pModels.split(",").map((eachModel) => <option value={eachModel}>{eachModel}</option>)}
                </select>
              )}
            </p>
            <label htmlFor="ep-text">Partition Name: </label>
            <input
              size="7"
              type="text"
              id={"ept_" + uploadComponent.componentID}
              name="ep-text"
            />
            <br />
            <label htmlFor="ep-textrf">From: </label>
            <input
              size="4"
              type="text"
              id={"eptrf_" + uploadComponent.componentID}
              name="ep-textrf"
            />
            <br />
            <label htmlFor="ep-textrt">To: </label>
            <input
              size="4"
              type="text"
              id={"eptrt_" + uploadComponent.componentID}
              name="ep-textrt"
            />
            <br />
            <p>
              Codon Model:{" "}
              <select
                value={selectedComponent}
                onChange={(e) => changeComponent(e, setSelectedComponent)}
              >
                <option value="none">None</option>
                <option value="codon-specific">Codon Specific</option>
                <option value="third-codon">Third Codon</option>
              </select>
            </p>
            <br />
            <button
              onClick={() =>
                setPartition(
                  props,
                  uploadComponent,
                  selectedComponent,
                  PartitionModel,
                  setPartitionMessage
                )
              }
            >
              Add Partition
            </button>
            <br />
            <p
              style={
                partitionMessage.includes("Error") ? { color: "red" } : null
              }
            >
              {partitionMessage}
            </p>
            <br />
            <textarea
              id={"PartitionArea"}
              placeholder="Partitions will appear here"
              rows="4"
              cols="40"
            />
          </div>
        </div>
      </React.Fragment>
    );
}

export default Upload;
