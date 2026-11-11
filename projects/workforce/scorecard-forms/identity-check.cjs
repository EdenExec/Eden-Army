const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/user/Agent-Builder/projects/workforce/scorecard-forms/scorecard-page.html','utf8');
const mock=(me)=>`<script>(function(){var store={'meta/week':{weekEnding:'2026-11-05',weekEndingLabel:'Thu 5 Nov 2026',window:'Fri 30 Oct to Thu 5 Nov',lockAt:'2099-01-01T00:00:00Z'},'prefill/max':{week:'2026-11-05',rps:63},'prefill/team':{week:'2026-11-05',rps:295}};
function doc(p){return{get:async()=>({exists:p in store,data:()=>store[p]}),set:async(d)=>{store[p]=d;window.__w=(window.__w||[]).concat(p)}}}
var db={doc:doc,collection:(c)=>({onSnapshot:(f)=>{f({docs:[]});return()=>{}}})};
var user={me:async()=>(${JSON.stringify(me)})};
window.claude={use:async(n)=>n==='db'?db:n==='user'?user:null};})();</script>`;
(async()=>{const b=await chromium.launch();
for (const [label,me,click] of [['Kev owner, no email',{id:'u1',email:null,name:'',isOwner:true}],['Max by name',{id:'u2',email:null,name:'Max Betcher',isOwner:false}],['Unknown, picks Evan',{id:'u3',email:null,name:'',isOwner:false},'Evan']]){
 const p=await b.newPage();await p.setContent('<!doctype html><html><head><meta charset=utf-8></head><body>'+mock(me)+html+'</body></html>');await p.waitForTimeout(600);
 if(click){await p.click('text='+click);await p.waitForTimeout(400)}
 console.log(label,'|',await p.textContent('#title'),'|',await p.textContent('#status'),'| rps=',await p.$eval('#f_rps',e=>e.value).catch(()=>'-'),'| writes',await p.evaluate(()=>window.__w||[]));
}
await b.close()})();
