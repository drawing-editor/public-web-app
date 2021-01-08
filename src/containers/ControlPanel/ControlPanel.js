import React, { useContext } from "react";
import { SketchPicker } from "react-color";
import AddImageDialog from "./AddImageDialog/AddImageDialog";
import CreateTextDialog from "./CreateTextDialog/CreateTextDialog";

import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { HiCursorClick } from "react-icons/hi";
import GestureIcon from "@material-ui/icons/Gesture";
import { BsSquare, BsSquareFill, BsCircle, BsCircleFill } from "react-icons/bs";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import FormatColorFillIcon from "@material-ui/icons/FormatColorFill";
import LineWeightIcon from "@material-ui/icons/LineWeight";
import Grow from "@material-ui/core/Grow";
import Slider from "@material-ui/core/Slider";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";

import ControlContext from "../../contexts/control-context";

import "./ControlPanel.css";

const Modes = ({
  currMode,
  changeCurrMode,
  currFillColor,
  currBorderColor,
  disabled
}) => {
  return (
    <div className="Control">
      <div className={disabled ? "Modes Disabled" : "Modes"}>
        <div
          className={["Mode", currMode === "select" ? "Active" : null].join(
            " "
          )}
          onClick={() => changeCurrMode("select")}
          id="cursor"
        >
          <HiCursorClick size={24} />
        </div>
        <div
          className={["Mode", currMode === "line" ? "Active" : null].join(" ")}
          onClick={() => changeCurrMode("line")}
        >
          <GestureIcon />
        </div>
        <div
          className={["Mode", currMode === "rect" ? "Active" : null].join(" ")}
          onClick={() => changeCurrMode("rect")}
        >
          <BsSquare className="Outline" size={28}
            fill={`rgba(${currBorderColor.r}, ${currBorderColor.g},\
              ${currBorderColor.b}, ${currBorderColor.a})`}
          ></BsSquare>
          <BsSquareFill className="Fill" size={24}
            fill={`rgba(${currFillColor.r}, ${currFillColor.g},\
              ${currFillColor.b}, ${currFillColor.a})`}
          />
        </div>
        <div
          className={["Mode", currMode === "ellipse" ? "Active" : null].join(
            " "
          )}
          onClick={() => changeCurrMode("ellipse")}
        >
          <BsCircle className="Outline" size={30}
            fill={`rgba(${currBorderColor.r}, ${currBorderColor.g},\
              ${currBorderColor.b}, ${currBorderColor.a})`}
          ></BsCircle>
          <BsCircleFill className="Fill" size={26}
            fill={`rgba(${currFillColor.r}, ${currFillColor.g},\
              ${currFillColor.b}, ${currFillColor.a})`}
          />
        </div>
        {/* control button to add images to canvas */}
        <div
          className={["Mode", currMode === "image" ? "Active" : null].join(" ")}
          onClick={() => changeCurrMode("image")}
        >
          <AddImageDialog />
        </div>
        {/* control button to add texts to canvas */}
        <div
          className={["Mode", currMode === "text" ? "Active" : null].join(" ")}
          onClick={() => changeCurrMode("text")}
        >
          <CreateTextDialog />
        </div>
      </div>
    </div>
  );
};

class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false
    };
  }

  handleClick = () => {
    this.setState({
      displayColorPicker: !this.props.disabled && !this.state.displayColorPicker
    });
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  handleChange = (color) => {
    // when disallowTransparentColor is true, currColor cannot be set to transparent
    if (!(color.rgb.a === 0 && this.props.disallowTransparentColor)) {
      this.props.setCurrColor(color.rgb);
    }
  };

  getBackgroundColor = () => {
    return `rgba(${this.props.currColor.r}, ${this.props.currColor.g},\
      ${this.props.currColor.b}, ${this.props.currColor.a})`;
  }

  render() {
    const popover = {
      position: "absolute",
      zIndex: "2",
    };
    const cover = {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    };
    return (
        <div className={this.props.disabled ? "Controls Disabled" : "Controls"}>
        <div className="colorPicker ButtonIcon" onClick={this.handleClick}>
          {this.props.title}
          <div
            className="swatch"
            style={{ backgroundColor: this.getBackgroundColor() }} />
        </div>
        { 
          this.state.displayColorPicker 
          ? <div style={popover}>
            <div style={cover} onClick={this.handleClose}/>
              <SketchPicker
                color={this.props.currColor}
                onChange={this.handleChange}
                />
            </div> 
          : null 
        }
      </div>
    )
  };
};

const BorderColor = ({
  currMode,
  currBorderColor,
  changeCurrBorderColor,
  currFillColor,
  disabled
}) => {
  return (
    <ColorPicker
      title= {<BorderColorIcon size={30}/>}
      currColor={currBorderColor}
      setCurrColor={changeCurrBorderColor}
      // line and text stroke cannot be transparent; border and fill cannot
      // be transparent at the same time
      disallowTransparentColor={
        currMode === "line" || currMode === "text" ||
        (currFillColor && currFillColor.a === 0)}
      disabled={disabled}
    />
  );
};

const FillColor = ({
  currFillColor, changeCurrFillColor, currBorderColor, disabled
}) => {
  return (
    <ColorPicker
      title={<FormatColorFillIcon size={30}/>}
      currColor={currFillColor}
      setCurrColor={changeCurrFillColor}
      disallowTransparentColor={currBorderColor && currBorderColor.a === 0}
      disabled={disabled}
    />
  );
};


const BorderWidth = ({ currBorderWidth, changeCurrBorderWidth, disabled }) => {
  const [clicked, setClicked] = React.useState(false);

  const handleClick = () => { setClicked((prev) => (!prev)); };

  const handleSliderChange = (_, newValue) => {
    changeCurrBorderWidth(newValue);
  };

  const handleInputChange = (event) => {
    changeCurrBorderWidth(parseInt(event.target.value));
  };

  return (
    <div className={disabled ? "Controls Disabled": "Controls"}>
      <div id="border-width">
        <LineWeightIcon className="ButtonIcon" onClick={handleClick} />
          <Grow in={clicked}>
            <div id="slider">
              <Slider
                className="bar"
                value={currBorderWidth}
                min={1}
                max={30}
                onChange={handleSliderChange}
                aria-labelledby="input-slider"
              />
                <Input
                  className="input"
                  margin="dense"
                  value={currBorderWidth}
                  onChange={handleInputChange}
                  inputProps={{
                    step: 1,
                    min: 1,
                    max: 30,
                    type: "number",
                    "aria-labelledby": "input-slider",
                  }}
                />
            </div>
        </Grow>
      </div>
    </div>
  );
};

const Delete = ({ selectedShapeId, deleteSelectedShape, disabled }) => {
  return (
    <div className="Control">
      <div className="DeleteButtonsContainer">
      <IconButton
        className="ButtonIcon"
        aria-label="delete"
        onClick={() => deleteSelectedShape()}
        disabled={disabled || !selectedShapeId}
        style={{
          cursor: !selectedShapeId ? "not-allowed" : null,
        }}
      >
        <DeleteIcon/>
      </IconButton>
      </div>
    </div>
  );
};

const Actions = ({ handleDownload, username, signIn, signOut }) => {
  return (
    <>
    {
      username
      ? <div className="items">
          <Button variant="outlined" color="primary" onClick={handleDownload}>Download</Button>
          <Button variant="outlined" color="secondary" onClick={signOut}>Sign Out</Button>
        </div>
      : <div className="items">
          <Button variant="outlined" color="primary" disabled>Download</Button>
          <Button variant="outlined" color="default" onClick={signIn}>Sign In</Button>
        </div>
    }
    </>
  )
}

const ControlPanel = () => {
  // use useContext to access the functions & values from the provider
  const {
    currMode,
    changeCurrMode,
    currBorderColor,
    changeCurrBorderColor,
    currFillColor,
    changeCurrFillColor,
    currBorderWidth,
    changeCurrBorderWidth,
    selectedShapeId,
    deleteSelectedShape,
    username,
    selectedSheetId,
    signIn,
    signOut,
    handleDownload
  } = useContext(ControlContext);

  // disable all controls when user is not signed in or when no sheet is selected
  const disabled = !username || !selectedSheetId;

  return (
    <div className="ControlPanel">
      <div id="topbar">
        <Actions {...{ handleDownload, username, signIn, signOut }} />
      </div>
      <div id="sidebar">
        <Modes
          {...{ currMode, changeCurrMode, currFillColor, currBorderColor, 
            currBorderWidth, disabled }}
        />
        <BorderColor
          {...{ currMode, currBorderColor, changeCurrBorderColor, disabled }}
        />
        <FillColor
          {...{ currFillColor, changeCurrFillColor, currBorderColor, disabled }}
        />
        <BorderWidth
          {...{ currBorderWidth, changeCurrBorderWidth, disabled }}
        />
        <Delete
          {...{ selectedShapeId, deleteSelectedShape, disabled }}
        />
      </div>
    </div>
  );
};

export default ControlPanel;
