---
pubDatetime: 2022-03-18T13:04:58Z
modDatetime: 2023-12-10T03:16:24Z
title: 玩转 Mac 之通用快捷键（一）
permalink: common-shortcuts-for-macos
originalUrl: https://github.com/bowencool/blog/issues/16
tags:
  - MacOS
  - tricks
description: 玩转 Mac 之通用快捷键（一）
---

个人很不屑记忆特定应用的快捷键的（比如 chrome 的各种快捷键扩展程序）：

1. 不够通用；
2. 如果是非全局的，那更没必要；
3. 万一停更/下架/被替代又要重新记忆。

> 本人是前端，IDE 仅测试 VS Code，其他的理论上是通用的。

## Tab 操作

实测 **Finder、 VS Code、Iterm2、浏览器**可以统一

- `⌘ + num` 切换到第 N 个 Tab
<!-- - `⌘ + ⌥ + →` 切换到右侧一个 Tab  -->
- `⌘ + W` 关闭当前 Tab
- `⌘ + T` 新建 Tab 并聚焦
- `⌘ + ⇧ + T` 重新打开刚刚关闭的 Tab，可以按多次恢复多个
- `⌘ + N` 新建 窗口

这部分快捷键 VS Code、Iterm2 默认不是这样的：

### Item2 设置

我现在用 [Warp](https://app.warp.dev/referral/6NP9Q8) , 不需要设置。

- 统一 UI：`Appearance > General > Theme` 选择 `Minimal`
- 总是显示 Tab：`Appearance > Tabs > Show tab bar even when there is only one tab 和 Show tab bar in fullscreen` 钩上，其他的随意
- 设置快捷键：`Keys > Navigation Shortcuts > Shortcut to select a tab` 为 `⌘ Number`

### VS Code 设置

`设置 > 键盘快捷方式`，把`workbench.action.openEditorAtIndex1` 设置为`cmd+1`，搜索 `cmd+1` 把其他无关快捷键删除。其他按键同理。我这里提供一份我设置好的，直接粘贴到 keybindings.json 里即可：

<details>
  <summary>查看代码</summary>

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

## 光标

不少人移动光标只会用鼠标和方向键，这里再给大家扩充一些快捷键吧。

实测 **VS Code、Iterm2、Chrome 搜索框、网页中的 Input、Spotlight/Alfred 搜索框**

### 移动

大家都知道方向键每次移动一个单词，你可能不知道 `按住option ⌥ + 方向键` 每次移动一个单词。

- `⌥ + ←` 向左移动一个单词
- `⌥ + →` 向右移动一个单词

关于移动光标到行首和行尾，Home / End 不通用，有些地方是翻页功能，而且有些残废键盘比如 13 寸 Macbook Pro 根本没有这两个键，推荐使用下面的通用快捷键：

- `⌘ + ←` 移动光标到行首
- `⌘ +  →` 移动光标到行尾
- `⌃ + A` 移动光标到段落首部，无视软换行
- `⌃ + E` 移动光标到段落尾部，无视软换行

### 删除

大家都知道 `backspace` 向左删除一个字符，不会还有人不知道 `delete` 向右删除一个字符吧。

`按住 option ⌥ + backspace/delete` 每次向左/右删除一个单词；

- `⌥ + backspace` 向左删除一个单词
- `⌥ + delete` 向右删除一个单词

`按住 command ⌘ + backspace/delete` 每次向左/右删除到行边界。

- `⌘ + backspace` 删除当前位置到行首
- `⌘ + delete` 删除当前位置到行尾

### 选中

和移动光标一样，只是多加了 `shift ⇧` 键：

- 鼠标双击选中当前单词
- 鼠标三击选中当前行
- `⌥ + ⇧ + ←` 选中范围向左扩大一个单词
- `⌥ + ⇧ + →` 选中范围向右扩大一个单词
- `⇧ + ←` 选中范围向左扩大一个字符
- `⇧ + →` 选中范围向右扩大一个字符
- `⇧ + ↑` 选中范围向上扩大一整行

这部分快捷键 VS Code、Iterm2 默认不是这样的：

### Item2 设置

`Profiles` > `Keys` > `Key Mapppings` > `Presets` > `Natural Text Editing` 时间长了不确定是不是这个了

## 其他

实测**任何应用**均有效

- `⌘ + ⇧ + P` 呼出命令菜单，如果有的话
- `⌘ + ,` 呼出设置菜单

致力于统一快捷键，形成肌肉记忆。欢迎在评论区补充。
