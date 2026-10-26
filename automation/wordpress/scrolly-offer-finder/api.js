(()=>{
let token=null,refresh=null;
const config=()=>window.SCROLLY_CONFIG||{};
async function json(res){try{return await res.json();}catch{throw new Error('The site could not process this request. Please try again.');}}
async function bootstrap(){if(refresh)return refresh;const cfg=config();if(!cfg.api)throw new Error('Install the WordPress plugin to save answers and send your plan.');refresh=(async()=>{const url=new URL(cfg.bootstrap||cfg.api+'bootstrap',location.href);url.searchParams.set('_scrolly',Date.now().toString());const res=await fetch(url.href,{cache:'no-store',credentials:'same-origin'});const body=await json(res);if(!res.ok)throw new Error(body.message||'Could not start your form session. Please try again.');if(!body.nonce)throw new Error('Could not start your form session. Please try again.');token=body.nonce;})();try{await refresh;}finally{refresh=null;}}
async function post(route,data){if(!token)await bootstrap();for(let attempt=0;attempt<2;attempt++){const res=await fetch(config().api+route,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Scrolly-Nonce':token},body:JSON.stringify(data)});const body=await json(res);if(res.ok)return body;if(attempt===0&&res.status===403&&body.code==='expired'){token=null;await bootstrap();continue;}throw new Error(body.message||'Could not complete this request. Please try again.');}}
window.ScrollyAPI={post};
})();
