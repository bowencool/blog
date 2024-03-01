---
pubDatetime: 2024-02-02T08:30:35Z
modDatetime: 2024-03-01T04:14:51Z
title: How to encrypt backup your data on your nas
permalink: how-to-encrypt-backup-your-data-on-your-nas
tags:
  - nas
  - unRAID
  - tricks
  - backup
  - data-security
  - automation
description: We previously discussed how to use RClone to back up your data to cloud drives/OSS and other remote storage services. However, using RClone directly in this way is too straightforward, lacking any privacy and versioning for backups. In this issue, we will talk about encrypted backups.
---

## Cons of RClone

Previously, we discussed [How to use RClone to backup your data to cloud drives/storages](/posts/offsite-disaster-recovery-for-unraid-with-rclone), but there are several drawbacks to directly syncing with RClone:

- Lack of encryption, posing privacy and review issues for all cloud drives, including OSS.
- If photos are synchronized to the cloud drive, all domestic cloud drives will erase the location information in EXIF.
- It will generate a large number of OSS requests, resulting in additional fees.

Of course, there are also some areas for improvement:

- Version history
- Compression/deduplication

## Comparison of Encryption Backup Tools

I recently came across several encryption backup tools that can all achieve the following:

- Encrypted backups (to remote or local storage)
- Intelligent versioning strategies
- Automatic splitting into fixed-size chunks
- Support for incremental backups.

You can take a look at [this post](https://forum.duplicati.com/t/duplicati-vs-duplicacy-vs-kopia-vs-vorta/14493)

### [Duplicati](https://github.com/duplicati/duplicati)

- GUI easy to use
- The best versioning policy is used by default
- But is the database easily damaged?

### [Duplicacy](https://github.com/gilbertchen/duplicacy)

Enhanced version of Duplicati, which boasts the most powerful backup features ([it has compared itself with competitors](https://github.com/gilbertchen/duplicacy?tab=readme-ov-file#comparison-with-other-backup-tools)), let me highlight a few key points:

- Data deduplication feature that can save a lot of storage space. (Similar to Git, Seafile, and it seems ZFS also has this feature)
- Multiple repositories can share one storage, maximizing the use of data deduplication.
- Backup one repository to multiple storages.
- Not using fixed size but average size, which saves space and time when only modifying a small part of files.
- If backup files are damaged, only relevant files are affected without impacting the entire directory.
- More active development team and fewer negative messages.
- Command line version is free while Web GUI is not free.

### [Kopia](https://github.com/kopia/kopia/)

It's also an excellent tool, but it's still in beta, so I won't go into detail this time around.

## Storage Endpoint Selection

<details>
  <summary>This section is for <b>Chinese readers only</b>, click to review</summary>

### 国内云盘

- （加密备份可解）EXIF 信息会被胡乱涂改，修改用户文件这点非常恶心
- （加密备份可解）隐私和审查问题，稍微敏感一点的内容会被无情封禁
- 2C 的产品非常不可靠
  - 不同程度的限速问题
  - 花里胡哨的营销
    - 阿里云盘各种非永久容量，太麻烦了
    - 夸克网盘故意不写容量到期时间
- ~~储存容量并不划算~~我有NAS了，根本不想掏钱买网盘，我宁愿买 OSS
  - 中国移动云盘、天翼云盘应该有一些优惠套餐，比如我在写这篇文章的时候，电信送了我4个T的天翼云盘有效期两年。登录看了一眼中国移动云盘，1T容量有效期一年

### 阿里云 OSS

2B 的产品，速度、稳定性、可用性全都超高，完爆网盘，不会有限制或者陷阱，明码标价。以下仅讨论最常用的阿里云 OSS，其他 S3/OSS 同理。

#### 标准储存

标准储存有几个活动挺划算的，没有坑：

- 体验资源包，一年 9 块，40G 储存容量，但超出就不划算了，这么小的容量根本不够用，不推荐。
- 500G 也做活动，一年 118，这个非常划算，比网盘便宜多了，容量也够用，强烈推荐。

#### [深度冷备份](https://help.aliyun.com/zh/oss/user-guide/overview-53)相对来说最划算：

- [储存价格非常低](https://www.aliyun.com/price/product#/oss/detail/oss)
- 请求费用非常高。
- 数据不能直接读取，实际操作下来并不适合加密工具直接备份，因为备份校验的过程需要读取文件。
  - 当然也可以换成归档储存并开启直读，那这样价格就高了点，不太推荐。
  - 先备份到本地磁盘，再用 RClone 把备份文件 sync 上去。这样会占用不少本地磁盘空间，把 chunkSize 设置大一点，这样请求次数就降下来了，对于我来说，重要文件都是小文件，不会太大，大文件几乎都是可以重新下载的资源，没有备份的需求。算是目前~~最佳~~最便宜的方案了。

</details>

## Practical Experience

### Duplicati

The first tool I experienced was Duplicati. The Docker installation was very simple, and the GUI was also very easy to use. I won't go into detail about it.

### Duplicacy

Next, let's document the exploration process of Duplicacy.

#### To WebDAV:

With the above experience, let's go ahead and set the backup endpoint directly to WebDAV

```bash
duplicacy init -encrypt -storage-name adrive share-bowen webdav://bowen@10.7.21.2:48080/duplicacy
```

Error:

```text
Failed to load the WebDAV storage at webdav: Maximum backoff reached
```

I tried another WebDAV implementation, and the issue remains the same. It should be a problem with duplicacy itself. I took another look at the documentation: WebDAV is still in beta.

#### To local disk

```bash
# Initialize storage and repository
duplicacy init -encrypt -storage-name dva -chunk-size 33554432 -max-chunk-size 67108864 share-bowen /mnt/user/backups/duplicacy
# [Optional] Configure the ignore file
duplicacy set -storage dva -filters /boot/config/plugins/user.scripts/scripts/duplicacyignore
# Backup
duplicacy backup -stats
# Check Backups
duplicacy list -files -chunks
```

Test restoring on another device:

```bash
mkdir Bowen
cd Bowen
# storage password will be checked when initializing the repo
duplicacy init -encrypt -storage-name dva share-bowen smb://bowen@10.7.21.2/backups/duplicacy
# check the revision numbers
duplicacy list
# restore the backup of version 1
duplicacy restore -r 1 -hash -ignore-owner -overwrite -delete -stats
# view recovered files
ls
```

It is officially recommended to back up different repositories to the same storage to maximize the use of the data de-duplication feature.

```bash
duplicacy init -encrypt -storage-name dva -chunk-size 33554432 -max-chunk-size 67108864 share-photos /mnt/user/backups/duplicacy
duplicacy set -storage dva -filters /boot/config/plugins/user.scripts/scripts/duplicacyignore
```

But I encountered [this error](https://forum.duplicacy.com/t/runtime-out-of-memory-fatal-error-out-of-memory/6584) in actual operation, which looks a bit like a memory leak, but it's okay, it only reports an error during initialization. Just run it a few more times and there will be no problem with the subsequent incremental backups.

Below is my scheduled task script

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
rclone --checksum sync /mnt/user/backups/duplicacy alist:/189cloud/duplicacy --progress
```
