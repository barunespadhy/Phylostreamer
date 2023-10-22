import React, { useState } from 'react';
import GlobalContext from './GlobalContext';
import config from "./config.json"

const GlobalContextProvider = ({ children }) => {
  const [componentSet, setComponentSet] = useState([])
  const [selectedComponent, setSelectedComponent] = useState("upload");
  const [swapMap, setSwapMap] = useState({});
  const [swapContents, setSwapContents] = useState({});
  const [setRootUrl, rootUrl] = useState(`${config.ssl ? "https":"http"}://${config.host}${config.port ? ":"+config.port:""}`)

  return (
    <GlobalContext.Provider value={{ componentSet, 
                                     setComponentSet, 
                                     selectedComponent, 
                                     setSelectedComponent, 
                                     swapMap,
                                     setSwapMap, 
                                     swapContents, 
                                     setSwapContents,
                                     rootUrl
                                   }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;