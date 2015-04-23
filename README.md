**Hash My Pass** is a JavaScript bookmarklet
that generates a password for a given site
by hashing a master password with the site's domain
(using the [SHA-256](http://en.wikipedia.org/wiki/Secure_Hash_Algorithm) cryptographic hash function).

This way you'll have the advantage of memorizing only a single password (the master one),
without the security problems of sharing passwords across sites.

The hash transformation makes it virtually impossible
to guess the master password even if one managed to obtain the site-specific password in plaintext
(which shouldn't happen anyway on any site that stores its user data securely).
And since the hash, by definition,
always returns the same result for the same input,
there's no need to store the passwords anywhere;
they can simply be calculated on the fly every time the tool is used.
As a javascript bookmarklet, does all its work in the client side,
so the master password is never sent through the network.

### Origins & motivation
This idea isn't new, of course,
and is heavily based on Nic Wolff's
[Password generator](http://angel.net/~nic/passwd.sha1.html).

So why not just use that one?
Well, there are a few drawbacks to Nic's code:

1. The code is open (evidently, as it's Javascript)
   but it isn't kept in a (publicly accessible) version control system.  
   This means it can’t be easily forked,
   receive patches (and keep the diffs, metadata & credits intact),
   be translated, have issues publicly reported, etc.
2. Different sites have different password requirements
   (length, allow/require/forbid alphanum/symbols, etc.)  
   HashMyPass takes care of this
   by maintaining a list of exceptions
   to the most commonly accepted format
   (8-char passwords including letters, digits and symbols)
   which was determined by exhaustively testing
   the sign-up process at various sites
   compiled from those available from
   http://accountkiller.com and http://bugmenot.com
   (back when the latter used to list the supported websites).
3. The bookmarklet prompt doesn’t mask the master password.
   Native Javascript prompts can’t do that,
   so as a workaround HasMyPass uses an `<input type=password>`
   on a dynamically created floating dialog.
4. The TLD list was too limited.
   By using a more powerful regex, most domains can be covered  
   (see http://www.iana.org/domains/root/db/
   and Mozilla’s [effective_tld_names.dat](http://mxr.mozilla.org/mozilla/source/netwerk/dns/src/effective_tld_names.dat?raw=1)).
5. And other minor annoyances
   due to website-specific implementations
   of login forms.

### Related work

Other implementations of the same concept (AFAIK) are:
- [PasswordMaker](http://www.passwordmaker.org)
  (the [Click](http://www.passwordmaker.org/Click) version).
  Supports lots of hashing options, and has desktop version,
  browser extensions, etc. Aside from the bookmarklet,
  it's essentially a different class of system,
  while HashMyPass aims to be a simple, no-frills solution
  for web accounts only.
- [SuperGenPass](http://supergenpass.com/).
  Pretty similar, but uses the MD5 hashing algorithm rather than SHA.
  Probably because it's also based on Nic Wolff's version,
  which originally used MD5.
  It also suffers from some of the same problems,
  namely #1, #2 and #4 above.

### License
Except Nic's implementation of the hashing algorithm,
all the code is released under the MIT license.
See the LICENSE.txt file for more details.
