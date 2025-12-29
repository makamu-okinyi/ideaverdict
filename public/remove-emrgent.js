// Runtime remover for 'emrgent' watermark
// Non-destructive: hides/removes DOM nodes and replaces obvious watermarked images at runtime.
(function(){
  'use strict';
  function replaceImages(replacementPath){
    try{
      document.querySelectorAll('img').forEach(img=>{
        const src = (img.getAttribute('src')||'').toString();
        const dataSrc = (img.getAttribute('data-src')||'').toString();
        if (/emrgent|watermark/i.test(src) || /emrgent|watermark/i.test(dataSrc)){
          img.dataset._emrgent_original = src || dataSrc || '';
          img.src = replacementPath;
          if (img.getAttribute('data-src')) img.setAttribute('data-src', replacementPath);
        }
      });
    }catch(e){console.error('replaceImages error',e);}    
  }

  function removeNodes(){
    try{
      // Remove nodes where id/class contains emrgent or watermark
      var all = document.querySelectorAll('*');
      for (var i=0;i<all.length;i++){
        var el = all[i];
        var id = (el.id||'').toString();
        var cls = (el.className||'').toString();
        if (/emrgent|watermark/i.test(id) || /emrgent|watermark/i.test(cls)){
          // remove overlay-like elements but keep inputs/forms alone
          if (!/input|textarea|select|button/i.test(el.tagName)) el.remove();
        }
      }

      // remove CSS background images that include watermark/emrgent in inline style
      document.querySelectorAll('[style]').forEach(el=>{
        var st = el.getAttribute('style')||'';
        if (/emrgent|watermark/i.test(st)){
          el.style.backgroundImage = 'none';
        }
      });

      // remove :before and :after pseudo-element overlays by injecting overrides
    }catch(e){console.error('removeNodes error',e);}    
  }

  function injectCSS(){
    try{
      var css = "*[class*='emrgent'],*[id*='emrgent'],*[class*='watermark'],*[id*='watermark']{display:none !important; visibility:hidden !important; opacity:0 !important; pointer-events:none !important;} ";
      css += "[style*='emrgent'],[style*='watermark']{background-image:none !important;}\n*[class*='emrgent']::before,*[class*='emrgent']::after,*[class*='watermark']::before,*[class*='watermark']::after{content:none !important;}";
      var s = document.createElement('style');
      s.setAttribute('data-remove-emrgent','true');
      s.appendChild(document.createTextNode(css));
      (document.head||document.documentElement).appendChild(s);
    }catch(e){console.error('injectCSS error',e);}    
  }

  function ready(){
    // Path to replacement image (relative to site root). Update if your assets path differs.
    var replacement = '/assets/images/emrgent-replacement.jpeg';
    injectCSS();
    removeNodes();
    replaceImages(replacement);

    // Also observe DOM for late-inserted watermarks (e.g., injected by JS)
    try{
      var mo = new MutationObserver(function(mutations){
        mutations.forEach(function(m){
          if (m.addedNodes){
            m.addedNodes.forEach(function(node){
              if (node.nodeType===1){
                var id = (node.id||'').toString();
                var cls = (node.className||'').toString();
                if (/emrgent|watermark/i.test(id) || /emrgent|watermark/i.test(cls)){
                  try{ node.remove(); }catch(e){}
                }
                // replace images inside node
                node.querySelectorAll && node.querySelectorAll('img').forEach(img=>{
                  const src=(img.getAttribute('src')||'').toString();
                  if(/emrgent|watermark/i.test(src)) img.src = replacement;
                });
              }
            });
          }
        });
      });
      mo.observe(document.documentElement||document.body, { childList:true, subtree:true });
    }catch(e){console.error('MutationObserver error',e);}    
  }

  if (document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    setTimeout(ready,50);
  }
})();
