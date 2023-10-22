import React, { useEffect, useState, useContext } from "react";

export function removeComponent(
	id,
	componentSet,
	setComponentSet,
	swapMap,
	setSwapMap
) {
	var componentSet = [...componentSet];
	var swapMap = swapMap;
	var elementContents = {};

	componentSet.splice(swapMap[id], 1);
	delete swapMap[id];
	for (var i = 0; i < componentSet.length; i++) {
		var currElement = componentSet[i];
		swapMap[currElement.componentID] = i;
	}
	elementContents = storeContents(
		swapMap,
		elementContents,
		componentSet,
		"store"
	);
	setComponentSet(componentSet);
	setSwapMap(swapMap);
	storeContents(swapMap, elementContents, componentSet, "transfer");
}

export function storeContents(
	swapMap,
	elementContents,
	componentSet,
	operation
) {
	console.log(swapMap)
	if (operation == "store") {
		for (const [key, value] of Object.entries(swapMap)) {
			//Every element has a name and display option so store that first
			elementContents["comTitle" + key] = returnProps("comTitle" + key);
			elementContents["dops" + key] = returnProps("dops" + key);

			//Other than lable element, every other element has a parameter translation,
			if (componentSet[swapMap[key]].componentType != "label" && componentSet[swapMap[key]].componentType != "fpp") {
				elementContents["pt" + key] = returnProps("pt" + key);

				//now check if it is an upload element. In that case save the checkbox values and file format
				if (componentSet[swapMap[key]].componentType == "upload") {
					elementContents["ep" + key] = document.getElementById(
						"ep" + key
					).checked;
					elementContents["do" + key] = document.getElementById(
						"do" + key
					).checked;
					elementContents["pf" + key] = returnProps("pf" + key);
				}

				//or check if it is an option. In that case, store the option list
				if (componentSet[swapMap[key]].componentType == "option") {
					elementContents["opsList" + key] = returnProps(
						"opsList" + key
					);
				}
			}
		}
		return elementContents;
	}
	if (operation == "transfer") {
		for (const [key, value] of Object.entries(swapMap)) {
			//Every element has a name and display option so store that first
			document.getElementById("comTitle" + key).value =
				elementContents["comTitle" + key];
			document.getElementById("dops" + key).value =
				elementContents["dops" + key];

			//Other than lable element, every other element has a parameter translation,
			if (componentSet[swapMap[key]].componentType != "label" && componentSet[swapMap[key]].componentType != "fpp") {
				document.getElementById("pt" + key).value =
					elementContents["pt" + key];

				//now check if it is an upload element. In that case save the checkbox values and file format
				if (componentSet[swapMap[key]].componentType == "upload") {
					document.getElementById("ep" + key).checked =
						elementContents["ep" + key];
					document.getElementById("do" + key).checked =
						elementContents["do" + key];
					document.getElementById("pf" + key).value =
						elementContents["pf" + key];
				}

				//or check if it is an option. In that case, store the option list
				if (componentSet[swapMap[key]].componentType == "option") {
					document.getElementById("opsList" + key).value =
						elementContents["opsList" + key];
				}
			}
		}
	}
}

export function swapComponent(
	id,
	opType,
	componentSet,
	setComponentSet,
	swapMap,
	setSwapMap
) {
	var swapContents = {};
	var swapMap = swapMap;
	var elementContents = {};
	var componentSet = [...componentSet];
	if (opType == "up") {
		try {
			var otherComponentID = componentSet[swapMap[id] - 1].componentID;
			elementContents = storeContents(
				swapMap,
				elementContents,
				componentSet,
				"store"
			);

			//store previous values

			//Swap components
			var temp = componentSet[swapMap[id] - 1];
			componentSet[swapMap[id] - 1] = componentSet[swapMap[id]];
			componentSet[swapMap[id]] = temp;

			//swap components in map
			temp = swapMap[otherComponentID];
			swapMap[otherComponentID] = swapMap[id];
			swapMap[id] = temp;
		} catch (error) {
			console.log(error);
		}
	}
	if (opType == "down") {
		try {
			var otherComponentID = componentSet[swapMap[id] + 1].componentID;
			elementContents = storeContents(
				swapMap,
				elementContents,
				componentSet,
				"store"
			);
			//Swap components
			var temp = componentSet[swapMap[id] + 1];
			componentSet[swapMap[id] + 1] = componentSet[swapMap[id]];
			componentSet[swapMap[id]] = temp;

			//swap components in map
			temp = swapMap[otherComponentID];
			swapMap[otherComponentID] = swapMap[id];
			swapMap[id] = temp;
		} catch (error) {}
	}
	setComponentSet(componentSet);
	setSwapMap(swapMap);
	storeContents(swapMap, elementContents, componentSet, "transfer");
	setTimeout(() => {
		document.getElementById(id).scrollIntoView();
	}, 100)
}

export function returnProps(props) {
	try {
		return document.getElementById(props).value;
	} catch (error) {}
}

export function selectRange(event, operation=""){
	let span = event.target;
	let range = document.createRange();
	range.selectNodeContents(span);
	let sel = window.getSelection();
	sel.removeAllRanges();
	if (operation == "select")
		sel.addRange(range);
}

export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

export function handleDrop(id){
	let dropBox = document.getElementById(id)

	if (id === "finalParameter"){
		dropBox.value = dropBox.value + " {"
		setTimeout(()=> {
			dropBox.value = dropBox.value+ "}"
		},10)
	}
	else{
		setTimeout(()=> {
			dropBox.value = dropBox.value+"="
		},10)
	}
}