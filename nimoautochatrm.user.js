// ==UserScript==
// @name		 NimoChatRemoteLoading
// @namespace	 https://fb.com/wolf.xforce
// @version		 0.1
// @@updateURL   https://raw.githubusercontent.com/silverwolfceh/tamperscript/main/nimoautochatrm.user.js
// @description	 Nimo chat remote loading
// @author		 Vuu Van Tong
// @match		 https://www.nimo.tv/live/*
// @match		 https://nimo.tv/live/*
// @require		 https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
// @resource    buttonCSS https://raw.githubusercontent.com/necolas/css3-github-buttons/master/gh-buttons.css
// @resource    bootstrapCSS https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css
// @resource    githubButtonIconSet https://raw.githubusercontent.com/necolas/css3-github-buttons/master/gh-icons.png
// @require     https://kit.fontawesome.com/e06bda392d.js
// ==/UserScript==
/* Change log */
// V0.1: First release version
// V0.2: Refine code, adding bootstrap button

var $ = window.jQuery;
var cdn = "https://cdn.jsdelivr.net/gh/silverwolfceh/tamperscript/";
$(document).ready(function(){
    var cachev = get_random(0,10000);
    load_script("https://code.jquery.com/jquery-3.4.1.min.js");
    load_script(cdn + "controlbox.js?v=" + cachev);
    load_script(cdn + "nimoautochat.user.js?v=" + cachev);
});

function load_script(url) {
    var jscript = document.createElement("script");
    jscript.setAttribute("src", jquertsrc);
    document.body.appendChild(jscript);
}

function get_random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }