import React, { useEffect, useState, useContext } from "react";
import Iframe from "react-iframe";
import "./Utils/css/HomePage.css";
import config from '../config.json'

const APIEndpoint = `${config.ssl === true ? "https" : "http"}://${config.host}${config.port === "" ? "" : ":"+config.port}`  
const hideElement = {
  display: "none",
};


function shiftTitle(homeButtonClicked, setHomeButtonClicked) {
  if (homeButtonClicked === false) setHomeButtonClicked(true);
  else setHomeButtonClicked(false);
}
function showLinks(id) {
  var element = document.getElementById(id);
  element.childNodes[2].className = "linkVisible";
}
function hideLinks(id) {
  var element = document.getElementById(id);
  element.childNodes[2].className = "link";
}
function loadNode(
  slug,
  setNodeButtonClicked,
  currentNode,
  setCurrentNode,
  setIframeLink
) {
  var element;
  var elementID;
  if (currentNode !== "") {
    elementID = currentNode.split("/");
    element = document.getElementById(
      elementID.length === 1 ? elementID[0] : elementID[1]
    );
    element.className = "nodeDiv";
  }
  elementID = slug.split("/");
  element = document.getElementById(
    elementID.length === 1 ? elementID[0] : elementID[1]
  );
  element.className = "selectedLink";
  setNodeButtonClicked(true);
  setCurrentNode(slug);
  setIframeLink(`/${slug}`);
}

function HomePage() {
  const [nodeList, setNodeList] = useState([
    {
      title: "Loading",
      slug: "Loading",
    },
  ]);
  const [homeButtonClicked, setHomeButtonClicked] = useState(false);
  const [nodeButtonClicked, setNodeButtonClicked] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentNode, setCurrentNode] = useState("");
  const [iframeLink, setIframeLink] = useState("/create");
  const initiateAPIConnection = () => {
    const token = localStorage.getItem('token');
    const endpoint = `${APIEndpoint}/list-node/`;
    let lookupOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    fetch(endpoint, lookupOptions)
      .then(function(response) {
        return response.json();
      })
      .then(function(responseData) {
          setNodeList(responseData);
      })
      .catch(function(error) {
        console.log("error", error);
      });
  };
  useEffect(() => {
    initiateAPIConnection()
    let targetNode = document.querySelector("iframe");
    let observer = new MutationObserver(function(mutationsList, observer) {
      for (let mutation of mutationsList) {
        if (mutation.type === "attributes") {
            initiateAPIConnection()
        }
      }
    });
    let config = { attributes: true, childList: true, subtree: true };

    // pass in the target node and observer options
    observer.observe(targetNode, config);
  }, []);
  return (
    <React.Fragment>
      <div
        className={
          homeButtonClicked === false
            ? "container containerDivision"
            : nodeButtonClicked === false
            ? "container containerDivisionC1Clicked"
            : "container containerDivisionNodeClicked"
        }
      >
        <div className="column1" /*Each Column Configs*/>
          <div className="startButtonStyle" style={{ width: "80%" }}>
            <a
              href="##"
              onClick={(e) =>
                shiftTitle(homeButtonClicked, setHomeButtonClicked)
              }
            >
              {" "}
              <h2>
                PhyloStreamer
                <br />
              </h2>
              <h5>Click here to begin</h5>
            </a>
          </div>
        </div>
        <div
          className="column2"
          style={
            homeButtonClicked === false ? hideElement : null
          } /*Each Column Configs*/
        >
          <h2> All Nodes </h2>
          <div id="create" className="nodeDiv" style={{ width: "80%" }}>
            <a
              href="##"
              key="createNode"
              onClick={(e) =>
                loadNode(
                  "create",
                  setNodeButtonClicked,
                  currentNode,
                  setCurrentNode,
                  setIframeLink
                )
              }
            >
              Create a new node
            </a>
          </div>
          <div id="componentView" style={{ width: "80%" }}>
            {nodeList.map((eachNode) => (
              <div
                key={eachNode.slug}
                id={eachNode.slug}
                className="nodeDiv"
                onMouseEnter={(e) => showLinks(eachNode.slug)}
                onMouseLeave={(e) => hideLinks(eachNode.slug)}
              >
                <a
                  href="##"
                  onClick={(e) =>
                    loadNode(
                      `node/${eachNode.slug}`,
                      setNodeButtonClicked,
                      currentNode,
                      setCurrentNode,
                      setIframeLink
                    )
                  }
                >
                  {eachNode.title}
                </a>{" "}
                <span className="link">
                  (
                  <a
                    href="##"
                    onClick={(e) =>
                      loadNode(
                        `update/${eachNode.slug}`,
                        setNodeButtonClicked,
                        currentNode,
                        setCurrentNode,
                        setIframeLink
                      )
                    }
                  >
                    Update Node
                  </a>
                  )
                </span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="column3"
          style={nodeButtonClicked === false ? hideElement : null}
        >
          <Iframe
            height="100%"
            width="95%"
            style={{ padding: "1em;" }}
            frameBorder="0"
            url={iframeLink}
          />
        </div>
      </div>
    </React.Fragment>
  );
}

export default HomePage;
