---
pubDatetime: 2022-08-13T07:16:50Z
modDatetime: 2023-12-08T07:20:10Z
featured: true
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

# 文件共享功能的使用

- 内网千兆的 SMB 网盘，几乎所有数码设备都原生支持。
  - 配合 OpenVPN 可以在外面访问。
  - 装一个 WebDAV 可以实现 HTTP 访问。_重要数据切勿暴露到外网_
  - 以 Mac OS Finder 为例：
    - 同一个局域网内，会收到广播，直接侧边栏寻找即可。
    - 如果没找到或者是在外面通过 VPN 访问，点击“前往 > 连接服务器”，根据协议输入 URL 即可在侧边栏找到
- 自带奇偶校验，随意一块硬盘坏了都可以直接用新硬盘恢复。大大提升容错性。
- 配合 RClone 定期备份到 xx网盘云盘 / OSS。
- 自带权限管理。
- 可以给 Mac 当 Time Machine 备份盘，全程无线备份，开启自动备份实现无感。
- 摄像头监控视频储存。

# 插件

## Community Applications

相当于 App Store

## Recycle Bin

回收站、废纸篓（仅当使用文件共享协议时生效）

## Unassigned Devices [plus]

阵列之外的未分配设备，比如 U 盘、移动硬盘等。

## Compose Manager

给 unRAID 添加 docker-compose 及管理面板。不能自定义图标就很烦。

## USB Manager

可以方便的管理 USB 设备，可以直接分配给虚拟机。轻度使用比硬件直通要方便。

## User Scripts

定时任务。我没用 crontab 的原因有两个：

1. 所有配置、脚步都在 Flash 备份范围内。（crontab 也可以通过文件的方式 `crontab ~/.crontab` 恢复）
2. 简单的可视化管理。

有些复杂的 cron 不生效，自己权衡一下吧。

## NerdTools

包管理器。目前安装了 vim、zsh、nodejs。

## Dynamix File Manager

直接在 unraid 后台管理页面上嵌一个文件管理器，有点作用，但不大。

## RClone

网盘同步工具，主要用来弥补缺失的异地容灾功能，参考[另一篇文章](./offsite-disaster-recovery-for-unraid-with-rclone)

## [WireGuard](https://unraid.net/blog/wireguard-on-unraid)（unRAID内置）

详情查看[这篇文章](./how-to-connect-to-the-home-intranet-from-outside)

# 虚拟机

## 软路由 OpenWrt

这个步骤需要买网卡硬件，然后直通给虚拟机，参考 B 站司波图的教程。

1. DDNS：用于将域名自动解析到正确的公网 IP，因为电信宽带的公网 IP 隔三差五就会变化，而且固定公网 IP 太贵了。
2. OpenClash + MosDNS：科学上网。
3. 其他插件我还没有精力、或者暂时没需求研究，比如广告屏蔽、流量管控等。

## OpenVPN

详情查看[这篇文章](./how-to-connect-to-the-home-intranet-from-outside)

因为 docker 版本已经不再维护，所以装到虚拟机了。

## ~~Windows 10~~

我已经是苹果全家桶用户了，~~所以需要虚拟机来运行一些 Windows 平台独占的软件。~~

~~我已经转为使用 Parallels Desktop 模拟 Window 环境了。~~

我又组了一台 PC 用来打游戏，哈哈哈。

# Docker

## MySql & Redis

基础设施。

## Nginx

> 为了方便自动更新证书，已经移动到虚拟机里。

用来

1. 分配域名代替 [IP]:[Port]
2. 统一处理 https
   1. 证书用 Certbot 申请的，官网上写需要 80 端口开放，我被误导了很久，用了好久的自签证书。详情请查看[无 80 端口情况下使用 CertBot 申请SSL证书](https://www.cnblogs.com/ellisonzhang/p/14298492.html)。
   2. 自动续期：主要是用 [SDK](https://next.api.aliyun.com/api-tools/sdk/Alidns?version=2015-01-09) 往 DNS 解析里添加/修改一条 TXT 记录。阿里云的 API 文档在[这里](https://help.aliyun.com/document_detail/29745.html) ，大概两三个小时开发完成，[代码在此](https://gist.github.com/bowencool/d0bce4bfb853c7ec1b1a4964e9371381)。

## Tailscale

详情查看[这篇文章](./how-to-connect-to-the-home-intranet-from-outside)

## ~~NextCloud~~

可以理解为私有部署的百度网盘、阿里云盘。

功能真的多，生态是真的丰富，不只是网盘。

小毛病有点多，强迫症已经卸载。

## MtPhotos

照片管理服务，吹爆，功能接近苹果相册，你也可以尝试 [Immich](https://github.com/immich-app/immich)

- 地图相册、场景识别、人脸识别、文本识别...
  - **在本地识别，支持使用 PC 硬件加速识别**
- 以文搜图，比如搜：湖
- 客户端功能完善
- 支持已有文件夹，可以通过 iCloudPD 同步到本地，用 MtPhotos 管理。（好处是全程无感自动备份，不需要打开任何 APP）
- 多用户支持

完爆国内所有网盘**（1.隐私及审查问题；2.会丢失 Exif 信息）**、 NextCloud、PhotoPrisma(操作反人类，没有多用户)、Pho、Xiaomi 相册。

## Gitea

轻量 git 服务，Gitlab 太重了。工具链（GitLens、Alfred、第三方客户端等）也比较完善。

## Bitwarden

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

## ~~Home Assistant~~

智能家居控制中心，可以把不同品牌的智能家居接到一起，举个例子，可以用 Siri 关米家的灯了。**体验不如米家**。

## ~~Syncthing~~

用来同步一些软件配置的，重点就是 Alfred 和 iTerm2 配置。之前用 NextCloud 同步，但 NextCloud 经常出问题所以换了。

同步和挂载的区别是：挂载是远程的文件，断开连接就没了。同步就是把你本地跟远程保持一致，断开也没啥影响。

Syncthing 和 rclone 的区别是：syncthing 是后台实时的、分布式的。rclone 是命令式的，单向的（双向同步还处于 BETA 阶段），类似 rsync，主要做网盘同步。

已经使用 rclone(crontab) + webdav 代替 Syncthing，原因如下：

1. Syncthing ignore 语法太非主流，而且 ignore 文件好像不会在各设备间同步。
2. 使用 Time Machine 恢复后，Syncthing 竟然还要手动重置一下 ID 才能用，真是自找麻烦。

## [WebDAV](https://hub.docker.com/r/bytemark/webdav)

如果你装了 Nextcloud 或 Alist，那就不需要装这个了。

和 SMB 差不多，WebDAV 是 HTTP 协议。有些第三方客户端支持 WebDAV 同步（Chrome 扩展程序居多），所以就装了一个。

## [aliyundrive-webdav](https://hub.docker.com/r/messense/aliyundrive-webdav)

如果你装了 Alist，那就不需要装这个了。

阿里云盘的 webDAV 实现，主要做备份用的。有缓存问题，问题不大。

## AList

Web 版的文件浏览器，功能非常多，比如支持网盘、同步、下载。

可以通过自带的 webdav 弥补 rclone 不支持的网盘类型，比如夸克网盘。

可以代替 Nginx(autoindex) 托管 Public 文件夹，以便分享给朋友。

我试了一下，权限这块我不太信任它。

## [OpenLDAP](https://hub.docker.com/r/osixia/openldap/) + [phpldapadmin](https://hub.docker.com/r/osixia/phpldapadmin/)

统一认证的。装的应用多了，改密码太费劲。

试过 FreeIPA，有个报错搜不到，放弃了。

目前已经接入了 OpenVPN 、Gitea。

## ~~Transmission~~

下载器，很久没用了。

## ~~[xware](https://hub.docker.com/r/caiguai/docker-xware)~~

迅雷远程下载。装了没用到。

## Aria2

22年底转为使用 [Aria2-Pro](https://p3terx.com/archives/docker-aria2-pro.html) + [AriaNg](https://p3terx.com/archives/aria2-frontend-ariang-tutorial.html) / [Aria2 Explorer](https://chrome.google.com/webstore/detail/mpkodccbngfoacfalldjimigbofkhgjn) 作为全协议下载器。

## Jellyfin

家庭影院服务。我的小核显有点吃力。对于普通人来说有点鸡肋，不如投屏方便。

## ~~[QingLong](https://hub.docker.com/r/whyour/qinglong)~~

也是定时任务，主要用来自动做京东的任务。

用过一段时间，每天大几百京豆入账，还是很香的。（2023.04: 已经薅不到多少羊毛了）

虽说不至于判个破坏计算机系统罪，但封号还是很有可能的，不用了。

## ~~Wiznot(为知笔记)e~~ / ~~Joplin~~

我最后还是决定用 IDE + Git 的方式代替这些笔记软件。我认为笔记软件做的再好，跟 IDE 比永远是小儿科。IDE 可以借助插件拥有无限可能，而且符合你的书写习惯。

## RSSHub + FreshRSS

我越来越依赖 RSS，很高效。

客户端的话 Mac / iOS 用 Reeder(付费) 或 NetNewsWire(开源免费)，安卓用 Feedme，全平台同步就很爽。

## ~~[DeepL Free API](https://hub.docker.com/r/zu1k/deepl)~~ [DeepLX](https://github.com/OwO-Network/DeepLX)

给 [Bob](https://bobtranslate.com/) 和[沉浸式翻译](https://immersivetranslate.com/)用的

# 下一步折腾计划

下面是我接下来想实现的玩法，如果你也有推荐的、更新的玩法，欢迎交流。

## 弃用光猫

最近换过一次光猫（新的电信光猫都是这样了），然后出现一个问题：域名是解析到光猫的，从公网访问正常，从内网却无法访问，之前是好的，也没找到原因，推测是光猫拦截了。目前手动在 OpenWrt 修改 host 记录勉强能用。有知道的欢迎留言。我想买一个光转电模块直接插在 NAS 上，但是好像又没必要。

优点：

1. 解决这个回环访问的问题
2. 略微增加带宽，预估 5%~10%
3. 不需要端口转发了

## 研究一下ZFS

Unraid 6.12 已经支持。

## 加密备份

Duplicacy / Duplicati

# 2022年12月更新

## OpenWrt 开启了 IPv6

[参考这篇文章](https://www.lategege.com/?p=676)，原因是居住环境是移动宽带，暂时没有公网 IP。

好处是：

1. 不需要端口转发了，直接解析到 Nginx。
2. ~~可以使用 443 和 80 端口了（不确定，反正我才用了几个星期就有问题了）~~。

缺点是：

1. IPv6 不够普及，要是公司的网络没有开启 IPv6 就没辙了。
2. 默认全部设备都会暴露到外网，这无疑增加了安全风险。
3. 少数运营商（比如安徽移动）对 IPv6 的解析不够稳定。
4. 调试复杂且坑多，我经历过两个不那么明显的坑：
   1. OpenWrt 记得去防火墙开启 MSS 钳制
   2. 光猫老旧也会引起卡顿，可以直接让运营商上门换新的

## 通过 IPv6 访问内网服务

最终形态：DDNS(IPv6) 直接指向 Nginx，Nginx 再转发给内网 IPv4 服务（Docker 容器）。我现在又有公网 IPv4 了，双栈解析。

可以看下[这个帖子](https://www.v2ex.com/t/488116)及里面提到的链接。
