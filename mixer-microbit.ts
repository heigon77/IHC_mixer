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

// 1) Beethoven - "Ode to Joy"
let odeToJoy = [
    [660, 200], [660, 200], [698, 200], [784, 200], [784, 200], [698, 200], [660, 200], [588, 200],
    [524, 200], [524, 200], [588, 200], [660, 200], [660, 300], [588, 100], [588, 400]
]

// 2) Koji Kondo - "Super Mario Bros. Theme"
let marioTheme = [
    [659, 110], [659, 110], [0, 110], [659, 110], [0, 110], [523, 110], [659, 110], [0, 110],
    [784, 110], [0, 330], [392, 110], [0, 330]
]

// 3) Take On Me
let takeOnMe = [[740, 130], [740, 130], [740, 130], [587, 130], [0, 130], [494, 130], [0, 130],
    [659, 130], [0, 130], [659, 130], [0, 130], [659, 130], [831, 130], [831, 130], [880, 130],
    [988, 130], [880, 130], [880, 130], [880, 130], [659, 130], [0, 130], [587, 130], [0, 130],
    [740, 130], [0, 130], [740, 130], [0, 130], [740, 130], [659, 130], [659, 130], [740, 130],
    [659, 130]
]


// ---------- GRUPO 2 (BOTAO B troca entre estas 3) --------------------

// 1) Funky Town
let funkyTown = [[880, 120], [880, 120], [784, 120], [880, 120], [0, 120], [659, 120], [0, 120], 
    [659, 120], [880, 120], [1175, 120], [1047, 120], [880, 120], [0, 480], [880, 120], [880, 120],
    [784, 120], [880, 120], [0, 120], [659, 120], [0, 120], [659, 120], [880, 120], [1175, 120],
    [1047, 120], [880, 120]
]

// 2) Star Wars - "Main Theme"
let starWars = [[784, 83], [784, 83], [784, 83], [1047, 500], [1568, 500], [1397, 83], [1319, 83],
    [1175, 83], [2093, 500], [1568, 250], [1397, 83], [1319, 83], [1175, 83], [2093, 500],
    [1568, 250], [1397, 83], [1319, 83], [1397, 83], [1175, 333], [0, 166], [784, 83], [784, 83],
    [784, 83], [1047, 500], [1568, 500], [1397, 83], [1319, 83], [1175, 83], [2093, 500], [1568, 250],
    [1397, 83], [1319, 83], [1175, 83], [2093, 500], [1568, 250], [1397, 83], [1319, 83], [1397, 83],
    [1175, 333]
]

// 3) Final Countdwon
let finalCountdown = [[988, 84], [880, 84], [988, 336], [659, 336], [0, 336], [0, 168], [1047, 84],
    [988, 84], [1047, 168], [988, 168], [880, 336], [0, 336], [0, 168], [1047, 84], [988, 84],
    [1047, 336], [659, 336], [0, 336], [0, 168], [880, 84], [784, 84], [880, 168], [784, 168],
    [740, 168], [880, 168], [784, 503], [740, 84], [784, 84], [880, 503], [784, 84], [880, 84],
    [988, 168], [880, 168], [784, 168], [740, 168], [659, 336], [1047, 336], [988, 1007], [988, 84],
    [1047, 84], [988, 84], [880, 84], [988, 1344]
]

// ---------- ESTADO ---------------------------------------------------
let bankA: number[][][] = [odeToJoy, marioTheme, takeOnMe]
let bankB: number[][][] = [funkyTown, starWars, finalCountdown]

let songA = 0   // qual musica A (0, 1 ou 2) - troca com o botao A
let songB = 0   // qual musica B (0, 1 ou 2) - troca com o botao B
let iA = 0      // posicao dentro da melodia A atual
let iB = 0      // posicao dentro da melodia B atual

let announcing = false   // true enquanto mostra o numero da musica no LED

let playing = true      // o som esta tocando? (comeca desligado)
let wasPressed = false   // o botao estava apertado no ciclo anterior?

let speedFactor = 1.0

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

    // Controle de velocidade por temperatura (22°C a 38°C)
    let currentTemp = input.temperature()
    speedFactor = Math.map(currentTemp, 22, 38, 1.0, 0.4)
    speedFactor = Math.max(0.4, Math.min(1.0, speedFactor))

    // Leitura do Potenciômetro P1
    let v = pins.analogReadPin(AnalogPin.P1)
    v = 0

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
    let dur = step[1] * speedFactor * 1.5

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
