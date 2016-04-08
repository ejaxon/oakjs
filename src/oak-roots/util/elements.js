//////////////////////////////
//
//  Classes for manipulating / working directly with DOM elements.
//  Similar to stuff you'd do with jQuery,
//  but using HTML5 APIs and as fast as possible.
//
//////////////////////////////

import Rect from "../Rect";
import Point from "../Point";


// Return the OFFSET rect -- relative to the DOCUMENT, INCLUDING scrolling.
// Returns `undefined` if element doesn't exist.
// TODO: scale???
export function clientRect(element) {
  if (!element) return undefined;
  const rect = element.getBoundingClientRect();
  return new Rect(rect.left, rect.top, rect.width, rect.height);
}

// Return `true` if the specified `element` matches the `selector`.
var matchesMethod = "matches";
if (!Element.prototype.matches) {
  if (Element.prototype.msMatchesSelector) matchesMethod = "msMatchesSelector";
  if (Element.prototype.webkitMatchesSelector) matchesMethod = "webkitMatchesSelector";
}
export function matches(element, selector) {
  if (typeof element[matchesMethod] !== "function") return false;
  return element[matchesMethod](selector);
}


// Given a node or element, return element or closest parent which matches selector.
export function closestMatching(element, selector) {
  if (!element) return undefined;
  let ancestor = (element instanceof Element ? element : element.parentNode);
  while (ancestor.parentElement) {
    if (matches(ancestor, selector)) return ancestor;
    ancestor = ancestor.parentElement;
  }
  return undefined;
}


// Given a set of elements:
//  - `clone()` each and stick inside a wrapper which positions it relative to
//  - an outerWrapper which is sized to the clientRect which encompasses the elements.
// Returns the `outerWrapper`.
export function getDragPreviewForElements(elements) {
  const rects = elements.map(element => clientRect(element));
  const outerRect = Rect.containingRect(rects);

  const $outerWrapper = $("<div style='position:relative'/>");
  $outerWrapper.css({ width: outerRect.width, height: outerRect.height });

  const outerOffset = outerRect.point.invert();
  elements.forEach( (element, index) => {
    const $wrapper = $("<div style='position:absolute'/>");
    const wrapperRect = rects[index].offset(outerOffset);

    $wrapper.css(wrapperRect);
    $wrapper.append( element.cloneNode(true) );

    $outerWrapper.append( $wrapper );
  });

  return {
    element: $outerWrapper[0],
    clientRect: outerRect,
    size: outerRect.size,
    offset: oak.event.clientLoc.subtract(outerRect.point)
  }
}


export default Object.assign({}, exports);
