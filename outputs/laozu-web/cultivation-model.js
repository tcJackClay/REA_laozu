/* Source config projection. Recruitment sampling is an explicitly local preview. */
window.Cultivation=(()=>{
 const D=window.CULTIVATION_DATA,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 function randomProfile(){const abilities=[];for(const type of [1,2,4,4,4]){const pool=D.abilities.filter(x=>x.iType===type&&!abilities.some(y=>y.iAbilityID===x.iAbilityID));abilities.push(pick(pool));}return {name:pick(D.names).szLasttName+pick(D.names).szFirstName,traitIds:abilities.map(x=>x.iID),generationProvenance:D.provenance.randomSelection};}
 function traits(p){const ids=p?.traitIds||[1205,2206,3117,3205,3217];return ids.map(id=>D.abilities.find(x=>x.iID===id)).filter(Boolean).sort((a,b)=>a.iType-b.iType).slice(0,6);}
 function traitHTML(p,prefix='trait'){const a=traits(p),art=n=>Object.values(window.BIRTH_LAYOUT_DATA.sprites).find(x=>x.name===n)?.file||'';return Array.from({length:6},(_,i)=>{const t=a[i],bg=t?['citiaodi_none','citiaodi_lv','citiaodi_lan','citiaodi_zi','citiaodi_cheng'][Math.min(t.iQuality,4)]:'citiaodi_none';return `<button type="button" ${t?`data-cultivation-trait="${t.iID}" aria-label="${esc(t.szName)}"`:'disabled'} style="background-image:url('${art(bg)||art('citiaodi_lan')}')">${esc(t?.szName||'天赋不足')}</button>`;}).join('');}
 function tip(target,root){const id=+target.dataset.cultivationTrait,t=D.abilities.find(x=>x.iID===id);if(!t)return;root.querySelector('.cultivation-tooltip')?.remove();const el=document.createElement('div');el.className='cultivation-tooltip';el.setAttribute('role','tooltip');el.textContent=t.szDesc;const a=target.getBoundingClientRect(),r=root.getBoundingClientRect(),scale=r.width/1080;el.style.left=Math.max(24,Math.min(376,(a.left-r.left)/scale-270))+'px';el.style.top=Math.max(12,(a.top-r.top)/scale-118)+'px';root.append(el);}
 const seed=id=>D.seeds.find(x=>x.iID===+id);
 function bonus(id,star=0){const x=seed(id),v={atk:0,def:0,hp:0,speed:0};for(const arr of x?[x.arrSecondAttribute1,x.arrSecondAttribute2,x.arrSecondAttribute3]:[]){const key={2001:'atk',2002:'def',2003:'hp',2007:'speed'}[arr[0]];if(key)v[key]+=arr[Math.min(Math.max(1,star+1),arr.length-1)]||0;}return v;}
 function combined(c,stars={}){const a=bonus(c.seed,stars[c.seed]||0),b=bonus(c.sub,stars[c.sub]||0);for(const k in a)a[k]+=b[k]*D.otherRate;return a;}
 function skill(id,star=0){const x=seed(id);if(!x)return null;let sid=0;for(let i=0;i<x.arrAngerSkill.length;i+=2){if(star>=x.arrAngerSkill[i])sid=x.arrAngerSkill[i+1];}return D.skills.find(s=>s.iSkillID===sid);}
 function rich(s){return esc(s||'').replace(/&lt;color=(#[\da-fA-F]{6}|green|red|yellow)&gt;/g,'<span style="color:$1">').replace(/&lt;\/color&gt;/g,'</span>').replace(/\n/g,'<br>');}
 return {randomProfile,traits,traitHTML,tip,seed,bonus,combined,skill,rich,esc};
})();
