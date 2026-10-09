/* Film photographs, original actor portraits and photographic flower atlas. Original pixels are preserved. */
(() => {
 const photoFiles={"ironman": "assets/movie-portraits-v17/ironman.jpg", "rescue": "assets/movie-portraits-v17/rescue.jpg", "warmachine": "assets/movie-portraits-v17/warmachine.jpg", "vision": "assets/movie-portraits-v17/vision-photo.jpg", "hulk": "assets/movie-portraits-v17/hulk.jpg", "captain": "assets/movie-portraits-v17/captain.jpg", "spiderman": "assets/movie-portraits-v17/spiderman.jpg", "strange": "assets/movie-portraits-v17/strange.jpg", "fury": "assets/movie-portraits-v17/fury.jpg", "thanos": "assets/movie-portraits-v17/thanos.jpg", "maw": "assets/movie-portraits-v17/maw.jpg", "corvus": "assets/movie-portraits-v17/corvus.jpg", "proxima": "assets/movie-portraits-v17/proxima.jpg", "cull": "assets/movie-portraits-v17/cull.png", "gamora": "assets/movie-portraits-v17/gamora.jpg", "nebula": "assets/movie-portraits-v17/nebula.jpg", "loki": "assets/movie-portraits-v17/loki.jpg", "ronan": "assets/movie-portraits-v17/ronan.jpg", "starlord": "assets/movie-portraits-v17/starlord.jpg", "drax": "assets/movie-portraits-v17/drax.jpg", "rocket": "assets/movie-portraits-v17/rocket.jpg", "groot": "assets/movie-portraits-v17/groot.jpg", "mantis": "assets/movie-portraits-v17/mantis.jpg", "yondu": "assets/movie-portraits-v17/yondu.jpg", "cosmo": "assets/movie-portraits-v17/cosmo.jpg", "deadpool": "assets/movie-portraits-v17/deadpool.jpg", "wolverine": "assets/movie-portraits-v17/wolverine.jpg", "x23": "assets/movie-portraits-v17/x23.jpg", "colossus": "assets/movie-portraits-v17/colossus.png", "negasonic": "assets/movie-portraits-v17/negasonic.jpg", "cable": "assets/movie-portraits-v17/cable.jpg", "domino": "assets/movie-portraits-v17/domino.jpg", "gambit": "assets/movie-portraits-v17/gambit.jpg", "blade": "assets/movie-portraits-v17/blade.jpg", "sylvie": "assets/movie-portraits-v17/sylvie.jpg", "thor": "assets/movie-portraits-v17/thor.jpg", "odin": "assets/movie-portraits-v17/odin.jpg", "mobius": "assets/movie-portraits-v17/mobius.jpg", "heimdall": "assets/movie-portraits-v17/heimdall.jpg", "valkyrie": "assets/movie-portraits-v17/valkyrie.jpg", "hela": "assets/movie-portraits-v17/hela.jpg", "minutes": "assets/movie-portraits-v17/minutes.jpg"};
 const photoRosters={"ironman": ["ironman", "rescue", "warmachine", "vision", "hulk", "captain", "spiderman", "strange", "fury"], "thanos": ["thanos", "maw", "corvus", "proxima", "cull", "gamora", "nebula", "loki", "ronan"], "guardians": ["starlord", "gamora", "drax", "rocket", "groot", "mantis", "nebula", "yondu", "cosmo"], "deadpool-wolverine": ["deadpool", "wolverine", "x23", "colossus", "negasonic", "cable", "domino", "gambit", "blade"], "loki": ["loki", "sylvie", "thor", "odin", "mobius", "heimdall", "valkyrie", "hela", "minutes"]};
 const photoPositions={heimdall:"50% 12%",valkyrie:"50% 12%",domino:"50% 65%",colossus:"50% 12%",ronan:"50% 18%",yondu:"50% 20%"};
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
  if(theme==='action90s'||theme==='gentle'){
   portrait.style.backgroundImage=theme==='action90s'?'url("assets/action90s-portraits-v16.png")':'url("assets/gentle-portraits-v17.png")';
   portrait.style.backgroundSize='300% 300%';portrait.style.backgroundPosition=`${index%3/2*100}% ${Math.floor(index/3)/2*100}%`;
  }else{
   const photo=photoRosters[theme][index];
   portrait.style.backgroundImage=`url("${photoFiles[photo]}")`;
   portrait.style.backgroundSize='cover';portrait.style.backgroundPosition=photoPositions[photo]||'center';
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
