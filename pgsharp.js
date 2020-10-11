// ==UserScript==
// @name         PGSharpAutoReg
// @namespace    https://fb.com/wolf.xforce
// @version      0.1
// @description  Auto register trial key of PGSharp
// @author       Vuu Van Tong
// @match        https://www.pgsharp.com/*
// @match        https://manage.pgsharp.com/*
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

// Variables
var $ = window.jQuery;
var running = false;
var timer = undefined;
var email_domain = "@maildrop.cc";
var email = "";
var display = "<div id='info'>Current time: <span id='realclock'></span> Status: <span id='err'></span> | <span id='hm'>Back home</span></div>";
// Main function
$(document).ready(function(){
    setInterval(clock_update,1000);
    $('body').append(display);
    $("#info").css("position", "fixed").css("bottom", 0).css("left", "0").css("padding", "0").css("z-index", 9999).css("text-align","center");
    $("#info").css("height","30px").css("font-size", 20).css("background","white").css("color","green").css("width","100%");
    $("#hm").click(function() { back(); });
	var currentdate = new Date();
    var hrs = currentdate.getHours();
	var min = currentdate.getMinutes();
	var sec = currentdate.getSeconds();
	if(min % 5 == 4 && sec >= 55) {
        error("Trying...");
		do_try();
	} else if (min % 5 == 0 && sec <= 55) {
        error("Trying...");
		do_try();
	} else {
		setTimeout(do_activate,1000);
	}
})

function clock_update() {
    var currentdate = new Date();
    var hrs = currentdate.getHours();
	var min = currentdate.getMinutes();
	var sec = currentdate.getSeconds();
    var x = hrs + ":" + min + ":" + sec;
    $("#realclock").text(x);
}

function do_activate() {
	var now = new Date();
    var hrs = now.getHours();
	var min = now.getMinutes();
	var sec = now.getSeconds();
	if(min % 5 == 4 && sec >= 55) {
		console.log("Now, entering rush mode");
        error("Go....");
		back();
	} else {
		console.log("Not in time " + min + ":" + sec);
        error("Waiting....");
		setTimeout(do_activate,1000);
	}
}
function error(msg) {
    $("#err").text(msg);
}

function checkout_failed_active() {
    error("Something wrong, logout");
    log_out();
}
function do_try() {
	var url = document.location.href;
	if (url.indexOf("manage") == -1) {
		if(url.indexOf("429toomanyrequests") != -1) {
			back();
		} else {
			click_reg();
		}
	} else {
		if(document.title.indexOf("429") != -1) {
			back();
		} else if (document.getElementsByTagName("h1")[0].innerText.indexOf("Out of Stock") != -1) {
			back();
		} else if(url.indexOf("cart.php?a=view") != -1) {
			check_out();
		} else if(url.indexOf("cart.php?a=checkout&e=false") != -1) {
            fill_info();
            setTimeout(checkout_failed_active,60000);
		} else if(url.indexOf("cart.php?a=complete") != -1) {
            error("Good. Saved email");
			save_current_mail();
		} else if(url.indexOf("logout.php") != -1) {
            back();
        } else if(url.indexOf("cart.php?a=checkout&submit=1") != -1) {
            log_out();
        } else if(url.indexOf("clientarea.php") != -1) {
            back();
        }


	}
}

function build_mail(pref) {
    return pref + email_domain;
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function save_current_mail() {
    var ck = getCookie("lastmail");
    GM_setValue(ck, true);
    log_out();
}

function generate_next() {
    var email_pre = generate_email(10);
    GM_setValue(email_pre, false);
    setCookie("lastmail", email_pre, 7);
    email = build_mail(email_pre);
	return email;
}

function generate(length, charset) {
    var randomChars = charset;
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

function generate_email(length) {
    return generate(length, 'abcdefghijklmnopqrstuvwxyz');
}

function generate_name(length) {
    return generate(length, 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ');
}

function generate_num(length) {
    return generate(length, "0123456789");
}

function generate_address() {
    return generate_num(3) + " " + generate_name(8) + " " + generate_name(10);
}

function fill(item, index) {
	var kv = item.split("=");
	document.getElementById(kv[0]).value = kv[1];
}
function fill_info() {
	var email = generate_next();
    if(document.getElementById("inputFirstName")) {
        var infodb = ["inputFirstName=" + generate_name(5),
			"inputLastName=" + generate_name(4),
			"inputEmail="+email,
			"inputPhone=" + generate_num(9),
			"inputAddress1=" + generate_address(),
			"inputAddress2=" + generate_address(),
			"inputCity=Orlando",
			"stateinput=NA",
			"inputPostcode=70000",
			"inputCountry=VN",
			"inputNewPassword1=111111111",
			"inputNewPassword2=111111111"]
        infodb.forEach(fill);
        error("Wait for captcha");
    } else {
        error("Failed to find form");
        log_out();
    }
}

function check_out() {
	document.location.href = "https://manage.pgsharp.com/cart.php?a=checkout&e=false";
}

function click_reg() {
	var el = document.evaluate ('/html/body/div[1]/div/div/div/div/div/section[2]/div/div/div[1]/div/div/div/div/div/div/div[4]/a', document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	el.singleNodeValue.click();

}

function back() {
	document.location.href = "https://www.pgsharp.com/";
}

function log_out() {
    document.location.href = "https://manage.pgsharp.com/logout.php";
}
