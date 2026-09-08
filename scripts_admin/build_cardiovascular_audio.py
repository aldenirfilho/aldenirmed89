#!/usr/bin/env python3
"""Build original, explicitly simulated teaching WAVs; never fabricate recordings.

Envelopes illustrate timing and relative spectral character, not validated acoustic
diagnosis. No external runtime dependency, patient data, network or machine paths.
"""
import array
import hashlib
import json
import math
from pathlib import Path
import random
import sys
import wave

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / '24_Semiologia/Cardiovascular'
RATE = 16000
BPM = 72
PERIOD = 60 / BPM
DURATION = PERIOD * 8


def build(identifier):
    size = round(RATE * DURATION)
    data = [0.0] * size
    rng = random.Random('aldenirmed89-cardio-v1:' + identifier)

    def tone(start, duration, frequency, amplitude):
        count = max(1, round(duration * RATE))
        for j in range(count):
            i = round(start * RATE) + j
            if 0 <= i < size:
                t = j / RATE
                envelope = math.sin(math.pi * j / count) ** 2
                data[i] += amplitude * envelope * (math.sin(2 * math.pi * frequency * t) +
                    0.35 * math.sin(2 * math.pi * frequency * 1.63 * t))

    def noise(start, duration, low, high, amplitude, shape='plateau', peak=0.5):
        # Cascaded first-order high/low-pass filters shape reproducible noise.
        hp_a = math.exp(-2 * math.pi * low / RATE)
        lp_a = math.exp(-2 * math.pi * high / RATE)
        hp = lp = previous = 0.0
        count = max(1, round(duration * RATE))
        for j in range(count):
            x = rng.uniform(-1, 1)
            hp = hp_a * (hp + x - previous)
            previous = x
            lp = (1 - lp_a) * hp + lp_a * lp
            u = j / count
            fade = min(1, u / .025, (1-u) / .025)
            if shape == 'diamond':
                envelope = u / peak if u < peak else (1-u) / (1-peak)
            elif shape == 'decrescendo':
                envelope = (1-u) ** 1.5
            elif shape == 'crescendo':
                envelope = u ** 1.4
            else:
                envelope = 1
            i = round(start * RATE) + j
            if 0 <= i < size:
                data[i] += 3 * amplitude * lp * envelope * max(0, fade)

    for beat in range(8):
        offset = beat * PERIOD
        def th(phase, duration, frequency, amplitude):
            tone(offset + phase * PERIOD, duration, frequency, amplitude)
        def nh(start, end, low, high, amp, shape='plateau', peak=.5):
            noise(offset + start * PERIOD, (end-start) * PERIOD, low, high, amp, shape, peak)
        th(.06, .085, 65, .48)
        s2 = .43
        split = .018
        if identifier == 'phys-split': split = .025 if (beat // 2) % 2 == 0 else .085
        if identifier == 'wide-split': split = .08 if (beat // 2) % 2 == 0 else .135
        if identifier == 'fixed-split': split = .095
        if identifier == 'paradox-split':
            th(s2, .052, 115, .25)  # P2 first; A2 delayed
            th(s2 + (.10 if (beat // 2) % 2 == 0 else .025), .058, 95, .38)
        else:
            th(s2, .058, 95, .25 if identifier == 'as' else .38)
            th(s2 + split, .045, 120, .20)
        if identifier in ('s3', 'gallop'): th(.62, .105, 38, .28)
        if identifier in ('s4', 'gallop'): th(.91, .085, 42, .30)
        if identifier in ('click-ejection', 'ps'): th(.17, .022, 230, .30)
        if identifier == 'mvp':
            th(.29, .023, 290, .40); nh(.32, .43, 190, 650, .18, 'crescendo')
        if identifier in ('as', 'ps', 'hcm'):
            nh(.15, .43, 100, 650 if identifier != 'hcm' else 480, .28, 'diamond', .68 if identifier == 'as' else .5)
        if identifier in ('mr', 'tr', 'vsd'):
            nh(.075, .43, 180 if identifier != 'vsd' else 280, 580 if identifier != 'vsd' else 1100, .20)
        if identifier in ('ar', 'pr'):
            nh(.46, 1.035, 220, 850, .22, 'decrescendo')
        if identifier in ('ms', 'ts'):
            th(.55, .022, 250, .31)
            nh(.61, .87, 28, 125, .28)
            nh(.87, 1.035, 28, 140, .30, 'crescendo')
        if identifier == 'pda':
            nh(.0, .44, 140, 550, .17, 'crescendo')
            nh(.44, 1.0, 140, 550, .19, 'decrescendo')
        if identifier == 'still':
            th(.16, .16, 130, .14); nh(.15, .36, 80, 230, .10, 'diamond')
        if identifier == 'rub':
            for a, b in ((.20,.35),(.59,.71),(.89,1.015)):
                nh(a,b,160,1600,.19,'diamond')
        if identifier == 'knock': th(.55,.035,165,.36)
        if identifier == 'venous-hum': nh(0,1,50,230,.065)
    # End fades avoid clicks when the teaching excerpt is repeated.
    for i in range(min(160, size)):
        data[i] *= i / 160
        data[-i-1] *= i / 160
    peak = max(abs(v) for v in data) or 1
    pcm = array.array('h', (round(v / peak * .78 * 32767) for v in data))
    if sys.byteorder != 'little': pcm.byteswap()
    target = MODULE / 'assets/audio' / (identifier + '.wav')
    target.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(target), 'wb') as handle:
        handle.setnchannels(1); handle.setsampwidth(2); handle.setframerate(RATE)
        handle.writeframes(pcm.tobytes())
    return {'id':identifier,'file':'assets/audio/'+target.name,'kind':'simulation',
        'duration':round(DURATION,3),'sampleRate':RATE,'bpm':BPM,
        'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
        'description':'Simulação didática original. Tempos e timbres aproximados; não é gravação de paciente nem modelo acústico clinicamente validado.'}


def main():
    sounds = json.loads((MODULE/'data/sounds.json').read_text())
    recordings = json.loads((MODULE/'data/recordings.json').read_text())
    results = [build(item['id']) for item in sounds] + recordings
    (MODULE/'data/audio-manifest.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
    print(f'{len(sounds)} simulações originais e {len(recordings)} gravações licenciadas registradas.')


if __name__ == '__main__': main()
