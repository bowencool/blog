---
pubDatetime: 2022-08-13T07:16:50Z
modDatetime: 2025-07-23T16:03:16.000+08:00
title: My unRAID Usage Report
permalink: my-usage-reports-of-unraid
originalUrl: https://github.com/bowencool/blog/issues/17
collapseDepth: 1
tags:
  - unRAID
  - nas
  - self-host
description: unRAID is a home NAS system, and it's also my first time using a NAS. Because some friends are using it, I didn't consider other NAS systems. It has been running stably for many years with an excellent user experience, so I'm recording this to share with others.
---

unRAID is a home NAS system, and it's also my first time using a NAS. Because some friends are using it, I didn't consider other NAS systems. It has been running stably for many years with an excellent user experience, so I'm recording this to share with others.

## Usage of File Sharing Function

- 2.5Gpbs SMB network drive in the local network, almost all digital devices support it natively.
  - [Can be accessed remotely with OpenVPN/Tailscale/WireGuard/Frp](/posts/how-to-connect-to-the-home-intranet-from-outside)。
  - Installing a [WebDAV](https://github.com/hacdias/webdav) can enable HTTP access. _Important data should not be exposed to the public network_
  - For example, in Mac OS Finder:
    - In the same local area network, you will receive broadcasts, and you can find it directly in the sidebar.
    - If you can't find it or are accessing it via VPN from outside, click "Go > Connect to Server", enter the URL according to the protocol, and you can find it in the sidebar.
- Built-in parity check(RAID5), any hard drive can be directly replaced and recovered with a new one. Greatly improves fault tolerance.
- [Periodic encrypted backup to XX Network Cloud Disk/OSS using RClone.](/posts/offsite-disaster-recovery-for-unraid-with-rclone)
- Built-in permission management.
- Can be used as a Time Machine backup disk for Mac, wireless backup throughout, automatic backup for seamless experience.
- Storage for surveillance camera footage.

## Plugins

### Community Applications

Equivalent to the App Store

### Recycle Bin

Recycle Bin, Wastebasket (only works if file sharing protocol is used)

### Unassigned Devices [plus]

Unassigned devices outside the array, such as USB flash drives, removable drives, etc.

### Compose Manager

Adds docker-compose and a management panel to unRAID.

### USB Manager

Allows easy management of USB devices, which can be assigned directly to VMs. Light use is easier than hardware passthrough.

### User Scripts

Scheduled tasks. Compared to crontab, it has a simple UI and log management. However, some complex cron expressions do not work, and it is not recommended.

### RClone

Web disk synchronization tool, mainly used to compensate for the missing offsite disaster recovery feature, refer to [another article](/posts/offsite-disaster-recovery-for-unraid-with-rclone)

### [WireGuard](https://unraid.net/blog/wireguard-on-unraid) (unRAID built-in)

For details, check out: [How to connect to home intranet from outside?](/posts/how-to-connect-to-the-home-intranet-from-outside)

### ZFS Master & Buddy Backup

The former allows you to manually manage ZFS snapshots, while the latter automatically manages them.

## Virtual Machines

### OpenWrt

This step requires purchasing a network card hardware, then passing it through to the virtual machine, refer to Spoto's tutorial on Bilibili.com.

1. DDNS: Used to automatically resolve domain names to the correct public IP, because the public IP of Chinese broadband changes every now and then, and fixed public IP is too expensive.
2. OpenClash + MosDNS: Special demand on the Chinese network.
3. Other plugins I was lazy to explore, such as adblocking and traffic control.

### ~~Windows 10~~

I am already an Apple ecosystem user, ~~so I need a virtual machine to run some Windows-exclusive software.~~

~~I have switched to using Parallels Desktop to simulate the Windows environment.~~

I built a PC for gaming, hahaha.

### Ubuntu

Install shairport-sync + snapcast to implement a multi-room (whole house) sound system. The Airplay2 solution has been implemented, but I also want to support Windows and Android, and am still in the exploration stage.

Reasons for choosing Ubuntu:

1. After installing the Docker version of shairport-sync, Apple devices cannot find it.
2. The snapcast documentation only explains how to set shairport-sync as an audio source through stdout; I don't know how to do this via a Docker container, perhaps through the network?
3. Snapcast can be directly installed on Ubuntu, whereas CentOS requires manual compilation; if the second point can be resolved, the Docker version would also be quite convenient.

## Docker

### MySql & Redis

Infrastructure.

### Nginx + [certd](https://github.com/certd/certd)/~~[certimate](https://github.com/usual2970/certimate)~~

Used for

1. Allocate domain names instead of [IP]:[Port]
2. Unified processing of common configurations such as https certificates and CORS, and leave professional matters to professional software.

### Tailscale

For more information, see [this article](/posts/how-to-connect-to-the-home-intranet-from-outside).

### MtPhotos

Photo management service, functionality close to Apple Photos, you can also try [Immich](https://github.com/immich-app/immich)

- Map albums, scene recognition, face recognition, text recognition...
  - **Local recognition supported with PC hardware acceleration**
  - Face recognition is not very well; although it can be used with deepface now, the effect is also quite average.
- Search images by text, for example: "lake"
- Client ~~fully featured~~
  - Only supports copy; lacks sync feature like rclone
  - Lack of "Synchronize only specified time range" function, emailed twice and the reply was "No development plan".
- Multi-user support
- Supports managing existing folders in place without changing directory structure (That's what I like about it. Immich doesn't support it.)
  - Can be paired with iCloudPD to sync locally and managed by MtPhotos. (The advantage is a completely seamless automatic backup without needing to open any APP)
- Supports editing the shooting time and location information of photos (Writes directly to the file Exif, very useful for organizing old photos.)

Far surpasses all domestic cloud services **(1. Privacy and censorship issues; 2. Exif information will be modified)**, NextCloud, PhotoPrisma (user-unfriendly operation and no multi-user support), Pho.

For specific strategies, please refer to [this article](/posts/how-do-i-manage-my-photos).

### Gitea

Lightweight git service, Gitlab is too heavy.

### Bitwarden

Cross-platform password management tool that covers mainstream browsers, Android, iOS, Mac, and supports command line and Alfred. It can also store bank cards, address forms, etc.

Chrome and iCloud are good but not cross-platform.

> 2022-08-15: Today I read a post. Everyone take a look: [chrome passwords leaked out; just realized using chrome to save passwords is like running naked](https://www.v2ex.com/t/872745)

1Password is the ceiling of password management services but passwords are very private data; you need to weigh it yourself.

EnPass can be privately deployed but its functionality is too rudimentary.

My principles for using passwords are:

1. Enable two-factor authentication on all platforms that support it; it's much safer than just using a password.

2. **Do not keep two-factor authentication codes with your passwords**; don't put all your eggs in one basket.

3. Two-factor authentication QR codes (keys) and recovery codes are very important; keep at least one or more copies in the most secure place possible. (I lost an Alibaba Cloud key before and still haven't been able to recover the account even after appealing for help; had to create a new one.)

Tips: Authenticator on a smartwatch works well as you don't have to find your phone. ~~Microsoft's Authenticator supports iCloud sync~~ Salesforce's Authenticator supports viewing on Apple Watch. After trying them all out, I highly recommend 2FAS Auth which has recently gone open source – only thing missing now is Apple Watch support being released soon!

### Home Assistant

A smart home control center that can connect different brands of smart home devices together. For example, you can use Siri to control Xiaomi's lights. **My evaluation is that it has high playability and strong customization, but it's not worth the effort. It's very troublesome, better to just use Mi Home directly.**. The [Official Mi Home Integration](https://github.com/XiaoMi/ha_xiaomi_home) is being updated frequently, looking forward to the day it matures.

### ~~NextCloud~~

It can be understood as a privately deployed AWS S3 or Google Drive.

It has a lot of features and a rich ecosystem, not just cloud storage.

There are quite a few minor issues, so I uninstalled it due to my perfectionism.

### Seafile

Recommended in the comments section and I've used it.

### ~~Syncthing~~

Used to synchronize software configurations, with a focus on Alfred and iTerm2 configurations. Previously used NextCloud for synchronization, but NextCloud often had problems so I switched.

The difference between synchronization and mounting is that mounting refers to remote files, which disappear when the connection is disconnected. Synchronization, on the other hand, means keeping your local and remote files consistent, with no significant impact if the connection is disconnected.

The differences between Syncthing, Seafile, and rclone are: Syncthing runs in real-time in the background and is decentralized. Seafile also supports real-time synchronization in the background but requires a server, similar to NextCloud or OneDrive. Rclone is command-based and by default performs one-way synchronization (its bidirectional sync feature is still in the beta stage), similar to rsync. It's primarily used for tasks like cloud storage syncing and backup, often used together with scheduled tasks.

I have gave up Syncthing for the following reasons:

1. Syncthing's ignore syntax is too non-mainstream, and it seems that its ignored file do not sync between devices.
2. After restored from Time Machine, Syncthing actually requires manual resetting of ID before it can be used again; truly troublesome.

### ~~AList~~ OpenList

Web version of the file browser, which has many features, such as support for cloud storage, synchronization, and downloading.

It can compensate for the types of cloud storage not supported by rclone through its built-in webdav, such as Quark Cloud.

It can solve some niche software issues like duplicacy not supporting WebDAV through its own s3 solution, like [this post](/posts/how-to-encrypt-backup-your-data-on-your-nas/).

It can replace Nginx(autoindex) to host a Public folder for sharing with friends or allowing friends to upload directly.

I have tried its permission management before; the download links had no authentication... I don't quite trust it.

And its WebDAV protocol does not implement the PROPFIND method, which will cause Tampermonkey to enter an infinite loop.

### [WebDAV](https://github.com/hacdias/webdav)

If you have installed Nextcloud or OpenList, then you don't need to install this.

Similar to SMB, WebDAV uses the HTTP protocol. Some third-party clients support WebDAV synchronization (mostly Chrome extensions), so I installed it for that purpose.

### [aliyundrive-webdav](https://hub.docker.com/r/messense/aliyundrive-webdav)

If you have installed OpenList, then you don't need to install this.

This is an implementation of webDAV for Aliyun Drive mainly used for backup purposes. There are some caching issues but they are not significant.

### ~~[OpenLDAP](https://hub.docker.com/r/osixia/openldap/) + [phpldapadmin](https://hub.docker.com/r/osixia/phpldapadmin/)~~

> It's not worth the hassle. It's less work to just Bitwarden/1Password to generate random passwords.

Unified authentication. With so many applications installed, changing passwords is too cumbersome.

Tried FreeIPA, but encountered an error that couldn't be resolved, so I gave up.

Currently integrated with OpenVPN and Gitea.

### ~~Transmission~~

A downloader that hasn't been used for a long time.

### ~~[xware](https://hub.docker.com/r/caiguai/docker-xware)~~

Remote download tool for Thunder. Installed but not used.

### Aria2

By the end of 2022, I switched to using [Aria2-Pro](https://p3terx.com/archives/docker-aria2-pro.html) + [AriaNg](https://p3terx.com/archives/aria2-frontend-ariang-tutorial.html) / [Aria2 Explorer](https://chrome.google.com/webstore/detail/mpkodccbngfoacfalldjimigbofkhgjn) as a full protocol downloader.

### [MeTuBe](https://github.com/alexta69/metube)

Download videos from various websites in one click, similar to Downie. I occasionally use it to download music.

### Jellyfin

Home theater service. My little integrated graphics are struggling a bit. It's a bit redundant for ordinary people, not as convenient as screen casting.

However, I recently used it to [self-host my own music streaming service](/posts/self-host-music-streaming-service), and it was really enjoyable.

### ~~[QingLong](https://hub.docker.com/r/whyour/qinglong)~~

It is also a scheduled task, mainly used to automatically perform tasks on JD.com.

After using it for a while, hundreds of Jingdong beans were credited to my account every day, which was quite great. (2023.04: Can't get much profit anymore)

Although it may not be enough to be convicted of damaging computer systems, being banned is still very likely, so I stopped using it.

### ~~Wiznote~~ / ~~Joplin~~ / ~~AppFlowy~~ / Docmost

In the end, I decided to use IDE + Git instead of these note-taking software. I think no matter how well note-taking software is done, it will always be inferior to IDE. IDE can have unlimited possibilities with plugins and can conform to your writing habits.

If you need multi-device synchronization, consider Obsidian, which does not require registration and can be used directly by opening the iCloud folder. Moreover, you can still use an IDE to edit on your computer. This is inconvenient with Joplin because its directory structure is not human-readable.

### FreshRSS + RSSHub + [WeWeRSS](https://github.com/cooderl/wewe-rss)

I'm relying more and more on RSS, it's efficient to get all the information in one place and not be held hostage by recommendation algorithms. One downside is that there's too much information, and it's impossible to read it all, haha, even just reading the titles is a big waste of time.

RSSHub converts all kinds of websites that don't support RSS into RSS, such as Bilibili, Zhihu, Weibo, Xiaohongshu, Twitter, Telegram...

WeWeRSS specializes in converting WeChat to RSS.

The role of FreshRSS is to synchronize the whole platform and fine management, not necessary, but recommended. Under normal circumstances RSS client can directly add subscriptions, you can also login to FreshRSS. This service has a competitor called TTRSS, which also supports self-host.

For the client, use Reeder (paid) or NetNewsWire (open source free) for Mac / iOS, and Feedme for Android. It's great to have cross-platform synchronization.

### ~~[DeepL Free API](https://hub.docker.com/r/zu1k/deepl)~~ [DeepLX](https://github.com/OwO-Network/DeepLX)

Used for [Bob](https://bobtranslate.com/) and [Immersive Translate](https://immersivetranslate.com/).

### ~~Duplicacy / Duplicati / Kopia~~

~~See [this post](/posts/how-to-encrypt-backup-your-data-on-your-nas)~~

Each has its own issues, only rlcone is the most stable, see [this article](/posts/offsite-disaster-recovery-for-unraid-with-rclone).

## Next Step Plan

Here is the feature I want to implement next. If you have any recommended or updated feature, feel free to share.

## Updates at December 2022

### IPv6 was enabled on OpenWrt

[Refer to this article](https://www.lategege.com/?p=676), the reason is that the living environment is using china mobile broadband, and there is currently no public IP.

Advantages:

1. No need for port forwarding, directly resolve to the virtual machine where Nginx is located.
2. ~~Can use ports 443 and 80 (not sure, but I encountered problems after only a few weeks)~~.

Disadvantages:

1. IPv6 is not widely used; if a company's network does not enable IPv6, then it's helpless.
2. By default all devices are exposed to the extranet, which undoubtedly increases the security risk.
3. Some telecommunications companies (such as Anhui Mobile) have unstable resolution of IPv6.
4. Debugging is complex with many pitfalls; I experienced two less obvious pitfalls:
   1. Remember to enable MSS clamping in the firewall on OpenWrt.
   2. The old optical modem may cause stuttering; you can directly request the telecommunications company to replace it with a new one at home

### Accessing Intranet Services via IPv6

Final form: DDNS (IPv6) directly points to Nginx, which then forwards to the intranet IPv4 service (Docker container).

You can take a look at [this post](https://www.v2ex.com/t/488116) and the links mentioned within.

## Updates at July 2025

### Migrated to ZFS

### Look into ZFS (RAID-Z)

> Why? Because now array writing will slow down, no matter what system, even using a cable to mount and copy also slows down. I didn't feel it before, but now that I've started editing videos, the materials are easily tens of GBs, and the array performance is really lagging behind.

I originally planned to set up a RAIDZ1, but I accidentally came across an idea of not setting up RAID at all. It was like a sudden enlightenment. Why should I insist on having redundancy for all data? There's no need. Just protect important data in ZFS, and it's okay if movies, TV series, etc., are lost. They take up space, slow down (the old array) performance, have very low access frequency, and just occupy hard drives, consuming electricity. It's completely unnecessary. I can put them on specific hard drives, and when not used, they can be put into hibernation. I should have realized this earlier.

My important data plus high-frequency accessed data is less than 1TB, just photos, videos, documents, system data, application data, plus game screenshots and recordings, which would be at most 2TB. The growth rate in the future is definitely going to be very slow. Eventually, I gave up on RAIDZ1, and used two 4TB drives to set up a ZFS Mirror， which comprehensively outperforms other arrays in terms of security, performance, snapshots, compression, deduplication! Also have OSS remote encrypted backup, unbeatable! Other hard drives are used to store unimportant video and film resources, and I also removed the parity drive, releasing the hard drive's inherent performance. Since the access frequency is low, I also set up automatic hibernation, saving electricity costs and ~~extending the life of the hard drive(frequent start-stop may harms hard disk life)~~. I'm really a genius!
