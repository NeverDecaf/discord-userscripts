# discord-userscripts
## [auto_shrink_images](https://github.com/NeverDecaf/discord-userscripts/raw/master/auto_shrink_images.user.js) [broken]
Shrink images uploaded or pasted into the client with `ctrl+v` to bring them below the 8MB upload limit. Images smaller than 8MB, when copied to the clipboard, can sometimes become larger than 8MB due to being converted to a pixmap. This script converts all large images to jpeg then reduces jpeg quality until the filesize is under 8MB. This works for both pasted images and uploaded files (including multiple file uploads).
## [always_twitfix](https://github.com/NeverDecaf/discord-userscripts/raw/master/always_twitfix.user.js)
Replace links to x/twitter posts with `fxtwitter.com` in outgoing messages. Also replaces bilibili links with `vxbilibili.com` (or `vxb23.tv`) and tiktok with `vxtiktok`.
## [full_res_image_modal](https://github.com/NeverDecaf/discord-userscripts/raw/master/full_res_image_modal.user.js)
Replace downscaled images (in the modal shown after clicking on an image) with their original source image, some images may fail to display due to [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
## [dont_show_typing](https://github.com/NeverDecaf/discord-userscripts/raw/master/dont_show_typing.user.js)
Hide your typing status.
## [filename_randomizer](https://github.com/NeverDecaf/discord-userscripts/raw/master/filename_randomizer.user.js)
Replace all uploaded filenames with the current Unix timestamp. Extensions are preserved, but converted to lowercase.
## [block_tracking](https://github.com/NeverDecaf/discord-userscripts/raw/master/block_tracking.user.js)
Blocks *some* internal tracking requests. **Not** a complete privacy solution.
