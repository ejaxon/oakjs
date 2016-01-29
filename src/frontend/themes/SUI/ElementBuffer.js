import React from "react";
import classNames from "classnames";

window.classNames = classNames;

import { flatten } from "./SUI";

class ElementBuffer {

  constructor({ type = "div", props = {}, elements = [] } = {}) {
    this.type = type;
    this.props = props;
    this.elements = elements;
  }

  get isEmpty() { return this.elements.length === 0 }
  get length() { return this.elements.length; }

  // Prepend one or more elements BEFORE the other elements.
  prepend(...elements) {
    this.elements = flatten(elements).concat(this.elements);
    return this;
  }

  // Append one or more elements to the end of this list.
  append(...elements) {
    this.elements = this.elements.concat(flatten(elements));
  }

  // Add one or more elements on either the `left` or the `right`
  addOn(side, ...elements) {
    if (side === "left")  this.prepend(elements);
    else                  this.append(elements);
  }

  // If you want to add an actual list, use this one!
  // NOTE: if you usse this, you have to make sure your elements have `key`s.
  // TODO: automatically add keys ???  can we do that???
  appendList(elements) {
    this.elements.push(elements)
  }

  get props() { return this._props }
  set props(props) {
    this._props = this.normalizeProps(props);
  }

  normalizeProps(props) {
    const output = {};
    for (let key in props) {
      // skip any undefiend properties
      if (props[key] === undefined) continue;

      const value = props[key];
      // normalize className with `classNames`
      if (key === "className") output[key] = classNames(value);
      else output[key] = value;
    }
    return output;
  }

  // Set className to a list of things
  // Used `classNames` semantics.
  get className() { return this._props.className || ""; }
  set className(...names) {
    this._props.className = classNames(names);
  }

  // Add a className using `classNames` semantics.
  addClass(...classes) {
    this._props.className = classNames(this._props.className, classes);
  }

  // Set a style property.  Adds a `style` property if necessary.
  setStyle(property, value) {
    if (!this._props.style) this._props.style = {};
    this._props.style[property] = value;
  }

  // Wrap the current set of elements in a container.
  // You can then keep using append() and prepend() as before.
  // NOTE: You can pass in a set of props for the wrapper,
  //       but this does not affect `this.props` in any way!
  wrap(type = this.type, props = {}) {
    this.elements = [ React.createElement(type, this.normalizeProps(props), ...this.elements) ];
  }

  // Render!
  render(type =  this.type, props) {
    // If we got `props`, assign them to `props` so we get className normalization.
    if (props) this.props = props;
    return React.createElement(type, this._props, ...this.elements);
  }

}

export default ElementBuffer;