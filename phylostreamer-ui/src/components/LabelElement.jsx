import React, { useEffect, useState, useContext } from "react";
import * as ElementUtils from "./Utils/js/elements.js";
import GlobalContext from "../GlobalContext";

const hideElement = {
  display: "none",
};

function Label(props) {

  const [labelElement, setLabelElement] = useState(
    <input defaultValue="label" />
  );
  const { componentSet, setComponentSet } = useContext(GlobalContext);
  const { swapMap, setSwapMap } = useContext(GlobalContext);
  useEffect(() => {
    if (props.parentType === "RunNode") {
      var component;
      var labelComponent = props.componentParams;
      var labelTitle = labelComponent.componentName;
      var component = (
          <h5
          style={{color: "white"}}
            type="label"
            name={labelTitle}
          >
            {labelTitle}
          </h5>
      );
    }
    setLabelElement(component);
  }, [props, componentSet]);
  if (props.parentType === "CreateNode") {
    return (
      <div key={props.id} id={props.id} className="createMarginBottom25">
        <div className="nodeID">
          <span>Information Text {props.id}</span>
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
            defaultValue={true}
          />
          <label htmlFor="removeFromCommandQuery" style={{fontSize: "14px"}}>Remove from final command query</label>
        </div>
        <input
          defaultValue = {props.updateProps === "" ? "" : props.updateProps.componentName}
          type="text"
          id={"comTitle" + props.id}
          placeholder="Type Information here"
        />{" "}
        <input
          defaultValue = {props.updateProps === "" ? "" : props.updateProps.displayOptions}
          id={"dops" + props.id}
          type="text"
          placeholder="Display When"
          size="20"
          onDrop={() => ElementUtils.handleDrop("dops"+props.id)}
        />
      </div>
    );
  }
  return (
    <div id={props.componentParams.componentID} style={props.renderParam == "true" ? null : hideElement}>
      {labelElement}
    </div>
  );
}

export default Label;
