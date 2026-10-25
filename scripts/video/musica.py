"""Música de fondo del video, hecha desde cero con números (sin grabaciones de nadie, así no hay derechos de autor de terceros).
Se corre con:  python3 scripts/video/musica.py      (necesita numpy)
Deja tienda/video/musica.wav, que grabar.js junta con la imagen.
Es tranquila a propósito: acordes suaves, un arpegio como de caja de música y un eco de sala.
Los momentos siguen al guion de scripts/video/estudio.html (en segundos)."""
import numpy as np, wave, os

TASA = 48000
DURACION = 61.0
N = int(TASA * DURACION)
t = np.arange(N) / TASA
izq = np.zeros(N); der = np.zeros(N)
# El bajo va aparte y sin eco: el eco en notas tan graves suena embarrado y se carga a un lado
bajo_i = np.zeros(N); bajo_d = np.zeros(N)

def nota(nombre):
    """Frecuencia de una nota como 'A4' o 'F#3'"""
    orden = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    return 440.0 * 2 ** ((orden[nombre[:-1]] + 12 * (int(nombre[-1]) - 4)) / 12)

def envolvente(n, ataque, caida):
    e = np.ones(n)
    a = min(n, int(ataque * TASA)); c = min(n - a, int(caida * TASA))
    if a: e[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if c: e[n - c:] = np.cos(np.linspace(0, np.pi / 2, c)) ** 2
    return e

def sumar(inicio, senal, paneo=0.0, vol=1.0, canales=None):
    l, r = canales or (izq, der)
    i = int(inicio * TASA)
    if i >= N: return
    senal = senal[: N - i] * vol
    l[i:i + len(senal)] += senal * np.cos((paneo + 1) * np.pi / 4)
    r[i:i + len(senal)] += senal * np.sin((paneo + 1) * np.pi / 4)

# Acordes: Fa mayor 9, Do/Mi, Re menor 7, Si bemol mayor 7 (cálidos, sin tensión). Cada uno dura 3,2 s (75 pulsos por minuto)
COMPAS = 3.2
ACORDES = [
    ["F3", "A3", "C4", "E4", "G4"],
    ["E3", "G3", "C4", "D4", "G4"],
    ["D3", "F3", "A3", "C4", "E4"],
    ["A#2", "D3", "F3", "A3", "C4"],
]
BAJOS = ["F2", "C2", "D2", "A#1"]

def colchon(frecs, dur):
    """Un acorde suave: cada nota con dos copias un poco desafinadas y pocos armónicos (suena como cuerdas lejanas)"""
    n = int(dur * TASA); x = np.arange(n) / TASA; s = np.zeros(n)
    for f in map(nota, frecs):
        for desafino in (-0.12, 0.12):
            ff = f * 2 ** (desafino / 12 / 4)
            vib = 1 + 0.0015 * np.sin(2 * np.pi * 4.8 * x + f)
            for arm, peso in ((1, 1.0), (2, 0.28), (3, 0.09)):
                s += peso * np.sin(2 * np.pi * ff * arm * x * vib)
    return s * envolvente(n, 1.1, 1.4) / len(frecs)

def campanita(f, dur=2.4):
    """Una nota de caja de música: golpe suave que se apaga solo"""
    n = int(dur * TASA); x = np.arange(n) / TASA
    s = np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * f * 2.0 * x) * np.exp(-x * 6) + 0.12 * np.sin(2 * np.pi * f * 3.01 * x) * np.exp(-x * 9)
    return s * np.exp(-x * 2.6) * envolvente(n, 0.004, 0.3)

def bajo(f, dur):
    n = int(dur * TASA); x = np.arange(n) / TASA
    return (np.sin(2 * np.pi * f * x) + 0.2 * np.sin(4 * np.pi * f * x)) * envolvente(n, 0.25, 0.9)

# Volumen del colchón a lo largo del video: entra con la portada, sube con el teléfono, baja en "Sin nombre" y cierra
def curva(x, puntos):
    return np.interp(x, [p[0] for p in puntos], [p[1] for p in puntos])

n_compases = int(np.ceil(DURACION / COMPAS)) + 1
for k in range(n_compases):
    ini = k * COMPAS
    if ini > 57.6: break
    acorde = ACORDES[k % 4]
    vol = curva(ini, [(0, .55), (8, .6), (9.6, .75), (49, .75), (50.5, .55), (55, .7), (61, .7)])
    sumar(ini, colchon(acorde, COMPAS + 1.6), 0, vol * 0.33)
    # El bajo entra cuando aparece el teléfono
    if 8.0 <= ini < 50:
        sumar(ini, bajo(nota(BAJOS[k % 4]), COMPAS + .6), 0, 0.22, (bajo_i, bajo_d))
    # Arpegio en corcheas mientras se muestra la app; más espaciado al principio y en la parte de privacidad
    paso = COMPAS / 8
    for j in range(8):
        tt = ini + j * paso
        if tt < 3.0 or tt > 57.0: continue
        tranquilo = tt < 8.8 or tt >= 50.0
        if tranquilo and j % 2: continue
        f = nota(acorde[[1, 2, 3, 4, 3, 2, 4, 3][j]]) * 2
        if tranquilo and j % 4 == 0: f *= 2
        sumar(tt, campanita(f), [-.45, .35, -.2, .5, -.35, .2, .45, -.5][j], 0.075 if not tranquilo else 0.06)

# Acorde final largo (Fa mayor) al aparecer el nombre
sumar(57.6, colchon(["F3", "A3", "C4", "F4", "A4"], 3.4), 0, 0.4)
sumar(57.6, bajo(nota("F2"), 3.4), 0, 0.2, (bajo_i, bajo_d))
for k, f in enumerate(["C5", "F5", "A5", "C6"]):
    sumar(55.6 + k * .3, campanita(nota(f), 3.0), [-.4, .4, -.2, .2][k], 0.07)

# Eco de sala: una "respuesta" de ruido que se apaga en unos 2,8 s, aplicada con la transformada rápida
def eco(x, semilla):
    rng = np.random.default_rng(semilla)
    largo = int(2.8 * TASA); xx = np.arange(largo) / TASA
    ir = rng.standard_normal(largo) * np.exp(-xx * 2.4)
    ir[: int(.012 * TASA)] = 0
    ir = np.convolve(ir, np.ones(24) / 24, mode="same")  # quita el brillo áspero del ruido
    ir /= np.sqrt(np.sum(ir ** 2))
    tam = 1 << int(np.ceil(np.log2(len(x) + largo)))
    H = np.fft.rfft(ir, tam)
    frec = np.fft.rfftfreq(tam, 1 / TASA)
    H *= np.clip(frec / 300, 0, 1) ** 2  # el eco no lleva graves
    y = np.fft.irfft(np.fft.rfft(x, tam) * H, tam)[: len(x)]
    return y

mojado_i, mojado_d = eco(izq, 1), eco(der, 2)
izq = izq * 0.78 + mojado_i * 0.42
der = der * 0.78 + mojado_d * 0.42
izq += bajo_i; der += bajo_d

# Entrada y salida suaves, y volumen final con margen (pico en -2 dB)
final = curva(t, [(0, 0), (0.6, 1), (59.4, 1), (61, 0)])
izq *= final; der *= final
pico = max(np.abs(izq).max(), np.abs(der).max())
izq *= 0.79 / pico; der *= 0.79 / pico

salida = os.path.join(os.path.dirname(__file__), "..", "..", "tienda", "video", "musica.wav")
os.makedirs(os.path.dirname(salida), exist_ok=True)
datos = (np.stack([izq, der], axis=1) * 32767).astype("<i2")
with wave.open(salida, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(TASA); w.writeframes(datos.tobytes())
print("Listo:", os.path.relpath(salida))
