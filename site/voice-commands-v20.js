/* Bounded Russian/English commands. Returns a draft; never mutates planner records. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PlannerVoiceCommands=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const sections=['tasks','notes','goals','reading','watch','recipes','money'];
 const monthPatterns=['январ[а-яё]*|january|jan','феврал[а-яё]*|february|feb','март[а-яё]*|march|mar','апрел[а-яё]*|april|apr','ма[йя]|may','июн[а-яё]*|june|jun','июл[а-яё]*|july|jul','август[а-яё]*|august|aug','сентябр[а-яё]*|september|sep','октябр[а-яё]*|october|oct','ноябр[а-яё]*|november|nov','декабр[а-яё]*|december|dec'];
 const numberWords={zero:0,ноль:0,one:1,один:1,одна:1,одно:1,two:2,два:2,две:2,three:3,три:3,four:4,четыре:4,five:5,пять:5,six:6,шесть:6,seven:7,семь:7,eight:8,восемь:8,nine:9,девять:9,ten:10,десять:10,eleven:11,одиннадцать:11,twelve:12,двенадцать:12,thirteen:13,тринадцать:13,fourteen:14,четырнадцать:14,fifteen:15,пятнадцать:15,sixteen:16,шестнадцать:16,seventeen:17,семнадцать:17,eighteen:18,восемнадцать:18,nineteen:19,девятнадцать:19,twenty:20,двадцать:20,thirty:30,тридцать:30,forty:40,сорок:40,fifty:50,пятьдесят:50,sixty:60,шестьдесят:60,seventy:70,семьдесят:70,eighty:80,восемьдесят:80,ninety:90,девяносто:90,сто:100,двести:200,триста:300,четыреста:400,пятьсот:500,шестьсот:600,семьсот:700,восемьсот:800,девятьсот:900};
 const scales={thousand:1000,thousands:1000,тысяча:1000,тысячи:1000,тысяч:1000,million:1000000,millions:1000000,миллион:1000000,миллиона:1000000,миллионов:1000000};
 const localDay=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 const dayDate=day=>new Date(day+'T12:00:00');
 const tidy=s=>String(s).replace(/\s+/g,' ').replace(/^[\s,:;—–-]+|[\s,:;—–-]+$/g,'').trim();
 function validDay(year,month,day){const date=new Date(Number(year),Number(month)-1,Number(day),12);if(date.getFullYear()!==Number(year)||date.getMonth()!==Number(month)-1||date.getDate()!==Number(day))throw Error('Проверьте дату: такого дня в календаре нет.');return localDay(date);}
 function dateFacts(text,base,language){
  const facts=[],year=Number(base.slice(0,4)),occupied=[];
  function add(match,date){if(occupied.some(([a,b])=>match.index<b&&match.index+match[0].length>a))return;occupied.push([match.index,match.index+match[0].length]);facts.push({raw:match[0],date,index:match.index});}
  for(const match of text.matchAll(/\d{4}-\d{2}-\d{2}/g)){const [y,m,d]=match[0].split('-');add(match,validDay(y,m,d));}
  for(const match of text.matchAll(/(?:\d{1,2})[./](?:\d{1,2})[./](?:20\d{2})/g)){const [a,b,y]=match[0].split(/[./]/);let d=a,m=b;if(language==='en-US'&&match[0].includes('/')){if(Number(a)<=12&&Number(b)<=12)throw Error('Дата неоднозначна. Назовите месяц словами, например October 15.');if(Number(a)<=12){m=a;d=b;}}add(match,validDay(y,m,d));}
  for(let m=0;m<monthPatterns.length;m++){
   const month=monthPatterns[m];
   for(const match of text.matchAll(new RegExp('(?<!\\d)(\\d{1,2})(?:st|nd|rd|th)?(?!\\d)\\s+(?:of\\s+)?('+month+')(?:\\s+(20\\d{2}))?','giu')))add(match,validDay(match[3]||year,m+1,match[1]));
   for(const match of text.matchAll(new RegExp('('+month+')\\s+(\\d{1,2})(?:st|nd|rd|th)?(?!\\d)(?:,?\\s+(20\\d{2}))?','giu')))add(match,validDay(match[3]||year,m+1,match[2]));
  }
  const relative=/(?:послезавтра|day after tomorrow|завтра|tomorrow|сегодня|today|через неделю|next week)/giu;
  for(const match of text.matchAll(relative)){const word=match[0].toLowerCase(),offset=/послезавтра|day after/.test(word)?2:/завтра|tomorrow/.test(word)?1:/неделю|week/.test(word)?7:0;const date=dayDate(base);date.setDate(date.getDate()+offset);add(match,localDay(date));}
  const weekdays=[/воскресень[а-яё]*|sunday/iu,/понедельник[а-яё]*|monday/iu,/вторник[а-яё]*|tuesday/iu,/сред[уаы]|wednesday/iu,/четверг[а-яё]*|thursday/iu,/пятниц[а-яё]*|friday/iu,/суббот[а-яё]*|saturday/iu];
  if(!facts.length)for(let day=0;day<7;day++){const match=text.match(weekdays[day]);if(match){const date=dayDate(base),offset=(day-date.getDay()+7)%7;date.setDate(date.getDate()+offset+(offset===0&&/следующ|next/iu.test(text)?7:0));add(match,localDay(date));break;}}
  return facts.sort((a,b)=>a.index-b.index);
 }
 function numericValue(tokens){
  const decimal=tokens.findIndex(token=>/^(point|запятая|точка)$/.test(token));
  if(decimal>=0){const whole=numericValue(tokens.slice(0,decimal)),tail=tokens.slice(decimal+1);if(!tail.length)throw Error('После десятичного разделителя нет числа.');let digits;if(tail.every(token=>/^\d+$/.test(token)||(numberWords[token]!=null&&numberWords[token]<10)))digits=tail.map(token=>/^\d+$/.test(token)?token:String(numberWords[token])).join('');else digits=String(numericValue(tail));if(digits.length>2)throw Error('Сумма может иметь не больше двух знаков после запятой.');return whole+Number(digits)/10**digits.length;}
  let total=0,current=0;
  for(let i=0;i<tokens.length;i++){const token=tokens[i];if(token==='and'||token==='и')continue;if(/^\d+(?:[.,]\d{1,2})?$/.test(token)){let literal=token;if(!/[.,]/.test(token))while(/^\d{3}$/.test(tokens[i+1]||'')){literal+=tokens[++i];}current+=Number(literal.replace(',','.'));}else if(token==='hundred'){current=(current||1)*100;}else if(scales[token]){total+=(current||1)*scales[token];current=0;}else if(numberWords[token]!=null){current+=numberWords[token];}else throw Error('Не удалось разобрать сумму.');}
  return total+current;
 }
 function amountFacts(text){
  if(/(?:^|\s)[−-]\s*\d/u.test(text))throw Error('Произнесите положительную сумму; расход выбирается отдельно.');
  const all=[...text.matchAll(/\d+(?:[.,]\d+)?|[\p{L}]+/gu)].map(match=>({word:match[0].toLowerCase(),index:match.index,end:match.index+match[0].length})),groups=[];
  const isNumber=word=>/^\d+(?:[.,]\d+)?$/.test(word)||numberWords[word]!=null||scales[word]||word==='hundred';
  for(let i=0;i<all.length;i++){
   if(!isNumber(all[i].word))continue;const start=all[i].index,words=[all[i].word];let end=all[i].end;
   while(i+1<all.length){const next=all[i+1];if(!/^[\s-]*$/.test(text.slice(end,next.index)))break;const connector=/^(and|и|point|запятая|точка)$/.test(next.word)&&isNumber(all[i+2]?.word||'');if(!isNumber(next.word)&&!connector)break;words.push(next.word);end=next.end;i++;}
   if(words.some(word=>/^\d+[.,]\d{3,}$/.test(word)))throw Error('Сумма может иметь не больше двух знаков после запятой.');
   if(words.some(word=>word==='and'||word==='и')&&(words.filter(word=>/^\d/.test(word)).length>1||words.filter(word=>word==='hundred'||numberWords[word]>=100).length>1))throw Error('В команде несколько сумм. Добавляйте по одной операции.');
   const value=numericValue(words);groups.push({value,raw:text.slice(start,end),start,end});
  }
  if(groups.length===2&&/руб|rubl|dollar|доллар|euro|евро|₽|\$/iu.test(text.slice(groups[0].end,groups[1].start))&&/копе|kopeck|cent|цент/iu.test(text.slice(groups[1].end))){if(groups[1].value>=100)throw Error('Проверьте копейки или центы.');groups[0].value+=groups[1].value/100;groups[0].end=groups[1].end;groups[0].raw=text.slice(groups[0].start,groups[0].end);groups.pop();}
  if(groups.length!==1)throw Error(groups.length?'В команде несколько сумм. Добавляйте по одной операции.':'Назовите сумму, например 500 рублей или seventy thousand rubles.');
  const result=groups[0],minor=Math.round(result.value*100);if(!Number.isSafeInteger(minor)||minor<=0||minor>100000000000000||Math.abs(minor-result.value*100)>0.00001)throw Error('Проверьте положительную сумму: не более двух знаков после запятой.');
  result.amount=(minor/100).toFixed(2);return result;
 }
 const rules=[
  ['money','expense',/^(?:спиши|списать|потратил[а]?|запиши расход|добавь расход|расход|оплати|заплати|запланируй расход|spend|spent|record expense|add expense|expense|pay|plan expense|budget expense)\s*[:,]?\s*/iu],
  ['money','income',/^(?:добавь доход|запиши доход|доход|получил[а]?|зачисли|запланируй доход|add income|record income|income|received|receive|deposit|plan income)\s*[:,]?\s*/iu],
  ['reading',null,/^(?:добавь книгу|добавить книгу|в книги добавь|в список книг добавь|книга|add (?:a )?book|record (?:a )?book|book)\s*[:,]?\s*/iu],
  ['watch','series',/^(?:добавь сериал|в сериалы добавь|сериал|add (?:a )?(?:series|tv show)|series|tv show)\s*[:,]?\s*/iu],
  ['watch','movie',/^(?:добавь фильм|в фильмы добавь|фильм|add (?:a )?movie|add (?:a )?film|movie|film)\s*[:,]?\s*/iu],
  ['recipes',null,/^(?:добавь рецепт|в рецепты добавь|рецепт|add (?:a )?recipe|recipe)\s*[:,]?\s*/iu],
  ['goals',null,/^(?:добавь цель|запиши цель|цель|add (?:a )?goal|record (?:a )?goal|goal)\s*[:,]?\s*/iu],
  ['notes',null,/^(?:добавь заметку|добавь комментарий|в календарь добавь|заметка|add (?:a )?note|add (?:a )?comment|calendar note|note)\s*[:,]?\s*/iu],
  ['tasks',null,/^(?:добавь дело|добавь задачу|запиши дело|запиши задачу|напомни|дело|задача|add (?:a )?task|add (?:a )?todo|task|remind me to|remind me)\s*[:,]?\s*/iu]
 ];
 function parse(input,options={}){
  const text=tidy(input);if(!text||text.length>4000)throw Error('Произнесите одну короткую команду.');
  if(/^(?:удали|удалить|сотри|delete|erase|remove|wipe)(?:\s|$)/iu.test(text))throw Error('Голосом можно добавлять записи. Удаление выполняется в разделе приложения.');
  if(/(?:\s(?:и|and|then)\s+)(?:добавь|спиши|зачисли|add|spend|record|deposit)\s/iu.test(text))throw Error('Добавляйте по одной команде за раз.');
  const language=options.language==='en-US'?'en-US':'ru-RU',base=options.day||localDay(new Date());validDay(...base.split('-'));
  let section=options.section||'auto',match=rules.map(rule=>({rule,match:text.match(rule[2])})).find(value=>value.match),body=text,kind='expense',watchKind='movie';
  if(match){if(section!=='auto'&&section!==match.rule[0])throw Error('Выбранный раздел отличается от команды. Выберите «Определить автоматически» или исправьте команду.');if(section==='auto')section=match.rule[0];body=text.slice(match.match[0].length);if(match.rule[0]==='money')kind=match.rule[1];if(match.rule[0]==='watch')watchKind=match.rule[1];}
  if(!sections.includes(section))throw Error('Не удалось определить раздел. Выберите его вручную или начните с «Добавь дело», «Спиши», «Add book».');
  const draft={section,title:'',note:'',date:'',language,warnings:[]};
  const noteMatch=body.match(/(?:описание|комментарий|примечание|description|note)\s*[:—-]\s*/iu);if(noteMatch){draft.note=body.slice(noteMatch.index+noteMatch[0].length).trim();body=body.slice(0,noteMatch.index);}
  let week=null;
  if(section==='money')for(let month=0;month<monthPatterns.length;month++){
   const found=body.match(new RegExp('(?:на|for|in)\\s+(1|2|3|4|5|first|second|third|fourth|fifth|перв[а-яё]*|втор[а-яё]*|трет[а-яё]*|четверт[а-яё]*|пят[а-яё]*)\\s+(?:недел[а-яё]*|week)\\s+(?:of\\s+)?('+monthPatterns[month]+')(?:\\s+(20\\d{2}))?','iu'));
   if(found){const number=/^\d/.test(found[1])?Number(found[1]):/first|перв/iu.test(found[1])?1:/second|втор/iu.test(found[1])?2:/third|трет/iu.test(found[1])?3:/fourth|четверт/iu.test(found[1])?4:5,year=Number(found[3]||base.slice(0,4)),first=1+(number-1)*7,last=new Date(year,month+1,0).getDate();if(first>last)throw Error('В этом месяце нет указанной недели.');week={number,date:validDay(year,month+1,first),end:validDay(year,month+1,Math.min(first+6,last))};body=body.replace(found[0],'');break;}
  }
  const facts=['tasks','goals','money','notes'].includes(section)?dateFacts(body,base,language):[];
  if(section!=='goals'&&new Set(facts.map(fact=>fact.date)).size>1)throw Error('В одной записи несколько дат. Оставьте одну дату.');
  draft.date=week?.date||facts[0]?.date||((section==='money'||section==='notes')?base:'');
  for(const fact of facts)body=body.replace(fact.raw,' ');
  const time=['tasks','notes','goals','money'].includes(section)?body.match(/(?:^|\s)(?:в|at)\s+(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?/iu):null;
  if(time){let hour=Number(time[1]),minute=Number(time[2]||0);if(time[3]){if(hour<1||hour>12)throw Error('Проверьте время.');hour=hour%12+(/pm/i.test(time[3])?12:0);}if(hour>23||minute>59)throw Error('Проверьте время.');draft.time=String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0');draft.date=draft.date||base;body=body.replace(time[0],' ');draft.note=tidy(draft.note+' Время: '+draft.time);}
  if(section==='money'){
   const currencies=[];if(/₽|руб[а-яё]*|rubles?/iu.test(body))currencies.push('RUB');if(/\$|доллар[а-яё]*|dollars?|USD/iu.test(body))currencies.push('USD');if(/€|евро|euros?|EUR/iu.test(body))currencies.push('EUR');if(currencies.length>1)throw Error('Назовите одну валюту.');draft.currency=currencies[0]||options.currency||'RUB';
   const amount=amountFacts(body);draft.amount=amount.amount;draft.kind=kind;draft.status=week||/запланируй|план|plan|budget/iu.test(text)||draft.date>base?'planned':'confirmed';draft.planSpan=week?'week':'day';if(week){draft.planWeek=String(week.number);draft.planEnd=week.end;}
   body=body.replace(amount.raw,' ').replace(/₽|руб[а-яё]*|rubles?|€|евро|euros?|EUR|\$|доллар[а-яё]*|dollars?|USD|копе[а-яё]*|kopecks?|cents?|цент[а-яё]*/giu,' ');
   const category=body.match(/(?:категория|category)\s*[:—-]\s*(.+)$/iu);if(category){draft.category=tidy(category[1]);body=body.slice(0,category.index);}else draft.category='Прочее';
   draft.title=tidy(tidy(body).replace(/^(?:на|за|для|on|for|to)\s+/iu,'').replace(/\s+(?:на|в|до|on|at|by)\s*$/iu,''));
  }else if(section==='tasks'){
   draft.daily=/каждый день|ежедневно|every day|daily/iu.test(body);body=body.replace(/каждый день|ежедневно|every day|daily/giu,'');draft.list='Личное';draft.title=tidy(body.replace(/^(?:в|на|on|by)\s+/iu,'').replace(/\s+(?:в|на|on|by)\s*$/iu,''));
  }else if(section==='goals'){
   const y=text.match(/(?:на|за|в|in|for)\s+(20\d{2})(?:\s|$)/iu)||text.match(/(20\d{2})\s*(?:год[а-яё]*|year)(?:\s|$)/iu),year=y?Number(y[1]):Number(base.slice(0,4));draft.period=facts.length>1?'range':facts.length?'date':'year';draft.start=facts[0]?.date||year+'-01-01';draft.end=facts[facts.length-1]?.date||year+'-12-31';
   if(!facts.length){
    if(/на месяц|за месяц|в этом месяце|this month|for a month/iu.test(body)){const month=Number(base.slice(5,7));draft.period='month';draft.start=validDay(year,month,1);draft.end=validDay(year,month,new Date(year,month,0).getDate());body=body.replace(/на месяц|за месяц|в этом месяце|this month|for a month/giu,'');}
    else for(let month=0;month<monthPatterns.length;month++){const found=body.match(new RegExp('(?:на|в|for|in)\\s+('+monthPatterns[month]+')(?:\\s+(20\\d{2}))?','iu'));if(found){const y=Number(found[2]||year);draft.period='month';draft.start=validDay(y,month+1,1);draft.end=validDay(y,month+1,new Date(y,month+1,0).getDate());body=body.replace(found[0],'');break;}}
   }
   draft.title=tidy(body.replace(/\s*(?:на год|за год|в этом году|this year|for a year|by year end)\s*/giu,' ').replace(/\s+(?:с\s+по|from\s+to|до|к|by|on|from|to)\s*$/iu,''));
  }else if(section==='notes'){draft.text=tidy(body.replace(/^(?:на|в|on)\s+/iu,'').replace(/\s+(?:на|в|on)\s*$/iu,''));draft.title=draft.text;
  }else {draft.title=tidy(body);if(section==='watch')draft.watchKind=watchKind;if(section==='reading'){const author=body.match(/\s+(?:автор|by)\s+(.+)$/iu);if(author){draft.author=tidy(author[1]);draft.title=tidy(body.slice(0,author.index));}}}
  if(!draft.title)throw Error('Назовите запись, например «Спиши 500 рублей на продукты».');
  if(draft.title.length>500)throw Error('Название слишком длинное. Сократите его или перенесите описание в комментарий.');
  if(/напомни|remind me/iu.test(text))draft.warnings.push('Системное напоминание появится только в версиях, где оно подключено. Проверьте дату и время.');
  return draft;
 }
 return {parse,sections,localDay};
});
