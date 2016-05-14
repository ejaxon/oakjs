//////////////////////////////
// Page class
//////////////////////////////

import { proto, debounce   } from "oak-roots/util/decorators";
import { dieIfMissing } from "oak-roots/util/die";

import ComponentController from "./ComponentController";

import OakPage from "./components/OakPage";

export default class Page extends ComponentController {
  constructor(props) {
    dieIfMissing(props, "new Page", ["oak", "pageId", "sectionId", "projectId"]);
    super(props);
  }

  @proto
  type = "page";

  @proto
  ComponentSuperConstructor = OakPage;

  //////////////////////////////
  //  Identify & Sugar
  //////////////////////////////

  static getPath(projectId, sectionId, pageId) { return `${projectId}/${sectionId}/${pageId}` }
  static splitPath(path) {
    const split = path.split("/");
    return { projectId: split[0], sectionId: split[1], pageId: split[0] }
  }

  get id() { return this.pageId }
  get path() { return Page.getPath(this.projectId, this.sectionId, this.pageId) }

  get project() { return this.oak.getProject(this.projectId) }
  get section() { return this.oak.getSection(this.projectId, this.sectionId) }

  // 1-based position (index) of this page in its section's `pages` list
  // NOTE: this index is 1-based!
  get position() { return this.section.pages.indexOf(this) + 1 }
  get isFirstPage() { return this.position === 1 }
  get isLastPage() { return this.position === this.section.pages.length }

  //////////////////////////////
  //  Components
  //////////////////////////////

  // TODO: dynamic components
  get components() { return this.section.components }

  // REFACTOR: rename this?
  get component() { if (oak.page === this) return oak._pageComponent }

  //////////////////////////////
  //  Initialization / Loading / Saving
  //////////////////////////////

  get route() { return this.oak.getPageRoute(this.projectId, this.sectionId, this.pageId) }

}


//////////////////////////////
// PageElement class
//////////////////////////////

import JSXElement from "./JSXElement";

// Create a specialized `PageElement` and export it
export class PageElement extends JSXElement {
  static renderVars = {
    ...JSXElement.renderVars,
    oak: "context.oak",
    _controller: "context._controller",
    page: "context.page",
    section: "context.section",
    project: "context.project",
    components: "context.components",
    data: "this.data || {}"
  }
  // Render out outer element as a div with only a few properties
  renderType = "div";

  // Use `getRenderProps()` to massage the props passed in
  _propsToSource(options, indent) {
    const propSource = super._propsToSource(options, indent);
    return `this.getRenderProps(${propSource})`;
  }
}

// Register it so `<Page>` elements in a jsxe will use `PageElement`.
import JSXParser from "./JSXParser";
JSXParser.registerType("OakPage", PageElement);
