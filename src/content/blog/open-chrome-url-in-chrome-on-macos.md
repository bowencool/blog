---
pubDatetime: 2024-08-18T12:27:45.000+08:00
title: Open URLs that start with "chrome://" in Chrome on MacOS.
permalink: open-chrome-url-in-chrome-on-macos
featured: true
tags:
  - hacks
  - macos
  - browser
description: Chrome did not register itself to open URLs that start with "chrome://". I'm going to share some tips on how to fix this.
---

## What's the problem?

If you try to open a URL like "chrome://history" or "chrome-extension://xxx" through another app such as Alfred or Raycast, you'll get this error: "There is no application set to open the URL chrome://history".

![There is no application set to open the URL chrome://history](https://imgur.com/la4J1tl.png)

And when you click the "Choose Application..." button, you will find the "Google Chrome" was unselectable:

![Choose an application to open the document "chrome://history"](https://i.imgur.com/dXJbGM5.png)

## A temporary solution

Click the "Show Options" button in the bottom left corner, then select "All Applications" instead of "Recommended Applications."

![Choose an application to open the document "chrome://history"](https://i.imgur.com/jCriWOa.png)

You will see that Chrome has opened its history page. But you must do these steps every time, it's not convenient.

## A solution once and for all

First of all, we should link the "chrome://" and "chrome-extension://" schema to Chrome. This can be done by modify `/Applications/Google Chrome.app/Contents/Info.plist`(don't do it right now):

![Info.plist](https://i.imgur.com/hSMLciU.png)

However, this will break Chrome and is not user-friendly when there is an update. So, we can make a new Application to link the two url schemas:

Open `/Applications/Utilities/Script Editor.app` and paste the following code into it:

```
on open location this_URL
	tell application "Google Chrome"
		open location this_URL
		activate
	end tell
end open location
```

Click "File" and select "Export." Set the file format to "Application," name the application (e.g., ChromeProtocol.app), and save it.

![Save the script as an Application](https://i.imgur.com/FxvcL5U.png)

Open `/Applications/ChromeProtocol.app/Contents/Info.plist` and add the following config:

```
	<key>CFBundleURLTypes</key>
	<array>
		<dict>
			<key>CFBundleURLName</key>
			<string>Chrome Internal URL</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>chrome</string>
				<string>chrome-extension</string>
			</array>
		</dict>
	</array>
```

Save and exit you editor.

And open "chrome://history" through other app, for example, Raycast. And select the new Application "ChromeProtocol.app" we just created to open this URL just like we did above:

![Select the new Application](https://i.imgur.com/joYWA16.png)

And you will find everythings works. 🎉🎉🎉
