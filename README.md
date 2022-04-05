# discord-userscripts
## auto_shrink_images.user.js
Shrink images uploaded or pasted into the client with `ctrl+v` to bring them below the 8MB upload limit. Images smaller than 8MB, when copied to the clipboard, can sometimes become larger than 8MB due to being converted to a pixmap. This script converts all large images to jpeg then reduces jpeg quality until the filesize is under 8MB. This works for both pasted images and uploaded files (include multiple file uploads).
## always_twitfix.js
Replace links to twitter posts with "fxtwitter.com" in outgoing messages.