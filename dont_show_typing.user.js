// ==UserScript==
// @name         Hide Typing Status on Discord
// @version      1.2.1
// @description  Prevents other users from seeing when you are typing.
// @author       NeverDecaf
// @match        https://discord.com/*
// @require      https://neverdecaf.github.io/discord-userscripts/webpackmodules.js?v=2
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
				if (action?.type === "TYPING_START_LOCAL") return;
				return originalDispatch.call(this, action, ...rest);
			};
		});
	});
})();
