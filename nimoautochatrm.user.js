// ==UserScript==
// @name		 NimoChatRemoteLoading
// @namespace	 https://fb.com/wolf.xforce
// @version		 0.4
// @@updateURL   https://raw.githubusercontent.com/silverwolfceh/tamperscript/main/nimoautochatrm.user.js
// @description	 Nimo chat remote loading
// @author		 Vuu Van Tong
// @match		 https://www.nimo.tv/live/*
// @match		 https://nimo.tv/live/*
// @require		 https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
// @require     https://kit.fontawesome.com/e06bda392d.js
// ==/UserScript==
/* Change log */
// V0.1: First release version
// V0.2: Refine code, adding bootstrap button
// V0.3: Fix bug
// V0.4: Promise loading style

var $ = window.jQuery;
var cdn = "https://cdn.jsdelivr.net/gh/silverwolfceh/tamperscript/";

$(document).ready(function(){
    var cachev = get_random(0,10000);
    
    load_script_promise('https://code.jquery.com/jquery-3.4.1.min.js')
    .then(function(rs) {
        return load_script_promise(cdn + "controlbox.js?v=" + cachev);
    })
    .then(function(rs) {
        return load_script_promise(cdn + "nimoautochat.user.js?v=" + cachev);
    })
    .catch(err => location.reload);
});

function load_script_promise(url) {
    return new Promise(function(resolve, reject) {
        var script = document.createElement("script");
        script.onload = resolve;
        script.onerror = reject;
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    });
}

function get_random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }