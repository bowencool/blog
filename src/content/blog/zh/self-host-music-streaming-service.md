---
pubDatetime: 2025-07-13T13:36:23.000+08:00
modDatetime: 2025-07-14T11:53:48.000+08:00
title: 自建音乐流媒体服务
permalink: self-host-music-streaming-service
featured: false
tags:
  - self-host
description: 近几年我用过网易云音乐、Apple Music（国区）、Youtube Music、QQ音乐，各有各的缺点，本以为耳濡目染的QQ音乐版权应该很牛逼，没想到一般般，只是热门音乐人的版权很全而已。而且付费看广告也真是神奇体验了。
---

## 历史方案

近几年我用过网易云音乐、Apple Music（国区）、Youtube Music、QQ音乐，各有各的缺点，本以为耳濡目染的QQ音乐版权应该很牛逼，没想到一般般，只是热门音乐人的版权很全而已。而且付费看广告也真是神奇体验了。

顺便再说说其他方案：Youtube Music 版权超级丰富，因为你可以把 YouTube 视频加入到你的播放列表，找不到正版的时候还有各种非官方的可以听。但它对节点有要求，网页版经常出现"你所处的国家或地区无法使用"，并且没有桌面客户端（Electron套壳的不算），而且它的内容是中繁英甚至拼音混在一起的，非常乱。Apple Music 美区太贵。Spotify 听说音质不好，而且也需要梯子才能使用，我再也不想为了出门听音乐开着梯子了。目前没有一套舒服的方案。

## 发现新工具

其实去年也尝试过自建 Navidrome 和 Jellyfin，但苦于没有好用的客户端就搁置了，听歌开网页也太蠢了。你可能会推荐类似椒盐音乐、foobar2000之类的本地音乐播放器，但我的需求是跨平台同步数据，我在电脑上喜欢了一首歌，我打开手机也必须能听到，我永远不会把数据（心血）放到一个脆弱的单机设备。但是[偶然间](https://www.v2ex.com/t/1138748)发现了[音流](https://github.com/gitbobobo/StreamMusic)这个APP，下载试用了一下，完美符合需求，这正是我寻找的 APP！！！相见恨晚啊。忍不住立刻开搞！

## 导出音乐列表

第一步就是从QQ音乐导出列表，我用的这个[GoMusic](https://github.com/Bistutu/GoMusic)，我以前用国外平台的时候用 [Turn My Music](https://www.tunemymusic.com/)。

## 根据列表下载音乐

曾经使用 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 下载 YouTube Music 中的音乐。

现在用[这个高度匹配使用场景的工具](https://github.com/59799517/simple_sq_musuc_plus) 下载，由于作者没怎么写文档，所以前期也浪费了不少时间。不过当我成功使用它后，我还是震惊于它的完成度：搜索、试听、下载（还是无损音乐）、自动刮削并整理、自动入库（Jellyfin）一气呵成！全程没有填写任何密码或密钥，就这么生硬地下载了！

最重要的是，可以把刚才导出的列表粘贴进去自动批量匹配下载！我一共从QQ音乐导出了一千多首，它自动匹配到了七百多首，节省了我大量精力。

缺少的几百首，我自己写脚本对比本地文件和导出列表，发现只要是多个歌手合作的作品，它直接解析失败，写脚本又自动匹配了约200首。

还剩一百多首音乐，自己一个个搜索、试听、下载，没有搜到的或被封禁的音乐，去HiFiNi(已经[无法访问，查看代替方案](https://v2ex.com/t/1143866))下载了，最终一千多首全都到本地并且刮削整理好了。

硬要说缺点，就是这个项目是作者私人用的，文档几乎没有，UIUX 很原始（虽然用了最新的前端技术，但不是这个时代的交互体验😂），免费公用要啥自行车啊，我反手就是多个账号全都 star。

## 刮削元数据和歌词

上面的下载工具直接就做好了，有些遗漏的可以用 [music-tag-web](https://github.com/xhongc/music-tag-web) 刮削或修改，Jellyfin 也能修改元数据。

## 音乐流媒体服务+客户端

最著名的当然是 [Navidrome](https://github.com/navidrome/navidrome) 了，我也试了，发现它不能显示同一个文件夹下的封面 cover.jpg，而 Jellyfin 可以，所以我直接选了 Jellyfin。

客户端用[音流](https://github.com/gitbobobo/StreamMusic)，支持全平台。而且它支持的服务端还挺多的，而且所有基础功能全免费，就冲这格局，我直接付费买断了。（是我孤陋寡闻了，Navidrome 客户端挺多的）

我在 MacOS、iPhone、Android 上都装了，除了不能直接搜索和下载网上的新歌，其他体验完美！甚至（管理员账户）可以删除服务器里的音乐！

## 如何追踪听歌记录和推荐算法？

当然是用 [LastFM 插件](https://github.com/jesseward/jellyfin-plugin-lastfm)啦，它可以记录你每一首的播放记录和喜欢的音乐。想听新歌的时候，去 last.fm 就行了。
