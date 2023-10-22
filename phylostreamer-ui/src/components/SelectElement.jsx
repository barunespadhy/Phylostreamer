import React, { useEffect, useState, useContext } from "react";
import * as ElementUtils from "./Utils/js/elements.js";
import GlobalContext from "../GlobalContext";

const hideElement = {
  display: "none",
};

function Select(props) {
  const [selectOptions, setSelectOptions] = useState([
    { option: <option value="option">option</option> },
  ]);
  const [selectedOption, setSelectedOption] = useState();
  const { componentSet, setComponentSet } = useContext(GlobalContext);
  const { swapMap, setSwapMap } = useContext(GlobalContext);
  const handleChange = (e, props, setSelectedOption) => {
    var selectedOption = e.target.value;
    setSelectedOption(selectedOption);
    props.onChange(selectedOption, props.componentParams.componentID, props.componentParams.parameterTranslation);
  };
  useEffect(() => {
    if (props.parentType === "RunNode") {
      try {
        var selectComponent = props.componentParams;
        var selectedOption = "";
        var selectOptions = selectComponent.compParams[0].split(",");
        var len = selectOptions.length;
        for (var i = 0; i < len; i++) {
          var selectElementProps = (selectOptions[i].trim()).split("|");
          selectOptions.push({
            option: (
              <option value={selectElementProps[0]}>
                {selectElementProps.length > 1
                  ? selectElementProps[1]
                  : selectElementProps[0]}
              </option>
            ),
          });
        }
        selectOptions.push({
          option: <option value="">{"<Choose an option>"}</option>,
        });
        if (props.componentParams.defaultValue !== ""){
          setSelectedOption(props.componentParams.defaultValue)
          props.onChange(props.componentParams.defaultValue, props.componentParams.componentID, props.componentParams.parameterTranslation);
        }
        else{
          setSelectedOption("")
          props.onChange("", props.componentParams.componentID, props.componentParams.parameterTranslation);
        }
        setSelectOptions(selectOptions);
        
      } catch (error) {
        console.log(error);
      }
    }
  }, [props]);

  if (props.parentType === "CreateNode")
    return (
      <div id={props.id} className="createMarginBottom25">
        <div className="nodeID">
          <span>ID: <span className="grabber" onMouseEnter={(event) => ElementUtils.selectRange(event, "select")} onMouseLeave={(event) => ElementUtils.selectRange(event)}>{props.id}</span> (Options)</span> &nbsp;&nbsp;
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
        <textarea
          defaultValue={
            props.updateProps === "" ? "" : props.updateProps.compParams
          }
          id={"opsList" + props.id}
          placeholder="Separate option elements by ','. Eg:&#10;A,&#10;B,&#10;C..."
          rows="4"
          cols="40"
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
    );

  if (props.parentType === "RunNode")
    return (
      <React.Fragment>
        <div id={props.componentParams.componentID}  style={props.renderParam == "true" ? null : hideElement}>
          <h4 className="runNodeElementTitle">{props.componentParams.componentName}{" "}
          <select
            value={selectedOption}
            defaultValue={props.componentParams.defaultValue === "" ? "" : props.componentParams.defaultValue}
            onChange={(e) => handleChange(e, props, setSelectedOption)}
            key={props.componentParams.componentID}
          >
            {selectOptions.map((eachComponent) => eachComponent.option)}
          </select></h4>
        </div>
      </React.Fragment>
    );
}

export default Select;
