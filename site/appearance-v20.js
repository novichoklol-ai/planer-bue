/* Per-device appearance preferences are independent of personal planner records. */
(() => {
 'use strict';
 const key='bue-font-size-v20';let percent=100;
 try{const saved=Number(localStorage.getItem(key));if(Number.isInteger(saved)&&saved>=100&&saved<=150&&saved%5===0)percent=saved;}catch{}
 function apply(){document.documentElement.style.setProperty('--bue-font-scale',String(percent/100));document.querySelectorAll('[data-font-percent]').forEach(label=>label.textContent=percent+'%');document.querySelectorAll('[data-font-range]').forEach(input=>input.value=String(percent));}
 function set(value){const number=Number(value);if(!Number.isInteger(number)||number<100||number>150||number%5!==0)return;percent=number;apply();try{localStorage.setItem(key,String(percent));document.querySelectorAll('[data-font-status]').forEach(label=>label.textContent='Размер текста сохранён на этом устройстве.');}catch{document.querySelectorAll('[data-font-status]').forEach(label=>label.textContent='Размер изменён; браузер не разрешил сохранить настройку.');}}
 function settings(){return '<section class="card"><h2>Размер текста</h2><div class="font-setting"><label>От обычного до крупного: <strong data-font-percent>'+percent+'%</strong><input data-font-range type="range" min="100" max="150" step="5" value="'+percent+'" aria-label="Размер текста в процентах"></label><p class="font-preview">Ваш день, ваши планы — текст удобного размера.</p><button type="button" class="settings-button" data-font-reset>Обычный размер · 100%</button><p class="small" data-font-status>Выбор сохраняется на этом устройстве.</p></div></section>';}
 document.addEventListener('input',event=>{if(event.target.matches('[data-font-range]'))set(event.target.value);});
 document.addEventListener('click',event=>{if(event.target.closest('[data-font-reset]'))set(100);});
 window.PlannerAppearance={settings,percent:()=>percent};apply();
})();
