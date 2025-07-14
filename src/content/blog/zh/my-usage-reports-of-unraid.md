---
pubDatetime: 2022-08-13T07:16:50Z
modDatetime: 2025-07-14T21:28:33.000+08:00
title: 我的 unRAID 使用报告
permalink: my-usage-reports-of-unraid
originalUrl: https://github.com/bowencool/blog/issues/17
collapseDepth: 1
tags:
  - unRAID
  - nas
  - self-host
description: unRAID 是一个家用 NAS 系统，也是我第一次接触 NAS，因为有朋友在用，所以也没考虑其他 NAS 系统。稳定运行好多年了，体验极好，特此记录，以便分享。
---

unRAID 是一个家用 NAS 系统，也是我第一次接触 NAS，因为有朋友在用，所以也没考虑其他 NAS 系统。稳定运行好多年了，体验极好，特此记录，以便分享。

## 文件共享功能的使用

- 内网 2.5Gpbs 的 SMB 网盘，几乎所有数码设备都原生支持。
  - [配合 OpenVPN/Tailscale/WireGuard/Frp 等在外面访问](/zh/posts/how-to-connect-to-the-home-intranet-from-outside)。
  - 装一个 [WebDAV](https://github.com/hacdias/webdav) 实现 HTTPS 访问。_重要数据切勿暴露到外网_
  - 以 Mac OS Finder 为例：
    - 同一个局域网内，会收到广播，直接侧边栏寻找即可。
    - 如果没找到或者是在外面通过 VPN 访问，点击“前往 > 连接服务器”，根据协议输入 URL 即可在侧边栏找到
- 自带奇偶校验(RAID5)，随意一块硬盘坏了都可以直接用新硬盘恢复。大大提升容错性。
- [定期使用 RClone 进行加密备份到网盘/云盘/OSS。](/zh/offsite-disaster-recovery-for-unraid-with-rclone)
- 自带权限管理。
- 可以给 Mac 当 Time Machine 备份盘，全程无线备份，开启自动备份实现无感。
- 摄像头监控视频储存。

## 插件

### Community Applications

相当于 App Store

### Recycle Bin

回收站、废纸篓（仅当使用文件共享协议时生效）

### Unassigned Devices [plus]

阵列之外的未分配设备，比如 U 盘、移动硬盘等。

### Compose Manager

给 unRAID 添加 docker-compose 及管理面板。

### USB Manager

可以方便的管理 USB 设备，可以直接分配给虚拟机。轻度使用比硬件直通要方便。

### User Scripts

定时任务。对比 crontab 多了简单的 UI 和日志管理。但是有些复杂的 cron 表达式不生效，不太推荐。

### RClone

网盘同步工具，主要用来弥补缺失的异地容灾功能，参考[另一篇文章](/zh/posts/offsite-disaster-recovery-for-unraid-with-rclone)

### [WireGuard](https://unraid.net/blog/wireguard-on-unraid)（unRAID内置）

详情查看[这篇文章](/zh/posts/how-to-connect-to-the-home-intranet-from-outside)

## 虚拟机

### OpenWrt

这个步骤需要买网卡硬件，然后直通给虚拟机，参考 B 站司波图的教程。

1. DDNS：用于将域名自动解析到正确的公网 IP，因为国内宽带的公网 IP 隔三差五就会变化，而且固定公网 IP 太贵了。
2. OpenClash + MosDNS：科学上网。
3. 其他插件我懒得研究，比如广告屏蔽、流量管控等。

### ~~Windows 10~~

我已经是苹果全家桶用户了，~~所以需要虚拟机来运行一些 Windows 平台独占的软件。~~

~~我已经转为使用 Parallels Desktop 模拟 Window 环境了。~~

我又组了一台 PC 用来打游戏，哈哈哈。

### Ubuntu

安装 shairport-sync + snapcast 实现多房间（全屋）音响系统。 airplay2 方案已经实现，但我还想支持 windows 和安卓，仍在探索阶段。

选 Ubuntu 的原因：

1. 安装 Docker 版本的 shairport-sync 后，苹果设备无法找到它。
2. snapcast 文档仅仅说明了通过 stdout 把 shairport-sync 设置为音源，我不知道如何通过 Docker container 做到这一点，也许通过网络？
3. snapcast 在 Ubuntu 上可以直接装，CentOS 还要自己编译，如果能解决第二点，Docker 版也挺方便。

## Docker

### MySql & Redis

基础设施。

### Nginx + [certd](https://github.com/certd/certd)/~~[certimate](https://github.com/usual2970/certimate)~~

1. 分配域名代替 [IP]:[Port]
2. 统一处理 https 证书和 CORS 等等常见配置，专业的事情交给专业的软件。

### Tailscale / Frpc

详情查看[这篇文章](/zh/posts/how-to-connect-to-the-home-intranet-from-outside)

### MtPhotos

照片管理服务，功能接近苹果相册，你也可以尝试 [Immich](https://github.com/immich-app/immich)

- 地图相册、场景识别、人脸识别、文本识别...
  - **在本地识别，支持使用 PC 硬件加速识别**
  - 人脸识别效果一言难尽，虽然可以用 deepface，但效果也是很一般。
- 以文搜图，比如搜：湖
- 客户端~~功能完善~~
  - 仅支持 copy，缺少 rclone 那样的 sync 功能
  - 缺少“仅同步指定时间范围”功能，发邮件问了两遍，答复都是“没有开发计划”
- 多用户支持
- 支持已有文件夹原地管理，不会更改目录结构（这一点我很喜欢，Immich 是不支持的）
  - 可以搭配 iCloudPD 同步到本地，用 MtPhotos 管理。（好处是全程无感自动备份，不需要打开任何 APP）
- 支持编辑照片的拍摄时间、位置信息（直接写入文件 Exif，整理老照片非常有用）

完爆所有国内网盘**（1.隐私及审查问题；2. Exif 信息会被修改）**、 NextCloud、PhotoPrisma(操作反人类，没有多用户)、Pho。

具体策略请查看[这篇文章](/zh/posts/how-do-i-manage-my-photos)。

### Gitea

轻量 git 服务，Gitlab 太重了。

### Bitwarden

跨平台密码管理工具，覆盖主流浏览器、Android、iOS、Mac 等，也支持命令行、Alfred。也可以记一些银行卡、地址表单等。

Chrome、iCloud 很好，但不能跨平台。

> 2022-08-15：今天看了个帖子，大家感受一下吧：[chrome 密码泄漏了， 才知道用 chrome 保存密码等于裸奔](https://www.v2ex.com/t/872745)

1Password 是密码管理服务天花板，但密码还是非常隐私的数据，自己权衡吧。

EnPass 也能私有部署但功能太简陋了。

我的密码使用原则是：

1. 能开二次验证的平台全部开启，二次验证比密码安全多了。
2. **不要把二次验证和密码放一起**，不要把鸡蛋放到同一个篮子里。
3. 二次验证的二维码（key）、恢复代码非常重要，要自己保留一份或多份到最安全的地方。（我之前丢过一个阿里云的 key，到现在账号也找不回来，申诉也没用，只能新注册一个。）

tips: Authenticator 放在手表上非常合适，不用找手机，~~微软家的 Authenticator 支持 iCloud 同步~~，salesforce 家的 Authenticator 支持 Apple Watch 上查看。用了一圈，强烈推荐 2FAS Auth，近期已经开源，就差 Apple Watch 功能发布了

### Home Assistant

智能家居控制中心，可以把不同品牌的智能家居接到一起，举个例子，可以用 Siri 关米家的灯了。**我的评价是可玩性高，自定义强，但并不值得耗费这么大的精力，非常折腾，不如直接用米家**。[米家官方插件](https://github.com/XiaoMi/ha_xiaomi_home)正在频繁更新，期待它成熟的那一天。

### ~~NextCloud~~

可以理解为私有部署的百度网盘、阿里云盘。

功能真的多，生态是真的丰富，不只是网盘。

小毛病有点多，强迫症已经卸载。

### Seafile

评论区推荐的，已经用上了。

### ~~Syncthing~~

用来同步一些软件配置的，重点就是 Alfred 和 iTerm2 配置。之前用 NextCloud 同步，但 NextCloud 经常出问题所以换了。

同步和挂载的区别是：挂载是远程的文件，断开连接就没了。同步就是把你本地跟远程保持一致，断开也没啥影响。

Syncthing、Seafile 和 rclone 之间的区别在于：Syncthing 是后台实时运行且分布式的。Seafile 同样支持后台实时同步，但需要一个服务器，类似于 NextCloud 或 OneDrive。rclone 则是基于命令操作的，并且默认为单向同步（其双向同步功能还处于测试阶段），类似于 rsync，主要用于网盘同步和备份等任务，通常与定时任务一起使用。

我已经放弃 Syncthing，原因如下：

1. Syncthing ignore 语法太非主流，而且 ignore 文件不会在各设备间同步。
2. 使用 Time Machine 恢复后，Syncthing 竟然还要手动重置一下 ID 才能用，真是自找麻烦。

### ~~AList~~ OpenList

Web 版的文件浏览器，功能非常多，比如支持网盘、同步、下载。

它可以通过自带的 webdav 弥补 rclone 不支持的网盘类型，比如夸克网盘。

它可以通过自带的 s3 解决一些小众软件比如 duplicacy 不支持 WebDAV 的问题，比如[这个帖子](/zh/posts/how-to-encrypt-backup-your-data-on-your-nas/)。

它可以代替 Nginx(autoindex) 托管 Public 文件夹，以便分享给朋友，或者让朋友直接上传。

而且它的 WebDAV 协议没有实现 PROPFIND 方法，会导致 Tampermonkey 无限循环。

我之前试过它的权限管理，下载链接没有鉴权...我不太信任它。

### [WebDAV](https://github.com/hacdias/webdav)

如果你装了 Nextcloud 或 OpenList，那就不需要装这个了。

和 SMB 差不多，WebDAV 是 HTTP 协议。有些第三方客户端支持 WebDAV 同步（Chrome 扩展程序居多），所以就装了一个。

### [aliyundrive-webdav](https://hub.docker.com/r/messense/aliyundrive-webdav)

如果你装了 OpenList，那就不需要装这个了。

阿里云盘的 webDAV 实现，主要做备份用的。有缓存问题，问题不大。

### ~~[OpenLDAP](https://hub.docker.com/r/osixia/openldap/) + [phpldapadmin](https://hub.docker.com/r/osixia/phpldapadmin/)~~

> 不值得折腾。直接 Bitwarden/1Password 生成随机密码更省事。

统一认证的。装的应用多了，改密码太费劲。

试过 FreeIPA，有个报错搜不到，放弃了。

目前已经接入了 OpenVPN 、Gitea。

### ~~Transmission~~

下载器，很久没用了。

### ~~[xware](https://hub.docker.com/r/caiguai/docker-xware)~~

迅雷远程下载。装了没用到。

### Aria2

22年底转为使用 [Aria2-Pro](https://p3terx.com/archives/docker-aria2-pro.html) + [AriaNg](https://p3terx.com/archives/aria2-frontend-ariang-tutorial.html) / [Aria2 Explorer](https://chrome.google.com/webstore/detail/mpkodccbngfoacfalldjimigbofkhgjn) 作为全协议下载器。

### [MeTuBe](https://github.com/alexta69/metube)

一键下载各种网站视频，类似于 Downie。我偶尔用它来下载音乐。

### Stirling-PDF

PDF 的各种操作。使用频率非常低，只用过一次签名。也有很多免费的在线版，但安全/隐私没保障。

### Jellyfin

家庭影院服务。我的小核显有点吃力。对于普通人来说有点鸡肋，不如投屏方便。

但是，我最近用它[自建了音乐流媒体](/zh/posts/self-host-music-streaming-service)，还是很爽的。

### ~~[QingLong](https://hub.docker.com/r/whyour/qinglong)~~

也是定时任务，主要用来自动做京东的任务。

用过一段时间，每天大几百京豆入账，还是很香的。（2023.04: 已经薅不到多少羊毛了）

虽说不至于判个破坏计算机系统罪，但封号还是很有可能的，不用了。

### ~~Wiznot(为知笔记)e~~ / ~~Joplin~~ / ~~AppFlowy~~ / Docmost

我最后还是决定用 IDE + Git 的方式代替这些笔记软件。我认为笔记软件做的再好，跟 IDE 比永远是小儿科。IDE 可以借助插件拥有无限可能，而且符合你的书写习惯。

有多端同步需求的话，可以考虑 Obsidian，无需注册，直接打开 iCloud 文件夹即可。而且电脑上仍然可以使用 IDE 编辑。这一点 Joplin 不太方便，因为它的目录结构不是人类可读的。

### FreshRSS + RSSHub + [WeWeRSS](https://github.com/cooderl/wewe-rss)

我越来越依赖 RSS，在一个地方获取所有信息，很高效，而且不会被推荐算法裹挟。有个缺点就是信息太多了，根本看不完，哈哈，即使只看标题，也很浪费时间。

RSSHub 将各种原本不支持 RSS 的网站转化成 RSS，比如 Bilibili、知乎、微博、小红书、Twitter、Telegram...

WeWeRSS 专注于将微信公众号转成 RSS。

FreshRSS 的作用是全平台同步以及精细化管理，不是必须的，但推荐使用。正常情况下 RSS 客户端可以直接添加订阅，也可以登录到 FreshRSS。这个服务有个竞品叫 TTRSS，也是支持 self-host 的。

客户端的话 Mac / iOS 用 Reeder(付费) 或 NetNewsWire(开源免费)，安卓用 Feedme，全平台同步就很爽。

### ~~[DeepL Free API](https://hub.docker.com/r/zu1k/deepl)~~ [DeepLX](https://github.com/OwO-Network/DeepLX)

给 [Bob](https://bobtranslate.com/) 和[沉浸式翻译](https://immersivetranslate.com/)用的

### ~~Duplicacy / Duplicati / Kopia~~

~~查看[这篇文章](/zh/posts/how-to-encrypt-backup-your-data-on-your-nas)~~

各有各的毛病，只有 rlcone 最稳定，查看[这篇文章](/zh/posts/offsite-disaster-recovery-for-unraid-with-rclone)。

## 下一步折腾计划

下面是我接下来想实现的玩法，如果你也有推荐的、更新的玩法，欢迎交流。

### ~~弃用光猫~~

~~最近换过一次光猫（新的电信光猫都是这样了），然后出现一个问题：域名是解析到光猫的，从公网访问正常，从内网却无法访问，之前是好的，也没找到原因，推测是光猫拦截了。目前手动在 OpenWrt 修改 host 记录勉强能用。有知道的欢迎留言。我想买一个光转电模块直接插在 NAS 上，但是好像又没必要。~~

优点：

1. 解决这个回环访问的问题
2. 略微增加带宽，预估 5%~10%
3. 不需要端口转发了

没必要折腾：需要猫棒来仿冒光猫；而且光猫也有网络保护的作用。

## 2022年12月更新

### OpenWrt 开启了 IPv6

[参考这篇文章](https://www.lategege.com/?p=676)，原因是居住环境是移动宽带，暂时没有公网 IP。

好处是：

1. 不需要端口转发了，直接解析到 Nginx 所在的虚拟机。
2. ~~可以使用 443 和 80 端口了（不确定，反正我才用了几个星期就有问题了）~~。

缺点是：

1. IPv6 不够普及，要是公司的网络没有开启 IPv6 就没辙了。
2. 默认全部设备都会暴露到外网，这无疑增加了安全风险。
3. 少数运营商（比如安徽移动）对 IPv6 的解析不够稳定。
4. 调试复杂且坑多，我经历过两个不那么明显的坑：
   1. OpenWrt 记得去防火墙开启 MSS 钳制
   2. 光猫老旧也会引起卡顿，可以直接让运营商上门换新的

### 通过 IPv6 访问内网服务

最终形态：DDNS(IPv6) 直接指向 Nginx，Nginx 再转发给内网 IPv4 服务（Docker 容器）。

可以看下[这个帖子](https://www.v2ex.com/t/488116)及里面提到的链接。

## 2025年7月更新

### 迁移到 ZFS

> 为什么？因为现在阵列写入会掉速，无论什么系统，甚至用插线挂载拷贝也掉速，以前没什么感觉，现在开始剪视频了，素材动辄几十G，阵列性能太拖后腿了。

本来打算组个 RAIDZ1 的，偶然间看到了一个不组 RAID 的思路。一下子有点醍醐灌顶，为什么要坚持所有数据都有冗余呢？没有必要啊，只需要把重要数据放到 ZFS 里保护起来不就行了，那些电影电视剧啥的丢就丢了吧，又占地方、又拖慢(老阵列)性能、访问频率还贼低、占着硬盘搁那费电，完全没必要啊，单独放在特定的硬盘里，平时不用的时候还能休眠，应该早点醒悟的。

我的重要数据+高频访问的也就 1T 不到，无非就是照片、视频、文稿、系统数据、应用数据，再加上游戏截图和录屏，撑死 2T 了。未来增速也确定很缓慢，最终放弃 RAIDZ1，拿两块4T盘组了个 ZFS Mirror，在安全、性能、快照、压缩、去重，全面吊打其他阵列！还有 OSS 异地加密备份，无敌！其他的硬盘用来放不重要的影视资源了，并且取消了校验盘，释放了硬盘本该有的性能。由于访问频率低，我还设置了自动休眠，节省电费，提高硬盘寿命。我真是个天才！
