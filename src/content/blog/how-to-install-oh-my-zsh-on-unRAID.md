---
pubDatetime: 2023-04-11T04:59:17Z
modDatetime: 2023-06-30T08:46:47Z
title: How to install oh-my-zsh on unRAID
permalink: how-to-install-oh-my-zsh-on-unRAID
originalUrl: https://github.com/bowencool/blog/issues/22
tags:
  - nas
  - unRAID
  - tricks
description: Every time unRAID is booted, the Home directory is reset, resulting in the installation of oh-my-zsh being wiped out. Here's how to do it, Automatically install it every time you boot up, and restore the configuration.
---

Every time unRAID is booted, the Home directory is reset, resulting in the installation of oh-my-zsh being wiped out. Here's how to do it, Automatically install it every time you boot up, and restore the configuration.

Intall the User Scripts plugin, and create a new script and set the execution timing to "At Startup of Array", the following is the content of the script:

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

# At the time of execution, the soft route had not yet started and there was no network
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

# Make sure the .zsh_history file exists
touch "$SOURCE_CONFIG/.zsh_history"

# Symlink the .zshrc file and the .zsh_history file
cp -sf "$SOURCE_CONFIG/.zshrc" "$HOME/.zshrc"
cp -sf "$SOURCE_CONFIG/.zsh_history" "$HOME/.zsh_history"
```
