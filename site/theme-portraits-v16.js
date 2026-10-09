/* Original action-cinema atlas and portraits extending the existing vector artwork. */
(() => {
 const slots=['today','tasks','calendar','goals','money','reading','watch','recipes','settings'];
 const names={
  action90s:['Чак Норрис','Арнольд Шварценеггер','Брюс Уиллис','Жан-Клод Ван Дамм','Джеки Чан','Сильвестр Сталлоне','Джет Ли','Дольф Лундгрен','Стивен Сигал'],
  ironman:['Железный человек','Пеппер Поттс','Воитель','Вижн','Халк','Капитан Америка','Человек-паук','Доктор Стрэндж','Ник Фьюри'],
  thanos:['Танос','Эбони Мо','Корвус Глейв','Проксима Миднайт','Кулл Обсидиан','Гамора','Небула','Локи','Ронан'],
  guardians:['Звёздный Лорд','Гамора','Дракс','Ракета','Грут','Мантис','Небула','Йонду','Космо'],
  'deadpool-wolverine':['Дэдпул','Росомаха','X-23','Колосс','Сверхзвуковая Боеголовка','Кейбл','Домино','Гамбит','Блэйд'],
  loki:['Локи','Сильви','Тор','Один','Мобиус','Хеймдалль','Валькирия','Хела','Мисс Минуты'],
  gentle:['Пионы','Кремовые розы','Лаванда','Ромашки','Тюльпаны','Магнолия','Гортензия','Космея','Полевые цветы']
 };
 const labels={today:'Сегодня',tasks:'Дела',calendar:'Календарь',goals:'Цели',money:'Финансы',reading:'Книги',watch:'Фильмы и сериалы',recipes:'Рецепты',settings:'Настройки'};
 const motto={today:'Твой день. Твои маленькие победы.',tasks:'Шаг за шагом — к результату.',calendar:'Для каждого плана найдётся время.',goals:'Большие мечты начинаются с первого шага.',money:'Планы и расходы — под контролем.',reading:'Новая глава ждёт тебя.',watch:'Время для новой истории.',recipes:'Добавь вкус в свой день.',settings:'Пусть всё будет по-твоему.'};
 function apply(theme,tab,wishKind){
  const panel=document.getElementById('mk-fighter'),portrait=document.getElementById('mk-portrait'),slot=tab==='wishes'?wishKind:tab;
  document.documentElement.dataset.heroTheme=theme;
  portrait.style.removeProperty('background-image');portrait.style.removeProperty('background-size');
  if(theme==='mk3'){
   panel.querySelector('.mk-edition').textContent='ULTIMATE / KOMBAT 3';
   panel.setAttribute('aria-label','Боец раздела '+(labels[slot]||'Сегодня'));
   document.documentElement.dataset.pageHero=document.getElementById('mk-name').textContent;
   return;
  }
  const roster=names[theme];if(!roster){panel.hidden=true;return;}
  const index=Math.max(0,slots.indexOf(slot)),name=roster[index];panel.hidden=false;
  if(theme==='action90s'){
   portrait.style.backgroundImage='url("assets/action90s-portraits-v16.png")';
   portrait.style.backgroundSize='300% 300%';portrait.style.backgroundPosition=`${index%3/2*100}% ${Math.floor(index/3)/2*100}%`;
  }else{
   portrait.style.backgroundImage=`url("assets/portraits-v16/${theme}-${slot}.svg")`;
   portrait.style.backgroundSize='cover';portrait.style.backgroundPosition='center';
  }
  portrait.setAttribute('aria-label',name);portrait.dataset.hero=theme+'-'+slot;delete portrait.dataset.fighter;
  document.documentElement.dataset.pageHero=name;
  document.getElementById('mk-name').textContent=name;
  document.getElementById('mk-motto').textContent=motto[slot]||motto.today;
  document.getElementById('mk-round').textContent=labels[slot]||labels.today;
  panel.querySelector('.mk-edition').textContent=theme==='gentle'?'В СВОЁМ РИТМЕ':theme==='action90s'?'БОЕВИКИ / 90-е И 2000-е':'ГЕРОЙ ТВОЕГО РАЗДЕЛА';
  panel.setAttribute('aria-label',(theme==='gentle'?'Цветы':'Герой')+' раздела '+(labels[slot]||labels.today));
 }
 window.PlannerPortraits={apply,slots,names};
})();
