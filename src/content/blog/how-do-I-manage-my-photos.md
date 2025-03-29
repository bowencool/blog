---
pubDatetime: 2024-09-15T17:03:46.000+08:00
modDatetime: 2025-03-29T11:19:44Z
title: How do I manage my photos?
permalink: how-do-i-manage-my-photos
featured: false
tags:
  - self-host
description: As the number of photos increases, iCloud and MiCloud have become completely uneconomical. Chinese cloud drives are even more unscrupulous. I'll share my solution here.
---

As the number of photos increases, iCloud and MiCloud have become completely uneconomical, and Chinese cloud drives are even more unscrupulous. (Buying a phone with larger storage space is too naive; there's no redundancy at all—if the phone breaks or gets lost, everything is gone.)

Regarding photo management storage space is one aspect; management (multi-dimensional classification and viewing, modifying metadata, deletion, sharing) is even more important, and security should not be underestimated.

## Photo Management Services

I tried several popular solutions and ultimately chose [MT Photos](https://mtmt.tech/) for the following reasons:

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Advantages</th>
      <th>Disadvantages</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>iCloud or other system level cloud services</td>
      <td>Low threshold, great experience</td>
      <td>Not very cost-effective</td>
    </tr>
    <tr>
      <td>Chinese cloud drives</td>
      <td>Low threshold</td>
      <td>
        <ol>
          <li style="background-color: red;">EXIF information will be randomly modified, which is very disgusting</li>
          <li style="background-color: red;">Privacy and censorship issues, slightly sensitive content will be ruthlessly banned</li>
          <li>2C products are very unreliable: varying degrees of speed limits, flashy marketing ads</li>
        </ol>
      </td>
    </tr>
    <tr>
      <td><a href="https://github.com/fregie/pho">Pho</a></td>
      <td>-</td>
      <td>Only a photo synchronization tool, no other functions; does not support Live Photos on first trial</td>
    </tr>
    <tr>
      <td><a href="https://github.com/icloud-photos-downloader/icloud_photos_downloader">iCloud PD</a></td>
      <td>Seems to be the only tool that can download iCloud photos</td>
      <td>Only a photo synchronization tool, no other functions</td>
    </tr>
    <tr>
      <td><a href="https://github.com/immich-app/immich">Immich</a></td>
      <td>
        <ol>
          <li>Calendar/Timeline</li>
          <li>Map Album</li>
          <li>Scene Recognition</li>
          <li>Face Recognition</li>
          <li>Text Recognition</li>
          <li>Search by Image</li>
          <li>View and modify metadata (shooting date, shooting location, etc.)</li>
          <li>Multi-user support</li>
          <li>User-friendly interface</li>
        </ol>
      </td>
      <td>Existing photos need to be imported into the system (reorganize directories and files), does not support in-place management</td>
    </tr>
    <tr>
      <td><a href="https://www.photoprism.app">PhotoPrisma</a></td>
      <td>-</td>
      <td>Same as above; interface is not very user-friendly; does not support multi-user (experienced a few years ago, information may be inaccurate)</td>
    </tr>
    <tr>
      <td><a href="https://mtmt.tech/">MT Photos</a></td>
      <td>
        <ol>
          <li><mark>All Immich features</mark></li>
          <li>Native Chinese</li>
          <li><mark>In-place management of existing files</mark> (scan and analyze directly after mapping the directory, without changing the directory structure)</li>
        </ol>
      </td>
      <td>Require payment; The mobile APP lacks the "Synchronize only specified time range" feature.</td>
    </tr>
  </tbody>
</table>

## Synchronization Strategy

Firstly, old photos and those not taken by a mobile phone are all managed using MT Photos (deployed on NAS, hereafter 'NAS' refers to MT Photos).

Secondly, my wife and I usually use iCloud because of its unparalleled shared library (note that this is different from shared albums) and photo recognition experience.

We use iCloudPD to sync photos from iCloud to NAS weekly (scheduled task).

Currently, we have a 200GB family plan which costs 21 yuan per month. Upgrading further would be unnecessarily expensive, so **my iCloud storage is rolling; when it's almost full, I archive the oldest year's photos onto the NAS**. The archiving process goes as follows: if it’s time to archive photos from 2018, move the 2018 folder in the download directory of iCloudPD on the NAS into an archival directory and then delete all photos from 2018 on iCloud.

iCloud PD download directories are divided into several folders (corresponding to libraries in MT Photos for easier permission management):

1. Each person's private library (real-time backup)
2. Shared library (real-time backup)
3. Each person’s private library (archived)
4. Shared library (archived)

Why not use MT Photos APP for syncing? Because it doesn't truly sync but copies instead. Moreover, it lacks the "sync only specified time range" feature.

Additionally, I set up XiaoMi Cloud for my parents; actually, it could be replaced with MT Photos but since I often travel out of town, I don’t want to trouble elderly people with new technology changes.

## Backup Strategy

Firstly, the array on the NAS comes with redundancy. I use unRAID, similar to RAID 5, which allows any single hard drive to fail without data loss; simply replacing the failed drive will recover the array.

Secondly, cold backups are performed monthly to another separate hard disk.

Most importantly, all photos on the NAS undergo **encrypted offsite backup**. This is the safest strategy achievable for ordinary people, following the 3-2-1 backup principle. For specific operations, you can refer to [this article](/posts/offsite-disaster-recovery-for-unraid-with-rclone).

Next is iCloud; I use iCloudPD to sync iCloud photos to NAS weekly. This way, photos in iCloud also have multiple backups.
