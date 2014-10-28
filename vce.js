
var vce = (function() {

    var vce = {
    };

    var sizes = [
        {w: 320, h: 180},
        {w: 428, h: 240},
        {w: 854, h: 480},
        {w: 1280, h: 720}
    ];
    var types = [
        {type: "video/mp4", extension: "mp4", codecs: "avc1.42C01F, mp4a.40.2"},
        {type: "video/ogg", extension: "ogg", codecs: "theora, vorbis"},
        {type: "video/webm", extension: "webm", codecs: "vp8, vorbis"}
    ];

    var template = "" +
            "<video id=\"vce-video\" preload=\"metadata\"> <!-- firefox won't load a video unless we tell it to preload the metadata!? -->" +
            "</video>" +
            "<div id=\"vce-overlay\">" +
            "    <div id=\"vce-spinner\"><div id=\"vce-spinner-text\">Loading...</div></div>" +
            "    <div id=\"vce-title\"></div>" +
            "    <div id=\"vce-sub-title\"></div>" +
            "    <div id=\"vce-error\">There was an error playing the video!</div>" +
            "    <div id=\"vce-choices\"></div>" +
            "</div>";

    var popcorn;

    var video_url;

    var init = vce.init = function(tree, options) {
        if (!(tree instanceof Array)) {
            tree = [tree];
        }
        
        //options
        options = options || {};

        var selector = options.selector || "#vce-container";
        if (typeof options === "string") {
            selector = options;
        } else if (options.el && typeof options.el === "string") {
            selector = options.el;
            delete options.el;
        }

        if (options.video_url) {
            video_url = options.video_url;
        }

        var el;

        var onload = function() {

            if (options.el) {
                el = options.el;
            } else if (selector) {
                el = document.querySelector(selector);
            }
            if (!el || !(el instanceof Element || el.length)) {
                throw "No element or selector passed";
            }
            if (el instanceof $) {
                el = el[0];
            }

            el.innerHTML = template;

            popcorn = vce.pocorn = Popcorn("#vce-video");
            popcorn.autoplay(false);
            popcorn.controls(false);

            saveNamedNodes(tree);
            executeNode(tree[0]);

        };
        if (document.readyState === "complete") {
            onload();
        } else {
            document.addEventListener("DOMContentLoaded", onload, false);
        }
    }

    var showChoices = vce.showChoices = function(node) {
        $("#vce-overlay").removeClass("vce-hidden");
        for (var c = 0 ; c < node.choices.length ; c++) {
            (function(choice) {
                var choiceDiv = $("<div class='vce-choice'>");
                choiceDiv.text(choice.label);
                choiceDiv.on("click", function() {
                    executeNode(getNode(choice.next));
                });
                $("#vce-choices").append(choiceDiv);
            })(node.choices[c]);
        }
    }

    var showText = vce.showText = function(node) {
        if (node.title) {
            $("#vce-title").text(node.title);
        }
        if (node.sub_title) {
            $("#vce-sub-title").text(node.sub_title);
        }
    }

    var namedNodes = {};
    var saveLeaf = function(leaf) {
        if (leaf.id) {
            namedNodes[leaf.id] = leaf;
        }
    }
    var saveNamedNodes = function(tree) {
        for (var t = 0 ; t < tree.length ; t++) {
            var leaf = tree[t];
            saveLeaf(leaf);
            while (leaf.next) {
                leaf = leaf.next;
                saveLeaf(leaf);
            }
            if (leaf.choices) {
                saveNamedNodes(leaf.choices);
            }
        }
    }

    var getNode = function(maybeNode) {
        if (typeof maybeNode === "string" && namedNodes[maybeNode]) {
            return namedNodes[maybeNode];
        } else if (typeof maybeNode === "object") {
            return maybeNode;
        }
        throw "This is not a node!";
    }

    var getVideo = function(maybeVideo) {
        if (typeof maybeVideo === "string") {
            return maybeVideo;
        } else if (typeof maybeVideo === "function") {
            return maybeVideo();
        }
        throw "This is not a video!";
    }

    var showPostVideo = function(node, delay) {
        delay = delay || node.delay || 0;
        if (node.title || node.sub_title) {
            showText(node);
        }
        if (node.choices) {
            showChoices(node);
        } else if (node.next) {
            setTimeout(function() {
                executeNode(getNode(node.next));
            }, delay);
        }
    }

    var executeNode = function(node) {
        $("#vce-choices").empty();
        $("#vce-title").empty();
        $("#vce-sub-title").empty();
        $("#vce-video").empty();

        $("#vce-error").removeClass("vce-shown");

        if (node.before) {
            node.before();
        }

        if (node.video) {
            $("#vce-spinner").addClass("vce-shown");
            for (var t = 0 ; t < types.length ; t++) {
                var type = types[t];
                for (var s = 0 ; s < sizes.length ; s++) {
                    var w = sizes[s].w;
                    var h = sizes[s].h;
                    if (s === sizes.length -1 || window.innerWidth * window.devicePixelRatio < sizes[s+1].w) {
                        var source = $("<source>");
                        var base_url = "";
                        if (!video_url || window.location.host === "localhost" || window.location.host === "0.0.0.0" || window.location.host === "127.0.0.1") {
                            base_url = "videos_transcoded/";
                        } else {
                            base_url = video_url;
                        }
                        source[0].src = base_url + getVideo(node.video) + "--" + h + "." + type.extension;
                        source.attr("type", type.type);
                        $("#vce-video").append(source);
                        break;
                    }
                }
            }
            var fallbackDiv = $("<div class=\"vce-fallback\">Your browser cannot play this video.</div>");
            $("#vce-video").append(fallbackDiv);
            var playVideoTimeout;
            var playVideo = function() {
                popcorn.off("canplay");
                popcorn.off("canplaythrough");
                popcorn.off("dataloaded");
                clearTimeout(playVideoTimeout);
                console.log("loaded video: " + this.video.currentSrc);
                $("#vce-spinner").removeClass("vce-shown");
                $("#vce-overlay").addClass("vce-hidden");
                popcorn.play();
                popcorn.on("ended", function() {
                    popcorn.off("ended");
                    if ($("#vce-video")[0].webkitExitFullScreen) {
                        $("#vce-video")[0].webkitExitFullScreen();
                    }
                    showPostVideo(node);
                    if (node.after) {
                        node.after();
                    }
                });
            };
            popcorn.on("canplay", playVideo);
            popcorn.on("canplaythrough", playVideo);
            popcorn.on("dataloaded", playVideo);
            playVideoTimeout = setTimeout(playVideo, 2000);
            popcorn.on("error", function(e) {
                popcorn.off("error");
                console.log("error: " + e);
                $("#vce-error").addClass("vce-shown");
                $("#vce-spinner").removeClass("shown");
            });
            popcorn.load();
        } else {
            showPostVideo(node, 5000);
        }
    }

    return vce;

})();

if (typeof module !== "undefined") {
    module.exports = vce;
} else {
    window.vce = vce;
}
