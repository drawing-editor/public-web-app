import React from "react";

export default ({
  id,
  cx,
  cy,
  rx,
  ry,
  fillColor,
  borderColor,
  borderWidth,
  filter
}) => {
  return (
    <ellipse
      id={id}
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill={`rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, \
        ${fillColor.a})`}
      stroke={`rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, \
        ${borderColor.a})`}
      strokeWidth={borderWidth}
      filter={filter}
    />
  );
};
