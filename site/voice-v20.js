/* Speech is started only by the microphone button. A parsed draft opens the existing editor. */
(() => {
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const names={auto:'Определить автоматически',tasks:'Дела',notes:'Комментарий к календарю',goals:'Цели',reading:'Я хочу → Книги',watch:'Я хочу → Фильмы / сериалы',recipes:'Я хочу → Рецепты',money:'Финансы'};
 let language='ru-RU';try{if(localStorage.getItem('bue-voice-language-v20')==='en-US')language='en-US';}catch{}
 const dialog=document.createElement('dialog');dialog.id='voice-dialog';dialog.className='voice-dialog';dialog.setAttribute('aria-labelledby','voice-title');
 dialog.innerHTML='<h2 id="voice-title">Добавить голосом</h2><p class="small">Выберите язык, произнесите одну команду и проверьте подготовленную запись. Аудио обрабатывает служба распознавания вашего телефона или браузера. Нужен интернет.</p><div class="voice-options"><label>Язык речи<select id="voice-language"><option value="ru-RU">Русский</option><option value="en-US">English</option></select></label><label>Куда добавить<select id="voice-section">'+Object.entries(names).map(([key,name])=>'<option value="'+key+'">'+esc(name)+'</option>').join('')+'</select></label></div><p id="voice-example" class="small"></p><div class="voice-mic-actions"><button type="button" id="voice-start" class="primary">🎙 Сказать</button><button type="button" id="voice-stop" disabled>Остановить</button></div><p id="voice-status" class="small" role="status" aria-live="polite"></p><label>Распознанная команда — можно исправить<textarea id="voice-text" rows="4" maxlength="4000" placeholder="Спиши 500 рублей на продукты сегодня"></textarea></label><p id="voice-error" class="error" role="alert"></p><div class="actions"><button type="button" id="voice-close">Закрыть</button><button type="button" id="voice-prepare" class="primary">Проверить запись</button></div>';
 document.body.append(dialog);
 const get=id=>dialog.querySelector('#'+id),text=get('voice-text'),status=get('voice-status'),error=get('voice-error'),lang=get('voice-language'),section=get('voice-section');
 let recognition=null,listening=false,session=0,native=false;
 function example(){lang.value=language;get('voice-example').textContent=language==='en-US'?'Examples: “Spend 500 rubles on groceries today”, “Add book Dune”, “Add task buy milk tomorrow”.':'Например: «Спиши 500 рублей на продукты сегодня», «Добавь книгу Дюна», «Добавь дело купить молоко завтра». ';text.placeholder=language==='en-US'?'Spend 500 rubles on groceries today':'Спиши 500 рублей на продукты сегодня';}
 function busy(value){listening=value;get('voice-start').disabled=value;get('voice-stop').disabled=!value;lang.disabled=value;get('voice-prepare').disabled=value;}
 function fail(message){busy(false);status.textContent='';error.textContent=message;}
 function stop(cancel=false){if(native){if(cancel){window.AndroidVoice?.cancel?.();window.BUENativeVoice?.cancel?.();busy(false);}else if(window.BUENativeVoice?.stop){window.BUENativeVoice.stop();status.textContent='Завершаю распознавание…';}else{status.textContent='Завершите запись в окне распознавания телефона.';}return;}if(recognition){cancel?recognition.abort():recognition.stop();}if(cancel){session++;recognition=null;busy(false);}}
 function open(){if(!window.PlannerVoiceTarget){return;}error.textContent='';status.textContent='';text.value='';section.value='auto';native=false;example();busy(false);dialog.showModal();}
 const recognitionErrors={
  'not-allowed':'Разрешите доступ к микрофону в настройках телефона или браузера и попробуйте снова.',
  'service-not-allowed':'Служба распознавания недоступна в этом браузере. Попробуйте Safari на iPhone или Chrome; также можно продиктовать команду микрофоном клавиатуры в поле ниже.',
  'audio-capture':'Микрофон недоступен. Проверьте его подключение и разрешения.',
  'network':'Не удалось связаться со службой распознавания. Проверьте интернет.',
  'no-speech':'Речь не распознана. Нажмите «Сказать» и повторите команду.',
  'language-not-supported':'Выбранный язык недоступен у службы распознавания. Проверьте языки телефона.',
  'aborted':'Запись остановлена.'
 };
 get('voice-start').addEventListener('click',()=>{
  error.textContent='';if(!navigator.onLine){fail('Для распознавания речи подключитесь к интернету. Команду можно ввести текстом.');return;}
  language=lang.value;const id=++session;busy(true);text.value='';status.textContent=language==='en-US'?'Listening… Say one command.':'Слушаю… Произнесите одну команду.';
  if(window.AndroidVoice?.start||window.BUENativeVoice?.start){native=true;try{(window.AndroidVoice||window.BUENativeVoice).start(language);}catch{fail('Не удалось запустить распознавание телефона.');}return;}
  native=false;const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){fail('Этот браузер не поддерживает голосовое распознавание. Откройте Safari или Chrome либо используйте микрофон клавиатуры в поле команды.');return;}
  try{
   recognition=new Speech();recognition.lang=language;recognition.continuous=false;recognition.interimResults=true;recognition.maxAlternatives=1;
   if('processLocally' in recognition)recognition.processLocally=false;
   recognition.onresult=event=>{if(id!==session||!dialog.open)return;const parts=[];for(let i=0;i<event.results.length;i++)parts.push(event.results[i][0].transcript);text.value=parts.join(' ').slice(0,4000);};
   recognition.onerror=event=>{if(id!==session||!dialog.open)return;fail(recognitionErrors[event.error]||'Не удалось распознать речь. Повторите или исправьте команду в поле ниже.');};
   recognition.onend=()=>{if(id!==session||!dialog.open)return;busy(false);recognition=null;if(text.value.trim()&&!error.textContent)status.textContent='Речь распознана. Проверьте текст и нажмите «Проверить запись».';else if(!error.textContent)fail('Команда не получена. Попробуйте ещё раз.');};
   recognition.start();
  }catch{recognition=null;fail('Не удалось запустить микрофон. Проверьте разрешение браузера.');}
 });
 get('voice-stop').addEventListener('click',()=>stop(false));
 get('voice-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>stop(true));
 dialog.addEventListener('cancel',()=>stop(true));
 lang.addEventListener('change',()=>{language=lang.value;try{localStorage.setItem('bue-voice-language-v20',language);}catch{}example();});
 get('voice-prepare').addEventListener('click',()=>{
  error.textContent='';try{
   const context=window.PlannerVoiceTarget.context(),draft=window.PlannerVoiceCommands.parse(text.value,{...context,language:lang.value,section:section.value});
   window.PlannerVoiceTarget.check(draft);dialog.close();window.PlannerVoiceTarget.openDraft(draft);
  }catch(problem){error.textContent=problem.message||'Проверьте команду.';}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&listening&&!native)stop(true);});
 window.addEventListener('pagehide',()=>stop(true));
 window.PlannerVoiceNative={
  onPartial:value=>{if(dialog.open&&listening)text.value=String(value||'').slice(0,4000);},
  onResult:value=>{if(!dialog.open||!listening)return;text.value=String(value||'').slice(0,4000);busy(false);native=false;status.textContent=text.value?'Речь распознана. Проверьте команду перед сохранением.':'Команда не получена.';},
  onError:value=>{if(dialog.open&&listening){native=false;fail(String(value||'Распознавание остановлено.'));}}
 };
 window.PlannerVoice={open};
 document.addEventListener('click',event=>{if(event.target.closest('[data-voice-open]')){const editor=document.getElementById('editor');if(editor?.open)editor.close();open();}});
 example();
})();
