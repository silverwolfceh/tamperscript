// ==UserScript==
// @name		 RemoteLoading
// @namespace	 https://fb.com/wolf.xforce
// @version		 0.1
// @@updateURL   https://raw.githubusercontent.com/silverwolfceh/tamperscript/main/nimoautochatrm.user.js
// @description	 Nimo chat remote loading
// @author		 Vuu Van Tong
// @match		 https://www.nimo.tv/live/*
// @match		 https://nimo.tv/live/*
// @require		 https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==
/* Change log */
// V0.1: First release version

var $ = window.jQuery;
var cdn = "https://cdn.jsdelivr.net/gh/silverwolfceh/tamperscript/";
$(document).ready(function(){
    load_script("https://code.jquery.com/jquery-3.4.1.min.js");
    load_script(cdn + "controlbox.js");
    load_script(cdn + "nimoautochat.user.js");
});

function load_script(url) {
    var jscript = document.createElement("script");
    jscript.setAttribute("src", jquertsrc);
    document.body.appendChild(jscript);
}