// ==UserScript==
// @name         Always TwitFix
// @version      0.5.0
// @description  Replace twitter.com links in messages you send (on discord) with fxtwitter.com, also converts bilibili to vxbilibili
// @author       NeverDecaf
// @match        https://discord.com/*
// @require      https://neverdecaf.github.io/discord-userscripts/webpackmodules.js
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function () {
    "use strict";

    runAfterWMLoaded(main);

    function main() {
        // map a regex (which matches relevant urls) to a domain replacement, groups 1 and 3 must be defined (but are preserved)
        const DOMAIN_SWAPS = [];
        DOMAIN_SWAPS.push({
            regex: /(\/\/)(?:www\.)?(twitter\.com|x\.com)(\/[^\/]+\/status\/\d+)/gi,
            domain: "fxtwitter.com",
        });
        DOMAIN_SWAPS.push({
            regex: /(\/\/)(?:www\.)?(bilibili\.com)(\/video\/[^\/]+)/gi,
            domain: "vxbilibili.com",
        });

        const UsedModules = {
            messageSend: window.Filters.byKeys(["sendMessage"]),
        };
        waitForAllModules(UsedModules).then(() => {
            var msgF = UsedModules.messageSend;
            msgF.sendMessage = (function () {
                var cacheF = msgF.sendMessage;
                return function () {
                    if (arguments.length > 2 && arguments[1].content) {
                        // modify message with regex
                        DOMAIN_SWAPS.forEach((pair) => {
                            arguments[1].content =
                                arguments[1].content.replaceAll(
                                    pair.regex,
                                    "$1" + pair.domain + "$3",
                                );
                        });
                    }
                    return cacheF.apply(this, arguments);
                };
            })();
        });
    }
})();
