import React, { useEffect, useState, useContext } from "react";
import * as ElementUtils from "./Utils/js/elements.js";
import GlobalContext from "../GlobalContext";

const hideElement = {
  display: "none",
};

function Checkbox(props) {
  const [checkboxElement, setCheckboxElement] = useState(
    <input type="checkbox" />
  );
  const [checkedValue, setCheckedValue] = useState("");
  const { componentSet, setComponentSet } = useContext(GlobalContext);
  const { swapMap, setSwapMap } = useContext(GlobalContext);

  const handleChange = (e, props, setCheckedValue) => {
    if (e.target !== null) {
      var checkedValue;
      if (e.target.checked) checkedValue = e.target.value;
      else checkedValue = "";
      setCheckedValue(checkedValue);
      props.onChange(checkedValue, props.componentParams.componentID, props.componentParams.parameterTranslation);
    }
  };

  useEffect(() => {
    if (props.parentType === "RunNode") {
      var checkboxComponent = props.componentParams;
      var checkboxTitle = checkboxComponent.componentName;
      var component = (
        <div>
          <h4 className="runNodeElementTitle">{checkboxTitle}{" "}
          <input
            id={props.componentParams.componentID}
            type="checkbox"
            name={checkboxTitle}
            defaultChecked={props.componentParams.defaultValue === "" ? false : true}
            value={checkboxComponent.parameterTranslation}
            onChange={(e) => handleChange(e, props, setCheckedValue)}
          />
          </h4>
        </div>
      );
      setCheckboxElement(component);
      if (props.componentParams.defaultValue !== ""){
          props.onChange(props.componentParams.defaultValue, props.componentParams.componentID, props.componentParams.parameterTranslation);
      }
    }
  }, [props]);

  if (props.parentType === "CreateNode") {
    return (
      <div key={props.id} id={props.id} className="createMarginBottom25">
        <div className="nodeID">
          ID: <span className="grabber" onMouseEnter={(event) => ElementUtils.selectRange(event, "select")} onMouseLeave={(event) => ElementUtils.selectRange(event)}>{props.id}</span> (Checkbox)
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
          <br/>
          <input
            defaultValue={
              props.updateProps === "" ? "" : props.updateProps.defaultValue
            }
            id={"defaultValue" + props.id}
            type="text"
            placeholder="Enter default value"
            size="20"
          />
        </div>
      </div>
    );
  }
  if (props.parentType === "RunNode") {
    return (
      <React.Fragment>
        <div id={props.componentParams.componentID} style={props.renderParam == "true" ? null : hideElement}>
          {checkboxElement}
        </div>
      </React.Fragment>
    );
  }
}

export default Checkbox;
