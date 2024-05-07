---
pubDatetime: 2023-02-21T10:31:56Z
modDatetime: 2023-06-30T08:51:08Z
title: 把 iPad 作为 Mac mini 的唯一显示器，过年回家也能用 Mac mini 啦！
permalink: use-ipad-as-the-sole-display-for-mac-mini
originalUrl: https://github.com/bowencool/blog/issues/21
tags:
  - MacOS
  - hacks
description: 把 iPad 作为 Mac mini 的唯一显示器，过年回家也能用 Mac mini 啦！无需外接显示器开启随航，最新 MacOS Ventura 版，无需 Luna Display
---

## 更新

直接用 Duet Display 吧，免费用户可以使用有线连接，暂时没有限制，下面的内容过时了

## 效果预览

无需额外显示器，使用用 iPad 的键盘、iPad 的鼠标/触控板、iPad 的屏幕操作你的 Mac。

## 为什么会有这种需求？

当然是 ~~买不起 Macbook~~ Mac mini 太香啦！但是过年回老家或者临时出差的时候，显示器带不走啊！
如果你要跟我扯“Mac 能干的事 iPad 几乎都能干”，那我只能说“啊对对对”。

## 现有的一些方案

也许你会想到便携显示器，可以，但质量一言难尽。iPad 屏幕素质又好，又不用额外花钱，完爆便携屏。

连接到 iPad 我之前在 MacOS 12 上玩过，之前是纯 apple script 方案，就是自动在屏幕上点点点，现在在 MacOS Vertrua 上不行了，原因如下:

1. 在没有显示器的情况下，系统也不会输出信号到 iPad 镜像。并且一旦显示器被拔掉，iPad 镜像输出也会被切断
2. automa workflow 在系统快捷键里找不到了

付费方案 Luna Display / Duet Display 是最完美的，尤其是无需担心下一次系统升级的时候能不能用的问题，开发者会帮你想办法，就是有点贵。

## 新的方案

今天在这里几种平价方案：

由 1.1 不难推出，如果有一个假的虚拟显示器欺骗系统，然后让 iPad 镜像到虚拟显示器，那么系统就可以输出 信号到 iPad 了，而且由于 iPad 是虚拟显示器的镜像，所以逻辑上 iPad 就是系统唯一显示器。

### 第一步：先弄一个虚拟显示器。

#### 软件法

[BetterDisplay](https://github.com/waydabber/BetterDisplay/releases) 这款软件可以虚拟一个显示器欺骗系统。

#### 硬件法

可以去电商平台上搜 显卡欺骗器，十块钱以内就能搞定。这个我没试过，应该挺方便的。

### 第二步：在没有真实显示器的情况下设置 iPad 为虚拟显示器的镜像。

#### 键鼠是连接到 iPad 上的

参考[这个视频](https://www.youtube.com/watch?v=1RGGTRiSpEs&list=WL&index=4&t=375s&ab_channel=APPLEFANS%E8%98%8B%E6%9E%9C%E8%BF%B7)

#### 键鼠是连接到 Mac 上的

预先设置：

1. 录制一个快捷键。
   1. 打开任意一个窗口，鼠标悬浮到左上角绿色小点上，可以看到“移动到 xxx”等选项，记住这些选项的名称。
   2. 打开系统设置 > 键盘 > Keyboard Shortcuts > App Shortcuts
   3. 点击“+”，标题填“移动到 xxxiPad”其中“xxxiPad”代表 iPad 的名字
   4. 录制快捷键，点击“完成”。
   5. 推荐再设置一个移动到虚拟显示器的快捷键、一个移动到真实显示器的快捷键，方便调试。
   6. 你可以再次悬浮到左上角绿色小点上验证那几个选项后面有没有出现快捷键的提示，顺便按下快捷键试试。(不是很稳定，如果没有出现快捷键提示，试试把 iPad 名字中的空格去掉。有时候网络不好甚至没有菜单项，多试几次)
2. 【非必需，推荐】设置 BetterDisplay 开机启动。
3. ~~【非必需，不推荐】开启自动登录。相当于开机不需要认证，直接进入桌面。我觉得非常危险，另外盲打密码（看不见画面，看得见键盘）是一件非常容易的事，如果有 Apple watch，还可以设置自动解锁。~~

真实场景操作步骤：

1. 需要先进入桌面。
2. 如果没有设置开机自动，可以按 `command` + `space`唤出 Spotlight，然后输入软件名“BetterDisplay”回车以启动。
3. 按下预先设置的快捷键。

#### 【推荐】用 iPhone / iPad 远程桌面

预先设置：

1. iPhone 上下载 [Remote Mouse and Keyboard Pro](https://apps.apple.com/us/app/remote-mouse-and-keyboard-pro/id884153085) 这个 APP，**偶尔会限时免费**，直接买的价格也不到 Luna Display 的十分之一。
2. Mac 上安装对应辅助软件[Remote For Mac](https://www.cherpake.com/get/)。推荐设置开机启动。
3. 授权。直到你可以用 iPhone 控制 Mac 并看到 Mac 的显示画面。

真实场景操作步骤：

1. 需要先进入桌面。
2. 如果没有设置开机自动，可以按 `command` + `space`唤出 Spotlight，然后输入软件名“Remote For Mac”回车以启动。
3. 在 iPhone 上打开 Remote Pro，此时你的 iPhone 已经可以控制 Mac 了，轻触左上第一个形似显示器的图标，然后就能看到 Mac 的画面了，直接去设置屏幕镜像即可。

### 第三步：【可选】将 iPad 的键盘输入转移到 Mac

预先设置：

参考[官方指引](https://support.apple.com/zh-cn/HT212757)。

真实场景操作步骤：

默认是看不见鼠标的，因为鼠标在 iPad OS，而此时 iPad 显示的是 MacOS 的画面，所以 iPad 把鼠标指针隐藏了。如果你记得排列方式的话，往 MacOS 的方向移动鼠标（要足够远）就能看见了，不记得的话，只能每个方向都试试。

此时，你就可以用 iPad 的键盘、iPad 的鼠标/触控板、iPad 的屏幕操作你的 Mac 了。

另外，此方案还可以通过调整虚拟显示器的缩放比间接调整 iPad 的缩放比。
