import React, { useEffect, useCallback, useContext, useState } from "react";
import Line from "./shapes/Line";
import Rect from "./shapes/Rect";
import Ellipse from "./shapes/Ellipse";
import Text from "./shapes/Text";
import Image from "./shapes/Image";

import ControlContext from "../../../contexts/control-context";
import { selectShadowId } from "../../../shared/util";

const SVGLayer = () => {
  const {
    currMode,
    currFillColor,
    currBorderColor,
    currBorderWidth,
    shapes,
    shapeMap,
    addShape,
    moveShape,
    selectedShapeId,
    selectShape,
    username
  } = useContext(ControlContext);

  // use useState to set elements in the React state directly
  // the first element of the list is the state value
  // the second element of the list is a function to update the state value in the future
  const [drawing, setDrawing] = useState(false);
  const [initPoint, setInitPoint] = useState({ x: undefined, y: undefined });
  const [currPoint, setCurrPoint] = useState({ x: undefined, y: undefined });

  const [dragging, setDragging] = useState(false);
  const [draggingShape, setDraggingShape] = useState(undefined);
  const [mouseDownPoint, setMouseDownPoint] = useState({
    x: undefined,
    y: undefined
  });

  const handleMouseDown = (e) => {
    if (currMode !== "select" && username) {
      // should create
      setDrawing(true);
      setInitPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      setCurrPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      e.preventDefault();
    } else if (e.target.nodeName === "svg" && username) {
      // should deselect
      selectShape(undefined);
    } else if (username) {
      // should select
      const targetId = e.target.id;
      selectShape(targetId);
      setDragging(true);
      setMouseDownPoint({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      });
      setDraggingShape(
        shapeMap[shapes.filter((shapeId) => shapeId === targetId)[0]]
      );
    }
  };

  const handleMouseMove = (e) => {
    if (drawing) {
      setCurrPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    } else if (dragging && draggingShape && mouseDownPoint) {
      const deltaX = e.nativeEvent.offsetX - mouseDownPoint.x;
      const deltaY = e.nativeEvent.offsetY - mouseDownPoint.y;
      moveShapeHelper(deltaX, deltaY, false);
    }
  };

  const handleMouseUp = (e) => {
    if (currMode === "line" || currMode === "ellipse" || currMode === "rect") {
      if (!(initPoint.x === currPoint.x && initPoint.y === currPoint.y)) {
        // check if it's too small
        const threshold = 10;
        let shouldCreate = true;
        const deltaX = Math.abs(initPoint.x - currPoint.x);
        const deltaY = Math.abs(initPoint.y - currPoint.y);
        if (currMode === "line") {
          if (Math.sqrt(deltaX ** 2 + deltaY ** 2) < threshold) {
            shouldCreate = false;
          }
        } else {
          if (deltaX < threshold || deltaY < threshold) {
            shouldCreate = false;
          }
        }

        if (shouldCreate) {
          // create
          addShape({
            type: currMode,
            initCoords: initPoint,
            finalCoords: currPoint,
            borderColor: currBorderColor,
            borderWidth: currBorderWidth,
            fillColor: currFillColor
          });
        }
      }

      setDrawing(false);
      setInitPoint({ x: undefined, y: undefined });
      setCurrPoint({ x: undefined, y: undefined });
    } else {
      // update coordinates to DB for moved shapes
      if (dragging && draggingShape && mouseDownPoint) {
        const deltaX = e.nativeEvent.offsetX - mouseDownPoint.x;
        const deltaY = e.nativeEvent.offsetY - mouseDownPoint.y;  
        moveShapeHelper(deltaX, deltaY, true);
      }
      setDragging(false);
      setDraggingShape(undefined);
      setMouseDownPoint({ x: undefined, y: undefined });
    }
  };

  const moveShapeHelper = useCallback((deltaX, deltaY, endOfMove) => {
      if (draggingShape.type === "text" || draggingShape.type === "image") {
        moveShape({
          initCoords: {
            x: draggingShape.initCoords.x + deltaX,
            y: draggingShape.initCoords.y + deltaY,
          }
        }, endOfMove);
      } else {
        moveShape({
          initCoords: {
            x: draggingShape.initCoords.x + deltaX,
            y: draggingShape.initCoords.y + deltaY,
          },
          finalCoords: {
            x: draggingShape.finalCoords.x + deltaX,
            y: draggingShape.finalCoords.y + deltaY,
          }
        }, endOfMove);
      }
    }, [draggingShape, moveShape]
  );

  // useCallback gives a memoized version of the callback that changes when one of its dependencies change
  // the first argument is the function that will be run
  // the second is the dependencies that the function relies on
  const escKeyDownHandler = useCallback(
    (e) => {
      if (e.key === "Escape") {
        // abort
        if (drawing) {
          setDrawing(false);
          setInitPoint({ x: undefined, y: undefined });
          setCurrPoint({ x: undefined, y: undefined });
        } else if (dragging && draggingShape) {
          moveShapeHelper(0, 0, false);
          setDragging(false);
          setDraggingShape(undefined);
          setMouseDownPoint({ x: undefined, y: undefined });
        }
      }
    },
    [drawing, dragging, draggingShape, moveShapeHelper]
  );

  // useEffect will run after the render is committed to the screen
  // the first argument is the function that will run
  // the second argument are the dependencies, meaning this will only run when there is a change in these values
  useEffect(() => {
    window.addEventListener("keydown", escKeyDownHandler, true);
    return () => window.removeEventListener("keydown", escKeyDownHandler, true);
  }, [escKeyDownHandler]);

  const genShape = (shapeData, key = undefined) => {
    const {
      id,
      initCoords,
      finalCoords,
      fillColor,
      borderColor,
      borderWidth,
      // for texts
      textContent,
      // for images
      width,
      height,
      src
    } = shapeData;
    const filter =
      selectedShapeId && selectedShapeId === id
        ? `url(#${selectShadowId})`
        : null;
    switch (shapeData.type) {
      case "line": {
        return React.createElement(Line, {
          x1: initCoords.x,
          y1: initCoords.y,
          x2: finalCoords.x,
          y2: finalCoords.y,
          borderColor,
          borderWidth,
          id,
          key,
          filter,
        });
      }
      case "rect": {
        return React.createElement(Rect, {
          x: Math.min(initCoords.x, finalCoords.x),
          y: Math.min(initCoords.y, finalCoords.y),
          width: Math.abs(finalCoords.x - initCoords.x),
          height: Math.abs(finalCoords.y - initCoords.y),
          fillColor,
          borderColor,
          borderWidth,
          id,
          key,
          filter,
        });
      }
      case "ellipse": {
        let x = Math.min(finalCoords.x, initCoords.x);
        let y = Math.min(finalCoords.y, initCoords.y);
        let w = Math.abs(finalCoords.x - initCoords.x);
        let h = Math.abs(finalCoords.y - initCoords.y);

        return React.createElement(Ellipse, {
          cx: x + w / 2,
          cy: y + h / 2,
          rx: w / 2,
          ry: h / 2,
          fillColor,
          borderColor,
          borderWidth,
          id,
          key,
          filter
        });
      }
      case "text": {
        return React.createElement(Text, {
          x: initCoords.x,
          y: initCoords.y,
          fillColor,
          borderColor,
          textContent,
          id,
          key,
          filter
        });
      }
      case "image": {
        return React.createElement(Image, {
          x: initCoords.x,
          y: initCoords.y,
          width,
          height,
          src,
          id,
          key,
          filter
        });
      }
      default: {
        return null;
      }
    }
  };

  const renderShape = (shapeData, key) => {
    return genShape(shapeData, key);
  };

  const renderTempShape = () => {
    if (
      initPoint.x !== undefined &&
      initPoint.y !== undefined &&
      currPoint.x !== undefined &&
      currPoint.y !== undefined
    ) {
      return genShape({
        type: currMode,
        initCoords: initPoint,
        finalCoords: currPoint,
        fillColor: currFillColor,
        borderColor: currBorderColor,
        borderWidth: currBorderWidth
      });
    }
  };

  return (
    <svg
      id="workspace-svg"
      width="800"
      height="700"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <filter
        id={selectShadowId}
        x="-100%"
        y="-100%"
        width="400%"
        height="400%"
      >
        <feDropShadow
          dx="0"
          dy="0"
          stdDeviation="15"
          floodColor="rgba(0, 0, 0, 0.7)"
        />
      </filter>
      {shapes.map((shapeId, idx) => {
        return renderShape(shapeMap[shapeId], idx);
      })}
      {drawing && renderTempShape()}
    </svg>
  );
};

export default SVGLayer;
