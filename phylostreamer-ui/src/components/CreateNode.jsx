import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import cookie from "react-cookies";
import Label from "./LabelElement";
import Upload from "./UploadElement";
import Select from "./SelectElement";
import Checkbox from "./CheckboxElement";
import String from "./StringElement";
import FinalParameterPart from "./FinalParameterPart";
import GlobalContext from "../GlobalContext";
import * as ElementUtils from "./Utils/js/elements.js";
import "./Utils/css/styles.css";
import config from '../config.json'

const APIEndpoint = `${config.ssl === true ? "https" : "http"}://${config.host}${config.port === "" ? "" : ":"+config.port}`  


const token = localStorage.getItem('token');

const hideElement = {
  display: "none",
};

function setTitleText(event, setTitle){
  setTitle(event.target.value)
}

function addElement(
  selectedComponent,
  componentSet,
  setComponentSet,
  swapMap,
  setSwapMap,
  updateBuilder = ""
) {
  var currentComponents = [...componentSet];
  var swapPos = currentComponents.length;
  var component = "";
  var id =
    updateBuilder === ""
      ? Math.floor(Math.random() * (100000 - 1 + 1)) + 1
      : updateBuilder.id;
  if (selectedComponent == "label") {
    component = (
      <Label
        parentType="CreateNode"
        id={id}
        key={id}
        updateProps={updateBuilder}
      />
    );
    currentComponents.push({
      componentID: id,
      componentType: selectedComponent,
      inputComponent: component,
    });
  }
  if (selectedComponent == "upload") {
    component = (
      <Upload
        parentType="CreateNode"
        id={id}
        key={id}
        updateProps={updateBuilder}
      />
    );
    currentComponents.push({
      componentID: id,
      componentType: selectedComponent,
      inputComponent: component,
    });
  }
  if (selectedComponent == "option") {
    component = (
      <Select
        parentType="CreateNode"
        id={id}
        key={id}
        updateProps={updateBuilder}
      />
    );
    currentComponents.push({
      componentID: id,
      componentType: selectedComponent,
      inputComponent: component,
    });
  }
  if (selectedComponent == "checkbox") {
    component = (
      <Checkbox
        parentType="CreateNode"
        id={id}
        key={id}
        updateProps={updateBuilder}
      />
    );
    currentComponents.push({
      componentID: id,
      componentType: selectedComponent,
      inputComponent: component,
    });
  }
  if (selectedComponent == "string") {
    component = (
      <String
        parentType="CreateNode"
        id={id}
        key={id}
        updateProps={updateBuilder}
      />
    );
    currentComponents.push({
      componentID: id,
      componentType: selectedComponent,
      inputComponent: component,
    });
  }
  if (selectedComponent == "fpp") {
    component = (
      <FinalParameterPart
        id={id}
        key={id}
        updateProps={updateBuilder}
      />
    );
    currentComponents.push({
      componentID: id,
      componentType: selectedComponent,
      inputComponent: component,
    });
  }

  var swapMap = swapMap;
  swapMap[id] = swapPos;

  if (updateBuilder === "") {
    setComponentSet(currentComponents);
    setSwapMap(swapMap);
  } else {
    return [swapMap, currentComponents];
  }
}

function changeComponent(e, setSelectedComponent) {
  var selectedComponent = e.target.value;
  setSelectedComponent(selectedComponent);
}

function addNode(componentSet, props, slug, oldTitle="") {
  var updateFlag = false;
  if (slug){
    updateFlag = true
  }
  var finalParameter = ""
  var componentSet = [...componentSet];
  for (var i = 0; i < componentSet.length; i++) {
    var currentComponent = componentSet[i];
    var component = currentComponent["inputComponent"];
    var compID = currentComponent["componentID"];
    var tempSet = [];
    currentComponent["parameterTranslation"] = ElementUtils.returnProps(
      "pt" + compID
    );
    currentComponent["displayOptions"] = ElementUtils.returnProps(
      "dops" + compID
    );
    currentComponent["componentName"] = ElementUtils.returnProps(
      "comTitle" + compID
    );
    if (currentComponent.componentType === "option" || currentComponent.componentType === "string" || currentComponent.componentType === "checkbox"){
      currentComponent["defaultValue"] = ElementUtils.returnProps("defaultValue"+compID)
    }
    if (currentComponent["componentType"] == "upload") {
      //This pushes the Checkbox parameters
      if (document.getElementById("ep" + compID).checked == true)
        tempSet.push("ep");
      if (document.getElementById("do" + compID).checked == true)
        tempSet.push("do");
      if (document.getElementById("pf" + compID).value != "") {
        tempSet.push(document.getElementById("pf" + compID).value);
      }
    }
    if (currentComponent["componentType"] == "option") {
      tempSet.push(ElementUtils.returnProps("opsList" + compID).replace(/(\r\n|\n|\r)/gm, ""));
    }
    if (currentComponent["componentType"].includes("common_")) {
      currentComponent["componentType"] = "option";
      var cParams = currentComponent["fetchedParams"];
      tempSet.push(cParams);
    }
    currentComponent["compParams"] = tempSet;
  }
  componentSet.push({
    finalParameter: (document.getElementById("finalParameter").value).trim(),
  });



  for (var i = 0; i < componentSet.length; i++) {
    delete componentSet[i]["inputComponent"];
  }
  if (!updateFlag){
    var slug = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 30; i++) {
      slug += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  }
  var title = ElementUtils.returnProps("nodeTitle");
  componentSet = JSON.stringify(componentSet);
  var postData = { title: title, slug: slug, nodeData: componentSet };
  const csrfToken = cookie.load("csrftoken");
  let lookupOptions = {
    method: updateFlag === true ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  };
  console.log(JSON.stringify(postData))
  fetch(updateFlag === true ? `${APIEndpoint}/node-update/${slug}/` : `${APIEndpoint}/save-node/`, lookupOptions)
    .then(function(response) {
      return response.json();
    })
    .then(function(responseData) {
      return responseData;
    })
    .catch(function(error) {
      console.log("error", error);
    });

  executeETLFunctions(slug, props, oldTitle);
}

function executeETLFunctions(slug, props, oldTitle) {
  var title = ElementUtils.returnProps("nodeTitle");
  var postData = {
    operation: oldTitle === "" ? "create-folder" : "rename-folder",
    postData: title,
    oldTitle: oldTitle === "" ? ";-;" : oldTitle
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
  fetch(`${APIEndpoint}/etl-functions/`, lookupOptions)
    .then(function(response) {
      return response.json();
    })
    .then(function(responseData) {
      alert(oldTitle === "" ? "Node created successfully" : "Node updated successfully")
      var parentIframe = window.parent.document.querySelector('iframe')
      parentIframe.src = `localhost:3000/phylostreamer/node/${slug}`
      window.location.reload()
      return responseData;
    })
    .catch(function(error) {
      alert(oldTitle === "" ? "Node creation failed" : "Node update failed")
      console.log("error", error);
    });
}

function CreateNode(props) {
  const { componentSet, setComponentSet } = useContext(GlobalContext);
  const { selectedComponent, setSelectedComponent } = useContext(GlobalContext);
  const { swapMap, setSwapMap } = useContext(GlobalContext);
  const { swapContents, setSwapContents } = useContext(GlobalContext);
  const [title, setTitle] = useState("");
  const [oldTitle, setOldTitle] = useState("")
  const [finalParameter, setFinalParameter] = useState("");
  const [updateFlag, setUpdateFlag] = useState(true);
  const { slug } = useParams();
  const buildUpdateNode = (
    swapMap,
    componentSet,
    setSwapMap,
    setComponentSet,
    setTitle,
    setOldTitle
  ) => {
    const endpoint = `${APIEndpoint}/node/${slug}/`;
    const csrfToken = cookie.load("csrftoken");
    let lookupOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
        Authorization: `Bearer ${token}`,
      },
    };
    fetch(endpoint, lookupOptions)
      .then(function(response) {
        return response.json();
      })
      .then(function(responseData) {
        var swapMap = {};
        var componentSet = [];
        setTitle(responseData.title);
        setOldTitle(responseData.title)
        var nodeData = JSON.parse(responseData.nodeData);
        var finalParameter;
        for (var i = 0; i < nodeData.length; i++) {
          var temp;
          temp = addElement(
            nodeData[i].componentType,
            componentSet,
            setComponentSet,
            swapMap,
            setSwapMap,
            {
              id: nodeData[i].componentID,
              componentName: nodeData[i].componentName,
              compParams: nodeData[i].compParams,
              parameterTranslation: nodeData[i].parameterTranslation,
              displayOptions: nodeData[i].displayOptions,
              defaultValue: nodeData[i].defaultValue,
            }
          );
          if (nodeData[i].finalParameter) {
            finalParameter = nodeData[i].finalParameter;
            setFinalParameter(finalParameter);
          }
          componentSet = temp[1];
          swapMap = temp[0];
        }
        delete swapMap[undefined];
        setComponentSet(componentSet);
        setSwapMap(swapMap);
      })
      .catch(function(error) {
        console.log("error", error);
      });
  };
  useEffect(() => {
    if (slug) {
      buildUpdateNode(
        swapMap,
        componentSet,
        setSwapMap,
        setComponentSet,
        setTitle,
        setOldTitle
      );
    }
  }, []);

  useEffect(() => {
    const element = document.getElementById("addElement");
    setTimeout(() => {
      element.scrollIntoView();
    }, 1)
    document.getElementById("finalParameter").value = ""
    for (var i=0; i<componentSet.length; i++) {
      if (componentSet[i].componentType !== "upload" && !document.getElementById("removeFromCommandQuery" + componentSet[i].componentID).checked){
        var finalParameterValue = document.getElementById("finalParameter").value;
        document.getElementById("finalParameter").value = finalParameterValue + " {" + componentSet[i].componentID +"} "
      }
    }
  },[componentSet])

  useEffect(() => {}, [title])
  useEffect(() => {}, [componentSet, swapMap]);
  return (
    <React.Fragment>
      <div className="nodeCreationArea">
        <h1>{slug ? "Update Existing Node" : "Create New Node"}</h1>
        <h3>
          <input type="text" id="nodeTitle" onChange={(event) => setTitleText(event, setTitle)} placeholder="Enter node name" defaultValue={slug ? title : ""}/>
          <br />
        </h3>
        <div id="componentView">
          {componentSet.map((eachComponent) => eachComponent.inputComponent)}
        </div>
        <br />
        <span>Add element:</span>
        <select
          value={selectedComponent}
          onChange={(e) => changeComponent(e, setSelectedComponent)}
        >
          <option value="upload">File Upload</option>
          <option value="option">Options</option>
          <option value="checkbox">Checkbox</option>
          <option value="string">String Text</option>
          <option value="label">Information Text</option>
          <option value="fpp">Final Parameter Part</option>
        </select>
        <a
          id = "addElement"
          href="#"
          className="Button"
          name="Add"
          onClick={() =>
            addElement(
              selectedComponent,
              componentSet,
              setComponentSet,
              swapMap,
              setSwapMap
            )
          }
        >
          Add
        </a>
        <br />
        <br />
        <a
          href="##"
          className="Button createMarginBottom25"
          name="Create"
          style={title === "" ? hideElement : null}
          onClick={() => addNode(componentSet, props, slug, oldTitle)}
        >
          {slug ? "Update Node" : "Add Node"}
        </a>
        <br/>
        <br/>
        <textarea
          defaultValue = {slug ? finalParameter : ""}
          id="finalParameter"
          placeholder="Enter final Parameter here"
          className="createMarginBottom15"
          rows="9"
          cols="40"
        />
        <h5 className="errorText" style={title === "" ? null : hideElement}>! Enter a title for the node !</h5>
      </div>
    </React.Fragment>
  );
}

export default CreateNode;
