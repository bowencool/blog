---
pubDatetime: 2023-09-25T05:54:07Z
modDatetime: 2023-09-25T06:56:53Z
title: 如何在外面连接到家里的内网？
permalink: how-to-connect-to-the-home-intranet-from-outside
originalUrl: https://github.com/bowencool/blog/issues/26
tags:
  - nas
  - network
description: 总结了一些作者使用过的连接家庭内网的方案。
---

本文讨论的是在外面连接到家里的内网，比如访问内网 IP、SSH、SMB、科学上网等。如果你不需要访问完整内网，只需要访问其中一个服务，只需要配个 Nginx 就行了，本文不做讨论。

## 方案对比

下面是我折腾过的方案，其他方案欢迎留言讨论。

最早的时候用过 OpenConnect，默认会把本地的路由表干掉，影响日常使用，而且时间太早就不写了。

<style>
  table {
    position: relative;
    table-layout: fixed !important;
    tr > th:first-child,
    tr > td:first-child {
      position: sticky;
      left: -1px;
      z-index: 2;
      background-color: rgba(var(--color-fill), var(--tw-bg-opacity));
      /* border-color: rgba(var(--color-accent),var(--tw-text-opacity)); */
    }
  }
</style>

<div style="overflow-x: auto">
  <table>
    <colgroup>
      <col width="100" />
      <col width="100" />
      <col width="80" />
      <col width="80" />
      <col width="50" />
      <col width="70" />
      <col width="130" />
      <col width="350" />
    </colgroup>
    <thead>
      <tr>
        <th>方案</th>
        <th>网络环境要求</th>
        <th>安装类型(server)</th>
        <th>连接类型</th>
        <th>延迟</th>
        <th>安装/维护成本</th>
        <th>推荐指数</th>
        <th>备注</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Tailscale / ZeroTier</td>
        <td>无</td>
        <td>docker</td>
        <td>NAT</td>
        <td>高</td>
        <td>低</td>
        <td>★★☆☆☆</td>
        <td>网段可能会冲突：比如你家里有一网段是 192.168.1/24（最常见的）并且添加到 tailscale 的静态路由里面了，在外面的 WiFi 网段刚好也是 192.168.1/24（它真的很常见），那你就访问不到家里的这个网段了，这一点刚好和 OpenVPN 相反。你可以把家里的网段手动修改成一个不常用的，比如 10.x.x/20</td>
      </tr>
      <tr>
        <td>Tailscale + 自建中转</td>
        <td>一个有公网 IPv4 的中转节点</td>
        <td>docker</td>
        <td>NAT</td>
        <td>低</td>
        <td>中</td>
        <td>★★☆☆☆</td>
        <td>-</td>
      </tr>
      <tr>
        <td>Headscale</td>
        <td>一个有公网 IPv4 的中转节点</td>
        <td>docker</td>
        <td>NAT</td>
        <td>低</td>
        <td>中</td>
        <td>★★☆☆☆</td>
        <td>-</td>
      </tr>
      <tr>
        <td>Tailscale + IPv6</td>
        <td>公网 IPv6(两端)</td>
        <td>docker</td>
        <td>直连</td>
        <td>很低</td>
        <td>低</td>
        <td>★★★★★</td>
        <td>-</td>
      </tr>
      <tr>
        <td>OpenVPN + IPv6</td>
        <td>公网 IPv6(两端)</td>
        <td>虚拟机</td>
        <td>直连</td>
        <td>很低</td>
        <td>高</td>
        <td>★★★☆☆</td>
        <td>-</td>
      </tr>
      <tr>
        <td>OpenVPN</td>
        <td>公网 IPv4(服务端)</td>
        <td>虚拟机</td>
        <td>直连</td>
        <td>很低</td>
        <td>高</td>
        <td>★★★☆☆</td>
        <td>配置是真的繁琐，记得把证书的有效期设置长点</td>
      </tr>
      <tr>
        <td>WireGuard</td>
        <td>公网 IPv4(服务端)</td>
        <td>unRAID 内置</td>
        <td>直连</td>
        <td>很低</td>
        <td>低</td>
        <td>★★★★☆</td>
        <td>可以配置多个 peer 达到多端同时连接的效果</td>
      </tr>
    </tbody>
  </table>
</div>

## 补充

设置 Tailscale 的主要步骤：

- 添加静态路由
- 设置 DNS
- 【可选】设置 unraid 为 exit mode
- 【可选】在客户端（Mac/iOS）上选择 exit node。

设置 WireGuard 的文档：https://unraid.net/blog/wireguard-on-unraid

提醒：无论是哪个，苹果生态下载客户端都需要一个非中国区的 Apple ID。
