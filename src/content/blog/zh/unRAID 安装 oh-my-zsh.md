---
pubDatetime: 2023-04-11T04:59:17Z
modDatetime: 2023-06-30T08:46:47Z
title: unRAID 安装 oh-my-zsh
permalink: how-to-install-oh-my-zsh-on-unRAID
originalUrl: https://api.github.com/repos/bowencool/blog/issues/22
tags:
  - nas
  - unRAID
  - tricks
description: unRAID 安装 oh-my-zsh
---

unRAID 每次开机，Home 目录都会重置一下，导致安装的 oh-my-zsh 荡然无存。这里提供一个办法：每次开机自动安装，并且恢复配置。

使用 User Scripts 这个插件，新建一个脚本，设置执行时机为“At Startup of Array”，以下是脚本内容：

```bash
#!/bin/bash

HOME=/root
OH_MY_ZSH_ROOT="$HOME/.oh-my-zsh"
ZSH_CUSTOM="$HOME/.oh-my-zsh/custom"
OH_MY_ZSH_PLUGINS="$ZSH_CUSTOM/plugins"
OH_MY_ZSH_THEMES="$ZSH_CUSTOM/themes"
cd $HOME

if [ -d "$OH_MY_ZSH_ROOT" ]; then
        echo "$OH_MY_ZSH_ROOT already exists"
        exit 1
fi

# 执行的时候，软路由还没启动，没有网
sleep 300

cp -sf .bash_profile .bashrc

# sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
sh -c "$(curl -fsSL https://ghproxy.com/https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

mkdir -p $OH_MY_ZSH_PLUGINS
mkdir -p $OH_MY_ZSH_THEMES

# Install zsh-autosuggestions
if [ ! -d "$OH_MY_ZSH_PLUGINS/zsh-autosuggestions" ]; then
        echo "  -> Installing zsh-autosuggestions..."
        git clone https://ghproxy.com/https://github.com/zsh-users/zsh-autosuggestions $OH_MY_ZSH_PLUGINS/zsh-autosuggestions
else
        echo "  -> zsh-autosuggestions already installed"
fi

# Install zsh-syntax-highlighting
if [ ! -d "$OH_MY_ZSH_PLUGINS/zsh-syntax-highlighting" ]; then
        echo "  -> Installing zsh-syntax-highlighting..."
        git clone https://ghproxy.com/https://github.com/zsh-users/zsh-syntax-highlighting.git $OH_MY_ZSH_PLUGINS/zsh-syntax-highlighting
else
        echo "  -> zsh-syntax-highlighting already installed"
fi

chmod 755 $OH_MY_ZSH_PLUGINS/zsh-autosuggestions
chmod 755 $OH_MY_ZSH_PLUGINS/zsh-syntax-highlighting

chsh -s /bin/zsh

SOURCE_CONFIG=/boot/config/extra
# Make sure the necessary directories are existing
mkdir -p $SOURCE_CONFIG

# Make sure history file exists
touch "$SOURCE_CONFIG/.zsh_history"

# Symlink .zshrc and history files
cp -sf "$SOURCE_CONFIG/.zshrc" "$HOME/.zshrc"
cp -sf "$SOURCE_CONFIG/.zsh_history" "$HOME/.zsh_history"
```
