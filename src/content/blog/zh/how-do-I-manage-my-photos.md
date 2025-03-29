---
pubDatetime: 2024-09-15T17:03:46.000+08:00
modDatetime: 2025-03-29T11:19:44Z
title: 我是如何管理我的照片的
permalink: how-do-i-manage-my-photos
featured: false
tags:
  - self-host
description: 随着照片越来越多，iCloud、MiCloud 已经完全不划算了。国内云盘更是毫无底线。我在这里分享一下我的方案。
---

随着照片越来越多，iCloud、MiCloud 已经完全不划算了，国内云盘更是毫无底线。（买更大储存空间的手机太天真，冗余意识都没有，手机坏了丢了全部完蛋。）

关于照片管理储存空间是一方面，管理（多维度分类与查看、修改元信息、删除、共享、分享）更是重头戏，安全也不容小觑。

## 照片管理服务

我体验了几个热门方案，最终选择了 [MT Photos](https://mtmt.tech/)，理由如下：

<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>优点</th>
      <th>缺点</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>iCloud 或其他系统厂商云服务</td>
      <td>门槛低，体验好</td>
      <td>不太划算</td>
    </tr>
    <tr>
      <td>国内网盘</td>
      <td>门槛低</td>
      <td>
        <ol>
          <li style="background-color: red;">EXIF 信息会被胡乱涂改，修改用户文件这点非常恶心</li>
          <li style="background-color: red;">隐私和审查问题，稍微敏感一点的内容会被无情封禁</li>
          <li>2C 的产品非常不可靠：不同程度的限速、花里胡哨的营销广告</li>
        </ol>
      </td>
    </tr>
    <tr>
      <td><a href="https://github.com/fregie/pho">Pho</a></td>
      <td>-</td>
      <td>仅仅只是一个照片同步工具，没有其他功能；第一次试用就不支持 Live Photos</td>
    </tr>
    <tr>
      <td><a href="https://github.com/icloud-photos-downloader/icloud_photos_downloader">iCloud PD</a></td>
      <td>貌似是唯一一个能下载 iCloud 照片的工具</td>
      <td>仅仅只是一个照片同步工具，没有其他功能</td>
    </tr>
    <tr>
      <td><a href="https://github.com/immich-app/immich">Immich</a></td>
      <td>
        <ol>
          <li>日历/时间轴</li>
          <li>地图相册</li>
          <li>场景识别</li>
          <li>人脸识别</li>
          <li>文本识别</li>
          <li>以文搜图</li>
          <li>元信息的查看与修改（拍摄日期、拍摄地点等）</li>
          <li>多用户支持</li>
          <li>友好易用的页面</li>
        </ol>
      </td>
      <td>已经存在的照片需要导入系统（重新组织目录与文件），不支持原地管理</td>
    </tr>
    <tr>
      <td><a href="https://www.photoprism.app">PhotoPrisma</a></td>
      <td>-</td>
      <td>同上；页面不太好用；还不支持多用户（几年前体验的，信息可能不准确）</td>
    </tr>
    <tr>
      <td><a href="https://mtmt.tech/">MT Photos</a></td>
      <td>
        <ol>
          <li><mark>Immich 所有功能</mark></li>
          <li>原生中文</li>
          <li><mark>已有文件原地管理</mark>（映射目录后直接扫描分析，不会更改目录结构）</li>
        </ol>
      </td>
      <td>需要付费；APP 缺少“仅同步指定时间范围”功能</td>
    </tr>
  </tbody>
</table>

## 同步策略

首先，老照片、非手机拍摄的照片、全都使用 MT Photos 管理（部署在 NAS 上，下文里的 NAS 等于 MT Photos）。

其次，我平时和我老婆用 iCloud，因为 iCloud 的共享图库（注意不是共享相册）和照片识别体验无出其右。

使用 iCloudPD 每周同步 iCloud 照片到 NAS（定时任务）。

目前我们开的是 200G 家庭共享，每月 21 元。再往上就有点贵且没必要，所以**我的 iCloud 是滚动存储的，快满的时候把最早一年的照片归档到 NAS**。归档操作如下：假如现在需要归档 2018 年的照片，在 NAS 上将 iCloudPD 下载目录里的 2018 文件夹移动到归档目录，然后在 iCloud 上删除所有 2018 年的照片。

iCloud PD 下载目录分这么几个文件夹（对应 MT Photos 里的图库，便于权限管理）：

1. 每个人的私人图库（实时备份）
2. 共享图库（实时备份）
3. 每个人的私人图库（归档）
4. 共享图库（归档）

为什么不用 MT Photos 的 APP 同步？因为它不是真正的同步，而是拷贝。而且还缺少“仅同步指定时间范围”功能。

另外给爸妈用的是 XiaoMi Cloud，其实可以用 MT Photos 代替了，但我经常在外地，不想折腾老年人了。

## 备份策略

首先，NAS 上的阵列自带冗余，我用的是 unRAID，类似 RAID 5，即：允许任意一块硬盘坏掉而不丢失数据，直接用新硬盘替换坏掉的硬盘就能恢复阵列。

其次，每月进行冷备份到另一块单独的硬盘。

最重要的一点，NAS 上所有照片都会进行**加密异地备份**。这是普通人能达到的最安全策略了，即 3-2-1 备份原则。具体操作可以查看[这篇文章](/zh/posts/offsite-disaster-recovery-for-unraid-with-rclone)。

然后是 iCloud，我使用 iCloudPD 每周同步 iCloud 照片到 NAS。这样 iCloud 里的照片也有了多重备份。
