import React, { useEffect, useState, useContext } from "react";
import Iframe from "react-iframe";
import "./Utils/css/HomePage.css";
import Modal from 'react-modal';
Modal.setAppElement('#root')
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
    const endpoint = `https://phylostreamer.herokuapp.com/list-node/`;
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
        if (responseData.code === "token_not_valid")
          setModalIsOpen(true);
        else
          setNodeList(responseData);
      })
      .catch(function(error) {
        console.log("error", error);
      });
  };
  const authenticate = () => {
      const authData = {
        username: document.getElementById("email").value,
        password: document.getElementById("password").value
      }
      
      fetch('https://phylostreamer.herokuapp.com/auth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authData)
      })
      .then(response => response.json())
      .then(data => {
        // Store the token in local storage
        setModalIsOpen(false)
        localStorage.setItem('token', data.access);
        initiateAPIConnection()
        // You can then use this token for future API requests
      })
      .catch((error) => {
        setModalIsOpen(true)
        console.error('Error:', error);
      });
  }
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      initiateAPIConnection()
    } else {
      setModalIsOpen(true);
    }
    let targetNode = document.querySelector("iframe");
    let observer = new MutationObserver(function(mutationsList, observer) {
      for (let mutation of mutationsList) {
        if (mutation.type === "attributes") {
          if (token)
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
    <Modal isOpen={modalIsOpen}>
        <h2>Login</h2>
          <input id="email" type="text" placeholder="Email" />
          <input id="password" type="password" placeholder="Password" />
          <button onClick={() => authenticate()}>Authenticate</button>
      </Modal>
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
