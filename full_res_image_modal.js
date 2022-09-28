// ==UserScript==
// @name         Discord full resolution image modal
// @version      0.2
// @description  Replace image preview modal with the original image (the image you see when clicking "Open original").
// @author       NeverDecaf
// @match        discord.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function () {
    "use strict";
    const ENABLE_FALLBACK = true; // If true will revert to the original image on error.
    const modalObserver = new MutationObserver(function (mutations, observer) {
        mutations.forEach(function (mutation) {
            mutation.target
                .querySelectorAll(
                    'div[class*="modal"] div[class*="imageWrapper"] img'
                )
                .forEach((img) => {
                    if (ENABLE_FALLBACK && !img.processed)
                        img.setAttribute(
                            "onerror",
                            `this.onerror=null; this.src='${img.src}';`
                        );
                    img.src = img.parentElement.nextSibling.href;
                    img.processed = true;
                });
        });
    });

    const attachObserver = new MutationObserver(function (mutations, observer) {
        const containers = document.body.querySelectorAll(
            'div[class*="layerContainer"]'
        );
        if (containers.length) {
            containers.forEach((c) => {
                modalObserver.observe(c, {
                    childList: true,
                });
            });
            observer.disconnect();
        }
    });

    attachObserver.observe(document.body, {
        childList: true,
    });
})();
