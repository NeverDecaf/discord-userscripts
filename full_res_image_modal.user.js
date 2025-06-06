// ==UserScript==
// @name         Discord full resolution image modal
// @version      0.5.2
// @description  Replace image preview modal with the original image (the image you see when clicking "Open original").
// @author       NeverDecaf
// @match        https://discord.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function () {
    "use strict";
    const ENABLE_FALLBACK = true; // If true will revert to the original image on error.
    const DEBUG_STYLES = false; // If true will apply green/red borders for debugging.
    const EXCLUDED_HOSTS = ["share.redd.it", "reddit.com"]; // do not replace image src on these domains
    const EMBED_REGEX =
        /^https:\/\/images-ext-\d+\.discordapp\.net\/external\/[^/]+(?:\/(\?[^/]+))?\/([a-z]+)\/([^?]+)(\?.*)?$/i;
    // Replace Discord URLs in the img src with the preferred format
    function fixSrc(src) {
        let url = decodeURIComponent(src)
            .replace("media.discordapp.net", "cdn.discordapp.com")
            .replace(
                EMBED_REGEX,
                (_, frag, proto, path) => `${proto}://${path}${frag ?? ""}`,
            );
        // Special case for Twitter URLs
        if (url.startsWith("https://pbs.twimg.com/media/")) {
            url = url.replace(/:\w+$/, ""); // remove :large or :anything
            // Use URL to check if name=orig param exists
            const u = new URL(url);
            if (!u.searchParams.has("name")) {
                u.searchParams.append("name", "orig");
                url = u.toString();
            }
        }
        return url;
    }

    // Observe src changes on a single image and fix its URL dynamically
    function observeImage(img) {
        if (img.dataset.observerAttached) return; // Avoid duplicate observers
        if (
            EXCLUDED_HOSTS.some((host) => {
                const match = img.src.match(EMBED_REGEX);
                const embeddedHost = match
                    ? match[3].split("/")[0]
                    : new URL(img.src).hostname;
                return (
                    embeddedHost === host || embeddedHost.endsWith(`.${host}`)
                );
            })
        )
            return;
        const applyFix = () => {
            const oldSrc = img.src;
            const newSrc = fixSrc(oldSrc);
            if (newSrc !== oldSrc) {
                img.src = newSrc;
            }
        };

        const srcObserver = new MutationObserver(() => applyFix());
        if (ENABLE_FALLBACK) {
            img.onerror = () => {
                img.onerror = null;
                srcObserver?.disconnect();
                img.src = img.dataset.originalsrc;
                if (DEBUG_STYLES) img.style.border = "1px solid red";
            };
        }
        img.dataset.originalsrc = img.src;
        applyFix(); // Fix immediately on attach

        srcObserver.observe(img, {
            attributes: true,
            attributeFilter: ["src"],
        });
        img.dataset.observerAttached = "true";

        // Optional visual debugging
        if (DEBUG_STYLES) {
            img.style.border = "1px solid lime";
            img.style.boxSizing = "border-box";
        }
    }

    // Observer to watch for modal content and attach observers to images inside it
    const modalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.target
                .querySelectorAll(
                    ".carouselModal_d3a6f0 .imageWrapper_af017a.media_a22bfd img",
                )
                .forEach(observeImage);
        });
    });

    // Attach modalObserver once layerContainers appear in the DOM
    const attachObserver = new MutationObserver((mutations, observer) => {
        const containers = document.body.querySelectorAll(
            'div[class*="layerContainer"]',
        );
        if (containers.length) {
            containers.forEach((container) => {
                modalObserver.observe(container, {
                    childList: true,
                    subtree: true,
                });
            });
            observer.disconnect(); // We only need to attach once
        }
    });

    attachObserver.observe(document.body, { childList: true });
})();
