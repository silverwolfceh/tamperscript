// ==UserScript==
// @name		 NimoLiveEgg
// @namespace	 https://fb.com/wolf.xforce
// @version		 0.2
// @description	 Nimo TV Auto Get Egg
// @author		 Vuu Van Tong
// @match		 https://www.nimo.tv/*
// @require		 https://code.jquery.com/jquery-3.4.1.min.js
// @grant		 GM_setValue
// @grant		 GM_getValue
// @grant		 GM_deleteValue
// ==/UserScript==
/* Change log */
// V0.1: First release version
// V0.2: Fast mode and normal mode switcher

var $ = window.jQuery;
var mode_interval = {"fast" : 100, "normal" : 1000, "noegg" : 5000, "pausestream" : 8000};
var MODE_FAST = "fast";
var MODE_NORMAL = "normal";
var MODE_NOEGG = "noegg";
var PAUSE_STREAM = "pausestream";
var egg_click_interval = mode_interval[MODE_NORMAL];
var mode_switch_enable = 20; // <= 20 seconds will change to fast mode
var last_mode = MODE_NOEGG;
// Never pause the stream on these channel
var channel_url = ["https://www.nimo.tv/live/922745114"];
// Url that not support
var exclude_url = ["https://www.nimo.tv/mkt/act/super/coin_box_lottery"];

$(document).ready(function(){

    if(active_condition()) {
        setTimeout(pause_stream, mode_interval[PAUSE_STREAM]);
        main_func();
    }
})

function get_current_egg_time() {
    try {
        var eggtime = document.getElementsByClassName("nimo-box-gift__box__cd n-as-fs12")[0].innerText;
        var minutes = eggtime.split(":")[0];
        var seconds = eggtime.split(":")[1];
        seconds = parseInt(seconds) + parseInt(minutes) * 60;
        return seconds;
    } catch(error) {
        return -1;
    }
}
function check_mode() {
    if(!egg_avaiable() && !receive_btn_avaiable()) {
        return MODE_NOEGG;
    } else if(!egg_avaiable()) {
        return MODE_FAST;
    } else {
        var time = get_current_egg_time();
        if(time >= 0 && time <= mode_switch_enable) {
            return MODE_FAST;
        } else {
            return MODE_NORMAL;
        }
    }
    
}

function active_condition() {
    var active = true;
    var url = document.location.href;
    for(var i = 0; i < exclude_url.length; i++)
    {
        if(url.indexOf(exclude_url[i]) != -1) {
            active = false;
            break;
        }
    }

    return active;
}

function egg_avaiable() {
    if(document.getElementsByClassName("nimo-box-gift__box__cd").length == 0) {
        return false;
    } else {
        return true;
    }
}

function receive_btn_avaiable() {
    if(document.getElementsByClassName("nimo-btn nimo-box-gift__box__btn n-as-fs12 nimo-btn-primary nimo-btn-sm").length == 0) {
        return false;
    } else {
        return true;
    }
}

function log_w(msg, msg1 = "") {
    var out = "[Egg] " + msg;
    if(msg1 != "") {
        out = out + " [" + msg1 + "]";
    }
}

function pauseable() {
    for(var i = 0; i < channel_url.length; i++) {
        if(channel_url[i] == document.location.href) {
            return false;
        }
    }
    return true;
}

function pause_stream() {
    if(pauseable()) {
        if(document.getElementsByClassName("nimo-icon nimo-icon-web-pause").length == 0) {
            setTimeout(pause_stream, 2000);
        } else {
            document.getElementsByClassName("nimo-icon nimo-icon-web-pause")[0].click();
        }
    }
}

function loop() {
    var mode = check_mode();
    if(last_mode != last_mode) {
        log_w("Switch to " + mode + " from " + last_mode);
        last_mode = mode;
    }
    if(mode == MODE_NOEGG) {
        // No egg, don't need to received it.
        log_w("No egg");
    } else {
        receive_with_fault();
    }
    setTimeout(loop, mode_interval[mode]);
}

function receive_with_fault() {
    try {
        document.getElementsByClassName("nimo-box-gift__box__cd")[0].click();
        document.getElementsByClassName("nimo-box-gift__box__cd")[0].click();
    } catch (error) {
        //console.error("Lỗi nè");
    }

    try {
        document.getElementsByClassName("nimo-btn nimo-box-gift__box__btn n-as-fs12 nimo-btn-primary nimo-btn-sm")[0].click();
        document.getElementsByClassName("nimo-btn nimo-box-gift__box__btn n-as-fs12 nimo-btn-primary nimo-btn-sm")[0].click();
    } catch (error) {
        //console.error("lỗi 2");
    }
}

function main_func() {
    log_w("Started to obsever");
    loop();
}