import React, { PropTypes } from "react";

import OakComponent from "./OakComponent";

class Card extends OakComponent {
  static propTypes = Object.assign({}, OakComponent.propTypes, {
    // card-specific props
    template: PropTypes.string
  });

  static defaultProps = Object.assign({}, OakComponent.defaultProps, {
    // card-specific props
  });

  static components = [];

  //////////////////////////////
  // Syntactic sugar
  //////////////////////////////

  get components() {
    return this.constructor.components;
  }

  //////////////////////////////
  // Rendering
  //////////////////////////////

  // Tack `Card` on the beginning of our css class name.
  renderClassName() {
    const className = super.renderClassName();
    return `Card ${className}`;
  }

}
export default Card;
