import { createContext } from "react";

// create a context with default values
const controlContext = createContext({
  currMode: "",
  changeCurrMode: () => {},
  currBorderColor: "",
  changeCurrBorderColor: () => {},
  currBorderWidth: 1,
  changeCurrBorderWidth: () => {},
  currFillColor: "",
  changeCurrFillColor: () => {},

  shapes: [],
  shapeMap: {},
  addShape: () => {},
  moveShape: () => {},
  selectedShapeId: "",
  selectShape: () => {},
  deleteSelectedShape: () => {},

  username: undefined,
  userId: undefined,
  signIn: () => {},
  signOut: () => {},

  sheets: [],
  selectedSheetId: "",
  addSheet: () => {},
  loadSheet: () => {},
  updateSheet: () => {},
  deleteSheet: () => {},

  handleDownload: () => {}  
});

export default controlContext;
