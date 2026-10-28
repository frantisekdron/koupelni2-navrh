window.k2ApplyVariantA = function(){
 const hero=document.querySelector('.k2-hero');if(!hero)return;
 const title=hero.querySelector('h1');title.innerHTML='<span>Koupelní 2.</span><span>Skutečný dům.</span>';
 hero.querySelector('.k2-lead').textContent='Dokončená fasáda. Skutečné interiéry. Dům, který si můžete prohlédnout.';
 const a=hero.querySelector('.k2-button');if(a){a.href=a.href.replace(/#pudorysy$/,'cenik/');a.childNodes[0].textContent='Prohlédnout jednotky ';}
};
