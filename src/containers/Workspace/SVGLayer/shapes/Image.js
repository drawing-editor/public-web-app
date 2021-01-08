import React from "react";

export default ({
  id,
  x,
  y,
  width,
  height,
  src,
  filter
}) => {
  return (
    <image
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      // to support downloading images, use xLinkHref instead of href
      // even though it is not recommended: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/xlink:href
      xlinkHref={src}
      filter={filter}
    />
  );
};