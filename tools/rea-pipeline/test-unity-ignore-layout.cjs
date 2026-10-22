const assert=require('node:assert/strict'),U=require('../../outputs/laozu-web/unity-rect.js');
const node=(id,parentID,ignore=false)=>({id,parentID,active:true,components:[{type:'RectTransform',m_SizeDelta:{x:100,y:50},m_AnchoredPosition:{x:12,y:7}},...(ignore?[{fields:{m_IgnoreLayout:1}}]:[])]});
const root=node('root',null);root.components.push({m_Spacing:9,m_ChildAlignment:0,m_Padding:{m_Top:20}});
const fixed=node('fixed','root',true),flow=node('flow','root'),next=node('next','root');
let r=U.solve([root,fixed,flow,next]);
assert.equal(r.get('fixed').x,12);assert.equal(r.get('fixed').y,-7);
assert.equal(r.get('flow').y,20);assert.equal(r.get('next').y,79);
fixed.components[1].m_Enabled=0;r=U.solve([root,fixed,flow,next]);assert.equal(r.get('fixed').y,20);assert.equal(r.get('flow').y,79);
console.log('6 IgnoreLayout assertions passed');
