/* One bounded speech session. A missing browser end event cannot lock the editor. */
(() => {
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const names={auto:'Определить автоматически',tasks:'Дела',notes:'Комментарий к календарю',goals:'Цели',reading:'Я хочу → Книги',watch:'Я хочу → Фильмы / сериалы',recipes:'Я хочу → Рецепты',money:'Финансы'};
 let language='ru-RU';try{if(localStorage.getItem('bue-voice-language-v20')==='en-US')language='en-US';}catch{}
 const dialog=document.createElement('dialog');dialog.id='voice-dialog';dialog.className='voice-dialog';dialog.setAttribute('aria-labelledby','voice-title');
 dialog.innerHTML='<h2 id="voice-title">Добавить голосом</h2><p class="small">Выберите язык, произнесите одну команду и проверьте запись. После паузы запись завершается автоматически, максимум — 45 секунд. Аудио обрабатывает телефон или браузер; нужен интернет.</p><div class="voice-options"><label>Язык речи<select id="voice-language"><option value="ru-RU">Русский</option><option value="en-US">English</option></select></label><label>Куда добавить<select id="voice-section">'+Object.entries(names).map(([key,name])=>'<option value="'+key+'">'+esc(name)+'</option>').join('')+'</select></label></div><p id="voice-example" class="small"></p><div class="voice-mic-actions"><button type="button" id="voice-start" class="primary">🎙 Сказать</button><button type="button" id="voice-stop" disabled>Остановить</button></div><p id="voice-status" class="small" role="status" aria-live="polite"></p><label>Распознанная команда — можно исправить<textarea id="voice-text" rows="4" maxlength="4000" placeholder="Спиши 500 рублей на продукты сегодня"></textarea></label><p id="voice-error" class="error" role="alert"></p><div class="actions"><button type="button" id="voice-close">Закрыть</button><button type="button" id="voice-prepare" class="primary">Проверить запись</button></div>';
 document.body.append(dialog);
 const get=id=>dialog.querySelector('#'+id),text=get('voice-text'),status=get('voice-status'),error=get('voice-error'),lang=get('voice-language'),section=get('voice-section');
 let recognition=null,listening=false,session=0,native=false,timers={};
 const errors={'not-allowed':'Разрешите доступ к микрофону в настройках телефона или браузера. Можно использовать микрофон клавиатуры в поле команды.','service-not-allowed':'Распознавание браузера недоступно. Используйте микрофон клавиатуры в поле команды.','audio-capture':'Микрофон недоступен. Проверьте разрешения.','network':'Не удалось связаться со службой распознавания. Проверьте интернет.','no-speech':'Речь не распознана. Повторите команду или введите её в поле.','language-not-supported':'Выбранный язык недоступен у службы распознавания.','aborted':'Запись остановлена.'};
 function example(){lang.value=language;get('voice-example').textContent=language==='en-US'?'Examples: “Spend 500 rubles on groceries today”, “Add book Dune”, “Add task buy milk tomorrow”.':'Например: «Спиши 500 рублей на продукты сегодня», «Добавь книгу Дюна», «Добавь дело купить молоко завтра».';text.placeholder=language==='en-US'?'Spend 500 rubles on groceries today':'Спиши 500 рублей на продукты сегодня';}
 function clearTimers(){Object.values(timers).forEach(clearTimeout);timers={};}
 function arm(name,ms,callback){clearTimeout(timers[name]);timers[name]=setTimeout(callback,ms);}
 function busy(value){listening=value;get('voice-start').disabled=value;get('voice-stop').disabled=!value;lang.disabled=value;get('voice-prepare').disabled=value&&!text.value.trim();}
 function detach(){const current=recognition;recognition=null;if(current){current.onresult=current.onerror=current.onend=current.onspeechend=null;try{current.abort();}catch{}}if(native){try{window.AndroidVoice?.cancel?.();window.BUENativeVoice?.cancel?.();}catch{}}native=false;}
 function cancel(){session++;clearTimers();busy(false);detach();}
 function finish(id,message){if(id!==session||!listening)return;session++;clearTimers();busy(false);detach();if(!dialog.open)return;if(text.value.trim()){error.textContent='';status.textContent='Запись завершена. Проверьте текст и нажмите «Проверить запись».';}else{status.textContent='';error.textContent=message||'Команда не получена. Повторите или используйте микрофон клавиатуры в поле ниже.';}}
 function fail(id,message){if(id!==session)return;cancel();if(dialog.open){status.textContent='';error.textContent=message;}}
 function heard(id,value,final=false){if(id!==session||!listening||!dialog.open)return;text.value=String(value||'').slice(0,4000);clearTimeout(timers.start);busy(true);if(final){finish(id);return;}if(text.value.trim())arm('silence',3500,()=>finish(id));}
 function stop(){if(!listening)return;const id=session;get('voice-stop').disabled=true;status.textContent='Завершаю запись…';if(native){try{if(window.BUENativeVoice?.stop)window.BUENativeVoice.stop();else{finish(id);return;}}catch{finish(id);return;}}else{try{recognition?.stop();}catch{finish(id);return;}}if(id===session&&listening)arm('stop',1500,()=>finish(id));}
 function open(){if(!window.PlannerVoiceTarget)return;cancel();error.textContent='';status.textContent='';text.value='';section.value='auto';example();dialog.showModal();}
 get('voice-start').addEventListener('click',()=>{
  if(listening)return;cancel();error.textContent='';status.textContent='';if(!navigator.onLine){error.textContent='Для распознавания речи подключитесь к интернету. Команду можно ввести текстом.';return;}
  language=lang.value;const id=++session;busy(true);text.value='';get('voice-prepare').disabled=true;status.textContent=language==='en-US'?'Listening… Say one command.':'Слушаю… Произнесите одну команду.';
  arm('limit',45000,()=>finish(id,'Распознавание не ответило за 45 секунд. Попробуйте снова или продиктуйте команду микрофоном клавиатуры.'));
  if(window.AndroidVoice?.start||window.BUENativeVoice?.start){native=true;try{(window.AndroidVoice||window.BUENativeVoice).start(language);}catch{fail(id,'Не удалось запустить распознавание телефона.');}return;}
  const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){fail(id,'Распознавание этого браузера недоступно. Используйте микрофон клавиатуры в поле команды.');return;}
  try{
   recognition=new Speech();recognition.lang=language;recognition.continuous=false;recognition.interimResults=true;recognition.maxAlternatives=1;if('processLocally' in recognition)recognition.processLocally=false;
   recognition.onresult=event=>{const parts=[];let final=false;for(let i=0;i<event.results.length;i++){parts.push(event.results[i][0].transcript);if(event.results[i].isFinal)final=true;}heard(id,parts.join(' '),final);};
   recognition.onerror=event=>{if(event.error==='aborted'&&id===session&&text.value.trim())finish(id);else fail(id,errors[event.error]||'Не удалось распознать речь. Повторите или исправьте команду.');};
   recognition.onend=()=>finish(id);
   recognition.onspeechend=()=>{if(id===session&&listening&&text.value.trim())stop();};
   arm('start',15000,()=>finish(id,'Браузер не начал распознавание. Проверьте разрешение микрофона или используйте микрофон клавиатуры.'));
   recognition.start();
  }catch{fail(id,'Не удалось запустить микрофон. Проверьте разрешение браузера.');}
 });
 get('voice-stop').addEventListener('click',stop);
 get('voice-close').addEventListener('click',()=>{cancel();dialog.close();});
 dialog.addEventListener('close',()=>{if(!dialog.open)cancel();});dialog.addEventListener('cancel',cancel);
 text.addEventListener('input',()=>{if(listening)cancel();});
 lang.addEventListener('change',()=>{language=lang.value;try{localStorage.setItem('bue-voice-language-v20',language);}catch{}example();});
 get('voice-prepare').addEventListener('click',()=>{error.textContent='';cancel();try{const context=window.PlannerVoiceTarget.context(),draft=window.PlannerVoiceCommands.parse(text.value,{...context,language:lang.value,section:section.value});window.PlannerVoiceTarget.check(draft);dialog.close();window.PlannerVoiceTarget.openDraft(draft);}catch(problem){error.textContent=problem.message||'Проверьте команду.';}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&listening&&!native){cancel();status.textContent='Запись остановлена. Распознанный текст сохранён в поле.';}});
 window.addEventListener('pagehide',cancel);
 window.PlannerVoiceNative={onPartial:value=>{if(native&&listening)heard(session,value);},onResult:value=>{if(native&&listening)heard(session,value,true);},onError:value=>{if(native&&listening)fail(session,String(value||'Распознавание остановлено.'));}};
 window.PlannerVoice={open};document.addEventListener('click',event=>{if(event.target.closest('[data-voice-open]')){const editor=document.getElementById('editor');if(editor?.open)editor.close();open();}});example();
})();
