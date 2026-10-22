#!/usr/bin/env python3
"""Original declarative 16:9 editorial covers for the public 360X directory.
Existing artwork, destination links, and clinical content are preserved.
No third-party images, external fonts, or executable SVG.
"""
from __future__ import annotations
import hashlib
import html
import json
import math
import random
import re
from pathlib import Path
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'ecossistema'
OUT = PAGE / 'assets/previews/turbo-360x-v1'
DATE = '2026-10-22'
VERSION = 'turbo-360x-20261022'
DESIGNS = {
 'aldenirmed': (['ALDENIR', 'MED89'], 'CONHECIMENTO QUE CUIDA', 'heart', '#24e5ff', '#6666ff', '#ff587b'),
 'nexus-care': (['PASSAGEM', 'DE PLANTÃO'], 'CLAREZA EM CADA TRANSIÇÃO', 'monitor', '#29e6ef', '#3d87ff', '#a5f86a'),
 'respiracrit': (['RESPIRA', 'CRIT'], 'EXPLORAR A RESPIRAÇÃO', 'lungs', '#50f3e0', '#238dff', '#ff7399'),
 'respirasense': (['RESPIRA', 'SENSE ICU'], 'SINAIS QUE CONECTAM', 'waves', '#26dfff', '#a773ff', '#ffba5a'),
 'intensivahub': (['INTENSIVA', 'HUB'], 'UM UNIVERSO PARA ESTUDAR', 'books', '#57d4ff', '#8667ff', '#ffd16b'),
 'atlas-plantas': (['ATLAS VIVO', 'PLANTAS'], 'A VIDA EM CADA FOLHA', 'leaves', '#75f983', '#06bfa6', '#ffe681'),
 'atlas-animais': (['ANIMALIA', '360X'], 'DESCOBRIR A DIVERSIDADE', 'tiger', '#ffd261', '#fb8d38', '#8efbd0'),
 'bolsa-ajuda-fauna': (['FAUNA', '360°'], 'CONHECER. PROTEGER. AJUDAR.', 'turtle', '#70f1e0', '#2697e9', '#ffe384'),
 'atlas-rochas': (['GEO', '360X'], 'HISTÓRIAS ESCRITAS NA TERRA', 'crystals', '#bf8cff', '#6161ff', '#53e9f4'),
 'tempo': (['TEMPO', 'DE VIVER'], 'MAIS PRESENÇA. MAIS VIDA.', 'hourglass', '#ffc867', '#ff7266', '#75d6ff'),
 'entre-dois-ceus': (['ENTRE', 'DOIS CÉUS'], 'JERI E ISLÂNDIA', 'landscape', '#74fbd3', '#3e9efb', '#ffd083'),
 'guerreiros-fe': (['GUERREIROS', 'DE FÉ'], 'REFLEXÃO, CORAGEM E CUIDADO', 'faith', '#ffd879', '#ce9145', '#c3a8ff'),
 'dragon-ball': (['DRAGON BALL', 'LEGADO ETERNO'], 'CULTURA, ENERGIA E SUPERAÇÃO', 'orbs', '#ffcc4c', '#ff753d', '#76e5ff'),
 'atlas-phoenix': (['ATLAS', 'PHOENIX'], 'PIRATAS DO INFINITO', 'phoenix', '#ff9656', '#fa4d85', '#c4a0ff'),
 'intuicao': (['INTUIÇÃO', 'DECISIONAL'], 'EXPLORAR CAMINHOS POSSÍVEIS', 'compass', '#cb9bff', '#6e70ff', '#78f1ef'),
 'life-archive': (['LIFE ARCHIVE', '360'], 'MEMÓRIAS QUE CONECTAM', 'archive', '#c597ff', '#646dff', '#5de6e5'),
 'plano-d': (['PLANO D', 'COMUNIDADE'], 'PESSOAS. VÍNCULOS. CUIDADO.', 'community', '#ffa3b5', '#de5896', '#ffc875'),
 'auditoria': (['AUDITORIA', 'DAS COISAS'], 'OBSERVAR ANTES DE ESCOLHER', 'magnifier', '#58e5f4', '#4181fb', '#ffd57d'),
 'garagem': (['GARAGEM', '2026'], 'DESIGN, MOVIMENTO E CULTURA', 'car', '#ffbb64', '#fb667c', '#61dcff'),
 'garagem-avaliacoes': (['GARAGEM', 'AVALIAÇÕES'], 'OPINIÕES PARA COMPARAR', 'gauge', '#ffd272', '#f5a345', '#75f4dc'),
 'nexus-brasil': (['360X BRASIL', 'COMUNIDADE'], 'CONECTAR PESSOAS E IDEIAS', 'globe', '#88f096', '#13bda8', '#ffdd73'),
 'nexus-propostas': (['360X BRASIL', 'PROPOSTAS'], 'CIÊNCIA, DIÁLOGO E CIDADANIA', 'scales', '#6ae3fa', '#5f87f2', '#ffdc81'),
 'indole': (['ÍNDOLE', '360°'], 'FONTES. CRITÉRIOS. CONTEXTO.', 'shield', '#d7b2ff', '#7c67e7', '#65e8ed'),
 'transparencia': (['TRANSPARÊNCIA', '360X'], 'FÉ, HISTÓRIA E PRESTAÇÃO DE CONTAS', 'church', '#ffdf94', '#cc9754', '#9ec7ff'),
}

def el(tag, **attrs):
    return '<'+tag+' '+ ' '.join(f'{k.replace("_","-")}="{html.escape(str(v),quote=True)}"' for k,v in attrs.items())+'/>'
def path(d, fill='none', stroke=None, sw=3, **kw):
    a=dict(d=d, fill=fill, **kw)
    if stroke: a.update(stroke=stroke, stroke_width=sw, stroke_linecap='round', stroke_linejoin='round')
    return el('path', **a)
def circle(x,y,r,fill,**kw): return el('circle',cx=x,cy=y,r=r,fill=fill,**kw)
def rect(x,y,w,h,fill,rx=0,**kw): return el('rect',x=x,y=y,width=w,height=h,rx=rx,fill=fill,**kw)
def text(x,y,s,size=24,fill='#f4f7ff',weight=600,**kw):
    attrs=dict(x=x,y=y,fill=fill,font_size=size,font_weight=weight,font_family='Arial, Helvetica, sans-serif',**kw)
    return '<text '+' '.join(f'{k.replace("_","-")}="{html.escape(str(v),quote=True)}"' for k,v in attrs.items())+'>'+html.escape(s)+'</text>'
def group(s,transform='',**kw):
    attrs={'transform':transform,**kw} if transform else kw
    return '<g '+' '.join(f'{k.replace("_","-")}="{v}"' for k,v in attrs.items())+'>'+s+'</g>'
def star(x,y,r,c):
    pts=[]
    for j in range(10):
        a=-math.pi/2+j*math.pi/5; rad=r if j%2==0 else r*.43
        pts.append(f'{x+math.cos(a)*rad:.1f},{y+math.sin(a)*rad:.1f}')
    return el('polygon',points=' '.join(pts),fill=c)

def scene(kind,c1,c2,c3):
    a='url(#accent)'; b='url(#warm)'; glass='url(#glass)'; dark='#102445'; white='#e9fbff'
    s=''
    if kind=='heart':
        s+=circle(255,244,187,'none',stroke=c1,stroke_width=1.5,opacity=.3)
        s+=path('M242 171 C196 107 107 133 120 216 C129 281 207 349 250 379 C304 339 382 263 384 203 C386 127 295 110 259 172 Z','url(#warm)',white,2)
        s+=path('M250 181 C256 130 236 109 242 69 L273 65 L285 123 M283 147 C308 116 337 120 352 93 L374 104 L347 158',c1,None)
        s+=path('M254 191 C233 237 247 284 278 322 M183 181 C194 212 208 219 239 229 M304 174 C289 209 282 227 275 258','none','#ffdfde',5,opacity=.62)
        s+=path('M24 275 H114 L140 239 L168 307 L203 204 L231 275 H281 L306 246 L330 275 H474','none',c1,5)
        s+=circle(138,90,7,c1)+circle(396,340,5,c3)
    elif kind=='monitor':
        s+=rect(54,91,371,248,'#06172b',22,stroke=c1,stroke_width=3)
        s+=rect(70,108,339,188,'url(#glass)',12)+path('M86 206 H151 L170 176 L190 241 L217 144 L244 206 H280 L298 185 L316 206 H390','none',c1,5)
        s+=circle(394,320,5,c3)+rect(218,339,44,46,c2,4)+rect(151,383,179,13,a,6)
        s+=rect(307,248,132,176,'#12253d',14,stroke=c3,stroke_width=2)
        s+=rect(347,233,51,26,c3,8)
        for i in range(3):
            y=291+i*39
            s+=path(f'M325 {y} l8 8 13-17','none',c1,4)+path(f'M359 {y} h58','none',white,3)
        s+=circle(90,362,27,a)+path('M90 347 v30 M75 362 h30','none',dark,5)
    elif kind=='lungs':
        s+=rect(236,69,29,139,a,10)
        s+=path('M229 154 C197 118 128 135 97 188 C67 238 63 319 85 365 C102 396 158 366 200 345 C227 330 233 301 232 266 Z',a,white,2)
        s+=path('M274 154 C307 118 376 135 406 189 C436 238 440 320 418 365 C402 396 346 366 305 345 C278 330 272 301 273 266 Z',b,white,2)
        for flip in [False,True]:
            branch=path('M247 185 L185 227 L157 293 M185 227 L171 183 M185 227 L120 223 M157 293 L106 311 M157 293 L179 334 M157 293 L117 258','none','#d6ffff',6)
            s+=group(branch,'translate(500 0) scale(-1 1)' if flip else '',opacity=.78)
        s+=path('M52 409 C160 452 339 452 451 408','none',c1,3)+circle(53,410,5,c1)+circle(451,409,5,c3)
    elif kind=='waves':
        for i in range(3):
            y=93+i*111
            s+=rect(62,y,371,92,glass,16,stroke=c1 if i!=1 else c3,stroke_width=1.3)
            s+=path(f'M85 {y+52} h30 c20-75 45 75 65 0 s45 75 65 0 s45 75 65 0 h94','none',[c1,c3,white][i],4)
        s+=circle(403,362,58,a,stroke=white,stroke_width=2)+path('M403 328 v68 M369 362 h68','none',dark,8)
        s+=circle(94,52,6,c1)+circle(431,57,4,c3)
    elif kind=='books':
        s+=path('M68 181 L233 218 L435 164 L280 128 Z',a,white,2)
        s+=path('M68 181 V314 L233 351 V218 Z','#214878',c1,2)+path('M233 218 L435 164 V297 L233 351 Z','#183454',c1,2)
        for i in range(7):
            s+=path(f'M85 {218+i*14} l130 29 M251 {253+i*13} l165 -44','none','#91d6ef',2,opacity=.6)
        s+=path('M51 328 L228 371 L452 307 V335 L230 400 L51 356 Z',c2,white,2)
        s+=path('M66 367 L229 407 L437 350 V374 L229 432 L66 391 Z',c3,None)
        s+=circle(267,83,61,'url(#warm)',stroke=white,stroke_width=2)
        s+=path('M239 84 C215 51 264 36 267 63 C272 32 310 58 293 80 C319 96 285 117 271 98 C250 118 222 105 239 84 Z','none',dark,4)
        s+=path('M267 63 V104','none',dark,3)
    elif kind=='leaves':
        s+=circle(255,272,148,'#0b3542',stroke=c1,stroke_width=2)
        s+=path('M127 222 L160 186 L215 199 L211 240 L252 259 L226 293 L202 290 L195 349 L155 329 L155 285 L119 268 Z',c2,None)
        s+=path('M280 147 L325 164 L339 208 L382 232 L359 259 L313 242 L293 285 L256 262 L267 211 Z',c1,None,opacity=.8)
        s+=path('M246 409 C273 299 267 209 253 81','none',c3,7)
        for d in ['M252 152 C180 155 138 108 145 54 C217 53 265 91 252 152 Z','M259 208 C330 206 377 159 370 104 C293 105 248 151 259 208 Z','M267 294 C198 284 157 239 162 196 C224 192 277 238 267 294 Z']:
            s+=path(d,a,white,2)
        s+=path('M167 77 L249 145 M348 126 L265 201 M184 215 L263 284','none',dark,3,opacity=.5)
    elif kind=='tiger':
        s+=circle(253,242,180,'none',stroke=c3,stroke_width=2,opacity=.6)
        s+=path('M120 165 Q77 54 161 81 L205 129 M303 130 L352 79 Q431 62 391 169',b,white,3)
        s+=path('M118 165 Q254 77 387 166 L373 297 Q349 395 252 419 Q151 388 129 291 Z',b,white,3)
        s+=path('M148 280 C170 255 215 274 252 320 C289 271 337 258 362 280 L336 357 L252 394 L171 355 Z','#fff1cb',None)
        s+=path('M211 306 L292 306 L252 344 Z',dark,None)
        s+=path('M166 213 L215 230 M340 213 L290 230','none',dark,15)
        s+=circle(191,231,7,c3)+circle(313,231,7,c3)
        for d in ['M239 131 L251 207 L269 132','M147 159 L204 190 L159 184','M355 159 L300 191 L346 183','M130 245 L195 263 L135 273','M373 245 L310 263 L367 272','M152 326 L197 338 L160 353','M350 326 L307 338 L341 353']:
            s+=path(d,dark,None)
        s+=path('M252 344 V363 M252 363 Q225 379 211 361 M252 363 Q280 379 295 361','none',dark,3)
    elif kind=='turtle':
        s+=path('M42 324 Q138 281 216 327 T464 325 M24 375 Q129 331 231 379 T473 375','none',c1,3,opacity=.4)
        s+=path('M174 170 C88 134 60 75 93 68 C161 60 199 118 208 166 Z M320 173 C376 91 430 72 434 103 C439 155 385 197 333 215 Z',a,white,2)
        s+=path('M169 304 C115 326 107 383 135 384 C171 378 194 349 207 322 M306 310 C343 365 391 387 406 363 C418 335 365 298 335 280',a,white,2)
        s+=el('ellipse',cx=255,cy=241,rx=111,ry=139,fill='url(#accent)',stroke=white,stroke_width=3,transform='rotate(22 255 241)')
        s+=path('M254 114 L213 175 L211 259 L263 321 L329 288 L347 211 L303 151 Z','#0e756b',c3,3)
        s+=path('M213 175 L275 190 L303 151 M275 190 L291 259 L211 259 M291 259 L263 321 M291 259 L329 288 M275 190 L347 211','none',c3,3)
        s+=el('ellipse',cx=344,cy=110,rx=32,ry=46,fill=c1,stroke=white,stroke_width=2,transform='rotate(31 344 110)')+circle(355,94,5,dark)
        s+=circle(83,255,7,'none',stroke=c1,stroke_width=2)+circle(419,218,11,'none',stroke=c1,stroke_width=2)+circle(447,170,6,'none',stroke=c1,stroke_width=2)
        s+=star(110,430,12,c3)
    elif kind=='crystals':
        s+=el('ellipse',cx=260,cy=414,rx=184,ry=35,fill=c2,opacity=.16)
        for x,y,w,h in [(88,231,109,178),(185,58,143,358),(305,175,109,232)]:
            s+=path(f'M{x} {y+60} L{x+w*.52} {y} L{x+w} {y+63} V{y+h} L{x+w*.5} {y+h+22} L{x} {y+h} Z',a,white,2)
            s+=path(f'M{x+w*.52} {y} L{x+w*.45} {y+90} V{y+h+22} L{x} {y+h} V{y+60} Z',c2,None,opacity=.6)
            s+=path(f'M{x+w*.45} {y+90} L{x+w} {y+63} V{y+h} L{x+w*.5} {y+h+22} Z',c3,None,opacity=.4)
            s+=path(f'M{x} {y+60} L{x+w*.45} {y+90} L{x+w} {y+63}','none',white,2)
        s+=star(381,92,17,c3)+star(112,145,9,c1)
    elif kind=='hourglass':
        s+=circle(255,240,184,'url(#halo)')
        s+=rect(137,62,237,25,a,9)+rect(137,405,237,25,a,9)
        s+=path('M160 87 C155 160 177 193 237 244 C174 290 154 329 160 405 H350 C355 330 336 290 274 244 C335 192 355 156 350 87 Z',glass,white,3)
        s+=path('M178 150 H333 C322 187 294 209 257 235 C218 207 191 183 178 150 Z',b,None)
        s+=path('M176 389 C190 354 230 329 257 299 C289 335 323 353 337 389 Z',b,None)
        s+=path('M256 246 V304','none',c3,4)+path('M183 104 C182 145 191 167 213 187','none',white,4,opacity=.7)
        for x,y in [(99,280),(420,180),(396,358)]:s+=circle(x,y,5,c3)
    elif kind=='landscape':
        s+=circle(257,234,194,glass,stroke=c1,stroke_width=2)
        s+=path('M73 239 Q157 186 233 242 Q322 296 440 218 V380 Q256 474 72 362 Z',b,None)
        s+=path('M78 290 Q165 246 242 294 T433 300 V373 Q251 449 81 358 Z','#cd7a5c',None)
        s+=path('M93 198 L163 101 L234 200 L291 119 L415 241 Z','#244d78',None)
        s+=path('M134 142 L163 101 L198 151 L166 142 L148 157 Z M267 152 L291 119 L330 161 L297 153 L284 165 Z','#d8f3ff',None)
        s+=path('M89 118 Q199 44 277 101 T430 82','none',c1,20,opacity=.46)+path('M92 128 Q202 54 280 111 T433 92','none',c1,6)
        s+=circle(366,152,32,c3)+path('M84 348 Q235 311 414 352','none',c3,3,opacity=.7)
    elif kind=='faith':
        s+=path('M252 44 L388 94 V232 Q385 331 252 386 Q119 331 116 232 V94 Z',a,white,3)
        s+=path('M252 67 L364 111 V232 Q362 309 252 358 Q142 309 140 232 V111 Z','#112644',c3,1.5)
        s+=path('M252 111 V267 M201 163 H303','none',c3,19)
        s+=path('M73 325 Q159 298 251 344 Q344 298 429 325 V425 Q340 400 251 445 Q165 400 73 425 Z',b,white,2)
        s+=path('M251 344 V445 M98 350 Q163 332 228 362 M98 374 Q166 355 228 385 M276 362 Q344 331 405 350 M276 385 Q344 355 405 374','none',dark,3,opacity=.75)
    elif kind=='orbs':
        s+=path('M79 364 Q68 181 234 75 Q450 144 411 368','none',c2,24,opacity=.22)
        s+=path('M91 361 Q89 188 236 89 Q424 147 401 350','none',c3,3)
        s+=circle(255,244,127,b,stroke='#fff1ca',stroke_width=3)
        s+=el('ellipse',cx=221,cy=179,rx=67,ry=27,fill='#fff7cc',opacity=.35,transform='rotate(-25 221 179)')
        for x,y in [(213,214),(296,214),(213,286),(296,286)]:s+=star(x,y,25,'#a94437')
        for x,y,r in [(91,359,39),(412,350,45),(159,81,27)]:s+=circle(x,y,r,b,stroke=white,stroke_width=1.5)+star(x,y,11,'#c04d3e')
        s+=path('M49 265 L92 249 M412 200 L459 180 M175 409 L159 444','none',c3,4)
    elif kind=='phoenix':
        s+=path('M250 336 C205 305 152 245 94 91 C174 147 226 178 254 225 C283 171 344 123 435 76 C393 205 333 286 278 335 Z',a,white,2)
        s+=path('M247 295 C189 259 155 209 121 136 L234 243 M276 291 C340 243 368 182 399 123 L286 238',b,None)
        s+=path('M226 323 C223 369 185 413 153 451 C216 424 250 395 259 359 C276 401 318 429 364 452 C330 402 291 365 289 323 Z',b,white,1.5)
        s+=path('M244 270 C222 228 238 173 263 153 L279 187 L315 202 L284 215 C289 256 280 286 267 319 Z',c3,white,2)
        s+=circle(277,194,4,dark)+path('M65 376 Q259 454 456 373','none',c3,2,opacity=.45)
    elif kind=='compass':
        s+=circle(255,245,166,glass,stroke=c1,stroke_width=3)+circle(255,245,136,'none',stroke=c3,stroke_width=1.5)
        for i in range(12):
            t=i*math.pi/6
            s+=path(f'M{255+math.sin(t)*145:.1f} {245-math.cos(t)*145:.1f} L{255+math.sin(t)*155:.1f} {245-math.cos(t)*155:.1f}','none',white,3)
        s+=path('M320 106 L277 266 L190 383 L233 225 Z',a,white,2)
        s+=path('M320 106 L255 245 L233 225 Z',c3,None)+path('M190 383 L255 245 L277 266 Z',c2,None)
        s+=circle(255,245,20,c3,stroke=white,stroke_width=3)
        s+=text(255,67,'N',20,c3,700,text_anchor='middle')
        s+=path('M92 150 Q161 11 339 71','none',c1,2,opacity=.4)
    elif kind=='archive':
        for i,(x,y,c) in enumerate([(81,110,c2),(125,85,c1),(169,60,c3)]):
            s+=rect(x,y,225,276,glass,20,stroke=c,stroke_width=2)
            s+=circle(x+112,y+90,35,c,opacity=.8)+path(f'M{x+40} {y+205} l58-73 36 47 31-35 29 61 Z',c,None,opacity=.85)
        s+=path('M51 300 H215 L244 326 H439 V436 H51 Z',a,white,2)
        s+=path('M51 336 H439 L419 451 H71 Z','#25466c',c1,2)
        s+=rect(188,370,120,37,c3,9)+path('M225 388 h45','none',dark,4)
        s+=star(441,104,12,c1)
    elif kind=='community':
        for x,y,r,c in [(119,121,34,c1),(251,83,43,c3),(385,121,34,c1)]:
            s+=circle(x,y,r,c)+path(f'M{x-56} {y+97} Q{x-52} {y+34} {x} {y+34} Q{x+52} {y+34} {x+56} {y+97} Z',c,None,opacity=.7)
        s+=path('M250 279 C200 217 136 248 162 293 C179 325 213 348 250 374 C289 348 331 316 342 282 C356 236 295 219 250 279 Z',b,white,2)
        s+=path('M45 307 Q95 301 132 342 L203 386 Q220 401 248 405 Q280 399 301 385 L373 342 Q410 305 458 306 L426 391 L333 443 H174 L78 389 Z',a,white,2)
        s+=path('M120 351 L198 405 M384 350 L307 405','none',dark,4,opacity=.6)
    elif kind=='magnifier':
        s+=path('M81 172 L213 103 L342 173 V328 L212 399 L81 328 Z',glass,c1,2)
        s+=path('M81 172 L212 239 L342 173 M212 239 V399','none',c1,3)
        s+=path('M146 138 L278 205 V254 L242 272 V225 L110 157 Z',c3,None,opacity=.7)
        s+=path('M325 301 L433 405','none','#07182d',30)+path('M325 301 L433 405','none',c3,19)
        s+=circle(298,235,98,'#133c57',stroke=c1,stroke_width=12)+circle(298,235,80,glass,stroke=white,stroke_width=2)
        s+=path('M254 234 L285 263 L343 201','none',c3,13)
    elif kind=='car':
        s+=path('M39 402 L158 273 H358 L478 402 M67 434 H450','none',c1,2,opacity=.4)
        s+=path('M94 310 L126 205 Q137 179 168 176 H338 Q367 177 379 206 L409 310 Z',a,white,2)
        s+=path('M146 211 L127 271 H375 L355 211 Q349 200 331 199 H168 Q153 199 146 211 Z','#0b2342',c1,3)
        s+=path('M75 283 Q255 253 429 283 L445 350 Q420 382 255 388 Q90 384 60 350 Z',glass,white,3)
        s+=path('M87 301 L174 314 L168 340 L87 328 Z M339 315 L419 301 V328 L344 340 Z',c3,white,2)
        s+=rect(172,344,164,29,'#071526',8)+path('M184 354 H325 M184 365 H325','none',c1,2)
        s+=rect(81,367,43,42,'#080f1c',10,stroke=c2,stroke_width=2)+rect(380,367,43,42,'#080f1c',10,stroke=c2,stroke_width=2)
        s+=path('M92 411 H418','none',c2,5)
    elif kind=='gauge':
        s+=circle(254,231,162,glass,stroke=c1,stroke_width=3)
        s+=path('M123 284 A141 141 0 1 1 386 284','none',c2,18,opacity=.35)+path('M123 284 A141 141 0 0 1 344 121','none',c3,18)
        for ang in range(-120,121,30):
            t=math.radians(ang)
            s+=path(f'M{254+math.sin(t)*108:.1f} {231-math.cos(t)*108:.1f} L{254+math.sin(t)*127:.1f} {231-math.cos(t)*127:.1f}','none',white,4)
        s+=path('M245 240 L357 144 L264 249 Z',c3,None)+circle(254,231,18,c1)
        s+=rect(130,354,250,83,'#122440',20,stroke=c1,stroke_width=2)
        for i in range(5):s+=star(163+i*46,396,16,c3)
    elif kind=='globe':
        s+=circle(255,240,155,glass,stroke=c1,stroke_width=3)
        s+=el('ellipse',cx=255,cy=240,rx=80,ry=155,fill='none',stroke=c1,stroke_width=2)
        s+=el('ellipse',cx=255,cy=240,rx=155,ry=59,fill='none',stroke=c1,stroke_width=2)
        s+=path('M100 240 H410 M255 85 V396','none',c1,2)
        for i in range(5):
            t=math.radians(-90+i*72);x=255+math.cos(t)*185;y=240+math.sin(t)*185
            s+=circle(x,y,31,c3,stroke=white,stroke_width=2)
            s+=circle(x,y-7,9,dark)+path(f'M{x-15} {y+16} Q{x} {y-7} {x+15} {y+16} Z',dark,None)
    elif kind=='scales':
        s+=circle(255,227,174,glass,stroke=c1,stroke_width=1)
        s+=path('M251 90 V382 M119 162 L380 130','none',c3,10)
        s+=path('M133 158 L76 272 H188 Z M365 132 L310 247 H423 Z','none',c1,3)
        s+=path('M75 274 Q133 346 190 274 Z',a,white,2)+path('M310 249 Q366 319 424 249 Z',a,white,2)
        s+=circle(251,90,19,c3)+rect(176,382,153,18,a,8)+rect(136,408,232,23,a,10)
        s+=path('M156 90 L176 59 M344 385 L371 408','none',c3,3)
    elif kind=='shield':
        s+=circle(254,239,182,'none',stroke=c1,stroke_width=1.5,opacity=.4)
        s+=path('M251 49 L403 104 V240 Q396 349 251 429 Q107 349 99 240 V104 Z',a,white,3)
        s+=path('M251 79 L373 124 V239 Q365 328 251 395 Q137 328 128 239 V124 Z','#0d203e',c3,2)
        s+=path('M166 240 L225 299 L343 174','none',c3,22)
        s+=path('M251 58 V105 M252 370 V419','none',white,3,opacity=.5)
    elif kind=='church':
        s+=path('M89 246 L251 107 L410 246 Z',a,white,2)
        s+=rect(117,246,268,157,glass,0,stroke=c1,stroke_width=2)
        s+=path('M211 402 V305 Q251 252 291 305 V402 Z',b,white,2)
        s+=rect(152,274,30,76,c1,14)+rect(323,274,30,76,c1,14)
        s+=path('M251 50 V119 M226 74 H276','none',c3,9)+rect(83,406,338,17,a,5)
        s+=circle(377,361,70,'#142642',stroke=c3,stroke_width=3)
        s+=path('M342 356 H408 M342 375 H382 M342 337 H408','none',c1,5)+path('M385 390 l12 11 24-28','none',c3,5)
    else: raise ValueError(kind)
    return s

def make_cover(pid,title,lines,subtitle,kind,c1,c2,c3,index,category):
    rng=random.Random(pid)
    s=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title desc">
<title id="title">{html.escape(title)} — capa editorial 360X</title>
<desc id="desc">Ilustração original em estilo Turbo TEMI 360X. {html.escape(subtitle.capitalize())}. Cores vivas e composição em formato 16:9; não é fotografia nem captura de tela.</desc>
<defs>
<linearGradient id="bg" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#080f25"/><stop offset=".56" stop-color="#0c1933"/><stop offset="1" stop-color="#15254a"/></linearGradient>
<linearGradient id="accent" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>
<linearGradient id="warm" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{c3}"/><stop offset="1" stop-color="{c2}"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#294766"/><stop offset="1" stop-color="#111c39"/></linearGradient>
<radialGradient id="halo"><stop stop-color="{c1}" stop-opacity=".32"/><stop offset="1" stop-color="{c1}" stop-opacity="0"/></radialGradient>
<radialGradient id="halo2"><stop stop-color="{c2}" stop-opacity=".24"/><stop offset="1" stop-color="{c2}" stop-opacity="0"/></radialGradient>
</defs>'''
    s+=rect(0,0,1200,675,'url(#bg)')+circle(940,260,420,'url(#halo)')+circle(485,628,300,'url(#halo2)')
    for x in range(625,1200,65):s+=path(f'M{x} 90 V572','none','#c9e6ff',.5,opacity=.08)
    for y in range(120,580,65):s+=path(f'M618 {y} H1160','none','#c9e6ff',.5,opacity=.08)
    s+=el('ellipse',cx=930,cy=325,rx=244,ry=201,fill='none',stroke=c1,stroke_width=1,opacity=.18,transform='rotate(-24 930 325)')
    for _ in range(24):
        x=rng.randint(630,1160);y=rng.randint(65,570)
        s+=circle(x,y,rng.choice([1,1.5,2]),'#e8f5ff',opacity=rng.uniform(.25,.7))
    s+=rect(52,47,111,43,'#122742',22,stroke=c1,stroke_width=1.5)+text(108,76,'360X',22,c1,800,text_anchor='middle',letter_spacing=2)
    s+=text(185,76,'EDIÇÃO TURBO',14,'#c5d6eb',700,letter_spacing=3)
    s+=text(1147,75,f'{index:02d}',17,c1,600,text_anchor='end',letter_spacing=3)
    s+=group(scene(kind,c1,c2,c3),'translate(640 93)')
    start=258 if len(lines)==2 else 270
    for n,line in enumerate(lines):
        size=61 if len(line)<13 else 47 if len(line)<16 else 40
        s+=text(52,start+n*77,line,size,'#f4f8ff' if n==0 else c1,800,letter_spacing=-1.6)
    s+=rect(54,start+112,62,5,c3,2)+text(52,start+161,subtitle,15,'#ccdaec',600,letter_spacing=1.2)
    s+=path('M52 576 H1148','none','#56718f',1,opacity=.45)
    cat={'Clínica e estudo':'CLÍNICA + APRENDIZAGEM','Ciência e natureza':'CIÊNCIA + NATUREZA','Vida e cultura':'VIDA + CULTURA','Cidadania e consumo':'CIDADANIA + ESCOLHAS'}.get(category,category.upper())
    s+=circle(59,619,4,c1)+text(76,624,cat,15,'#c5d6e7',600,letter_spacing=1.8)
    s+=text(1148,624,'UNIVERSO 360X',14,'#9db0c9',600,text_anchor='end',letter_spacing=2.4)
    return s+'</svg>\n'

CSS='''
/* turbo-360x-covers:v1 — artwork stays vivid in both accessible reading themes. */
.sites-universe{--sites-accent:#66e6f6}
.site-card{box-shadow:0 10px 32px rgba(4,14,31,.12);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
.site-card-image{aspect-ratio:16/9;object-fit:contain;background:#0a132a}
.site-card:focus-within{border-color:var(--sites-accent);box-shadow:0 0 0 2px var(--sites-accent)}
.site-card h3{font-weight:750}
html[data-theme="light"] .sites-universe{--sites-accent:#125675}
html[data-theme="light"] .site-card{background:#fff;box-shadow:0 10px 28px rgba(18,40,65,.09)}
@media(hover:hover){.site-card:hover{transform:translateY(-3px);border-color:var(--sites-accent);box-shadow:0 16px 36px rgba(5,22,45,.18)}}
@media(prefers-reduced-motion:reduce){.site-card{transition:none}.site-card:hover{transform:none}}
@media print{.site-card{box-shadow:none;transform:none}}
'''

def main():
    file=PAGE/'data/sites-360x.json'
    data=json.loads(file.read_text(encoding='utf-8'))
    ids={p['id'] for p in data['projects']}
    if ids != set(DESIGNS):
        raise SystemExit(f'Directory changed; review artwork mapping before proceeding: {ids ^ set(DESIGNS)}')
    original_destinations=[(p['id'],p['url']) for p in data['projects']]
    OUT.mkdir(parents=True,exist_ok=True)
    new_paths=[]
    for index,p in enumerate(data['projects'],1):
        lines,subtitle,kind,c1,c2,c3=DESIGNS[p['id']]
        dest=OUT/f"{p['id']}.svg"
        content=make_cover(p['id'],p['title'],lines,subtitle,kind,c1,c2,c3,index,p['category'])
        ET.fromstring(content)
        dest.write_text(content,encoding='utf-8')
        new_paths.append(dest.relative_to(ROOT).as_posix())
        p['image']=f"./assets/previews/turbo-360x-v1/{p['id']}.svg"
        p['imageAlt']=f"{p['title']}: {subtitle.lower()}. Ilustração editorial colorida 360X."
        p['imageType']='illustration'
        p['imageCredit']='Ilustração vetorial original produzida para o Ecossistema 360X, sob direção do proprietário. Estética Turbo TEMI 360X; não é fotografia nem captura real do site.'
        p['imageLicense']='Arte original do projeto. Sem fotografias, personagens oficiais, logotipos ou material visual de terceiros. Não altera direitos sobre marcas e sites referenciados.'
    assert original_destinations==[(p['id'],p['url']) for p in data['projects']]
    data['visualRevision']={'version':VERSION,'date':DATE,'scope':'24 capas editoriais originais, independentes e widescreen 16:9; destinos e conteúdo preservados.'}
    file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    css=PAGE/'assets/styles.css';raw=css.read_text(encoding='utf-8')
    if '/* turbo-360x-covers:v1' not in raw:css.write_text(raw+CSS,encoding='utf-8')
    page=PAGE/'index.html';raw=page.read_text(encoding='utf-8')
    raw,n=re.subn(r'href="\./assets/styles\.css(?:\?[^\"]*)?"',f'href="./assets/styles.css?v={VERSION}"',raw,count=1)
    if n!=1:raise SystemExit('Unexpected stylesheet reference; review required.')
    page.write_text(raw,encoding='utf-8')
    changed=['ecossistema/data/sites-360x.json','ecossistema/assets/styles.css','ecossistema/index.html']
    registry=ROOT/'data/editorial/registry.json';reg=json.loads(registry.read_text(encoding='utf-8'))
    revision={'id':VERSION,'date':DATE,'authorization':'Pedido explícito do proprietário para melhorar as imagens dos sites, deixando-as mais vivas no estilo Turbo TEMI 360X.','scope':'Somente capas editoriais, identificação de autoria e apresentação visual; preserva destinos, categorias, textos, fontes e privacidade.','reviewer':'Revisão técnica assistida por IA; não concede homologação clínica, jurídica ou de impacto.'}
    for item in reg['items']:
        affected=set(changed)&set(item.get('paths',[]))
        if affected:
            revs=item.setdefault('visualRevisions',[])
            if not any(r.get('id')==VERSION for r in revs):revs.append(revision)
            ev={e['path']:e for e in item.get('assetEvidence',[])}
            for p in affected:ev[p]={'path':p,'sha256':hashlib.sha256((ROOT/p).read_bytes()).hexdigest()}
            item['assetEvidence']=list(ev.values())
    cover_id='universo-360x-capas-turbo-20261022'
    item={
      'id':cover_id,'classification':'public-cited','paths':new_paths,
      'publishTargets':['github-pages'],'ownerApproval':True,'reviewer':'Revisão técnica de ilustrações originais assistida por IA; identidade visual solicitada pelo proprietário, sem alegação de revisão clínica.','reviewedAt':DATE,
      'medical':False,'rights':{'basis':'owned','statement':'24 composições vetoriais originais, declarativas, sem fotografias, fontes externas, personagens oficiais ou logotipos de terceiros. A identificação dos projetos não concede direitos sobre suas marcas. Ilustrações conceituais, não fotografias ou capturas.'},
      'personalData':{'contains':False},'professionalClaims':[],
      'sources':[{'title':'Diretório público do Ecossistema 360X','url':'https://aldenirfilho.github.io/aldenirmed89/ecossistema/','accessedAt':DATE}],
      'publicationAuthorization':{'source':'explicit-human-user-request-in-current-chat','authorizedAt':DATE,'authorizationSummary':revision['authorization'],'scope':revision['scope'],'grantsClinicalHomologation':False,'claimsHumanClinicalReview':False},
      'assetEvidence':[{'path':p,'sha256':hashlib.sha256((ROOT/p).read_bytes()).hexdigest()} for p in new_paths]}
    reg['items']=[i for i in reg['items'] if i.get('id')!=cover_id]+[item]
    registry.write_text(json.dumps(reg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'covers':len(new_paths),'public_paths':changed+new_paths,'destinations_preserved':True},ensure_ascii=False))
if __name__=='__main__':main()
