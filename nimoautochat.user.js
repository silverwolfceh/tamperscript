// ==UserScript==
// @name		 NimoAutoChat
// @namespace	 https://fb.com/wolf.xforce
// @version		 0.8
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
// V0.5: Add autopause stream and autoreload
// V0.6: Add autoloading keyword from github
// V0.7: Add method to check last message sent or not
// V0.8: Prevent the script go to sleep
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

var cmd = {"!rl" : load_keywords, "!ks" : keywords_status};
// var keywords = {"hi" : "Xin chào bạn, chúc bạn nghe nhạc vui vẻ. Nếu hay thì cho streamer 1 follow ạ ❤️",
//         "minhii" : "Chị MinHii siêu cute, hát siêu hay đó bạn !!",
//         "tina" : "Chị Tina là siêu mẫu, hát hay nữa.",
//         "tùng" : "Anh Tùng là admin mà sợ Idol ban nhất room. Hài không?",
//         "minhiifamily" : "Ừm, Minhii Family là một gia đình siêu xịn xò đó nha. Nhìn avatar xem :))",
//         "yutin" : "Người anh 10 ngày thì 9 ngày ngủ sofa",
//         "vu" : "Ờm, tui không rõ tui là người hay là bot nữa. Hay gọi là trưởng ban kỹ thuật của Minhii's Family nhé",
//         "!fl1" : "Cám ơn bạn đã follow Minhii nha. Chúc bạn có một thời gian nghe nhạc thật vui",
//         "!fl2" : "Thanks for following idol Minhii. We are happy to have you here. Please enjoy the music",
//         "p" : "Heart beat...",
//         "duyn" : "Là người chị em cũng nhau đập 'đá' của Minhii idol đó ạ",
//         "!pk": "Hello mọi người, giúp idol PK đi mọi người ơi. Cám ơn mọi người 🥰",
//         "!pke" : "Hello, please help idol in this PK. Thanks so much 🥰"
//     };
var keywords;
var keywords_load_finished = false;
var msg_items;
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
var timeintervals = {[MODE_OFFLINE]: 1*60*1000, [MODE_EGG]: 180000, [MODE_NORMAL]:  5*60*1000};

var reload_after_second = 1*60*60*1000; // Reload after 1 hour

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
//    clock_display();
   load_keywords();
   msg_items = document.getElementsByClassName('nimo-room__chatroom__message-item');
   keyword_check();
   pause_stream();
   if(check_chatmsg_compability()) {
       main();
   }
});

function keywords_status() {
    if(keywords_load_finished) {
        console.log("Loaded finished");
    } else {
        console.log("Loading....");
    }
}

function load_keywords() {
    console.log("Start loading keywords...")
    keywords_load_finished = false;
    var http = new XMLHttpRequest;
    var url = "https://raw.githubusercontent.com/silverwolfceh/tamperscript/main/keywords.json";
    http.open("GET", url, !0);
    http.onreadystatechange = function() {
        if (4 == http.readyState && 200 == http.status) {
            var json_data = JSON.parse(http.responseText);
            keywords = json_data;
            keywords_load_finished = true;
            console.log("Finished loading keywords...")
        }
    };
    http.send();
}
function reload_stream() {
    location.reload();
}
function pause_stream() {
    if(document.getElementsByClassName("nimo-icon nimo-icon-web-pause").length == 0) {
        setTimeout(pause_stream, 2000);
    } else {
        document.getElementsByClassName("nimo-icon nimo-icon-web-pause")[0].click();
    }
}

function get_welcome_msg(msg) {
    msg = msg.toLowerCase();
    if(msg in cmd) {
        cmd[msg]();
        return "";
    }
    if(msg in keywords) {
        return keywords[msg].replaceAll("IDOL", get_idol_id());
    } else {
        return "";
    }
}
function is_lastmessage_sent() {
    try {
        if(document.getElementsByClassName("nimo-room__chatroom__chat-box__input nimo-chat-box__input n-as-scroll c1")[0].value != '') {
            return true;
        }
    } catch (error) {
        console.log("Error in check the last message");
    }
    return false;
}
function keyword_check() {
    if(kw_enable) {
        if(cbox_is_playable()) {
            try{
                var msg = msg_items[msg_items.length-1].getElementsByClassName("n-as-vtm")[0].innerText;
                if(msg != last_msg || !is_lastmessage_sent()) {
                    last_msg = msg;
                    var wlcm_msg = get_welcome_msg(last_msg);
                    if(wlcm_msg != "") {
                        send_message(wlcm_msg, "WELCOME MSG");
                    }
                }
            } catch (error) {
                console.log("Errror");
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

function send_message_offline(msg) {
    try {
        document.getElementsByClassName("nimo-room__chatroom__chat-box__input nimo-chat-box__input n-as-scroll c1")[0].value = msg;
    } catch (error) {

    }
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
        send_message_offline(msg); // Just keep some idle activity
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