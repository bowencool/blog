---
pubDatetime: 2024-02-02T08:30:35Z
modDatetime: 2024-02-02T08:44:21Z
title: 如何加密备份你的 NAS 数据
featured: true
permalink: how-to-encrypt-backup-your-data-on-your-nas
tags:
  - nas
  - unRAID
  - tricks
  - backup
  - data-security
  - automation
description: 之前我们讲过如何用 RClone 将你的数据备份到云盘/OSS等远程存储服务，但是直接使用 RClone 这种方式太过直白，毫无隐私可言，而且备份没有版本。这期我们来聊聊加密备份。
---

## RClone 的缺点

之前我们讲过[如何用 RClone 将你的数据备份到云盘/OSS等远程存储服务](/zh/posts/offsite-disaster-recovery-for-unraid-with-rclone)，但 RClone 直接 sync 有这么几个缺点：

- 没有加密，所有网盘都有隐私和审查问题，OSS 也一样
- 如果同步到网盘的话，国内所有网盘都会抹掉EXIF里面的位置信息
- 会造成大量 OSS 请求数，产生额外费用

当然也有一些改进点：

- 历史版本
- 压缩/去重冗余

## 加密备份工具的对比

偶然间听到了以下几个加密备份工具。它们都可以实现：

- 加密备份（到远程或本地）
- 智能版本策略
- 自动切割成固定尺寸的 chunks
- 支持增量备份。

可以看看[这个帖子](https://forum.duplicati.com/t/duplicati-vs-duplicacy-vs-kopia-vs-vorta/14493)

### [Duplicati](https://github.com/duplicati/duplicati)

- GUI 易上手
- 默认最佳版本策略
- 但数据库易损坏？

#### 阿里云 OSS

官方不支持，自己魔改太麻烦，而且增加了不确定性。

#### WebDAV

支持 WebDAV。那我们很快就想到先把云盘/OSS转成 WebDAV（我用的是 AList），再用它备份到 WebDAV。我尝试了一下：

##### WebDAV => OSS

可行。

##### WebDAV => adrive

可行。

#### RClone

可行。

### [Duplicacy](https://github.com/gilbertchen/duplicacy)

加强版 Duplicati，它拥有最强的备份功能（[它自己和竞品做了比较](https://github.com/gilbertchen/duplicacy?tab=readme-ov-file#comparison-with-other-backup-tools)），简单提几个要点：

- 数据去重功能，可以节省不少储存空间。（有点像 Git、Seafile，好像 ZFS 也有这个功能）
- 多个仓库可以共享一个存储，最大限度利用数据去重功能。
- 同时备份到多个储存。
- 并非采用固定大小，而是平均大小，这样仅修改少部分文件的时候会比较节省空间和时间。
- 备份文件有损坏的话，仅相关文件受到影响，不会影响整个目录。
- 更活跃的开发团队、更少的负面消息。
- 命令行版免费，Web GUI 不免费。

### [Kopia](https://github.com/kopia/kopia/)

优点也有很多，但它还在 beta 阶段，这次就不详细说了

## 储存终点的选择

### 国内云盘

- 有限速问题
- ~~储存容量并不划算~~我有NAS了，根本不想掏钱买网盘（你说巧不巧，在写这篇文章的时候，电信送了我4个T的天翼云盘，那就它了）
- 本期虽然讲加密备份，但非加密备份（比如 rclone sync）的缺点也列一下：
  - 隐私和审查问题
  - EXIF 信息会被胡乱涂改

### 阿里云 OSS

[深度冷备份](https://help.aliyun.com/zh/oss/user-guide/overview-53)相对来说最划算：

- [储存价格非常低](https://www.aliyun.com/price/product#/oss/detail/oss)
- 请求费用非常高。
- 数据不能直接读取，实际操作下来并不适合加密工具直接备份，因为备份校验的过程需要读取文件。
  - 当然也可以换成归档储存并开启直读，那这样价格就高了点，不太推荐。
  - 有个标准储存体验资源包，一年 9 块，40G 储存容量，但超出就不划算了，早晚会超出的，不推荐。
  - 先备份到本地磁盘，再用 RClone 把备份文件 sync 上去。这样会占用不少本地磁盘空间，把 chunkSize 设置大一点，这样请求次数就降下来了，对于我来说，重要文件都是小文件，不会太大，大文件几乎都是可以重新下载的资源，没有备份的需求。矮子里面挑高个，算是目前~~最佳~~最便宜的方案了。

### 其他

欢迎补充。

## 实战

### Duplicati

我最先体验的是 Duplicati，Docker 安装，非常简单，GUI 也非常容易上手，就不再赘述了。

### Duplicacy

接下来记录一下 Duplicacy 的探索过程：

#### WebDAV:

有了上面的经验，我们来直接把备份终点设为 WebDAV

```
duplicacy init -encrypt -storage-name adrive share-bowen webdav://bowen@10.7.21.2:48080/duplicacy
```

报错：

```
Failed to load the WebDAV storage at webdav: Maximum backoff reached
```

我换了其他 WebDAV 实现也一样，应该是 duplicacy 本身的问题，又看了一眼文档：WebDAV 还在 beta 阶段

#### 阿里云 OSS:

那我再试试直接备份到 OSS 吧：

```bash
duplicacy init -encrypt -storage-name oss share-bowen s3://hangzhou@oss-cn-hangzhou.aliyuncs.com/xxx-deep-archived/duplicacy
```

遇到了上面提到了“能备份但不能校验”的问题。如果你用的是标准储存或归档储存并开启直读，应该不会遇到这个错误。我就不再继续实验了，后面的流程和备份到本地是一样的：

#### local disk

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

但我在实际操作中遇到了[这个错误](https://forum.duplicacy.com/t/runtime-out-of-memory-fatal-error-out-of-memory/6584)，未完待续。
