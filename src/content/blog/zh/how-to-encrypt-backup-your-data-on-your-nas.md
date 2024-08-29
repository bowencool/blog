---
pubDatetime: 2024-02-02T08:30:35Z
modDatetime: 2024-08-29T13:35:54Z
title: 如何加密备份你的 NAS 数据
permalink: how-to-encrypt-backup-your-data-on-your-nas
tags:
  - nas
  - unRAID
  - hacks
  - backup
  - data-security
  - automation
description: 之前我们讲过如何用 RClone 将你的数据备份到云盘/OSS等远程存储服务，但是直接使用 RClone 这种方式太过直白，毫无隐私可言，而且备份没有版本。这期我们来聊聊加密备份。
---

## RClone 的缺点

之前我们讲过[如何用 RClone 将你的数据备份到云盘/OSS等远程存储服务](/zh/posts/offsite-disaster-recovery-for-unraid-with-rclone)，但 RClone 直接 sync 有这么几个缺点：

- 会造成大量 OSS 请求数，产生额外费用
- 没有版本历史
- 没有压缩
- 没有优化重复文件

## 加密备份工具的对比

偶然间听到了以下几个加密备份工具。它们都可以实现：

- 加密备份（到远程或本地）
- 智能版本策略
- 自动切割成固定尺寸的 chunks
- 支持增量备份。

可以看看[这个帖子](https://forum.duplicati.com/t/duplicati-vs-duplicacy-vs-kopia-vs-vorta/14493)

### [Duplicati](https://github.com/duplicati/duplicati)

- GUI 易上手
- 默认使用最佳版本策略
- 但数据库易损坏？

#### 阿里云 OSS

官方不支持，自己魔改太麻烦，而且增加了不确定性。

#### WebDAV

支持 WebDAV。那我们很快就想到先把云盘/OSS转成 WebDAV（我用的是 AList，最近新增了 S3 Server，也就是说可以把网盘转成 S3），再用它备份到 WebDAV。我尝试了一下：

##### WebDAV => OSS

可行。

##### WebDAV => adrive

可行。

##### S3 => adrive

可行。

#### RClone

可行。

### [Duplicacy](https://github.com/gilbertchen/duplicacy)

加强版 Duplicati，它拥有更强的备份功能（[它自己和竞品做了比较](https://github.com/gilbertchen/duplicacy?tab=readme-ov-file#comparison-with-other-backup-tools)），简单提几个要点：

- 命令行版免费，Web GUI 不免费。
- 数据去重功能，可以节省不少储存空间。（有点像 Git、Seafile，好像 ZFS 也有这个功能）
- 多个仓库可以共享一个存储，最大限度利用数据去重功能。
- 同时备份到多个储存。
- 并非采用固定大小，而是平均大小，这样仅修改少部分文件的时候会比较节省空间和时间。
- 备份文件有损坏的话，仅相关文件受到影响，不会影响整个目录。
- 更活跃的开发团队、更少的负面消息。

### [Kopia](https://github.com/kopia/kopia/)

也是一个非常优秀的工具，但它还在 beta 阶段。我也尝试了一下，拥有前两者的所有优点，感觉比前面两个好用多了。具体看下面实战部分。

## 实战

### Duplicati

我最先体验的是 Duplicati，Docker 安装，非常简单，GUI 也容易上手。我的主观感受是：

1. 页面逻辑不够清晰，尤其是配置 S3 那里，表单逻辑混乱。
2. 配置共享也有点麻烦，必须完整的导出文件再导入。
3. 还有 ignore 语法我也不太喜欢。

### Duplicacy

记录一下我探索 Duplicacy 的过程：

安装过程：官方社区没有直接可用的插件或 Docker 镜像。我的方法是直接从[GitHub Releases](https://github.com/gilbertchen/duplicacy/releases)下载可执行文件（可能需要使用`chmod +x [file]`命令），然后将其放入`/usr/local/bin`目录中。

#### WebDAV

有了上面的经验，我们来直接把备份终点设为 WebDAV

```bash
duplicacy init -encrypt -storage-name adrive share-bowen webdav://bowen@10.7.21.2:48080/duplicacy
```

报错：

```text
Failed to load the WebDAV storage at webdav: Maximum backoff reached
```

我换了其他 WebDAV 实现也一样，应该是 duplicacy 本身的问题，又看了一眼文档：WebDAV 还在 beta 阶段

#### 阿里云 OSS

那我再试试直接备份到 OSS 吧：

```bash
duplicacy init -encrypt -storage-name oss share-bowen s3://hangzhou@oss-cn-hangzhou.aliyuncs.com/xxx-deep-archived/duplicacy
```

遇到了上面提到了“能备份但不能校验”的问题。如果你用的是标准储存或归档储存并开启直读，应该不会遇到这个错误。我就不再继续实验了，后面的流程和备份到本地是一样的：

#### 本地路径

提示：推荐使用下一节提到的 S3 协议代替本地路径，只需要更换 storage 终点即可。

```bash
# 初始化 storage 和 repository
duplicacy init -encrypt -storage-name dva -chunk-size 33554432 -max-chunk-size 67108864 share-bowen /mnt/user/backups/duplicacy
# [可选]配置忽略文件
duplicacy set -storage dva -filters /boot/config/plugins/user.scripts/scripts/duplicacyignore
# 备份
duplicacy backup -stats
# 检查备份
duplicacy list -files -chunks
```

测试一下在另一台设备上恢复：

```bash
mkdir Bowen
cd Bowen
# 初始化仓库时，会验证storage密码
duplicacy init -encrypt -storage-name dva share-bowen smb://bowen@10.7.21.2/backups/duplicacy
# 查看 revision number
duplicacy list
# 恢复版本为1的备份
duplicacy restore -r 1 -hash -ignore-owner -overwrite -delete -stats
# 查看恢复的文件
ls
```

官方推荐将不同 repositories 备份到同一个 storage，这样可以最大限度利用数据去重功能。

```bash
duplicacy init -encrypt -storage-name dva -chunk-size 33554432 -max-chunk-size 67108864 share-photos /mnt/user/backups/duplicacy
duplicacy set -storage dva -filters /boot/config/plugins/user.scripts/scripts/duplicacyignore
```

但我在实际操作中遇到了[这个错误](https://forum.duplicacy.com/t/runtime-out-of-memory-fatal-error-out-of-memory/6584)，有点像内存泄露，不过没关系，也就初始化的时候报错，多跑几次就行了，后面增量备份没有问题。

下面是我的定时任务脚本

```bash
#!/bin/bash

export DUPLICACY_DVA_PASSWORD=xxx

cd /mnt/user/Bowen
duplicacy backup -stats -storage dva
duplicacy prune -keep 0:360 -keep 30:180 -keep 7:30 -keep 1:7

cd /mnt/user/Photos
duplicacy backup -stats -storage dva
duplicacy prune -keep 0:360 -keep 30:180 -keep 7:30 -keep 1:7

export RCLONE_EXCLUDE_FROM=/boot/config/plugins/user.scripts/scripts/rcloneignore
export RCLONE_BWLIMIT="08:00,3M:off 01:00,off"
# sync 只修改远程, bisync 才是双向同步
# copy 只增加远程
rclone --checksum sync /mnt/user/backups/duplicacy alist:/189cloud/duplicacy --progress
```

#### S3 协议

AList 最近新增了 S3 Server（rclone 也有这个功能，我才知道），强烈推荐。所有操作和上面一节一样，把备份终点换成 AList 的终点，即：

```bash
duplicacy init -encrypt -storage-name alist-s3 -chunk-size 33554432 -max-chunk-size 67108864 share-bowen minio://189cloud@10.7.21.2:15246/189cloud/duplicacy
# 或者添加一个新 storage：
duplicacy add -encrypt -chunk-size 33554432 -max-chunk-size 67108864 -copy dva alist-s3 share-bowen minio://189cloud@10.7.21.2:15246/189cloud/duplicacy
```

定时任务脚本：

```bash
#!/bin/bash

export DUPLICACY_ALIST_S3_PASSWORD=xxx
export DUPLICACY_ALIST_S3_S3_ID=xxx
export DUPLICACY_ALIST_S3_S3_SECRET=xxx

cd /mnt/user/Bowen
duplicacy backup -stats -storage alist-s3 # -dry-run
duplicacy prune -keep 0:360 -keep 30:180 -keep 7:30 -keep 1:7

cd /mnt/user/Photos
duplicacy backup -stats -storage alist-s3
duplicacy prune -keep 0:360 -keep 30:180 -keep 7:30 -keep 1:7
```

用了几个月后，duplicacy 出现了 404 NoSuchKey 的错误，也没搜到，懒得反馈了，转头试用一下 Kopia：

### Kopia

直接安装 Docker 版，我启动的时候报错找不到 htpasswd 文件，手动生成一个就好了。

进入 WebUI，虽然不够精致，但逻辑非常清晰，配置项细节非常多，比 duplicati 强多了。

备份很多照片也没报错。
