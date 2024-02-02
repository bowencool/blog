---
pubDatetime: 2024-02-02T08:30:35Z
modDatetime: 2024-02-02T09:34:23Z
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
- If synced to a cloud drive, all location information in EXIF will be erased for domestic cloud drives.
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

</details>

## Practical Experience

### Duplicati

The first tool I experienced was Duplicati. The Docker installation was very simple, and the GUI was also very easy to use. I won't go into detail about it.

### Duplicacy

Next, let's document the exploration process of Duplicacy.

#### To WebDAV:

With the above experience, let's go ahead and set the backup endpoint directly to WebDAV

```
duplicacy init -encrypt -storage-name adrive share-bowen webdav://bowen@10.7.21.2:48080/duplicacy
```

Error:

```
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

But I encountered [this error](https://forum.duplicacy.com/t/runtime-out-of-memory-fatal-error-out-of-memory/6584) in practice, to be continued.
