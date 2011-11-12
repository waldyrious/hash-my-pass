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

// ROtate bits Left, or Left circular shift
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

function doIt() {
  var master = window.prompt('Enter your master password');
  if (master != '' && master != null) {
    // remove the http(s):// and the www, www1, etc.
    host = document.location.hostname.match( /^(www\d?\.)?([^\/]+)/ )[2];
    // disregard subdomains so that they're treated as the same site
    // KNOWN ISSUE: this captures the last digit of IP addresses. We should probably fail it and drop to the else instruction instead.
    if (noSubDomain = host.match( /[^.]+(\.(aero|arpa|asia|biz|cat|com|coop|co|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|xxx))?(\.[a-z]{2})?$/ )) {
      domain = noSubDomain[0];
    } else { domain = host; }
    // sites at different domains that share the same accounts and must therefore use the same password
    // even if someone uses different accounts, it still works
    // (they'll simply use the same password accross that network of sites)
    var merge = {
       "wikipedia.org" : /^(wiki([pm]edia|books|source|quote|news|species)|mediawiki|wiktionary)\.org$/,
       "example.com" : /example\.com/
    }
    for(i in merge)
    {
      if ( domain.match(merge[i]) );
      domain = i;
    }
    var i = 0,
        j = 0,
        p = b64_sha1(master+':'+domain).substr(0,8)+'1a',
        F = document.forms,
        g = false;
    for (i = 0; i < F.length; i++) {
      E = F[i].elements;
      for (j = 0; j < E.length; j++) {
        D = E[j];
        if (D.type == 'password' || (D.type == 'text' && D.name.match(/p(ass|w(or)?d?)/i) ) ) {
          D.value = p;
          D.focus();
          g = true;
      }
    }
    if (!g) {
      window.prompt('Your password for '+domain+' is', p)
    }
  }
}

doIt();
void(null);
