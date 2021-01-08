import React from "react";

import "./Footer.css";
require('typeface-varela-round')

const Footer = () => {
  return (
    <div className="copyright">
      <p> © Eileen You, Maya Pandurangan, Yuhan Xiao</p>
      <p className="dot">•</p>
      <p className="classlabel"> SSUI Fall 2020</p>
    </div>
  );
};

export default Footer;