import React, { Component } from "react";
import ControlPanel from "./containers/ControlPanel/ControlPanel";
import Workspace from "./containers/Workspace/Workspace";
import DrawingFolder from "./containers/DrawingFolder/DrawingFolder";
import Nav from "./containers/Nav/Nav";
import Footer from "./containers/Footer/Footer";

import ControlContext from "./contexts/control-context";
import { defaultValues } from "./shared/util";

import * as FirestoreService from "./firestore/index";

import { saveSvgAsPng } from "save-svg-as-png";

import "./App.css";

class App extends Component {

  state = {
    // controls
    currMode: defaultValues.mode,
    currFillColor: defaultValues.fillColor,
    currBorderColor: defaultValues.borderColor,
    currBorderWidth: defaultValues.borderWidth,

    // workspace
    shapes: [],
    shapeMap: {},
    selectedShapeId: undefined,

    // user info
    username: undefined,
    userId: undefined,

    // sheet info
    sheets: [],
    selectedSheetId: undefined
  };

  constructor() {
    super();
    this.unsubscribeAuthListener = () => {};
    this.unsubscribeAuthListener.bind(this);
  }

  componentDidMount = () => {
    this.unsubscribeAuthListener = FirestoreService.onAuthStateChange((user) => {
      if (user) { // user signed in
        FirestoreService.loadAllSheets(user.uid)
        .then((querySnapshot) => {
          let sheets = [];
          querySnapshot.forEach((doc) => {
            sheets.push({ ...doc.data(), "id": doc.id })
          })
          this.setState({
            username : user.displayName,
            userId : user.uid,
            sheets,
            // set selectedSheetId is repeated in loadSheet, but without it here
            // <Tabs> will complain
            selectedSheetId: (sheets.length > 0) ? sheets[0].id : undefined
          });
        })
        .then(() => {
          // if user has drawings, auto load the first sheet
          if (this.state.sheets.length > 0) {
            this.loadSheet(this.state.sheets[0].id);
          }
        })
        .catch((e) => console.error(e));
      } else { // user signed out
        this.setState({
          shapes: [],
          shapeMap: {},
          selectedShapeId: undefined,
          username: undefined,
          userId: undefined,
          sheets: [],
          selectedSheetId: undefined
        });
      }
    });
  }

  componentWillUnmount = () => {
    this.unsubscribeAuthListener();
  }

  // select a shape and change current shape property states to match
  // the selected shape
  selectShape = (id) => {
    let shapes = [...this.state.shapes];
    let shapeMap = {...this.state.shapeMap};
    this.setState({ selectedShapeId: id });
    if (id) {
      const { type, borderColor, borderWidth, fillColor } = shapeMap[
        shapes.filter((shapeId) => shapeId === id)[0]
      ];
      if (type === "text") {
        this.setState({
          currFillColor: fillColor,
          currBorderColor: borderColor
        });
      } else if (type === "line") {
        this.setState({
          currBorderColor: borderColor,
          currBorderWidth: borderWidth
        });
      } else if (type === "image") {
        // no need to set any state
      } else { // ellipse, rectangle
        this.setState({
          currFillColor: fillColor,
          currBorderColor: borderColor,
          currBorderWidth: borderWidth
        });
      }
    }
  };

  // add the shapeId to the array, and the shape itself to the map
  // also store shapes to db
  addShape = (shapeData) => {
    FirestoreService.addShape(
      this.state.userId, 
      this.state.selectedSheetId,
      shapeData
    )
    .then((docRef) => {
      let shapes = [...this.state.shapes];
      let shapeMap = { ...this.state.shapeMap };
      const id = docRef.id;
      shapeMap[id] = {
        ...shapeData,
        id,
      };
      shapes.push(id);
      this.setState({ shapes, shapeMap, selectedShapeId: id });
    })
    .catch((e) => console.error(e));
  };

  updateShape = (shapeId, newData) => {
    // update shape properties in db
    FirestoreService.updateShape(
      this.state.userId,
      this.state.selectedSheetId,
      shapeId,
      newData
    )
    .then(() => {
      // update shape properties locally
      let shapeMap = { ...this.state.shapeMap };
      let targetShape = shapeMap[shapeId];
      shapeMap[shapeId] = { ...targetShape, ...newData };
      this.setState({ shapeMap });
    })
    .catch((e) => console.error(e));
  };

  moveShape = (newData, endOfMove=false) => {
    let shapeId = this.state.selectedShapeId;
    if (shapeId) {
      if (endOfMove) {
        // at the end of the move, update shape position in db
        this.updateShape(
          shapeId,
          newData
        );
      } else {
        // otherwise, just update in local state
        let shapeMap = { ...this.state.shapeMap };
        let targetShape = shapeMap[shapeId];
        shapeMap[shapeId] = { ...targetShape, ...newData };
        this.setState({ shapeMap });
      }
    }
  };

  // deleting a shape sets its visibility to false, rather than removing it
  deleteSelectedShape = () => {
    let selectedShapeId = this.state.selectedShapeId;
    if (selectedShapeId) {
      FirestoreService.deleteShape(
        this.state.userId,
        this.state.selectedSheetId,
        selectedShapeId
      )
      .then(() => {
        let shapeMap = { ...this.state.shapeMap };
        let shapes = [...this.state.shapes];
        // filter out current selected shape in shapeMap 
        shapeMap = Object.fromEntries(Object.entries(shapeMap)
          .filter(([shapeId, _]) => shapeId !== selectedShapeId));
        shapes = shapes.filter((shapeId) => shapeId !== selectedShapeId);
        this.setState({
          shapeMap,
          shapes,
          selectedShapeId: this.getNextSelectedShapeId(shapeMap)
        });
      })
      .catch((e) => console.error(e) );
    }
  };

  // helper function for deleteSelectedShape; get next visible shape's id 
  // if exists
  getNextSelectedShapeId = (shapeMap) => {
    let visibleShapes = Object.fromEntries(Object.entries(shapeMap)
      .filter(([_, shapeData]) => shapeData.visible));
    let visibleShapeKeys = Object.keys(visibleShapes);
    // select the lastly added item in the shapeMap
    return (visibleShapes.size === 0) ? null 
      : visibleShapeKeys[visibleShapeKeys.length - 1];
  };

  changeCurrMode = (mode) => {
    this.setState({ currMode: mode });
  };

  changeCurrFillColor = (fillColor) => {
    this.setState({ currFillColor: fillColor });
    if (this.state.selectedShapeId) {
      this.updateShape(
        this.state.selectedShapeId,
        { fillColor }
      );
    }
  };

  changeCurrBorderColor = (borderColor) => {
    this.setState({ currBorderColor: borderColor });
    if (this.state.selectedShapeId) {
      this.updateShape(
        this.state.selectedShapeId,
        { borderColor }
      );
    }
  };

  changeCurrBorderWidth = (borderWidth) => {
    this.setState({ currBorderWidth: borderWidth });
    if (this.state.selectedShapeId) {
      this.updateShape(
        this.state.selectedShapeId,
        { borderWidth }
      );
    }
  };

  changeCurrMode = (mode) => {
    if (mode === "line" ) {
      this.setState({
        currMode: mode,
      });
    } else {
      this.setState({ currMode: mode });
    }
  };

  signIn = () => {
    FirestoreService.signIn();
  };

  signOut = () => {
    FirestoreService.signOut();
  };

  addSheet = () => {
    let userId = this.state.userId;
    let sheetData = {"title": "default title"};
    FirestoreService.addSheet(userId, sheetData)
    .then((doc) => {
      let sheets = [...this.state.sheets];
      sheets.push({ ...sheetData, "id": doc.id })
      this.setState({
        sheets,
        selectedSheetId: doc.id
      });
    })
    .catch((e) => console.error(e) );
  };

  loadSheet = (sheetId) => {
    FirestoreService.loadSheet(this.state.userId, sheetId)
    .then((querySnapshot) => {
      // remove all shapes on canvas, and select drawing
      this.setState({
        shapes: [],
        shapeMap: {},
        selectedShapeId: undefined,
        selectedSheetId: sheetId
      });
      querySnapshot.forEach((doc) => {
        // add one shape data from db to local state
        this.loadShape(doc.id, doc.data());
      })
    })
    .catch((e) => console.error(e));
  };

  loadShape = (id, shapeData) => {
    let shapes = [...this.state.shapes];
    let shapeMap = { ...this.state.shapeMap };
    shapeMap[id] = {
      ...shapeData,
      id,
    };
    shapes.push(id);
    this.setState({ shapes, shapeMap, selectedShapeId: id });
  };

  updateSheet = (sheetData) => {
    let selectedSheetId = this.state.selectedSheetId;
    if (selectedSheetId) {
      FirestoreService.updateSheet(
        this.state.userId,
        selectedSheetId,
        sheetData
      )
      .then(() => {
        // update selected sheet locally
        let sheets = [...this.state.sheets];
        let selectedIdx = sheets
          .findIndex((sheet) => sheet.id === selectedSheetId);
        sheets[selectedIdx] = {...sheets[selectedIdx], ...sheetData};
        this.setState({ sheets });
      })
      .catch((e) => console.error(e));
    }
  };

  // delete the selected sheet
  deleteSheet = () => {
    let selectedSheetId = this.state.selectedSheetId;
    if (selectedSheetId) {
      FirestoreService.deleteSheet(this.state.userId, selectedSheetId)
      .then(() => {
        let sheets = [...this.state.sheets];
        sheets = sheets
          .filter((sheet) => sheet.id !== selectedSheetId);
        if (sheets.length > 0) {
          // load the next sheet
          let nextSheetId = sheets[sheets.length - 1].id;
          this.setState({
            sheets,
            // set selectedSheetId is repeated in loadSheet, but without it here
            // <Tabs> will complain
            selectedSheetId: nextSheetId
          })
          this.loadSheet(nextSheetId);
        } else {
          // clear canvas, clear folder, unselect any selected shape/sheet
          this.setState({
            shapes: [],
            shapeMap: {},
            selectedShapeId: undefined,
            sheets,
            selectedSheetId: undefined
          });
        }
      })
      .catch((e) => console.error(e));
    }
  };

  handleDownload = () => {
    saveSvgAsPng(document.getElementById("workspace-svg"),
      this.state.sheets.filter(sheet => sheet.id === this.state.selectedSheetId)[0].title);
  };

  render() {
    const {
      currMode,
      currFillColor,
      currBorderColor,
      currBorderWidth,
      shapes,
      shapeMap,
      selectedShapeId,
      username,
      userId,
      sheets,
      selectedSheetId,
    } = this.state;

    // update the context with the functions and values defined above and from state
    // and pass it to the structure below it (control panel and workspace)
    return (
      <React.Fragment>
        <ControlContext.Provider
          value={{
            currMode,
            changeCurrMode: this.changeCurrMode,
            currFillColor,
            changeCurrFillColor: this.changeCurrFillColor,
            currBorderColor,
            changeCurrBorderColor: this.changeCurrBorderColor,
            currBorderWidth,
            changeCurrBorderWidth: this.changeCurrBorderWidth,

            shapes,
            shapeMap,
            addShape: this.addShape,
            moveShape: this.moveShape,
            selectedShapeId,
            selectShape: this.selectShape,
            deleteSelectedShape: this.deleteSelectedShape,

            username,
            userId,
            signIn: this.signIn,
            signOut: this.signOut,

            sheets,
            selectedSheetId,
            addSheet: this.addSheet,
            loadSheet: this.loadSheet,
            updateSheet: this.updateSheet,
            deleteSheet: this.deleteSheet,

            handleDownload: this.handleDownload
          }}
        >
          <ControlPanel />
          <Workspace />
          <DrawingFolder />
        </ControlContext.Provider>
        <Nav />
        <Footer />
      </React.Fragment>
    );
  }
}

export default App;