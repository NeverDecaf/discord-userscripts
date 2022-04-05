// ==UserScript==
// @name         Always TwitFix
// @version      0.1
// @description  Replace twitter.com links in messages you send (on discord) with fxtwitter.com
// @author       NeverDecaf
// @match        discord.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
const chunkName = "webpackChunkdiscord_app";
// WebpackModules from an old version of BetterDiscord (https://github.com/rauenzi/BetterDiscordApp)

const wm = (() => {
    const req = (() => {
        const id = "twitfix-webpackmodules";
        let __webpack_require__ = undefined;
        if (typeof webpackJsonp !== "undefined") {
            __webpack_require__ = window.webpackJsonp.push([
                [],
                {
                    [id]: (module, exports, __internal_require__) =>
                        (module.exports = __internal_require__),
                },
                [[id]],
            ]);
        } else if (typeof window[chunkName] !== "undefined") {
            window[chunkName].push([
                [id],
                {},
                (__internal_require__) =>
                    (__webpack_require__ = __internal_require__),
            ]);
        }
        delete __webpack_require__.m[id];
        delete __webpack_require__.c[id];
        return __webpack_require__;
    })();

    const shouldProtect = (theModule) => {
        if (
            theModule.remove &&
            theModule.set &&
            theModule.clear &&
            theModule.get &&
            !theModule.sort
        )
            return true;
        if (theModule.getToken || theModule.getEmail || theModule.showToken)
            return true;
        return false;
    };

    const protect = (theModule) => {
        if (
            theModule.remove &&
            theModule.set &&
            theModule.clear &&
            theModule.get &&
            !theModule.sort
        )
            return null;
        if (!theModule.getToken && !theModule.getEmail && !theModule.showToken)
            return theModule;
        const proxy = new Proxy(theModule, {
            getOwnPropertyDescriptor: function (obj, prop) {
                if (
                    prop === "getToken" ||
                    prop === "getEmail" ||
                    prop === "showToken"
                )
                    return undefined;
                return Object.getOwnPropertyDescriptor(obj, prop);
            },
            get: function (obj, func) {
                if (func == "getToken")
                    return () =>
                        "mfa.XCnbKzo0CLIqdJzBnL0D8PfDruqkJNHjwHXtr39UU3F8hHx43jojISyi5jdjO52e9_e9MjmafZFFpc-seOMa";
                if (func == "getEmail") return () => "puppet11112@gmail.com";
                if (func == "showToken") return () => true;
                // if (func == "__proto__") return proxy;
                return obj[func];
            },
        });
        return proxy;
    };

    const find = (filter) => {
        for (const i in req.c) {
            if (req.c.hasOwnProperty(i)) {
                const m = req.c[i].exports;
                if (m && m.__esModule && m.default && filter(m.default))
                    return protect(m.default);
                if (m && filter(m)) return protect(m);
            }
        }
        // console.warn("Cannot find loaded module in cache");
        return null;
    };

    const findAll = (filter) => {
        const modules = [];
        for (const i in req.c) {
            if (req.c.hasOwnProperty(i)) {
                const m = req.c[i].exports;
                if (m && m.__esModule && m.default && filter(m.default))
                    modules.push(protect(m.default));
                else if (m && filter(m)) modules.push(protect(m));
            }
        }
        return modules;
    };

    const findByUniqueProperties = (propNames) =>
        find((module) => propNames.every((prop) => module[prop] !== undefined));
    const findByPrototypes = (protoNames) =>
        find(
            (module) =>
                module.prototype &&
                protoNames.every(
                    (protoProp) => module.prototype[protoProp] !== undefined
                )
        );
    const findByDisplayName = (displayName) =>
        find((module) => module.displayName === displayName);

    return {
        find,
        findAll,
        findByUniqueProperties,
        findByPrototypes,
        findByDisplayName,
    };
})();

function waitForLoad(maxtimems, callback) {
    var interval = 100; // ms
    if (
        maxtimems > 0 &&
        (typeof wm === "undefined" ||
            wm.findByUniqueProperties(["promptToUpload"]) === null)
    ) {
        setTimeout(() => waitForLoad(maxtimems - interval, callback), interval);
    } else {
        callback();
    }
}

const TWITTER_DOMAIN = /(twitter\.com)(\/[^\/]+\/status\/\d+)/gi;
const TWITFIX_DOMAIN = "fxtwitter.com";
waitForLoad(10000, () => {
    var msgF = wm.findByUniqueProperties(["sendMessage"]);
    msgF.sendMessage = (function () {
        var cacheF = msgF.sendMessage;
        return function () {
            if (arguments.length > 2 && arguments[1].content) {
                // modify message with regex
                arguments[1].content = arguments[1].content.replaceAll(
                    TWITTER_DOMAIN,
                    TWITFIX_DOMAIN + "$2"
                );
            }
            return cacheF.apply(this, arguments);
        };
    })();
});
