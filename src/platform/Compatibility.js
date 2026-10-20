export function installCompatibility(){
 if(!Element.prototype.replaceChildren)Element.prototype.replaceChildren=function(...nodes){while(this.firstChild)this.removeChild(this.firstChild);this.append(...nodes);};
 // Chrome 61 has Grid gaps, but no Flex gap. Detect actual layout once.
 const flex=document.createElement('div');flex.style.cssText='position:absolute;visibility:hidden;display:flex;flex-direction:column;row-gap:1px';flex.append(document.createElement('div'),document.createElement('div'));document.body.append(flex);if(flex.scrollHeight!==1)document.documentElement.classList.add('no-flex-gap');flex.remove();
}
