// ==UserScript==
// @name         Hide Typing Status on Discord
// @version      1.1
// @description  Prevents other users from seeing when you are typing.
// @author       NeverDecaf
// @match        https://discord.com/*
// @require      https://neverdecaf.github.io/discord-userscripts/webpackmodules.js?v=0
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function () {
	"use strict";

	runAfterWMLoaded(main);

	function main() {
		const UsedModules = {
			dispatcher: window.Filters.byKeys([
				"dispatch",
				"subscribe",
				"register",
			]),
		};
		waitForAllModules(UsedModules).then(() => {
			const originalDispatch = UsedModules.dispatcher.dispatch;
			UsedModules.dispatcher.dispatch = function (action, ...rest) {
				if (action?.type === "TYPING_START_LOCAL") return;
				return originalDispatch.apply(this, [action, ...rest]);
			};
		});
	}
})();
