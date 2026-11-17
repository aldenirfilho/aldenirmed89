'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const X=require('../dist/assets/xp');
const D=require('../dist/assets/catalog');
const ev=(o={})=>({necessidade:3,gratidao:3,oportunidade:3,criatividade:1,seguranca:3,reserva:true,recebidoCents:null,...o});
const money=(cents,recebido,o)=>({kind:'dinheiro',amountCents:cents,date:'2026-11-01',causeId:'caatinga',xp:ev({recebidoCents:recebido,...o})});
test('reproduz os três exemplos da planilha Placar XP da Boa Ação',()=>{
 const a=X.score(money(30000,600000,{}));assert.equal(a.xp,9454.55);assert.equal(a.measure,1);assert.equal(Number(a.quality.toFixed(4)),0.9394);
 const b=X.score(money(300000,600000,{necessidade:2,gratidao:1,oportunidade:1,criatividade:0,seguranca:1}));assert.equal(b.xp,1000);
 const c=X.score(money(150000,600000,{necessidade:3,gratidao:2,oportunidade:2,criatividade:1,seguranca:2,reserva:false}));assert.equal(c.xp,0);assert.equal(c.lock,'reserva');
});
test('XP não cresce com o dinheiro: além da medida ideal, doar mais rende menos',()=>{
 const ideal=X.score(money(5000,100000)).xp,dobro=X.score(money(10000,100000)).xp,triplo=X.score(money(15000,100000)).xp;
 assert.ok(ideal>dobro&&dobro>triplo);assert.ok(ideal<=10000);
 assert.equal(X.score(money(5000,null)).measure,1);
});
test('trava de segurança, avaliação pendente e limites da régua',()=>{
 assert.equal(X.score(money(5000,null,{seguranca:0})).xp,0);
 assert.equal(X.score({kind:'tempo',amountCents:0,xp:null}).evaluated,false);
 const max=X.score({kind:'sangue',amountCents:0,xp:ev({criatividade:3})});assert.equal(max.xp,10000);
 const min=X.score({kind:'tempo',amountCents:0,xp:ev({necessidade:0,gratidao:0,oportunidade:0,criatividade:0,seguranca:1})});assert.ok(min.xp>=1000&&min.xp<2000);
 assert.equal(X.validEvaluation(ev({necessidade:4})),false);assert.equal(X.validEvaluation({...ev(),reserva:'sim'}),false);assert.equal(X.validEvaluation({...ev(),x:1}),false);
 assert.equal(X.suggestSecurity(true,false),2);assert.equal(X.suggestSecurity(true,true),3);assert.equal(X.suggestSecurity(false,false),1);
});
test('níveis e infinito',()=>{
 assert.equal(X.level(0).name,'Semente');assert.equal(X.level(10000).name,'Broto');assert.equal(X.level(2500000).name,'Lenda do Bem');
 assert.match(X.level(5000000).name,/★/);assert.ok(X.level(9999).toNext===1);
});
test('resumo, conquistas e linhas do Placar com as colunas da planilha',()=>{
 const cause=id=>D.find(c=>c.id===id);
 const entries=[money(5000,100000),{...money(0,null),kind:'sangue',amountCents:0,causeId:'hemoce-sobral',date:'2026-10-01'},{kind:'tempo',amountCents:0,date:'2026-09-01',causeId:'aquasis',detail:'mutirão',xp:null}];
 const s=X.summary(entries,cause);assert.equal(s.evaluated,2);assert.equal(s.pending,1);assert.ok(s.badges.find(b=>b.id==='sangue').ok);assert.ok(s.badges.find(b=>b.id==='constancia').ok);assert.ok(s.badges.find(b=>b.id==='ceara').ok);
 const rows=X.placarRows(entries,cause);assert.equal(rows[0].length,15);assert.equal(rows[0][5],'XP da boa ação');assert.equal(rows.length,4);assert.equal(rows[1][0],'2026-09-01');assert.equal(rows[1][14],'Pendente de avaliação');
});
