import React from 'react';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';

import ControlContext from "../../../../contexts/control-context";

export default function ImgMediaCard(props) {
  const { description, src } = props;

  const {
    addShape
  } = React.useContext(ControlContext);

  // make sure both width and height are small enough, 
  // so as to fit on canvas
  const rescaleToFit = (width, height) => {
    let MAX_WIDTH = 400;
    let MAX_HEIGHT = 400;
    if (width > MAX_WIDTH) { 
      let ratio = MAX_WIDTH / width;
      width = MAX_WIDTH;
      height *= ratio;
    }
    if (height > MAX_HEIGHT) {
      let ratio = MAX_HEIGHT / width;
      height = MAX_HEIGHT;
      width *= ratio;
    }
    return { width, height }
  }

  const handleAddImage = () => {
    let { width, height } = rescaleToFit(props.width, props.height)
    addShape({
      type: "image",
      initCoords: { x: 40, y: 40 },
      ...props,
      width,
      height
    });
  }

  return (
    // remove material UI card box shadow and border radius
    <Card className="ImageCard" elevation={0} style={{ borderRadius: 0 }}>
      <CardMedia
        component="img"
        alt={description}
        image={src}
        title={description}
        onClick={handleAddImage}
        className="ImageCardImage"
      />
    </Card>
  );
}
