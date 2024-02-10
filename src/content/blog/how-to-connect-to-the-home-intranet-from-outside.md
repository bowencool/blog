---
pubDatetime: 2023-09-25T05:54:07Z
modDatetime: 2024-02-10T07:28:42Z
title: How to connect to the internal network at home from outside?
permalink: how-to-connect-to-the-home-intranet-from-outside
originalUrl: https://github.com/bowencool/blog/issues/26
tags:
  - nas
  - unRAID
  - network
description: Summarized some of the solutions used by authors to connect to the home network.
---

This article discusses connecting to the internal network at home from outside, such as accessing internal IP, SSH, SMB, and using your OpenWrt. If you don't need to access the entire internal network and only require access to one of its services, setting up Nginx is sufficient. This article will not delve into that discussion.

## Solutions Comparison

Here are the solutions I have tried, and other suggestions are welcome in the comments for discussion.

I initially used OpenConnect, which by default would mess up the local routing table, affecting daily use. However, since it was a long time ago, I won't write about it.

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
      <col width="120" />
      <col width="120" />
      <col width="100" />
      <col width="100" />
      <col width="80" />
      <col width="100" />
      <col width="130" />
      <col width="350" />
    </colgroup>
    <thead>
      <tr>
        <th>Solution</th>
        <th>Network Environment Requirements</th>
        <th>Installation Type (server)</th>
        <th>Connection Type</th>
        <th>Latency</th>
        <th>Installation / Maintenance Cost</th>
        <th>Recommendation Rating</th>
        <th style="width: 300px">Remarks</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Tailscale / ZeroTier</td>
        <td>None</td>
        <td>Docker</td>
        <td>NAT</td>
        <td>High</td>
        <td>Low</td>
        <td>★★☆☆☆</td>
        <td>Segment conflicts may occur: for example, if your home network segment is 192.168.1/24 (the most common), and it is added to the static route of tailscale, and the external WiFi segment happens to also be 192.168.1/24 (it’s really common), then you won’t be able to access this network segment at home, which is exactly the opposite of OpenVPN. You can manually change your home network segment to a less commonly used one, such as 10.x.x/20.</td>
      </tr>
      <tr>
        <td>Tailscale + Self-built Relay</td>
        <td>A relay node with public IPv4 address</td>
        <td>Docker</td>
        <td>NAT</td>
        <td>Low</td>
        <td>Middle</td>
        <td>★★☆☆☆</td>
        <td>-</td>
      </tr>
      <tr>
        <td>Headscale</td>
        <td>A relay node with public IPv4 address</td>
        <td>Docker</td>
        <td>NAT</td>
        <td>Low</td>
        <td>Middle</td>
        <td>★★☆☆☆</td>
        <td>-</td>
      </tr>
      <tr>
        <td>Tailscale + IPv6</td>
        <td>Public IPv6 (both ends)</td>
        <td>Docker</td>
        <td>Direct</td>
        <td>Very low</td>
        <td>Low</td>
        <td>★★★★★</td>
        <td>-</td>
      </tr>
      <tr>
        <td>OpenVPN + IPv6</td>
        <td>Public IPv6 (both ends)</td>
        <td>Virtual machine</td>
        <td>Direct</td>
        <td>Very low</td>
        <td>High</td>
        <td>★★★☆☆</td>
        <td>-</td>
      </tr>
      <tr>
        <td>OpenVPN</td>
        <td>Public IPv4( server end )</td>
        <td>Virtual machine</td>
        <td>Direct</td>
        <td>Very low</td>
        <td>High</td>
        <td>★★★☆☆</td>
        <td>
          Configuration is really cumbersome; remember to set a longer validity
          period for certificates.
        </td>
      </tr>
      <tr>
        <td>WireGuard</td>
        <td>Public IPv4( server end )</td>
        <td>unRAID built-in</td>
        <td>Direct</td>
        <td>Very low</td>
        <td>Low</td>
        <td>★★★★☆</td>
        <td>
          Can configure multiple peers for simultaneous multi-end connections
        </td>
      </tr>
    </tbody>
  </table>
</div>

## Additional

Main steps to set up Tailscale:

- Add static routes
- Set DNS
- (Optional) Set unraid to exit mode
- (Optional) Select an exit node on the client (Mac/iOS)

Documentation for setting up WireGuard: https://unraid.net/blog/wireguard-on-unraid

Note: Regardless of which one, downloading the client in the Apple ecosystem requires a non-Chinese region Apple ID.
