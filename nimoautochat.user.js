// ==UserScript==
// @name		 NimoAutoChat
// @namespace	 https://fb.com/wolf.xforce
// @version		 0.4
// @description	 Nimo autobot
// @author		 Vuu Van Tong
// @match		 https://www.nimo.tv/live/*
// @match		 https://nimo.tv/live/*
// @require		 https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
// @resource    buttonCSS https://raw.githubusercontent.com/necolas/css3-github-buttons/master/gh-buttons.css
// @resource    bootstrapCSS https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css
// @resource    githubButtonIconSet https://raw.githubusercontent.com/necolas/css3-github-buttons/master/gh-icons.png
// @require     https://kit.fontawesome.com/e06bda392d.js
// @grant		 GM_setValue
// @grant		 GM_getValue
// @grant		 GM_deleteValue
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_getResourceURL
// ==/UserScript==
/* Change log */
// V0.1: First release version
// V0.2: Add clock bar
// V0.3: Fix typo and clear the noti message for idol offline
// V0.4: Detect keywork demo

var $ = window.jQuery;
var chatmsg_normal = ["Mọi người vào rom cho IDOL xin 1 cái follow nha ❤️",
               "Hi everyone, welcome! Please also follow IDOL to be chilled with songs 😎",
               "Mọi người vào chơi vui vẻ, xin 1 cái follow là được rồi ạ ❤️❤️❤️",
               "Thanks for joining this channel, please help to follow IDOL.You can also request songs",
               "Cám ơn mọi người đã vào room nha, mọi người cho IDOL xin 1 follow ạ ❤️❤️❤️",
               "Hi guys, you know we have a great idol here :) Don't hesitate to follow ^^",
               "Mọi người yêu quý IDOL thì cho IDOL 1 follow ạ. Cám ơn mọi người",
               "Hi, please help by following IDOL. Thanks so much ❤️",
               "You feel sad? listen to the song. You feel happy 🥰? Follow and listen to many songs  ❤️❤️"
              ];
var chatmsg_egg = ["Mọi người vào lụm trứng cho IDOL xin 1 follow chúc mọi người một ngày zui ze ❤️❤️❤️",
                   "Please follow the streamer, we have a lot of eggs will be given out you know?",
                   "Chúc mọi người lụm được kim cương nha, yêu mọi người ❤️",
                   "Hey, good luck guys. Don't forget to follow IDOL, you will have more luck for sure ❤️",
                   "Trứng còn nhiều, từ từ lụm và chớ quên follow nha người ơi 😝"];
var chatmsg_offline = [ "Hi mọi người, IDOL sẽ live sớm thôi, cám ơn mọi người đã chờ",
                       "Chào mọi người, xíu xíu nữa là IDOL sẽ online nhé ❤️",
                       "IDOL sắp online rồi mọi người ơi....",
                       "Chỉ còn vài phút nữa thôi, mọi người chờ cùng em nhé"
                       ];

var keywords = {"hi" : "Xin chào bạn, chúc bạn nghe nhạc vui vẻ. Nếu hay thì cho streamer 1 follow ạ ❤️",
        "minhii" : "Chị MinHii siêu cute, hát siêu hay đó bạn !!"
    };
var msg_item;
var last_msg = "";
var kw_enable = true;
var prefix = "[🔥Auto] ";

var idols = {"922745114" : "MinHii🎹", "177713304" : "DontCry"};
var NG = "NOT_SUPPORT";
var MODE_EGG = "eggg";
var MODE_OFFLINE = "offline";
var MODE_NORMAL = "normal";
var msg_interval = 20000;
var chatmsg = {[MODE_OFFLINE]: chatmsg_offline, [MODE_EGG]: chatmsg_egg, [MODE_NORMAL]:  chatmsg_normal};
var timeintervals = {[MODE_OFFLINE]: 10000, [MODE_EGG]: 60000, [MODE_NORMAL]:  120000};

/*--------------CONTROL_BOX AND LOGGER LIBRARY-------------*/
var cbox_model = `
<div class="controlbox" style="position: fixed; z-index: 9999; left : 160px; top: 20px; background-color: black; height: 30px; valign: middle">
  <div class="button-group">
    <button type="button" id="button_play" class="btn">
      <i id="cbox_play" class="fa fa-play"></i>
    </button>
    <button type="button" id="button_stop" class="btn">
      <i class="fa fa-stop"></i>
    </button>
    <i id="noti" style="color:white"></i>
  </div>
</div>
`;
var CBOX_PLAYING = 0;
var CBOX_PAUSE = 1;
var CBOX_STOP = 2;
var cbox_play_state = CBOX_PLAYING;
var cbox_stop_state = false;
var cbox_state = CBOX_PLAYING;
var cbox_enable = false;

var logger_name = "AAAA";
var LOGGER_DEBUG = 2;
var LOGGER_INFO = 1;
var LOGGER_ERROR = 0;
var logger_lvl = LOGGER_INFO;


function playclick_action() {
    var newstate = CBOX_PLAYING;
    if(cbox_stop_state == true) {
        cbox_stop_state = false;
        newstate = CBOX_PLAYING
    } else if(cbox_play_state == CBOX_PLAYING) {
        newstate = CBOX_PAUSE;
    } else if(cbox_play_state == CBOX_PAUSE) {
        newstate = CBOX_PLAYING;
    } else {
        logger("Something unexpected", LOGGER_ERROR, false);
    }

    if(newstate == CBOX_PAUSE) {
        cbox_play_state = CBOX_PAUSE;
        cbox_state = CBOX_PAUSE;
        document.getElementById("cbox_play").classList.remove("fa-play");
        document.getElementById("cbox_play").classList.add("fa-pause");
        $('#noti').text("Paused");
    } else if(newstate == CBOX_PLAYING) {
        cbox_play_state = newstate;
        cbox_state = newstate;
        document.getElementById("cbox_play").classList.remove("fa-pause");
        document.getElementById("cbox_play").classList.add("fa-play");
        $('#noti').text("Playing...");
    }
}

function stopclick_action() {
    cbox_stop_state = true;
    cbox_state = CBOX_STOP;
    $('#noti').text("Stopped");
}


function cbox_is_playable() {
    if(!cbox_enable) {
        alert("Please enable cbox");
        return undefined;
    }
    if(cbox_state == CBOX_PLAYING) {
        $('#noti').text("OK, running the script");
        return true;
    }
    $('#noti').text("Script stopped");
    return false;
}

function register_cbox() {
   $("body").prepend(cbox_model);
   $("#button_play").click(playclick_action);
   $("#button_stop").click(stopclick_action);
    cbox_enable = true;
}

function logger(msg, lvl = 0, islist = false) {
    if(lvl <= logger_lvl) {
        $('#noti').text(msg);
        console.log(msg);
    }
}
/*--------------CONTROL_BOX AND LOGGER LIBRARY-------------*/



$(document).ready(function(){
   register_cbox();
   clock_display();
   msg_items = document.getElementsByClassName('nimo-room__chatroom__message-item');
   keyword_check();
   if(check_chatmsg_compability()) {
       main();
   }
});

function get_welcome_msg(msg) {
    msg = msg.toLowerCase();
    if(msg in keywords) {
        return keywords[msg].replaceAll("IDOL", get_idol_id());
    } else {
        return "";
    }
}

function keyword_check() {
    if(kw_enable) {
        if(cbox_is_playable()) {
            try{
                var msg = msg_items[msg_items.length-1].getElementsByClassName("n-as-vtm")[0].innerText;
                if(msg != last_msg) {
                    last_msg = msg;
                    wlcm_msg = get_welcome_msg(last_msg);
                    if(wlcm_msg != "") {
                        send_message(wlcm_msg, "WELCOME MSG");
                    }
                }
            } catch (error) {
        
            }
        }
        setTimeout(keyword_check, 1000);
    }
    
}

function check_chatmsg_compability() {
    var result = true;
    var check_arr = [chatmsg_normal, chatmsg_egg, chatmsg_offline];
    var i = 0, j = 0;
    var total_len = 0;
    for(i = 0; i < check_arr.length; i++) {
        var chatmsg = check_arr[i];
        for(j = 0; j < chatmsg.length; j++) {
            var msg = chatmsg[j];
            total_len = msg.length + prefix.length;
            if(total_len >= 100) {
                console.log("Msg len " + total_len + " is not support: " + msg);
                result = false;
            }
        }
    }
    return result;
}

function get_chat_msg(whatmode) {
    var idx = Math.floor(Math.random() * whatmode.length);
    return whatmode[idx];
}

function get_idol_id() {
    var stream_url = document.location.href;
    var id = stream_url.split("/live/")[1].split("?")[0];
    console.log(id);
    if(id in idols) {
        return idols[id];
    }
    return NG;
}



function egg_avaiable() {
    if(document.getElementsByClassName("nimo-box-gift__box__cd").length == 0) {
        return false;
    } else {
        return true;
    }
}

function is_idol_offline() {
    if(document.getElementsByClassName("nimo-anchor-broadcast-game nimo-rm_type n-fx0 n-as-mrgh c2").length > 0) {
        var data = document.getElementsByClassName("nimo-anchor-broadcast-game nimo-rm_type n-fx0 n-as-mrgh c2")[0].innerText;
        if(data.indexOf("ago streamed") != -1) {
            return true;
        }
    }
    return false;
}

function get_mode() {
    if(egg_avaiable()) {
        return MODE_EGG;
    }
    if(is_idol_offline()) {
        return MODE_OFFLINE;
    }
    return MODE_NORMAL;
}

function change_interval(mode) {
    msg_interval = timeintervals[mode];
}

function send_message(msg, idol_name) {
    var step = 0;
    if(document.getElementsByClassName("nimo-room__chatroom__chat-box__input nimo-chat-box__input n-as-scroll c1").length > 0) {
        document.getElementsByClassName("nimo-room__chatroom__chat-box__input nimo-chat-box__input n-as-scroll c1")[0].value = msg;
        step = step + 1;
    }
    if(document.getElementsByClassName("nimo-btn nimo-chat-box__send-btn n-fx0 nimo-btn-secondary").length > 0) {
        document.getElementsByClassName("nimo-btn nimo-chat-box__send-btn n-fx0 nimo-btn-secondary")[0].click();
        step = step + 1;
    }

    if(step == 2) {
        logger("Sending auto message for IDOL " + idol_name, LOGGER_INFO);
        return true;
    }
    return false;
}

function clock_display() {
  var date = new Date;
  var seconds = date.getSeconds();
  var minutes = date.getMinutes();
  var hour = date.getHours();
  logger("Current time: " + hour + ":" + minutes + ":" + seconds);
  setTimeout(clock_display, 1000);
}

function run_work() {
    var idol_name = get_idol_id();
    if(idol_name == NG) {
        logger("The idol aren't activated in tool", LOGGER_ERROR);
        return false;
    }
    var mode = get_mode();
    var msg = get_chat_msg(chatmsg[mode]);
    change_interval(mode);
    msg = msg.replaceAll("IDOL", idol_name);
    msg = prefix + msg;
    if(mode != MODE_OFFLINE) {
        send_message(msg, idol_name);
    } else {
      // Idol is offline. No action
    }
}

function main() {
    if(cbox_is_playable()) {
        run_work();
        setTimeout(main,msg_interval);
    } else {
        setTimeout(main, 1000);
    }
}
