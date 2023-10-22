import React, { useEffect, useState, useContext } from "react";
import * as ElementUtils from "./Utils/js/elements.js";
import GlobalContext from "../GlobalContext";

const hideElement = {
  display: "none",
};

function FinalParameterPart(props) {
  
  const [finalParameterPartElement, setFinalParameterPartElement] = useState(
    <input type="text" />
  );
  const { componentSet, setComponentSet } = useContext(GlobalContext);
  const { swapMap, setSwapMap } = useContext(GlobalContext);
      return (
      <div key={props.id} id={props.id} className="createMarginBottom25">
        <div className="nodeID">
          <span> Parameter Part </span>
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
        <input
          defaultValue = {props.updateProps === "" ? "" : props.updateProps.componentName}
          type = "text"
          id = {"comTitle" + props.id}
          placeholder = "Type parameter part here"
        />{" "}
        <input
          defaultValue = {props.updateProps === "" ? "" : props.updateProps.displayOptions}
          id = {"dops" + props.id}
          type = "text"
          placeholder = "Run this when"
          size = "20"
          onDrop = {() => ElementUtils.handleDrop("dops"+props.id)}
        />
      </div>
    );
}

export default FinalParameterPart;