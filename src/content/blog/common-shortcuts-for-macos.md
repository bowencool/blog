---
pubDatetime: 2022-03-18T13:04:58Z
modDatetime: 2024-03-06T11:06:37Z
title: Common MacOS Shortcuts
permalink: common-shortcuts-for-macos
originalUrl: https://github.com/bowencool/blog/issues/16
tags:
  - MacOS
  - hacks
description: This post shares some unifying shortcuts on MacOS for muscle memory formation.
---

I'm focusing on unifying shortcuts to form muscle memory. Personally, I don't want to memorize application-specific shortcuts (like various shortcuts of Chrome extensions):

1. Not versatile enough;
2. If it's not global, then it's even less necessary;
3. In case of stopping or being replaced, you have to remember again.

> Only one IDE, VS Code, was tested, the others are theoretically universal.

## Tabs

The actual test shows that **Finder, VS Code, Iterm2, and the browser** can be unified.

- `⌘ + num` Switch to the nth Tab
<!-- - `⌘ + ⌥ + →` Switch to the right Tab  -->
- `^ + Tab` Switch to the next Tab
- `^ + ⇧ + Tab` Switch to the previous Tab
- `⌘ + W` Close the current Tab
- `⌘ + T` Create new Tab and focus
- `⌘ + ⇧ + T` Reopen the tab that was just closed, press multiple times to restore multiple tabs
- `⌘ + N` New Window

This part of the shortcuts is not the default for VS Code and iTerm2.

### Set up Item2

I'm using [Warp](https://app.warp.dev/referral/6NP9Q8) , no setup required.

- Make the UI look uniform: Go to `Appearance > General > Theme` and select `Minimal`
- Always show Tabs：Go to `Appearance > Tabs`, make sure `Show tab bar even when there is only one tab` and `Show tab bar in fullscreen` are enabled.
- Set shortcut keys: Go to `Keys > Navigation Shortcuts` and set `Shortcut to select a tab` to `⌘ Number`

### Set up VS Code

Go to `Settings > Keyboard Shortcuts`, Set `workbench.action.openEditorAtIndex1` to `cmd+1` and search for `cmd+1` to remove any other extraneous shortcuts. Same for other keys. I've provided a copy of my setup here, just paste it directly into keybindings.json:

<details>
  <summary>View Codes</summary>

```json
[
  {
    "key": "cmd+numpad1",
    "command": "-workbench.action.toggleSidebarVisibility",
    "when": "!editorFocus"
  },
  {
    "key": "cmd+numpad5",
    "command": "-workbench.action.toggleSidebarVisibility",
    "when": "!editorFocus"
  },
  {
    "key": "cmd+numpad9",
    "command": "-workbench.action.toggleSidebarVisibility",
    "when": "!editorFocus"
  },
  {
    "key": "cmd+numpad3",
    "command": "-workbench.action.toggleSidebarVisibility",
    "when": "searchViewletVisible"
  },
  {
    "key": "cmd+numpad0",
    "command": "-workbench.action.zoomReset"
  },
  {
    "key": "cmd+numpad5",
    "command": "-workbench.view.debug",
    "when": "editorFocus"
  },
  {
    "key": "cmd+numpad3",
    "command": "-workbench.view.search",
    "when": "!searchViewletVisible"
  },
  {
    "key": "cmd+numpad1",
    "command": "-workbench.view.explorer",
    "when": "editorFocus"
  },
  {
    "key": "cmd+numpad0",
    "command": "-workbench.actions.view.problems"
  },
  {
    "key": "cmd+numpad9",
    "command": "-workbench.view.git",
    "when": "editorFocus"
  },
  {
    "key": "cmd+1",
    "command": "-workbench.action.focusFirstEditorGroup"
  },
  {
    "key": "cmd+1",
    "command": "-workbench.action.toggleSidebarVisibility",
    "when": "!editorFocus"
  },
  {
    "key": "cmd+1",
    "command": "-workbench.view.explorer",
    "when": "editorFocus"
  },
  {
    "key": "cmd+2",
    "command": "-workbench.action.focusSecondEditorGroup"
  },
  {
    "key": "cmd+k",
    "command": "editor.foldLevel2",
    "when": "editorTextFocus && foldingEnabled"
  },
  {
    "key": "cmd+k cmd+2",
    "command": "-editor.foldLevel2",
    "when": "editorTextFocus && foldingEnabled"
  },
  {
    "key": "cmd+3",
    "command": "-workbench.action.focusThirdEditorGroup"
  },
  {
    "key": "cmd+3",
    "command": "-workbench.action.toggleSidebarVisibility",
    "when": "searchViewletVisible"
  },
  {
    "key": "cmd+3",
    "command": "-workbench.view.search",
    "when": "!searchViewletVisible"
  },
  {
    "key": "cmd+k cmd+3",
    "command": "-editor.foldLevel3",
    "when": "editorTextFocus && foldingEnabled"
  },
  {
    "key": "cmd+k cmd+4",
    "command": "-editor.foldLevel4",
    "when": "editorTextFocus && foldingEnabled"
  },
  {
    "key": "cmd+4",
    "command": "-workbench.action.focusFourthEditorGroup"
  },
  {
    "key": "cmd+5",
    "command": "-workbench.action.toggleSidebarVisibility",
    "when": "!editorFocus"
  },
  {
    "key": "cmd+5",
    "command": "-workbench.view.debug",
    "when": "editorFocus"
  },
  {
    "key": "cmd+k cmd+5",
    "command": "-editor.foldLevel5",
    "when": "editorTextFocus && foldingEnabled"
  },
  {
    "key": "cmd+5",
    "command": "-workbench.action.focusFifthEditorGroup"
  },
  {
    "key": "cmd+6",
    "command": "-workbench.action.focusSixthEditorGroup"
  },
  {
    "key": "cmd+k cmd+6",
    "command": "-editor.foldLevel6",
    "when": "editorTextFocus && foldingEnabled"
  },
  {
    "key": "cmd+7",
    "command": "-outline.focus"
  },
  {
    "key": "cmd+7",
    "command": "-workbench.action.focusSeventhEditorGroup"
  },
  {
    "key": "cmd+k cmd+7",
    "command": "-editor.foldLevel7",
    "when": "editorTextFocus && foldingEnabled"
  },
  {
    "key": "shift+cmd+8",
    "command": "-editor.action.toggleColumnSelection"
  },
  {
    "key": "cmd+k cmd+8",
    "command": "-editor.foldAllMarkerRegions",
    "when": "editorTextFocus && foldingEnabled"
  },
  {
    "key": "cmd+8",
    "command": "-workbench.action.focusEighthEditorGroup"
  },
  {
    "key": "cmd+9",
    "command": "-workbench.action.lastEditorInGroup"
  },
  {
    "key": "ctrl+cmd+9",
    "command": "-workbench.action.moveEditorToLastGroup"
  },
  {
    "key": "cmd+9",
    "command": "-workbench.action.toggleSidebarVisibility",
    "when": "!editorFocus"
  },
  {
    "key": "cmd+9",
    "command": "-workbench.view.scm",
    "when": "editorFocus"
  },
  {
    "key": "cmd+k cmd+9",
    "command": "-editor.unfoldAllMarkerRegions",
    "when": "editorTextFocus && foldingEnabled"
  },
  {
    "key": "cmd+1",
    "command": "workbench.action.openEditorAtIndex1"
  },
  {
    "key": "ctrl+1",
    "command": "-workbench.action.openEditorAtIndex1"
  },
  {
    "key": "cmd+2",
    "command": "workbench.action.openEditorAtIndex2"
  },
  {
    "key": "ctrl+2",
    "command": "-workbench.action.openEditorAtIndex2"
  },
  {
    "key": "cmd+3",
    "command": "workbench.action.openEditorAtIndex3"
  },
  {
    "key": "ctrl+3",
    "command": "-workbench.action.openEditorAtIndex3"
  },
  {
    "key": "cmd+4",
    "command": "workbench.action.openEditorAtIndex4"
  },
  {
    "key": "ctrl+4",
    "command": "-workbench.action.openEditorAtIndex4"
  },
  {
    "key": "cmd+5",
    "command": "workbench.action.openEditorAtIndex5"
  },
  {
    "key": "ctrl+5",
    "command": "-workbench.action.openEditorAtIndex5"
  },
  {
    "key": "cmd+6",
    "command": "workbench.action.openEditorAtIndex6"
  },
  {
    "key": "ctrl+6",
    "command": "-workbench.action.openEditorAtIndex6"
  },
  {
    "key": "cmd+7",
    "command": "workbench.action.openEditorAtIndex7"
  },
  {
    "key": "ctrl+7",
    "command": "-workbench.action.openEditorAtIndex7"
  },
  {
    "key": "cmd+8",
    "command": "workbench.action.openEditorAtIndex8"
  },
  {
    "key": "ctrl+8",
    "command": "-workbench.action.openEditorAtIndex8"
  },
  {
    "key": "cmd+9",
    "command": "workbench.action.openEditorAtIndex9"
  },
  {
    "key": "ctrl+9",
    "command": "-workbench.action.openEditorAtIndex9"
  }
]
```

</details>

## Cursor

Many people only use the mouse and arrow keys to move the cursor. Here are some shortcut keys for you.

Tested **VS Code, Iterm2, Chrome search box, Input in web pages, Spotlight/Alfred search boxes**

### Moving

Everyone knows that the arrow keys move one word at a time, but you may not know that holding down `option ⌥ + arrow key` moves one word at a time.

- `⌥ + ←` Move the cursor one word to the left
- `⌥ + →` Move the cursor one word to the right

Regarding moving the cursor to the beginning and end of a line, Home / End keys are not universal. In some places, they function as page navigation, and some keyboards such as the 13-inch Macbook Pro don't have these keys at all. It is recommended to use the following universal shortcuts:

- `⌘ + ←` Move cursor to beginning of line
- `⌘ + →` Move cursor to end of line
- `⌃ + A` Move cursor to beginning of paragraph, ignoring soft line breaks
- `⌃ + E` Move cursor to end of paragraph, ignoring soft line breaks

### Deleting

Everyone knows that `backspace` deletes a character to the left, and surely no one doesn't know that `delete` deletes a character to the right.

Holding down `option ⌥ + backspace/delete` will delete a word to the left/right each time;

- `⌥ + backspace` deletes a word to the left
- `⌥ + delete` deletes a word to the right

Holding down `command ⌘ + backspace/delete` will delete to the beginning/end of line each time.

- `⌘ + backspace` deletes from current position to beginning of line
- `⌘ + delete` deletes from current position to end of line

### Selecting

Just like moving the cursor, but with the addition of the `shift ⇧` key:

- Double-click to select the current word
- Triple-click to select the current line
- `⇧ + ←` to expand selection left by one character
- `⇧ + →` to expand selection right by one character
- `⇧ + ↑` to expand selection up by a whole line
- `⇧ + ↓` to expand selection down by a whole line
- `⌥ + ⇧ + ←` to expand selection left by one word
- `⌥ + ⇧ + →` to expand selection right by one word

This part of the shortcuts is not the default for and iTerm2.

### Set up Item2

`Profiles` > `Keys` > `Key Mapppings` > `Presets` > `Natural Text Editing` It's been a long time. I'm not sure that's it.

## Others

**Works on any application**

- `⌘ + ⇧ + P` Call out the command panel, if there is one
- `⌘ + ,` Calls out the settings panel

Feel free to add in the comment section.
