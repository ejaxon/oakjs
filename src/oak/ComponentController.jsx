//////////////////////////////
//
//  ComponentController class
//
//  Base class for ProjectController, StackController, CardController, ProjectController.
//
//////////////////////////////

import React from "react";

import Loadable from "oak-roots/Loadable";
import Mutable from "oak-roots/Mutable";
import Savable from "oak-roots/Savable";

import { browser, objectUtil } from "oak-roots";

import JSXElement from "./JSXElement";
import Stub from "./components/Stub";



export default class ComponentController extends Savable(Loadable(Mutable)) {

  //////////////////////////////
  //  Creation / destruction
  //////////////////////////////

  constructor(props) {
    super(props);
  }

  destroy() {
    if (this.styles) browser.removeStylesheet(this.stylesheetId);
  }


  //////////////////////////////
  //  Identify syntactic sugar
  //////////////////////////////

  // Note: you SHOULD override this with the `type` of your component, eg: "card" or "stack"
  static type = "component";
  get type() { return this.constructor.type }

  // Note: you MUST override this with your component constructor.
  static baseComponentConstructor = React.Component;

  get id() { throw "You must override `get id()`" }
  get path() { throw "You must override `get path()`" }

  get selector() { throw "You must override `get selector()`" }
  get rootSelector() { return (this.parent ? this.parent.rootSelector : "") + this.selector }


  // Die if your component is not fully identified.
  // See `CardComponent` for an example.
  dieIfNotIdentified(errorMessage) {}


  //////////////////////////////
  //  Mutation
  //////////////////////////////

  // Notify observers if certain things have changed.
  onChanged(changes, old) {
    super.onChanged(changes, old);
    const { childIndex, component, styles, script } = changes;
    if (childIndex) this.onChildIndexChanged(childIndex, old.childIndex);
    if (component || script) this.onComponentChanged(component, old.component);
    if (styles) this.onStylesChanged(styles, old.styles);
  }

  //////////////////////////////
  //  Child index
  //////////////////////////////

  onChildIndexChanged(newChildIndex, oldChildIndex) {
    if (oldChildIndex) this.dirty();
    console.info("TODO: Instantiate childIndex ", newChildIndex);
    this.trigger("childIndexChanged", newChildIndex);
  }

  //////////////////////////////
  //  Component (from JSXE)
  //////////////////////////////

  onComponentChanged(newComponent, oldComponent) {
    if (oldComponent) this.dirty();
    console.info("TODO: Instantiate component ", newComponent);
    this.trigger("componentChanged", newComponent);
  }


  //////////////////////////////
  //  Stylesheet
  //////////////////////////////

  get stylesheetId() { return "STYLE-" + this.id }
  onStylesChanged(newStyles, oldStyles) {
    if (oldStyles) this.dirty();
    console.info(`Updating ${this.type} styles`);
    console.warn("TODO: use less to convert to scoped styles");
    if (newStyles) {
      browser.createStylesheet(newStyles || "", this.stylesheetId)
    }
    else {
      browser.removeStylesheet(this.stylesheetId)
    }
    this.trigger("stylesChanged", newStyles);
  }



  //////////////////////////////
  //  Creating the class based on our loaded data
  //////////////////////////////
  get ComponentConstructor() {
    if (!this.component) return Stub;
    if (!this.cache.Constructor) {
      console.info("Creating Constructor");
      console.warn("TODO: use babel to allow us to use ES2015 scripts");
      const BaseComponent = this.constructobaseComponentConstructor;
      const Constructor = class ComponentConstructor extends BaseComponent {};
      console.info(Constructor.prototype.render);
      Constructor.prototype.render = this.component.getRenderMethod();
      console.log(Constructor.prototype.render);
      this.cache.Constructor = Constructor;
      Constructor.controller = this;
    }
    return this.cache.Constructor
  }



  //////////////////////////////
  //  Loading / Saving
  //////////////////////////////

  // OVERRIDE THIS TO ACTUALLY LOAD WHATEVER YOU NEED TO!
  loadData() {}

  onLoaded(data) {
console.warn(`${this.type} loaded.  Data: `, data);
    this.mutate(data);
  }

  // OVERRIDE THIS TO ACTUALLY SAVE WHATEVER YOU NEED TO!
  saveData() {}


  //////////////////////////////
  //  Debug
  //////////////////////////////
  toString() {
    return `[${this.constructor.name} ${this.id}]`;
  }

}