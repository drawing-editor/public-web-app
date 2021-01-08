import React from "react";

export default ({
  id,
  x,
  y,
  width,
  height,
  fillColor,
  borderColor,
  borderWidth,
  filter
}) => {
  return (
    <rect
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      fill={`rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, \
        ${fillColor.a})`}
      stroke={`rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, \
        ${borderColor.a})`}
      strokeWidth={borderWidth}
      filter={filter}
    />
  );
};
