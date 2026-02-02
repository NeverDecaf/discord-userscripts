// ==UserScript==
// @name         Always TwitFix
// @version      0.5.4
// @description  Replace twitter.com links in messages you send (on discord) with fxtwitter.com, also converts bilibili => vxbilibili, tiktok => vxtiktok, pixiv => phixiv
// @author       NeverDecaf
// @match        https://discord.com/*
// @require      https://neverdecaf.github.io/discord-userscripts/webpackmodules.js?v=3
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function () {
    "use strict";
    WMInit().then(() => {
        const Modules = {
            messageSend: {
                filter: Filters.byKeys(["sendMessage"]),
                options: { searchExports: true },
            },
        };
        waitForAllModules(Modules).then(() => {
            // map a regex (which matches relevant urls) to a domain replacement, groups 1 and 3 must be defined (but are preserved)
            const DOMAIN_SWAPS = [
                {
                    regex: /(\/\/)(?:www\.)?(twitter\.com|x\.com)(\/[^\/]+\/status\/\d+)/gi,
                    domain: "fxtwitter.com",
                },
                {
                    regex: /(\/\/)(?:www\.)?(bilibili\.com)(\/video\/[^\/]+)/gi,
                    domain: "vxbilibili.com",
                },
                {
                    regex: /(\/\/)(?:www\.)?(b23\.tv)(\/[^\/]+)/gi,
                    domain: "vxb23.tv",
                },
                {
                    regex: /(\/\/)(?:www\.)?(tiktok\.com)(\/[^\/]+\/video\/\d+)/gi,
                    domain: "vxtiktok.com",
                },
                {
                    regex: /(\/\/)(?:www\.)?(pixiv\.net)(\/.*\d+.*)/gi,
                    domain: "phixiv.net",
                },
            ];

            const originalSendMessage = Modules.messageSend.sendMessage;
            Modules.messageSend.sendMessage = function () {
                if (arguments.length > 2 && arguments[1]?.content) {
                    DOMAIN_SWAPS.forEach(({ regex, domain }) => {
                        arguments[1].content = arguments[1].content.replaceAll(
                            regex,
                            `$1${domain}$3`,
                        );
                    });
                }
                return originalSendMessage.apply(this, arguments);
            };
        });
    });
})();
