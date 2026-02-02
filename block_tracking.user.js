// ==UserScript==
// @name         Block Discord Tracking
// @version      0.1.1
// @description  Blocks 'TRACK' events in discord's dispatcher, NOT a comprehensive privacy solution.
// @author       NeverDecaf
// @match        https://discord.com/*
// @require      https://neverdecaf.github.io/discord-userscripts/webpackmodules.js?v=3
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function () {
    "use strict";
    WMInit().then(() => {
        const Modules = {};
        waitForAllModules(Modules).then(() => {
            const originalDispatch = Modules.Dispatcher.dispatch;
            Modules.Dispatcher.dispatch = function (action, ...rest) {
                if (action?.type === "TRACK") return;
                return originalDispatch.call(this, action, ...rest);
            };
        });
    });
})();
