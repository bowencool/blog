---
pubDatetime: 2022-08-14T07:55:35Z
modDatetime: 2024-02-22T11:49:33Z
title: 使用 RClone 实现 unRAID 的异地容灾
featured: true
permalink: offsite-disaster-recovery-for-unraid-with-rclone
originalUrl: https://github.com/bowencool/blog/issues/18
tags:
  - nas
  - unRAID
  - tricks
  - backup
  - data-security
  - automation
description: 众所周知，unRAID 作为最流行的家用 Nas 系统之一，没有提供异地容灾的功能（3-2-1 备份原则中最后一条）。随着 Nas 里的数据越来越多，应用越来越复杂，我越来越担心 NAS 硬件由于不可抗力（地震、水灾、火灾、盗窃等）全挂了的时候该如何恢复的问题。为了确保数据万无一失，今天来说说异地容灾。
---

众所周知，unRAID 作为最流行的家用 Nas 系统之一，没有提供异地容灾的功能（3-2-1 备份原则中最后一条）。随着 Nas 里的数据越来越多，应用越来越复杂，我越来越担心 NAS 硬件由于不可抗力（地震、水灾、火灾、盗窃等）全挂了的时候该如何恢复的问题。为了确保数据万无一失，今天来说说异地容灾。

今天的主角是 [RClone](https://rclone.org/) :

> Rclone 是一个命令行程序，用于管理云存储的文件。它是一个功能丰富的云供应商网络存储界面的替代品。超过 40 个云存储产品支持 Rclone，包括 S3 对象存储、商业和消费者文件存储服务，以及标准传输协议。

简单点说，RClone 是一个网盘同步命令行工具。他支持 40 多种网盘类型，今天我介绍一下国内常见的阿里云盘、OSS 的简单配置：

## 安装 RClone

小插曲：第一次装的时候，我装了自带 GUI 的 Docker 版。但探索了半天 GUI，没找到我想要的同步功能。与此同时我也在看官方文档，在逐渐意识到这是一个命令行工具的情况后，我换成了 unRAID 插件版，因为我要的几乎是整个 Nas 的数据备份，那岂不是要把所有目录都开放给 Docker 容器，那 Docker 就多此一举了。

在 unRAID 后台页面的 APPS 标签下搜索 rclone，然后点击左侧 Plugins 筛选出插件版，点击 Actions 安装：
![image](https://user-images.githubusercontent.com/20217146/184527668-d079cd78-d503-490a-8ead-185643473715.png)

安装完成后，执行命令 `rclone version` 确认是否安装成功，或者去 Settings > User Utilities > rclone 面板查看：
![image](https://user-images.githubusercontent.com/20217146/184527686-cbfd9008-a5b4-416c-a6d4-61b0754e7d67.png)

## 配置

一个比较快的配置方式是直接去 Settings > User Utilities > rclone ，把配置粘贴到配置文件里去，配置文件内容参考下文。

使用命令配置粒度更细，也是官网文档里给的方式：执行 `rclone config` 会弹出交互式的终端会话，根据提示，输入 n 表示新建配置，接下来按照提示输入即可

### OSS

OSS 配置最简单，跟网盘的对比可参考官网，我认为比网盘更适合做备份。

配置文件内容：

```text
[oss]
type = s3
provider = Alibaba
access_key_id = xxx
secret_access_key = xxx
endpoint = oss-cn-hangzhou.aliyuncs.com
acl = private
```

自行配置：

```text
# 远程连接名称
name> oss
# 储存类型，可以输入对应的数字编号，也可以直接输入已知类型
Storage> s3
# 服务商
provider>Alibaba
# 认证，选择false或直接回车跳过
env_auth>
# 接下来就是熟悉的AK字段了
access_key_id>xxx
secret_access_key>xxx
endpoint>oss-cn-hangzhou.aliyuncs.com
# 也不需要填，权限交给阿里云管理就行
acl>
# 后面的没啥重要的，一路回车就行
storage_class>
```

接下来再执行 `rclone config` 就能看到刚刚配置好的远程连接了：

```text
Current remotes:
Name                 Type
====                 ====
oss                  s3
```

执行命令`rclone lsd oss:` 测试一下连接：

> `lsd` 的意思是列出目录，`oss:` 是 `远程连接名:路径` 的格式，路径为空表示根目录。

```text
-1 2022-08-07 11:36:13        -1 unraid # 这是 bucket 名称，需要自己创建
```

[常见命令](https://rclone.org/docs/#subcommands)

简单演示一下：

```bash
# 复制本地 /mnt/user/Public 到远程 /unraid/Public 下，已经存在的文件会被跳过
rclone copy /mnt/user/Public remote:/unraid/Public

# 移动本地 /mnt/user/file 到远程 /unraid/ 目录下
rclone move /mnt/user/file remote:/unraid/file

# 使远程 /unraid/Public 和本地 /mnt/user/Public 保持一致，不会修改本地文件
rclone sync /mnt/user/Public remote:/unraid/Public
```

需要注意的是，同步命令有两个：

**sync 是单向同步，只会修改目标，不会修改源目录。**

- 假如你在本地删除了其中的文件，那么远程对应的文件也会被删除（如果不想这样，可以用 copy 命令）。
- 假如是远程文件被删除，只要本地文件还在，rclone sync 会再次把此文件推到远程。

**bisync 才是直觉上的双向同步。** 暂时没用到。详细可以查看官方文档。

### 阿里云盘

阿里云盘并没有直接支持，而是通过上文提到的标准协议之一的 WebDAV 实现支持的。

我用的是 [messense/aliyundrive-webdav](https://hub.docker.com/r/messense/aliyundrive-webdav)，你也可以用 alist，支持的国内网盘更多。

使用 Docker 镜像这个过程就不赘述了，不过我遇到一个坑：

~~我之前的 Docker 容器网络都配成了 br0，就是分配一个 IP，而不是 host(unRAID)端口。然而[在 unRAID 上访问不到容器的 IP](https://forums.unraid.net/topic/69255-cant-access-host-from-docker-container-when-using-br0/)，需要去 Settings > Docker 里设置，或者改成 Bridge 分配端口号。~~ 已过时

成功之后，把下面内容追加到配置文件里去：

```text
[adrive]
type = webdav
url = http://localhost:8080
vendor = owncloud
user = xxx
pass = xxx
```

操作完成后即可获得与 OSS 地位相同的远程连接，命令也一模一样。

## 自动同步

### 安装 User Scripts

我是通过 User Scripts 这个插件实现的定时任务，通过 APPS 面板搜索即可。

我没用 crontab 的原因有两个：

1. 尽可能与 unRAID 解耦，所有数据都是插件级的，卸载即清空。之前因为连续升级 beta 系统而回滚过。
2. 可视化管理。

### 添加任务

```bash
cd /boot/config/plugins/user.scripts/scripts
```

创建一个目录（直接 copy 其他任务更方便），新建一个文件 script，注意没有后缀名，写入以下内容：

```bash
#!/bin/bash

cd /mnt/user

echo "syning Public"
rclone sync /mnt/user/Public oss:/unraid/Public --exclude-from=/boot/config/plugins/user.scripts/scripts/rcloneignore --progress
rclone --no-update-modtime sync /mnt/user/Public adrive:/unraid/Public --exclude-from=/boot/config/plugins/user.scripts/scripts/rcloneignore --progress
```

我的 rcloneignore 文件内容：

```text
*DS_Store
.AppleDB/**
.Recycle.Bin/**
.stfolder/**
.stversions/**
.duplicacy/**
node_modules/**
cache/**
caches/**
.cache/**
.caches/**
*.log
.pnpm-store/**
```

### 设置任务调度

然后去 `Settings > User Utilities > User Scripts` 设置任务调度即可。

<img width="2092" alt="image" src="https://user-images.githubusercontent.com/20217146/184527717-8caae3dd-e47b-4fd2-91b7-86dd081eac3a.png">

顺便分享一个带压缩和日期版本的 script:

```bash
#!/bin/bash
NOW=`date +"%Y-%m-%d"`
cd /mnt/user

LOCAL_PATH=/tmp/appdata.tar.gz
REMOTE_PATH=/unraid/appdata/$NOW/

tar -czvf $LOCAL_PATH appdata
echo "=> done $LOCAL_PATH"

echo "moving $LOCAL_PATH to $REMOTE_PATH"
rclone copy $LOCAL_PATH oss:$REMOTE_PATH --progress
```

## 备份 Flash

flash backup 也很简单，就是把 `/boot` 目录压缩就行了：

```bash
tar -czvf /tmp/`hostname`_flash.tgz --exclude 'previous*' --exclude "System Volume Information" --exclude 'logs*' /boot
```
