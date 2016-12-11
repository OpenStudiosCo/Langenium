function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {".\u002Ftemplates\u002Fpartials\u002Fhead.pug":"head\r\n  title Langenium 2016 Rebuild\r\n  link(href='dist\u002Fstyles.css', rel='stylesheet')"};
var pug_indent = [];
;pug_debug_line = 1;pug_debug_filename = ".\u002Ftemplates\u002Fpartials\u002Fhead.pug";
pug_html = pug_html + "\n\u003Chead\u003E";
;pug_debug_line = 2;pug_debug_filename = ".\u002Ftemplates\u002Fpartials\u002Fhead.pug";
pug_html = pug_html + "\n  \u003Ctitle\u003E";
;pug_debug_line = 2;pug_debug_filename = ".\u002Ftemplates\u002Fpartials\u002Fhead.pug";
pug_html = pug_html + "Langenium 2016 Rebuild\u003C\u002Ftitle\u003E";
;pug_debug_line = 3;pug_debug_filename = ".\u002Ftemplates\u002Fpartials\u002Fhead.pug";
pug_html = pug_html + "\n  \u003Clink href=\"dist\u002Fstyles.css\" rel=\"stylesheet\"\u002F\u003E\n\u003C\u002Fhead\u003E";} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;}