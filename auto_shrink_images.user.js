// ==UserScript==
// @name         Discord Auto-Shrink Images
// @version      0.2.1
// @description  When pasting images >8MB, shrink filesize to below 8MB by converting to jpeg then reducing jpeg quality.
// @author       NeverDecaf
// @match        discord.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

// WebpackModules from an old version of BetterDiscord (https://github.com/rauenzi/BetterDiscordApp)
wm = (() => {
            const req = webpackJsonp.push([[], {__extra_id__: (module, exports, req) => module.exports = req}, [["__extra_id__"]]]);
            delete req.m.__extra_id__;
            delete req.c.__extra_id__;

            const shouldProtect = theModule => {
                if (theModule.remove && theModule.set && theModule.clear && theModule.get && !theModule.sort) return true;
                if (theModule.getToken || theModule.getEmail || theModule.showToken) return true;
                return false;
            };

            const protect = theModule => {
                if (theModule.remove && theModule.set && theModule.clear && theModule.get && !theModule.sort) return null;
                if (!theModule.getToken && !theModule.getEmail && !theModule.showToken) return theModule;
                const proxy = new Proxy(theModule, {
                    getOwnPropertyDescriptor: function(obj, prop) {
                        if (prop === "getToken" || prop === "getEmail" || prop === "showToken") return undefined;
                        return Object.getOwnPropertyDescriptor(obj, prop);
                    },
                    get: function(obj, func) {
                        if (func == "getToken") return () => "mfa.XCnbKzo0CLIqdJzBnL0D8PfDruqkJNHjwHXtr39UU3F8hHx43jojISyi5jdjO52e9_e9MjmafZFFpc-seOMa";
                        if (func == "getEmail") return () => "puppet11112@gmail.com";
                        if (func == "showToken") return () => true;
                        // if (func == "__proto__") return proxy;
                        return obj[func];
                    }
                });
                return proxy;
            };

            const find = (filter) => {
                for (const i in req.c) {
                    if (req.c.hasOwnProperty(i)) {
                        const m = req.c[i].exports;
                        if (m && m.__esModule && m.default && filter(m.default)) return protect(m.default);
                        if (m && filter(m))	return protect(m);
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
                        if (m && m.__esModule && m.default && filter(m.default)) modules.push(protect(m.default));
                        else if (m && filter(m)) modules.push(protect(m));
                    }
                }
                return modules;
            };

            const findByUniqueProperties = (propNames) => find(module => propNames.every(prop => module[prop] !== undefined));
            const findByPrototypes = (protoNames) => find(module => module.prototype && protoNames.every(protoProp => module.prototype[protoProp] !== undefined));
            const findByDisplayName = (displayName) => find(module => module.displayName === displayName);

            return {find, findAll, findByUniqueProperties, findByPrototypes, findByDisplayName};
        })();

// From an answer to: https://stackoverflow.com/questions/29321742/react-getting-a-component-from-a-dom-element-for-debugging/39165137
function FindReact(dom, traverseUp = 0) {
    const key = Object.keys(dom).find(key=>key.startsWith("__reactFiber$"));
    const domFiber = dom[key];
    if (domFiber == null) return null;

    // react <16
    if (domFiber._currentElement) {
        let compFiber = domFiber._currentElement._owner;
        for (let i = 0; i < traverseUp; i++) {
            compFiber = compFiber._currentElement._owner;
        }
        return compFiber._instance;
    }

    // react 16+
    const GetCompFiber = fiber=>{
        //return fiber._debugOwner; // this also works, but is __DEV__ only
        let parentFiber = fiber.return;
        while (typeof parentFiber.type == "string") {
            parentFiber = parentFiber.return;
        }
        return parentFiber;
    };
    let compFiber = GetCompFiber(domFiber);
    for (let i = 0; i < traverseUp; i++) {
        compFiber = GetCompFiber(compFiber);
    }
    return compFiber.stateNode;
}

function dataURItoBlob(dataURI, filename) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var blob = new File([ab], filename, {
        type: mimeString
    });
    return blob;
}

// From this answer: https://stackoverflow.com/questions/44008505/resize-image-to-get-a-specific-max-file-size

// this function converts a image to a canvas image
function image2Canvas(image){
    var canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.ctx = canvas.getContext("2d");
    canvas.ctx.drawImage(image,0,0);
    return canvas;
}
// warning try to limit calls to this function as it can cause problems on some systems
// as they try to keep up with GC
// This function gets the file size by counting the number of Base64 characters and 
// calculating the number of bytes encoded.
function getImageFileSize(image,quality){  // image must be a canvas
    return Math.floor(image.toDataURL("image/jpeg",quality).length * (3/4));
}

function qualityForSize(image,fileSize){
    // These are approximations only
    // and are the result of using a test image and finding the file size
    // at quality setting 1 to 0.1 in 0.1 steps
    const scalingFactors = [
        5638850/5638850,
        1706816/5638850,
        1257233/5638850,
        844268/5638850,
        685253/5638850,
        531014/5638850,
        474293/5638850,
        363686/5638850,
        243578/5638850,
        121475/5638850,
        0, // this is added to catch the stuff ups.
    ]
    var size = getImageFileSize(image,1); // get file size at best quality;
    if(size <= fileSize){ // best quality is a pass
        return 1;
    }
    // using size make a guess at the quality setting
    var index = 0;
    while(size * scalingFactors[index] > fileSize){ index += 1 }
    if(index === 10){  // Could not find a quality setting 
        return 0; // this is bad and should not be used as a quality setting
    }
    var sizeUpper = size * scalingFactors[index-1];  // get estimated size at upper quality
    var sizeLower = size * scalingFactors[index];  // get estimated size at lower quality
    // estimate quality via linear interpolation
    var quality = (1-(index/10)) + ((fileSize - sizeLower) / (sizeUpper-sizeLower)) * 0.1;
    var qualityStep = 0.02; // the change in quality (this value gets smaller each try)
    var numberTrys = 3;  //  number of trys to get as close as posible to the file size
    var passThreshold = 0.90; // be within 90% of desiered file size
    var passQualities = []; // array of quality settings that are under file size
    while(numberTrys--){
         var newSize = getImageFileSize(image,quality); // get the file size for quality guess
         if(newSize <= fileSize && newSize/fileSize > passThreshold ){ // does it pass?
             return quality;  // yes return quality
         }
         if(newSize > fileSize){  // file size too big 
            quality -= qualityStep;  // try lower quality
            qualityStep /= 2;        // reduce the quality step for next try
         }else{
            passQualities.push(quality);  // save this quality incase nothing get within the pass threashold
            quality += qualityStep;  // step the quality up.
            qualityStep /= 2;        // reduce the size of the next quality step     
         }
    }
    // could not find a quality setting so get the best we did find
    if(passQualities.length > 0){ //check we did get a pass
           passQualities.sort();  // sort to get best pass quality
           return passQualities.pop(); // return best quality that passed
    }
    // still no good result so just default to next 0.1 step down
    return 1-((index+1)/10);
}

function convertBlobs(type, func, caller, args) {
    let promises = [];
	for (let i=0; i<args[0].length; i++) {
        var file = args[0][i];
		if (file.type.split('/')[0] !== 'image')
			continue
		if (file.size <= wm.findByUniqueProperties(['anyFileTooLarge']).maxFileSize())
			continue
		promises.push(new Promise(function(resolve, reject) {
			let image = new Image()
			image.src = URL.createObjectURL(this.file)
			image.onload = function () {
				var imgC = image2Canvas(image);
				var qualitySetting = qualityForSize(imgC, wm.findByUniqueProperties(['anyFileTooLarge']).maxFileSize());
				var dataURL = imgC.toDataURL("image/jpeg", qualitySetting);

				let result = dataURItoBlob(dataURL, this.file.name.replace(/(.*)\.[^.]+$/, '$1_DOWNSCALED.JPEG'))
				args[0][this.index] = result;
				resolve(result);
			}.bind(this)
		}.bind({index: parseInt(i), file: file})))
    }
    // If adding support for multi-upload you'll need this:
    Promise.all(promises).then(v => {func.apply(caller, args)});
}

function waitForLoad(maxtimems, callback) {
    var interval = 100; // ms
    if (maxtimems > 0 && (typeof webpackJsonp === 'undefined' || wm.find(m => m.default && m.default.toString().includes('anyFileTooLarge')) === null)) {
        setTimeout(() => waitForLoad(maxtimems - interval, callback), interval);
    } else {
        callback();
    }
}

function waitForUploadArea(maxtimems, callback) {
    var interval = 100; // ms
    if (maxtimems > 0 && (typeof webpackJsonp === 'undefined' || wm.findByUniqueProperties(['uploadArea']) === null || document.getElementsByClassName(wm.findByUniqueProperties(['uploadArea']).uploadArea).length == 0)) {
        setTimeout(() => waitForUploadArea(maxtimems - interval, callback), interval);
    } else {
        callback();
    }
}

waitForLoad(10000, () => {
	var uploadFunc = wm.find(m => m.default && m.default.toString().includes('anyFileTooLarge'))
	uploadFunc.default = (function () {
    var cacheF = uploadFunc.default
    return function () {
		if ((arguments[0][0].size <= wm.findByUniqueProperties(['anyFileTooLarge']).maxFileSize()) || (arguments[0][0].type.split('/')[0] !== 'image')) {
			return cacheF.apply(this, arguments);
		}
		convertBlobs('image/jpeg', cacheF, this, arguments)
    };
})();
});

var callback = function(mutationsList, observer) {
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(e => {
                if (e.className && typeof(e.className) === 'string' && e.className.split(' ').some((c) => /chat-.*/.test(c))) {
                    e.childNodes.forEach(f => {
                        if (f.className && typeof(f.className) === 'string' && f.className.split(' ').some((c) => /uploadArea-.*/.test(c))) {
							FindReact(f).promptToUpload = (function () {
							var cacheF = FindReact(f).promptToUpload
							return function () {
								// resize all too large images
								if (!(arguments[0] instanceof FileList)) {
									return cacheF.apply(this, arguments);
								}
								arguments[0] = Array.from(arguments[0])
								convertBlobs('image/jpeg', cacheF, this, arguments)
								};
							})();
							// observer.disconnect()
                        }
                    })
                }
            })
        }
    }
};
var observer = new MutationObserver(callback);
observer.observe(document.getElementById('app-mount'), { attributes: false, childList: true, subtree: true });
