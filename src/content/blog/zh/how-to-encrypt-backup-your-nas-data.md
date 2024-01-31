---
pubDatetime: 2022-08-14T07:55:35Z
modDatetime: 2024-01-17T17:01:50Z
title: 如何加密备份你的 NAS 数据
featured: true
draft: true
permalink: how-to-encrypt-backup-your-nas-data
originalUrl: https://github.com/bowencool/blog/issues/18
tags:
  - nas
  - unRAID
  - tricks
  - backup
  - data-security
  - automation
description: 之前我们讲过如何用 rclone 将你的数据备份到云盘/OSS等远程存储服务，但是直接使用 rclone 这种方式太过直白，毫无隐私可言，而且备份没有版本。这期我们来聊聊加密备份。
---

## rclone 的缺点

之前我们讲过[如何用 rclone 将你的数据备份到云盘/OSS等远程存储服务](/zh/posts/offsite-disaster-recovery-for-unraid-with-rclone)，但 rclone 有这么几个缺点：

- 没有加密，所有网盘都有隐私和审查问题，OSS 也一样
- 如果同步到网盘的话，国内所有网盘都会抹掉EXIF里面的位置信息
- 会造成大量 OSS 请求数，产生额外费用

当然也有一些改进点：

- 历史版本
- 压缩/去重冗余

## Duplicati:

偶然间听到了 Duplicati。它可以实现把数据加密备份到云盘/OSS等远程存储服务，自带版本管理，并且可以自动切割成固定尺寸的小文件块。

它也可以备份到本地路径，但本地中转太占空间了，理想情况就是直接备份到云。阿里云 oss [深度冷备份](https://help.aliyun.com/zh/oss/user-guide/overview-53)就比较合适，因为它的[价格非常低](https://www.aliyun.com/price/product#/oss/detail/oss)。

### aliyun oss

官方不支持 ，自己魔改太麻烦，而且增加了不确定性。

### webdav

支持 WebDAV。那我们很快就想到先把云盘/OSS转成 WebDAV（我用的是 AList），再用它备份到 WebDAV。我尝试了一下：

#### webdav => oss

能上传但不能校验，因为是[深度冷归档](https://help.aliyun.com/zh/oss/user-guide/overview-53)数据，不能直接读取文件校验。

#### webdav => adrive

可行。但我的 adrive 只有 100G，开会员不如 oss 划算

### rclone

它也可以备份到 rclone，但此时我得知它的数据库容易报废，就懒得试了

## Duplicacy:

我知道 Duplicati 的缺点后，搜到了竞品 Duplicacy，可以算是加强版了，它拥有最强的备份功能（它自己和竞品做了比较），更活跃的开发团队、更少的负面消息。命令行版免费，Web GUI 不免费

### webdav:

有了上面的经验，我们来直接把备份终点设为 WebDAV

```
duplicacy init -encrypt -storage-name adrive share-bowen webdav://bowen@10.7.21.2:48080/duplicacy
```

报错：

```
Failed to load the WebDAV storage at webdav: Maximum backoff reached
```

我换了其他 WebDAV 实现也一样，应该是 duplicacy 本身的问题，又看了一眼文档：WebDAV 还在beta阶段

### aliyun oss:

那我再试试直接备份到 OSS 吧：

```bash
duplicacy init -encrypt -storage-name oss share-bowen s3://hangzhou@oss-cn-hangzhou.aliyuncs.com/xxx-deep-archived/duplicacy
```

也报错了：

```
Failed to download the configuration file from the storage: InvalidObjectState: The operation is not valid for the object's state
```

这个错误同样是[存储类型](https://help.aliyun.com/zh/oss/user-guide/overview-53)造成的，解决方案：

- 换成归档储存并开启直读就可以了。但是这样[价格就贵了](https://www.aliyun.com/price/product#/oss/detail/oss)。
- TODO：先备份到本地路径，再 rclone 到 oss。也不是不行，对于我来说，重要文件都是小文件，不会太大，大文件几乎都是可以重新下载的资源，没有备份的需求。

## Kopia

还在 beta，个人维护？不敢试

> https://forum.duplicati.com/t/duplicati-vs-duplicacy-vs-kopia-vs-vorta/14493
