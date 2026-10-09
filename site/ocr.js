/* Optional screenshot import. Images never leave this browser; CDN downloads contain only OCR code/languages. */
(() => {
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const TYPES={tasks:'Дела',goals:'Цели',reading:'Книги',watch:'Фильмы и сериалы',recipes:'Рецепты',money:'Финансы'};
  const MONTHS=['январ','феврал','март','апрел','ма','июн','июл','август','сентябр','октябр','ноябр','декабр'];
  const dayOf=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function validDay(y,m,d){const v=new Date(Number(y),Number(m)-1,Number(d),12);return v.getFullYear()===Number(y)&&v.getMonth()===Number(m)-1&&v.getDate()===Number(d)?dayOf(v):'';}
  function dateIn(text,base){
    let m=text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);if(m)return {date:validDay(m[1],m[2],m[3]),raw:m[0]};
    for(const match of text.matchAll(/\b(\d{1,2})\s*[./]\s*(\d{1,2})(?:\s*[./]\s*(\d{2,4}))?\b/g)){const yr=match[3]?(match[3].length===2?'20'+match[3]:match[3]):base.slice(0,4),date=validDay(yr,match[2],match[1]),suffix=text.slice(match.index+match[0].length);if(date&&!/^\s*(₽|руб|RUB|€|EUR|\$|USD)/iu.test(suffix))return {date,raw:match[0]};}
    m=text.match(/\b(\d{1,2})\s+(январ[а-яё]*|феврал[а-яё]*|март[а-яё]*|апрел[а-яё]*|ма[йя]|июн[а-яё]*|июл[а-яё]*|август[а-яё]*|сентябр[а-яё]*|октябр[а-яё]*|ноябр[а-яё]*|декабр[а-яё]*)(?:\s+(20\d{2}))?/iu);
    if(m){const mo=MONTHS.findIndex(x=>m[2].toLowerCase().startsWith(x))+1;return {date:validDay(m[3]||base.slice(0,4),mo,m[1]),raw:m[0]};}
    if(/сегодня/iu.test(text))return {date:dayOf(new Date()),raw:'сегодня'};
    if(/завтра/iu.test(text)){const d=new Date();d.setDate(d.getDate()+1);return {date:dayOf(d),raw:'завтра'};}
    return {date:'',raw:''};
  }
  function amountIn(text){
    const number='[+−–-]?\\s*\\d+(?:[ \\u00a0\\u202f]\\d{3})*(?:[,.]\\d{1,2})?';
    let m=text.match(new RegExp('('+number+')\\s*(₽|руб(?:лей|ля|ль|\\.)?|RUB|€|EUR|\\$|USD)(?![a-zа-я])','iu'));
    if(!m)m=text.match(new RegExp('(?:сумма|итого|всего|зачислено|списано|поступило)\\s*[:=]?\\s*('+number+')','iu'));
    if(!m)m=text.match(new RegExp('('+number+')\\s*$','u'));
    if(!m)return {amount:'',raw:'',sign:'',currency:''};
    let value=m[1].replace(/[ \u00a0\u202f]/g,'');const sign=/^[−–-]/.test(value)?'expense':/^\+/.test(value)?'income':'';
    value=value.replace(/^[+−–-]/,'').replace(',','.');
    const amount=/^\d+(\.\d{1,2})?$/.test(value)&&Number(value)>0?value:'';
    const unit=m[2]||'',currency=/₽|руб|RUB/iu.test(unit)?'RUB':/€|EUR/i.test(unit)?'EUR':/\$|USD/i.test(unit)?'USD':'';
    return {amount,raw:m[0],sign,currency};
  }
  const clean=s=>/^[−–-]\s*\d/.test(s.trim())||/^\s*\d{1,2}\s*[./]\s*\d{1,2}\s*[./]\s*\d{2,4}\b/u.test(s)?s.trim():s.replace(/^\s*(?:[•●▪☐☑✓✔*—–-]\s*|\d+[.)]\s+)/u,'').trim();
  function parse(text,{kind,day,currency='RUB',moneyKind='expense',moneyStatus='planned'}){
    const lines=String(text).split(/\r?\n/).map(s=>kind==='money'?s.trim():clean(s)).filter(Boolean).slice(0,100);
    const base=day||dayOf(new Date()),globalDate=dateIn(text,base).date;
    const skip=s=>/^(?:\d{1,2}:\d{2}|\d{1,3}\s*%|назад|готово|поделиться|доходы|расходы|статья|дата|сумма|примечание|список дел|мои цели|книги|фильмы|рецепты)$/iu.test(s);
    const common=(title,note='',date='')=>({title:title||'',note,date,selected:true,amount:'',currency:currency,kind:moneyKind,status:moneyStatus,category:'Прочее',author:'',period:'date',end:date,watchKind:'movie',daily:false,list:'Личное',mandatory:false});
    if(kind==='recipes')return lines.length?[common(lines[0],lines.slice(1).join('\n'))]:[];
    if(kind==='money'){
      const result=[];
      for(const line of lines){
        if(skip(line)||/баланс|остаток|доступно|номер карты|сч[её]т\s*№/iu.test(line)||/^\d{1,2}\s*[./]\s*\d{1,2}(?:\s*[./]\s*\d{2,4})?[.]?$/u.test(line)||/^20\d{2}$/u.test(line))continue;
        const found=dateIn(line,base),withoutDate=found.raw?line.replace(found.raw,''):line;
        const a=amountIn(withoutDate);if(!a.amount)continue;
        const title=withoutDate.replace(a.raw,'').replace(/^[\s|:;—–-]+|[\s|:;—–-]+$/g,'');
        const index=lines.indexOf(line),previous=lines[index-1]||'';
        const suitablePrevious=!skip(previous)&&!amountIn(previous).amount&&!dateIn(previous,base).raw;
        const row=common(title|| (suitablePrevious?previous:'Операция со скриншота'),'',found.date||globalDate||base);
        row.amount=a.amount;row.currency=a.currency||currency;
        row.kind=/зачислен|поступлен|доход|зарплат|аванс|возврат/iu.test(line)||a.sign==='income'?'income':/списан|расход|оплат|покупк/iu.test(line)||a.sign==='expense'?'expense':moneyKind;
        row.note='Из скриншота. Проверьте сумму, дату и название.';
        if(result.length&&/итог|всего/iu.test(line)){row.selected=false;row.note='Итоговая сумма. Не добавляйте одновременно с отдельными статьями, чтобы не посчитать дважды.';}
        if(row.currency!==currency){row.selected=false;row.note+=' Валюта отличается: пересчитайте сумму в '+currency+' перед добавлением.';}
        result.push(row);
      }
      return result.length?result:[common(lines.find(s=>!skip(s))||'', 'Сумма не найдена — заполните её вручную.',globalDate||base)];
    }
    return lines.filter(s=>!skip(s)).map(line=>{
      const d=dateIn(line,base),title=d.raw?line.replace(d.raw,'').replace(/^[\s|:;—–-]+|[\s|:;—–-]+$/g,''):line;
      if(!title)return null;
      const row=common(title,'',d.date||'');
      if(kind==='tasks'){row.daily=/каждый день|ежедневно/iu.test(line);row.title=title.replace(/каждый день|ежедневно/giu,'').trim();}
      if(kind==='goals'){const y=line.match(/\b(20\d{2})\s*(?:год|г\.)/iu);row.date=d.date||`${y?y[1]:base.slice(0,4)}-01-01`;row.end=d.date||`${y?y[1]:base.slice(0,4)}-12-31`;row.period=d.date?'date':'year';}
      if(kind==='watch'){row.watchKind=/сериал/iu.test(line)?'series':'movie';row.title=title.replace(/^(?:фильм|сериал)\s*[:—–-]?\s*/iu,'');}
      if(kind==='reading'){const parts=title.split(/\s+[—–]\s+/);if(parts.length===2){row.title=parts[0];row.author=parts[1];}}
      return row;
    }).filter(Boolean);
  }
  const dialog=document.createElement('dialog');dialog.id='screenshot-editor';dialog.setAttribute('aria-labelledby','ocr-heading');
  dialog.innerHTML=`<form id="ocr-form"><h2 id="ocr-heading">Из скриншота</h2><p class="small">Выберите скриншот с читаемым текстом. Распознавание экспериментальное: проверьте записи перед сохранением.</p><p class="small">Интернет нужен для загрузки распознавателя. Изображение обрабатывается на устройстве и не отправляется на сервер.</p><label class="ocr-file-label">Скриншот<input id="ocr-file" type="file" accept="image/png,image/jpeg,image/webp"></label><img id="ocr-image" alt="Выбранный скриншот" hidden><p id="ocr-status" role="status" aria-live="polite"></p><details id="ocr-text-panel"><summary>Распознанный текст / вставить текст</summary><label>Можно исправить или вставить текст вручную<textarea id="ocr-text" maxlength="50000" rows="7"></textarea></label><button type="button" id="ocr-parse">Заполнить из текста</button></details><div id="ocr-drafts"></div><button type="button" id="ocr-add-row" hidden>＋ Ещё запись</button><p class="error" id="ocr-error" role="alert"></p><div class="actions"><button type="button" id="ocr-cancel">Отмена</button><button class="primary" id="ocr-save" type="submit" disabled>Добавить выбранные</button></div></form>`;
  document.body.append(dialog);
  const $=id=>document.getElementById(id);
  let options=null,rows=[],job=0,worker=null,previewURL='',loading=false,libraryPromise=null;
  const input=(n,label,value='',type='text')=>`<label>${esc(label)}<input data-field="${n}" type="${type}" value="${esc(value)}" ${n==='amount'?'inputmode="decimal"':''}></label>`;
  const select=(n,label,items,value)=>`<label>${esc(label)}<select data-field="${n}">${items.map(([v,t])=>`<option value="${v}" ${v===value?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
  const checkbox=(n,label,yes)=>`<label class="inline"><input type="checkbox" data-field="${n}" ${yes?'checked':''}>${esc(label)}</label>`;
  function renderRows(){
    $('ocr-drafts').innerHTML=rows.map((r,i)=>{
      let fields=input('title','Название',r.title);
      if(options.kind==='tasks')fields+=input('date','Дата (необязательно)',r.date,'date')+input('list','Название списка',r.list)+checkbox('daily','Каждый день',r.daily);
      if(options.kind==='goals')fields+=select('period','Период',[['date','Дата'],['month','Месяц'],['year','Год'],['range','Свой период']],r.period)+input('date','Начало',r.date,'date')+input('end','Окончание',r.end,'date');
      if(options.kind==='watch')fields+=select('watchKind','Тип',[['movie','Фильм'],['series','Сериал']],r.watchKind);
      if(options.kind==='reading')fields+=input('author','Автор',r.author);
      if(options.kind==='money')fields+=select('kind','Тип',[['expense','Расход'],['income','Доход']],r.kind)+input('amount','Сумма',r.amount)+`<p class="small">Валюта записи: ${esc(options.currency)}${r.currency!==options.currency?' · В скриншоте другая валюта. Пересчитайте сумму самостоятельно.':''}</p>`+input('date','Дата',r.date,'date')+input('category','Категория',r.category)+select('status','Результат',[['planned','В плане'],['confirmed','Состоялось'],['absent','Не состоялось']],r.status)+checkbox('mandatory','Обязательный расход',r.mandatory);
      return `<fieldset class="ocr-draft" data-row="${i}"><legend>${checkbox('selected',`Добавить запись ${i+1}`,r.selected)}</legend>${fields}<label>Описание / комментарий<textarea data-field="note" rows="3">${esc(r.note)}</textarea></label></fieldset>`;
    }).join('');
    $('ocr-add-row').hidden=!rows.length;$('ocr-save').disabled=loading||!rows.some(r=>r.selected);
  }
  function library(){
    if(window.Tesseract)return Promise.resolve();
    if(libraryPromise)return libraryPromise;
    libraryPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';script.crossOrigin='anonymous';
      const timer=setTimeout(()=>{script.remove();reject(Error('Не удалось загрузить распознаватель. Проверьте интернет.'));},30000);
      script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);script.remove();reject(Error('Не удалось загрузить распознаватель. Проверьте интернет.'));};document.head.append(script);
    }).catch(e=>{libraryPromise=null;throw e;});return libraryPromise;
  }
  async function canvasFor(file){
    const url=URL.createObjectURL(file),image=new Image();image.src=url;
    try{
      await image.decode();if(!image.width||!image.height)throw Error('Не удалось открыть изображение.');
      if(image.width*image.height>36000000)throw Error('Изображение слишком большое. Обрежьте скриншот.');
      const scale=Math.min(1,2400/Math.max(image.width,image.height)),c=document.createElement('canvas');c.width=Math.round(image.width*scale);c.height=Math.round(image.height*scale);
      const ctx=c.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(image,0,0,c.width,c.height);
      const pixels=ctx.getImageData(0,0,c.width,c.height);let brightness=0,count=0;
      for(let i=0;i<pixels.data.length;i+=160){brightness+=(pixels.data[i]+pixels.data[i+1]+pixels.data[i+2])/3;count++;}
      const invert=brightness/count<110;
      for(let i=0;i<pixels.data.length;i+=4){let gray=.299*pixels.data[i]+.587*pixels.data[i+1]+.114*pixels.data[i+2];if(invert)gray=255-gray;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=gray;}
      ctx.putImageData(pixels,0,0);return c;
    }finally{URL.revokeObjectURL(url);}
  }
  async function recognize(file){
    if(loading)return;
    $('ocr-error').textContent='';
    if(!navigator.onLine){$('ocr-error').textContent='Для распознавания скриншота подключитесь к интернету. Можно вставить текст или заполнить записи руками.';return;}
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)){ $('ocr-error').textContent='Выберите PNG, JPEG или WebP. Если фото в HEIC, сделайте скриншот.';return;}
    if(file.size>15000000){$('ocr-error').textContent='Файл больше 15 МБ. Обрежьте скриншот.';return;}
    const token=++job;loading=true;rows=[];renderRows();$('ocr-file').disabled=true;$('ocr-parse').disabled=true;$('ocr-text').value='';
    if(previewURL)URL.revokeObjectURL(previewURL);previewURL=URL.createObjectURL(file);$('ocr-image').src=previewURL;$('ocr-image').hidden=false;
    $('ocr-status').textContent='Загружаю распознаватель… При первом запуске это может занять около минуты.';
    let timeout,localWorker=null;
    try{
      const work=(async()=>{
        const canvas=await canvasFor(file);await library();if(token!==job)throw Error('Отменено.');
        localWorker=await Tesseract.createWorker(['rus','eng'],1,{workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',langPath:'https://tessdata.projectnaptha.com/4.0.0',logger:m=>{if(token===job&&m.status==='recognizing text')$('ocr-status').textContent='Распознаю текст: '+Math.round(m.progress*100)+'%';},errorHandler:()=>{}});
        if(token!==job){await localWorker.terminate();throw Error('Отменено.');}worker=localWorker;
        await localWorker.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});
        return localWorker.recognize(canvas);
      })();
      const result=await Promise.race([work,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Распознавание заняло слишком долго. Попробуйте обрезать скриншот и повторить.')),90000);})]);
      if(token!==job)return;
      $('ocr-text').value=result.data.text.slice(0,50000);rows=parse($('ocr-text').value,options);renderRows();
      $('ocr-status').textContent=rows.length?'Текст перенесён в поля. Проверьте выбранные записи и нажмите «Добавить выбранные».':'Текст не найден. Попробуйте более чёткий или обрезанный скриншот.';
      if(!rows.length)$('ocr-text-panel').open=true;
    }catch(e){if(token===job){$('ocr-error').textContent=e.message||'Не удалось распознать скриншот.';$('ocr-text-panel').open=true;}}
    finally{clearTimeout(timeout);if(token===job){job++;loading=false;worker=null;$('ocr-file').disabled=false;$('ocr-parse').disabled=false;renderRows();}if(localWorker)await localWorker.terminate().catch(()=>{});}
  }
  function close(){job++;loading=false;if(worker){worker.terminate().catch(()=>{});worker=null;}if(previewURL){URL.revokeObjectURL(previewURL);previewURL='';}$('ocr-image').removeAttribute('src');dialog.close();}
  function open(opts){
    if(!TYPES[opts.kind])return;options=opts;rows=[];job++;loading=false;$('ocr-heading').textContent='Из скриншота · '+(opts.kind==='money'?(opts.moneyKind==='income'?'Доход':'Расход'):TYPES[opts.kind]);
    $('ocr-file').value='';$('ocr-file').disabled=false;$('ocr-parse').disabled=false;$('ocr-text').value='';$('ocr-image').hidden=true;$('ocr-status').textContent='';$('ocr-error').textContent='';$('ocr-text-panel').open=false;renderRows();dialog.showModal();
  }
  $('ocr-file').addEventListener('change',e=>{if(e.target.files[0])recognize(e.target.files[0]);});
  dialog.addEventListener('paste',e=>{const item=Array.from(e.clipboardData?.items||[]).find(x=>x.type.startsWith('image/'));if(item){e.preventDefault();const f=item.getAsFile();if(f)recognize(f);}});
  $('ocr-parse').addEventListener('click',()=>{rows=parse($('ocr-text').value,options);renderRows();$('ocr-error').textContent='';$('ocr-status').textContent=rows.length?'Поля заполнены. Проверьте перед добавлением.':'Вставьте текст или выберите скриншот.';});
  $('ocr-add-row').addEventListener('click',()=>{if(rows.length>=100)return;rows.push({...parse(options.kind==='money'?'Новая операция':'Новая запись',options)[0],title:''});renderRows();});
  $('ocr-drafts').addEventListener('input',e=>{const field=e.target.dataset.field,index=e.target.closest('[data-row]')?.dataset.row;if(field&&index!=null){rows[index][field]=e.target.type==='checkbox'?e.target.checked:e.target.value;$('ocr-save').disabled=loading||!rows.some(r=>r.selected);}});
  $('ocr-form').addEventListener('submit',e=>{
    e.preventDefault();$('ocr-error').textContent='';const selected=rows.filter(r=>r.selected);
    try{if(!selected.length)throw Error('Выберите хотя бы одну запись.');options.onSave(selected);close();}catch(error){$('ocr-error').textContent=error.message;}
  });
  $('ocr-cancel').addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  window.ScreenshotImport={open,parse,dateIn,amountIn};
})();
