//////////////////////////////
//  Section Actions
//////////////////////////////
"use strict";

import Action from "oak-roots/Action";
import { die, dieIfMissing } from "oak-roots/util/die";

import Section from "../Section";
import oak from "../oak";

import component from "./component";
import navigation from "./navigation";
import utils from "./utils";

// set to `true` to log messages as actions proceed
const DEBUG = true;



// Show some section.
export function showSection(options = {}) {
  let {
    section = oak.section,            // Section or section path, defaults to current section
    replace,
    actionName = "Show Section",
    autoExecute
  } = options;

  // handle relative section specifier
  if (section === "FIRST") section = oak.section && oak.section.project.firstChild;
  else if (section === "PREV") section = oak.section && oak.section.previous
  else if (section === "NEXT") section = oak.section && oak.section.next;
  else if (section === "LAST") section = oak.section && oak.section.project.lastChild;

  if (section === oak.section) return;
  if (!section) return;

  // normalize section to path string
  if (section instanceof Section) section = section.path;
  if (typeof section !== "string") die(oak, "actions.showSection", [options], "you must specify a section");

  const { projectId, sectionId } = Section.splitPath(section);

  return navigation._navigateToRouteTransaction({
    route: oak.getPageRoute(projectId, sectionId),
    replace,
    actionName,
    autoExecute
  })
}

new Action({
  id: "oak.showFirstSection", title: "Show First Section",
  handler: ()=>showSection({ section: "FIRST" }),
  enabled:()=>oak.section && !oak.section.isFirst
});

new Action({
  id: "oak.showPreviousSection", title: "Show Previous Section",
  handler: ()=>showSection({ section: "PREV" }),
  enabled:()=>oak.section && !oak.section.isFirst
});

new Action({
  id: "oak.showNextSection", title: "Show Next Section",
  handler: ()=>showSection({ section: "NEXT" }),
  enabled:()=>oak.section && !oak.section.isLast
});

new Action({
  id: "oak.showLastSection", title: "Show Last Section",
  handler: ()=>showSection({ section: "LAST" }),
  enabled:()=>oak.section && !oak.section.isLast
});


//////////////////////////////
//  Save a section.
//////////////////////////////

// Save the section to the server.
// NOTE: this is currently not undoable.
// TODO: this doesn't return a transaction, so can't be used in other undo contexts... ???
export function saveSection(options = {}) {
  let {
    section = oak.section
  } = options;

  // normalize section to Section object
  if (typeof section === "string") section = oak.account.getSection(section);
  if (!section) die(oak, "actions.savePage", [options], "you must specify a section");

  return section.save("FORCE");
}

new Action({
  id: "oak.saveSection", title: "Save Section",
  handler: saveSection,
  enabled:()=>oak.section
});



//////////////////////////////
//  Add section.  Undoing deletes the new section.
//////////////////////////////

export function createSection(options = {}) {
  let {
    project = oak.project,    // default to current project
    sectionId,                // id for the section (we'll make one up if necessary)
    data,                     // data object for section with `{ jsxe, script, styles, index }`
    position,                 // numeric position within the project, undefined = place after current section
    title,                    // title for the section
    prompt = true,            // if true and title is not specified, we'll prompt for section title
    navigate = true,          // if true, we'll navigate to the section after creation
    actionName,
    autoExecute
  } = options;

  // normalize project
  if (typeof project === "string") project = oak.account.getProject(project);
  if (!project) die(oak, "actions.createSection", [options], "you must specify a project");

  // place after current section by default
  if (!position && oak.section) position = oak.section.position + 1;

  return component._createComponentTransaction({
    parent: project,
    type: "section",
    newId: sectionId,
    title,
    prompt,
    data,
    position,
    navigate,
    actionName,
    autoExecute
  });
}

new Action({
  id: "oak.createSection", title: "New Section...",
  handler: createSection,
  enabled:()=>oak.project
});


//////////////////////////////
//  Duplicate some section.  Undoing deletes the new section.
//////////////////////////////
export function duplicateSection(options = {}) {
  let {
    section = oak.section,          // default to current section
    sectionId,
                                    // default to section's name, duplicateSection will uniquify.
    position,                       // 1-based numeric position within the section, undefined = place after current section
    title,                          // title for the new section, defaults to same as current section
    prompt,                         // if true and title is not specified, we'll prompt for section title
    navigate,                       // if true, we'll navigate to the section after creation
    actionName = "Duplicate Section",
    autoExecute
  } = options;

  // normalize section to Section object
  if (typeof section === "string") section = oak.account.getSection(section);
  if (!section) die(oak, "actions.duplicateSection", [options], "you must specify a section");

  return component._duplicateComponentTransaction({
    component: section,
    newId: sectionId,
    position,
    title,
    prompt,
    navigate,
    actionName,
    autoExecute
  });
}

new Action({
  id: "oak.duplicateSection", title: "Duplicate Section...",
  handler: duplicateSection,
  enabled:()=>oak.section
});


//////////////////////////////
//  Rename section (change it's id)
//////////////////////////////
export function renameSection(options = {}) {
  let {
    section = oak.section,  // Section to change
    newId,                  // New id for the section
    prompt,                 // If `true`, we'll prompt for a new name if newId is not set.
    actionName,
    autoExecute
  } = options

  // normalize section to Section object
  if (typeof section === "string") section = oak.account.getSection(section);
  if (!section) die(oak, "actions.renameSection", [options], "you must specify a section");

  return component._renameComponentTransaction({
    component: section,
    newId,
    updateInstance: function(component, id) { component.sectionId = id },
    navigate: (section === oak.section),
    actionName,
    autoExecute
  });
}

new Action({
  id: "oak.renameSection", title: "Rename Section...",
  handler: renameSection,
  enabled:()=>oak.section
});


//////////////////////////////
//  Delete section.  Undoing adds the section back.
//////////////////////////////
export function deleteSection(options = {}) {
  let {
    section = oak.section,    // Section to delete as Section object or path.
    confirm,
    actionName,
    autoExecute
  } = options;

  // normalize section to Section object
  if (typeof section === "string") section = oak.account.getSection(section);
  if (!section) die(oak, "actions.deleteSection", [options], "you must specify a section");

  return component._deleteComponentTransaction({
    component: section,
    navigate: (section == oak.section),   // navigate if showing the section
    confirm,
    actionName,
    autoExecute
  });
}

new Action({
  id: "oak.deleteSection", title: "Delete Section",
  handler: deleteSection,
  enabled:()=>oak.section
});


// Export all as a lump
export default Object.assign({}, exports);
