---
pubDatetime: 2022-08-14T09:00:07Z
modDatetime: 2022-08-14T09:00:42Z
title: 【补发】OpenVPN 小记
permalink: openvpn-experience
originalUrl: https://api.github.com/repos/bowencool/blog/issues/20
tags:
  - nas
  - network
  - experience
description: 记录一下配置 OpenVPN 过程中遇到的问题
---

启动不了，把防火墙关了

报错：关闭 linuxSE

连接超时，搜索得知 NAT 依赖防火墙。所以又开防火墙、加端口号

小结：关闭 linuxSE，防火墙不关，把 openVPN server 端口号添加到防火墙。

https://openvpn.net/community-resources/reference-manual-for-openvpn-2-4/

# Route & DNS

连上后访问不了公司内网 10.10.10.0 IP段（各种虚拟机包括DNS解析），192.168 段（员工电脑）正常
在 Mac 上执行：sudo route -n add -net 10.10.10.0/23 192.168.82.1
todo add to client config
redirect-gateway 默认 def1 bypass-dhcp，改成 bypass-dns，但是没有任何效果。
`push "dhcp-option DNS 192.168.10.1"`会把客户端的 DNS设置为 192.168.10.1（`push  "XX"` 相当于在客户端配置里写一行 `"XX"`），但是经过我的测试，客户端配置里的 `dhcp-option DNS xxx` 会覆盖 Wi-Fi 默认的 DNS，而不是追加。
暂时也没找到解决办法，妥协了，把 Wi-Fi DNS 抄在 client config，没有完美解决。

```
# client.ovpn
...
dhcp-option DNS 10.10.10.100
dhcp-option DNS 10.10.10.101
dhcp-option DNS 10.10.10.102
...
```

```
# server.conf
...

push "dhcp-option DNS 192.168.10.1"
push "dhcp-option DNS 223.6.6.6"
push "redirect-gateway bypass-dns"
...
```
