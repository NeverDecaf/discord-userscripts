// ==UserScript==
// @name         Discord Filename Randomizer
// @version      0.2.1
// @description  "Randomize" filenames of uploaded files on discord by replacing them with the current timestamp
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
            fileUploads: {
                filter: Filters.byStrings(["uploadFiles"]),
                options: { searchExports: true },
            },
        };
        function randomizeFilename(originalFilename) {
            let ext = originalFilename.split(".").pop();
            if (ext) {
                ext = "." + ext.toLowerCase();
            }
            return `${Date.now().toString()}${ext}`;
        }
        waitForAllModules(Modules).then(() => {
            const originalUploadFiles =
                Modules.fileUploads.prototype.uploadFiles;
            Modules.fileUploads.prototype.uploadFiles = function () {
                for (const file of arguments[0]) {
                    file.filename = randomizeFilename(file.filename);
                }
                return originalUploadFiles.apply(this, arguments);
            };
        });
    });
})();
