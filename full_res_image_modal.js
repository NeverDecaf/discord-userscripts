// ==UserScript==
// @name         Discord full resolution image modal
// @version      0.1
// @description  Replace image preview modal with the original image (the image you see when clicking "Open original").
// @author       NeverDecaf
// @match        discord.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function () {
    "use strict";
    const modalObserver = new MutationObserver(function (mutations, observer) {
        mutations.forEach(function (mutation) {
            mutation.target
                .querySelectorAll(
                    'div[class*="modal"] div[class*="imageWrapper"] img'
                )
                .forEach((img) => {
                    img.src = img.parentElement.nextSibling.href;
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
