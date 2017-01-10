// Slightly uncompressed version of https://github.com/geraintluff/sha256's minimized code
var base64_sha256 = function a(b) {
    function c(a, b) { return a >>> b | a << 32 - b }
    for (var d, e, f = Math.pow, g = f(2, 32), h = "length", i = "", j = [], k = 8 * b[h], l = a.h = a.h || [], m = a.k = a.k || [], n = m[h], o = {}, p = 2; 64 > n; p++)
        if (!o[p]) {
            for (d = 0; 313 > d; d += p) o[d] = p;
            l[n] = f(p, .5) * g | 0, m[n++] = f(p, 1 / 3) * g | 0 }
    for (b += "\x80"; b[h] % 64 - 56;) b += "\x00";
    for (d = 0; d < b[h]; d++) {
        if (e = b.charCodeAt(d), e >> 8) return;
        j[d >> 2] |= e << (3 - d) % 4 * 8 }
    for (j[j[h]] = k / g | 0, j[j[h]] = k, e = 0; e < j[h];) {
        var q = j.slice(e, e += 16), r = l;
        for (l = l.slice(0, 8), d = 0; 64 > d; d++) {
            var s = q[d - 15], t = q[d - 2], u = l[0], v = l[4],
                w = l[7] + (c(v, 6) ^ c(v, 11) ^ c(v, 25)) + (v & l[5] ^ ~v & l[6]) + m[d] + (q[d] = 16 > d ? q[d] : q[d - 16] + (c(s, 7) ^ c(s, 18) ^ s >>> 3) + q[d - 7] + (c(t, 17) ^ c(t, 19) ^ t >>> 10) | 0),
                x = (c(u, 2) ^ c(u, 13) ^ c(u, 22)) + (u & l[1] ^ u & l[2] ^ l[1] & l[2]);
            l = [w + x | 0].concat(l), l[4] = l[4] + w | 0 }
        for (d = 0; 8 > d; d++) l[d] = l[d] + r[d] | 0 }
    for (d = 0; 8 > d; d++)
        for (e = 3; e + 1; e--) {
            var y = l[d] >> 8 * e & 255;
            i += (16 > y ? 0 : "") + y.toString(16) }
    // convert hex to base64 (see dandavis's comment here: http://stackoverflow.com/q/23190056)
    return btoa(i.match(/\w{2}/g).map(function(a){return String.fromCharCode(parseInt(a, 16));} ).join(""))
};

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
  inputBoxDiv.innerHTML = '<label for="hmp-pw">Enter your master password</label><br>'+
  '<input type="password" id="hmp-pw" width="100"><br>'+
  '<input type="button" name="send" value="hash!"'+
    'onclick="javascript:hmp(this.previousSibling.previousSibling.value); removeElement(\'hashMypAssBox\',\'overlay\');">'+
  '<a href="javascript:removeElement(\'hashMypAssBox\',\'overlay\')" title="Close HashMypAss Box" class="closeButton"'+
      'style="float:right; font-size:xx-small; position:relative; top:1em;">(close)</a>';
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
    // (they'll simply use the same password across that network of sites)
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
    var p = base64_sha256(master+':'+domain).substr(0,8);
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
      "ebikemaps.com",    // added 2017-01-10
      "gnome-look.org",   // added 2013-05-19 (d9185d6)
      "klect.com",        // added 2013-05-31 (21d9fb6)
      "netemprego.gov.pt" // added 2015-08-23 (7cdee87)
      "nozbe.com",        // added 2012-08-08 (7e107d5)
      "roomsketcher.com"  // added 2016-04-10 (ba7ce1f)
      "tvtropes.org",     // added 2011-11-12 (97437ad)
      "viactt.pt",        // added 2012-03-29 (83855a2)
      "viaverde.pt",      // added 2014-09-08 (8548ef7)
      "wikicfp.com"       // added 2012-04-04 (c1aa9b1)
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
      var sym = String.fromCharCode( 33 + seed%14 ); // symbols: chars 33 to 46
      p = p.replaceAt(posSym, sym);
    }
    
    // Note for future reference: in case we decide to offer length customization,
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
