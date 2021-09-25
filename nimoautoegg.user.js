// ==UserScript==
// @name		 NimoLiveEgg
// @namespace	 https://fb.com/wolf.xforce
// @version		 0.1
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

var $ = window.jQuery;
var clmcounter = 0;
var clmretrymax = 20;
var revinterval = 500; //ms
var waitinterval = 5000; //ms
var channel_url = [""];
var exclude_url = ["https://www.nimo.tv/mkt/act/super/coin_box_lottery"];
$(document).ready(function(){

    if(active_condition()) {
        setTimeout(pause_stream, 8000);
        main_func();
    }
})

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
    var out = "[WOLF] " + msg;
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

function check_and_receive_egg() {
    receive();
    if(egg_avaiable()) {
        setTimeout(check_and_receive_egg, revinterval);
    } else {
        log_w("Egg not available, scheduled to check");
        setTimeout(check_and_receive_egg, waitinterval);
    }
}

function receive() {
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
    check_and_receive_egg();
}