// =====================================================================
//  MIXER DE MASHUP - micro:bit V2
// =====================================================================
//  Pot em P1  = mistura entre a musica A e a musica B (crossfade).
//               Todo a ESQUERDA = so musica A.  Todo a DIREITA = so musica B.
//               No meio = 50% de cada.  Os LEDs mostram a proporcao.
//  Switch P2  = liga/desliga o som (pra nao ficar tocando o tempo todo).
//  Botao A    = troca a musica A (entre as 3 do grupo A).
//  Botao B    = troca a musica B (entre as 3 do grupo B).
//
//  Cada nota = [frequencia em Hz, duracao em ms].  Frequencia 0 = pausa.
//
//  LIGACAO (breakout encaixado no protoboard):
//    Pot (P1):           esquerda -> 3V   meio -> pino 1   direita -> GND
//    Botao modulo (P2):  VCC -> 3V   GND -> GND   OUT -> pino 2
//
//  Como cole no makecode.microbit.org:
//    New Project -> botao JavaScript no topo -> apague tudo -> cole isto
//    -> Download -> arraste o .hex para o drive MICROBIT.
// =====================================================================


// ---------- GRUPO 1 (BOTAO A troca entre estas 3) --------------------

// 1) AC/DC - "Thunderstruck" (intro: nota-pedal B alternando com a escala subindo)
let thunderstruck = [
    [740, 90], [988, 90], [831, 90], [988, 90], [932, 90], [988, 90], [988, 90], [988, 90],
    [1109, 90], [988, 90], [1245, 90], [988, 90], [1319, 90], [988, 90], [1245, 90], [988, 90]
]

// 2) Michael Jackson - "Thriller" (groove sincopado em Do# menor)
let thriller = [
    [277, 150], [277, 150], [330, 150], [277, 150],
    [370, 150], [330, 150], [277, 150], [247, 300]
]

// 3) Beethoven - "Fur Elise" (tema de abertura)
let furElise = [
    [659, 150], [622, 150], [659, 150], [622, 150], [659, 150], [494, 150], [587, 150], [523, 150], [440, 300],
    [262, 150], [330, 150], [440, 150], [494, 300],
    [330, 150], [415, 150], [494, 150], [523, 300],
    [330, 150], [659, 150], [622, 150], [659, 150], [622, 150], [659, 150], [494, 150], [587, 150], [523, 150], [440, 300]
]


// ---------- GRUPO 2 (BOTAO B troca entre estas 3) --------------------

// 1) Anitta - "Envolver" (hook descendente, levada de reggaeton)
let envolver = [
    [659, 160], [587, 160], [523, 160], [494, 160], [440, 320], [0, 120],
    [523, 160], [494, 160], [440, 160], [392, 320]
]

// 2) "Parabens pra Voce" (Happy Birthday)
let parabens = [
    [392, 180], [392, 120], [440, 300], [392, 300], [523, 300], [494, 600],
    [392, 180], [392, 120], [440, 300], [392, 300], [587, 300], [523, 600],
    [392, 180], [392, 120], [784, 300], [659, 300], [523, 300], [494, 300], [440, 600],
    [349, 180], [349, 120], [659, 300], [523, 300], [587, 300], [523, 600]
]

// 3) "Brilha Brilha Estrelinha" (Twinkle Twinkle)
let estrelinha = [
    [262, 250], [262, 250], [392, 250], [392, 250], [440, 250], [440, 250], [392, 500],
    [349, 250], [349, 250], [330, 250], [330, 250], [294, 250], [294, 250], [262, 500],
    [392, 250], [392, 250], [349, 250], [349, 250], [330, 250], [330, 250], [294, 500],
    [392, 250], [392, 250], [349, 250], [349, 250], [330, 250], [330, 250], [294, 500],
    [262, 250], [262, 250], [392, 250], [392, 250], [440, 250], [440, 250], [392, 500],
    [349, 250], [349, 250], [330, 250], [330, 250], [294, 250], [294, 250], [262, 500]
]


// ---------- ESTADO ---------------------------------------------------

let bankA: number[][][] = [thunderstruck, thriller, furElise]
let bankB: number[][][] = [envolver, parabens, estrelinha]

let songA = 0   // qual musica A (0, 1 ou 2) - troca com o botao A
let songB = 0   // qual musica B (0, 1 ou 2) - troca com o botao B
let iA = 0      // posicao dentro da melodia A atual
let iB = 0      // posicao dentro da melodia B atual

let announcing = false   // true enquanto mostra o numero da musica no LED

let playing = false      // o som esta tocando? (comeca desligado)
let wasPressed = false   // o botao estava apertado no ciclo anterior?


// ---------- BOTOES: trocam a musica de cada grupo --------------------

input.onButtonPressed(Button.A, function () {
    songA = (songA + 1) % bankA.length
    iA = 0
    announce(songA + 1)   // mostra 1, 2 ou 3
})

input.onButtonPressed(Button.B, function () {
    songB = (songB + 1) % bankB.length
    iB = 0
    announce(songB + 1)
})

function announce(n: number) {
    announcing = true
    basic.showNumber(n)
    basic.pause(150)
    announcing = false
}


// ---------- SETUP ----------------------------------------------------

music.setBuiltInSpeakerEnabled(true)
music.setVolume(180)

// modulo de botao 3 pinos: VCC -> 3V, GND -> GND, OUT -> P2.
// pull-up interno garante leitura estavel (funciona com qualquer modulo).
pins.setPull(DigitalPin.P2, PinPullMode.PullUp)

// le o estado do botao SOLTO no boot (nao segure o botao ao ligar/gravar).
// qualquer leitura diferente desta = botao apertado.
let idleLevel = pins.digitalReadPin(DigitalPin.P2)


// ---------- LOOP PRINCIPAL ------------------------------------------

basic.forever(function () {
    // apertado = leitura diferente da de repouso (auto-calibrado no boot)
    let pressed = pins.digitalReadPin(DigitalPin.P2) != idleLevel
    if (pressed && !wasPressed) {   // so no instante do clique
        playing = !playing          // liga/desliga e CONTINUA assim
        basic.pause(60)             // debounce (evita clique duplo)
    }
    wasPressed = pressed

    // desligado -> silencio (tela apagada), mas continua vendo o botao
    if (!playing) {
        if (!announcing) basic.clearScreen()
        basic.pause(60)
        return
    }

    // posicao do pot: 0 = so musica A ... 1023 = so musica B
    let v = pins.analogReadPin(AnalogPin.P1)

    // zona morta: nas pontas, gruda no extremo (evita restinho do outro lado)
    let DEADZONE = 80
    if (v <= DEADZONE) v = 0
    if (v >= 1023 - DEADZONE) v = 1023

    let shareB = v             // quanto de B (0..1023)
    let shareA = 1023 - v      // quanto de A (0..1023)

    // LEDs: esquerda = quanto de A, direita = quanto de B
    if (!announcing) plotBar(shareA, shareB)

    // sorteia qual musica toca neste passo, proporcional a posicao do pot
    let pick = Math.randomRange(0, 1022)
    if (pick < shareB) {
        playStep(bankB[songB][iB])
        iB = (iB + 1) % bankB[songB].length
    } else {
        playStep(bankA[songA][iA])
        iA = (iA + 1) % bankA[songA].length
    }
})


// ---------- AUXILIARES ----------------------------------------------

function playStep(step: number[]) {
    let freq = step[0]
    let dur = step[1]
    if (freq == 0) {
        basic.pause(dur)        // pausa (silencio no ritmo)
    } else {
        music.playTone(freq, dur)
    }
}

function plotBar(a: number, b: number) {
    basic.clearScreen()
    let ha = Math.map(a, 0, 1023, 0, 5)
    let hb = Math.map(b, 0, 1023, 0, 5)
    for (let y = 0; y < ha; y++) {
        led.plot(0, 4 - y); led.plot(1, 4 - y)
    }
    for (let y = 0; y < hb; y++) {
        led.plot(3, 4 - y); led.plot(4, 4 - y)
    }
}
