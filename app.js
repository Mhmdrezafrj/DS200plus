const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const KEY="ds200_v01";
let state=JSON.parse(localStorage.getItem(KEY)||'{"books":[],"weaknesses":[],"sessions":0,"questions":0}');
let current={questions:[],i:0};

function save(){localStorage.setItem(KEY,JSON.stringify(state));renderAll()}
function fa(n){return String(n).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d])}
function importanceText(v){return v==="high"?"🔴 اهمیت بالا":v==="medium"?"🟡 اهمیت متوسط":"🟢 اهمیت پایین"}

function go(id){
  $$(".screen").forEach(x=>x.classList.toggle("active",x.id===id));
  $$(".nav button").forEach(x=>x.classList.toggle("active",x.dataset.go===id));
  if(id==="review") renderReview(); if(id==="library") renderBooks(); if(id==="progress") renderAll();
  scrollTo(0,0);
}
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));

const qTemplates={
  "زیست‌شناسی":[
    t=>`مبحث «${t}» را طوری توضیح بده که یک دانش‌آموز هم تعریف، هم سازوکار و هم یک مثال روشن از آن را بفهمد. من اگر جای دانش‌آموز باشم، کدام قسمت را ممکن است اشتباه برداشت کنم؟`,
    t=>`در «${t}» چه رابطه علت و معلولی مهمی وجود دارد؟ اگر یکی از شرایط را تغییر دهیم، چه اتفاقی می‌افتد؟`,
    t=>`اگر این مطلب در امتحان نهایی با بیان متفاوت پرسیده شود، از کجا می‌فهمی هنوز مفهوم را واقعاً بلدی؟`
  ],
  "شیمی":[
    t=>`در «${t}» اول مفهوم اصلی را توضیح بده، بعد بگو چرا این اتفاق از نظر شیمیایی رخ می‌دهد. یک مثال هم بزن.`,
    t=>`اگر داده یا شرایط مسئله «${t}» تغییر کند، کدام بخش پاسخ تو باید تغییر کند و چرا؟`,
    t=>`یک سؤال تشریحی شبیه امتحان نهایی از «${t}» تصور کن و بگو برای نمره کامل چه نکاتی باید در پاسخ بیاید.`
  ],
  "فیزیک":[
    t=>`مفهوم «${t}» را با زبان ساده توضیح بده و بگو هر کمیت چه معنایی دارد. بعد یک حالت «اگر...» مطرح کن.`,
    t=>`در «${t}» اگر یکی از عوامل را دو برابر کنیم چه چیزی تغییر می‌کند؟ دلیل فیزیکی‌اش چیست؟`,
    t=>`اگر بخواهی این مبحث را در یک پاسخ تشریحی نهایی بنویسی، چه زنجیره استدلالی را قدم‌به‌قدم می‌نویسی؟`
  ],
  "ریاضی":[
    t=>`«${t}» را از صفر توضیح بده؛ هیچ مرحله‌ای را جا نینداز. اول بگو مسئله چه چیزی از ما می‌خواهد.`,
    t=>`در حل یک سؤال از «${t}» اولین قدم چیست و چرا؟ اگر همان قدم را اشتباه انجام بدهیم، خطای بعدی کجا ایجاد می‌شود؟`,
    t=>`یک سؤال ساده از «${t}» طرح کن و حلش را مرحله‌به‌مرحله توضیح بده؛ من روی پرش‌های منطقی گیر می‌دهم.`
  ]
};

function startSession(){
  const subject=$("#subject").value, topic=$("#topic").value.trim(), page=$("#page").value||"—", imp=$("#importance").value;
  if(!topic){alert("اول مبحث را وارد کن.");return}
  current={questions:qTemplates[subject].map(fn=>fn(topic)),i:0,subject,topic,page,imp};
  $("#sessionArea").classList.remove("hidden"); showQ();
  state.sessions++; save();
}
function showQ(){
  const q=current.questions[current.i];
  $("#question").textContent=q; $("#answer").value=""; $("#feedback").classList.add("hidden");
  $("#sourceRef").classList.add("hidden"); $("#nextQ").classList.add("hidden");
  $("#importanceBadge").className="importance "+current.imp; $("#importanceBadge").textContent=importanceText(current.imp);
}
function submitAnswer(){
  const a=$("#answer").value.trim(); if(a.length<25){$("#feedback").classList.remove("hidden");$("#feedback").textContent="پاسخت خیلی کوتاه است. هنوز جواب را نمی‌دهم. یک بار دیگر مثل معلم، مفهوم + دلیل + مثال را توضیح بده.";return}
  state.questions++;
  const weakness={id:Date.now(),subject:current.subject,topic:current.topic,page:current.page,importance:current.imp,date:new Date().toLocaleDateString("fa-IR"),status:a.length>160?"yellow":"red"};
  state.weaknesses.unshift(weakness);
  $("#feedback").classList.remove("hidden");
  $("#feedback").innerHTML="فعلاً بررسی محلی انجام شد: پاسخ ثبت شد. برای ارزیابی علمی واقعی، در نسخه بعدی این بخش به موتور AI متصل می‌شود.<br><br><b>قانون فعلی:</b> اگر خودت مطمئن نیستی، قبل از گرفتن جواب، صفحه منبع را دوباره بخوان و دوباره توضیح بده.";
  $("#sourceRef").classList.remove("hidden");
  $("#sourceRef").textContent=current.page==="—"?"صفحه منبع ثبت نشده؛ شماره صفحه را وارد کن تا ارجاع دقیق داشته باشیم.":`📖 برگرد به صفحه ${fa(current.page)} از منبع خودت و همین سؤال را دوباره توضیح بده.`;
  $("#nextQ").classList.remove("hidden"); save();
}
$("#startSession").addEventListener("click",startSession);
$("#submitAnswer").addEventListener("click",submitAnswer);
$("#hintBtn").addEventListener("click",()=>{
  $("#feedback").classList.remove("hidden");
  $("#feedback").textContent=`راهنما: اول تعریف «${current.topic}» را بگو، سپس رابطه علت و معلولی/مراحل را توضیح بده و در پایان یک مثال یا حالت تغییریافته اضافه کن.`;
});
$("#nextQ").addEventListener("click",()=>{current.i=(current.i+1)%current.questions.length;showQ()});
$("#speakQ").addEventListener("click",()=>{speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance($("#question").textContent))});
$("#voiceInput").addEventListener("click",()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert("تشخیص گفتار در این مرورگر در دسترس نیست؛ می‌توانی با کیبورد صوتی گوشی پاسخ بدهی.");return}
  const r=new SR(); r.lang="fa-IR"; r.interimResults=false;
  r.onresult=e=>$("#answer").value=e.results[0][0].transcript; r.start();
});

$("#makeExam").addEventListener("click",()=>{
  const s=$("#examSubject").value,t=$("#examTopic").value.trim();
  if(!t){alert("مبحث را وارد کن.");return}
  const qs=qTemplates[s].map(f=>f(t));
  $("#examQuestion").textContent=qs[1]; $("#examArea").classList.remove("hidden"); $("#examAnswer").value=""; $("#examFeedback").classList.add("hidden");
});
$("#checkExam").addEventListener("click",()=>{
  const a=$("#examAnswer").value.trim();$("#examFeedback").classList.remove("hidden");
  $("#examFeedback").innerHTML=a.length<80?"برای پاسخ تشریحی نهایی، توضیح و دلیل کافی نیست؛ مراحل و نکات کلیدی را کامل‌تر کن.":"پاسخ از نظر طول اولیه قابل بررسی است؛ اما نمره واقعی بدون سؤال و بارم رسمی قابل ادعا نیست. در نسخه بعدی، بارم‌بندی و پاسخ‌نامه رسمی به این بخش متصل می‌شود.";
});

$("#pdfInput").addEventListener("change",e=>{
  const f=e.target.files[0]; if(!f)return;
  const b={id:Date.now(),name:f.name,size:f.size,date:new Date().toLocaleDateString("fa-IR")};
  state.books.unshift(b); save(); renderBooks();
  // v0.1 metadata-only persistence; actual PDF bytes stay in browser session.
  alert("منبع ثبت شد. در نسخه ۰.۱ شماره صفحات را دستی ثبت می‌کنیم؛ در نسخه بعد ذخیره کامل فایل و استخراج متن اضافه می‌شود.");
});
function renderBooks(){
  const el=$("#books"); if(!state.books.length){el.innerHTML='<div class="card muted">هنوز PDF اضافه نکرده‌ای.</div>';return}
  el.innerHTML=state.books.map(b=>`<div class="item"><b>📄 ${esc(b.name)}</b><div class="meta">${fa(b.date)} · ${Math.round(b.size/1024)} KB</div></div>`).join("");
}
function renderReview(){
  const el=$("#reviewList"); if(!state.weaknesses.length){el.innerHTML='<div class="card muted">هنوز نقطه ضعفی ثبت نشده.</div>';return}
  el.innerHTML=state.weaknesses.slice(0,30).map(w=>`<div class="item"><b>${importanceText(w.importance)} · ${esc(w.subject)}</b><div>${esc(w.topic)}</div><div class="meta">📖 صفحه ${esc(w.page)} · وضعیت: ${w.status==="red"?"🔴 نیازمند کار": "🟡 نیازمند مرور"}</div><button class="ghost" onclick="reviewWeak(${w.id})">شروع مرور</button></div>`).join("");
}
window.reviewWeak=id=>{const w=state.weaknesses.find(x=>x.id===id);if(!w)return;$("#subject").value=w.subject;$("#topic").value=w.topic;$("#page").value=w.page==="—"?"":w.page;$("#importance").value=w.importance;go("session");startSession()}
function renderAll(){
  $("#bookCount").textContent=fa(state.books.length)+" منبع";$("#reviewCount").textContent=fa(state.weaknesses.length)+" مورد";$("#weakCount").textContent=fa(state.weaknesses.length)+" ضعف ثبت‌شده";
  $("#statSessions").textContent=fa(state.sessions);$("#statQuestions").textContent=fa(state.questions);$("#statWeak").textContent=fa(state.weaknesses.length);
  renderBooks();renderReview();
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
renderAll();

let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn").addEventListener("click",async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#installBtn").classList.add("hidden")});
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
