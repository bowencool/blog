---
pubDatetime: 2022-08-14T07:55:35Z
modDatetime: 2024-10-31T03:15:48Z
title: 使用 RClone 实现 unRAID 的异地容灾
featured: true
permalink: offsite-disaster-recovery-for-unraid-with-rclone
originalUrl: https://github.com/bowencool/blog/issues/18
tags:
  - nas
  - unRAID
  - hacks
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
$RECYCLE.BIN/**
.Trash/**
lost+found/**
tmp/**
temp/**
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

## 加密备份

### 为什么？

国内所有网盘（OSS 也一样）都有隐私和审查问题，网盘都会抹掉照片 EXIF 里面的位置信息，而且有被和谐的风险（不管你有没有公开分享，全都要接受审查）。

### 上手

```text
# 添加一个新 remote storage；输入名称（以 secret 为例）
name> secret
# 类型选择 `crypt`
Storage> crypt
# 选择一个已经存在的 remote 及路径作为新的 remote 的根目录
remote> oss:/mybackup
# 选择文件名的混淆方式（默认值 standard 有文件名长度限制，推荐 obfuscate）
filename_encryption> obfuscate
# 是否混淆目录名
directory_name_encryption> true
# 用来加密的密码
Enter the password:
password:
Confirm the password:
password:
# 密码或口令用于加盐。（可选但建议使用。应与之前的密码不同。我是随机生成的，保存好配置用的时候粘贴配置即可）
y/g/n> g
```

新的 remote 的使用方法和其他 remote 一样：

```bash
# 加密备份到 oss:/mybackup/Photos
rclone sync /mnt/user/Photos secret:/Photos

# 直接查看文件，你会发现，文件名已经混淆，直接下载文件也无法直接读取其内容
rclone lsf --max-depth 1 oss:/mybackup/Photos

# 通过 secret: 查看/下载真实目录及文件。
rclone lsd secret:/Photos
rclone copy secret:/Photos ~/MyPhotos
```

第一次设置好后，以后就可以随意粘贴并修改配置文件：

```text
[secret]
type = crypt
remote = alist:/adrive/backup
password = *** ENCRYPTED ***
password2 = *** ENCRYPTED ***
```

## 此方案的不足

- 会造成大量 OSS 请求数，产生额外费用
- 没有版本历史
- 没有压缩
- 没有优化重复文件

若想进一步优化请看[这篇文章](/zh/posts/how-to-encrypt-backup-your-data-on-your-nas)。

## 储存终点的选择

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

#### [冷归档存储](https://help.aliyun.com/zh/oss/user-guide/overview-53)相对来说最划算：

[储存价格非常低(0.015 元/GB/月)](https://www.aliyun.com/price/product#/oss/detail/oss)。

深度冷归档虽然储存价格更低，但 PUT 请求费用贵了 35 倍！（实测并不是上传一个文件就是一个 PUT 请求，实际统计比上传文件数要多）

不需要关心数据取回费用，平时用不到，真用到的时候，再贵也值得。

### 其他

欢迎补充。
