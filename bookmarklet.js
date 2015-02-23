var chrsz   = 8; // size of password in chars
var b64pad  = ""; // See http://en.wikipedia.org/wiki/Base64#Padding

// main function
function b64_sha1(s) {
  return binb2b64(core_sha1(str2binb(s), s.length * chrsz));
}

function core_sha1(x, len) {
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for (var j = 0; j < 80; j++) {
      if (j < 16) {
        w[j] = x[i + j];
      } else {
        w[j] = bit_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      }
      var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = bit_rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);
}

function sha1_ft(t, b, c, d) {
  if (t < 20) { return (b & c) | ((~b) & d); }
  if (t < 40) { return b ^ c ^ d; }
  if (t < 60) { return (b & c) | (b & d) | (c & d); }
  return b ^ c ^ d;
}

function sha1_kt(t) {
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

// ROL = ROtate bits Left, aka Left circular shift
function bit_rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

function str2binb(str) {
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for (var i = 0; i < str.length * chrsz; i += chrsz) {
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
  }
  return bin;
}

function safe_add(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

// Convert binary(?) to base64
function binb2b64(binarray) {
  // Base64 alphabet
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for (var i = 0; i < binarray.length * 4; i += 3) {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for (var j = 0; j < 4; j++) {
      if (i * 8 + j * 6 > binarray.length * 32) { str += b64pad; }
      else { str += tab.charAt((triplet >> 6*(3-j)) & 0x3F); } // 0x3F = 63 = '?'
    }
  }
  return str;
}

function pressHashMyPass() {

  var overlayDiv = document.createElement('div');
  var overlayDivName = 'overlay';
  overlayDiv.setAttribute('id',overlayDivName);
  // Style the overlay
  overlayDiv.style.height = "100%";
  overlayDiv.style.width = "100%";
  overlayDiv.style.position = "fixed";
  overlayDiv.style.left = 0;
  overlayDiv.style.top = 0;
  overlayDiv.style.zIndex = 10000;
  overlayDiv.style.backgroundColor = "black";
  overlayDiv.style.opacity = "0.75";
  // Add it to the DOM
  document.body.appendChild(overlayDiv);

  var inputBoxDiv = document.createElement('div');
  var inputBoxDivName = 'hashMypAssBox';
  inputBoxDiv.setAttribute('id', inputBoxDivName);
  // Style the box
  inputBoxDiv.style.padding = "10px";
  inputBoxDiv.style.backgroundColor = "#dfdfdf";
  inputBoxDiv.style.borderRadius = "5px";
  inputBoxDiv.style.position = "fixed";
  inputBoxDiv.style.top = "30%";
  inputBoxDiv.style.left = "40%";
  inputBoxDiv.style.zIndex = 10000;
  // Add the content
  inputBoxDiv.innerHTML = '<label for="hmp-pw">Enter your master password</label><br>\
  <input type="password" id="hmp-pw" width="100"><br>\
  <input type="button" name="send" value="hash!"\
    onclick="javascript:hmp(this.previousSibling.previousSibling.value); removeElement(\'hashMypAssBox\',\'overlay\');">\
  <a href="javascript:removeElement(\'hashMypAssBox\',\'overlay\')" title="Close HashMypAss Box" class="closeButton"\
      style="float:right; font-size:xx-small; position:relative; top:1em;">(close)</a>';
  // Add it to the DOM
  document.body.appendChild(inputBoxDiv);
  // Focus the input box
  document.getElementById("hmp-pw").focus();
}

function removeElement(parentDiv,childDiv){	
  var parent = document.getElementById(parentDiv);
  document.body.removeChild(parent);
  var child = document.getElementById(childDiv);
  document.body.removeChild(child);
}
// Store the function in a global property so that the minifier doesn't remove it for not being called
window['removeElement'] = removeElement;

function hmp(master) {
  if (master !== '' && master !== null) {
    // remove the http(s):// and the www, www1, etc.
    //var host = document.location.hostname.match( /^(www\d?\.)?([^\/]+)/ )[2];
    var host = document.location.href.match( /^[^:]+?:\/\/\/?(www\d?\.)?([^\/]+)/ )[2];
    // disregard subdomains so that they're treated as the same site
    // KNOWN ISSUE: this captures the last digit of IP addresses. We should probably fail it and drop to the else instruction instead.
    var domain, noSubDomain;
    if (noSubDomain = host.match( /[^.]+(\.(aero|arpa|asia|biz|cat|com|coop|co|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|xxx))?(\.[a-z]{2})?$/ )) {
      domain = noSubDomain[0];
    } else { domain = host; }
    // Use a canonical domain for sites that share the same user accounts over different domains,
    // so that the hash is the same for that group of sites regardless of the domain.
    // Even if someone deliberately uses separate accounts for each domain, it still works
    // (they'll simply use the same password accross that network of sites)
    var merge = {
       "wikipedia.org" : /^(wiki([pm]edia|books|source|quote|news|species|data|voyage)|mediawiki|wiktionary)\.org$/,
       "amazon.com" : /^amazon\.(com|co\.uk|de)$/
    };
    for(var m in merge) {
      if ( domain.match(merge[m]) ) {
        domain = m;
      }
    }
    // Generate a password that should be fairly secure and work on most websites:
    // 8 chars, upper and lowercase letters and numbers
    var p = b64_sha1(master+':'+domain).substr(0,8);
    // Make sure it includes at least one number
    String.prototype.replaceAt = function(index, repStr) {
      return this.substr(0, index) + repStr + this.substr(index+repStr.toString().length);
    };
    // Get a "random" number so that different passwords aren't enhanced
    // in the same way. 
    var seed = p.charCodeAt(0);
    // Choose the position to insert the number.
    // By applying the modulo, we ensure
    // that the pseudo-random index where we'll insert the digit
    // falls within the length of the string.
    // This index is always the same for a given password,
    // but it will change for different passwords.
    var posNum = seed % p.length;
    if (!p.match(/\d/)) {
      var num = seed % 10; // only one digit
      p = p.replaceAt(posNum, num);
    }
    // Also include a special character (symbol/punctuation)
    // Some websites forbid these, so we'll account for that here
    var allowSymbols = true;
    var noSymbols = new Array(
      "gnome-look.org",
      "klect.com",
      "mecanto.com",
      "nozbe.com",
      "tvtropes.org",
      "viactt.pt",
      "wikicfp.com",
      "viaverde.pt"
    );
    for(var s in noSymbols)
    {
      if ( !isNaN(s) && domain.match(noSymbols[s]) ) {
        allowSymbols = false;
        break;
      }
    }
    if (allowSymbols) {
      // The symbol, like the digit, is also chosen in a pseudo-random way
      // and added to a pseudo-random position
      var posSym = p.length - posNum - 1;
      if(posSym === posNum) { posSym++; } // don't add to the same position as the number
      var sym = String.fromCharCode( 32 + seed%15 ); // symbols: chars 32 to 46
      p = p.replaceAt(posSym, sym);
    }
    
    // Note for future reference: in case we decide to offer lenght customization,
    // we should account for size limitations in different websites.
    // For instance, travellerspoint.com only allows passwords 6 to 10 characters long, etc.
    
    // Attempt to fill the password forms automatically
    var i = 0,
        j = 0,
        F = document.forms,
        g = false;
    for (i = 0; i < F.length; i++) {
      var E = F[i].elements;
      for (j = 0; j < E.length; j++) {
        var D = E[j];
        if (D.type === 'password' || (D.type === 'text' && D.name.match(/p(ass|w(or)?d?)/i) ) ) {
          D.value = p;
          D.focus();
          g = true;
        }
      }
    }
    // If the password input field couldn't be found, give the password to the user
    if (!g) {
      window.prompt('Your password for '+domain+' is', p);
    }
  }
}
// Store the function in a global property so that the minifier doesn't remove it for not being called
window['hmp'] = hmp;

function init() {
  if (typeof masterpw === "undefined" || masterpw === "") {
    pressHashMyPass();
  } else {
    hmp(masterpw);
  }
}

init();
