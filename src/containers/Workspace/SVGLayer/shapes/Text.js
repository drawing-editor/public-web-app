import React from "react";

export default ({
  id,
  x,
  y,
  textContent,
  fillColor,
  borderColor,
  filter
}) => {
  return (
    <text
      id={id}
      x={x}
      y={y}
      fill={`rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, \
        ${fillColor.a})`}
      stroke={`rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, \
        ${borderColor.a})`}
      style={{fontSize: "2em", fontWeight: "bolder"}}
      filter={filter}
    >
      {textContent}
    </text>
  );
};