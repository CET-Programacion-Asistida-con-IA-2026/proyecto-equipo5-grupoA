console.log("JavaScript conectado");

// ====== MODAL GENÉRICO ======
const modalOverlay = document.getElementById("modal-overlay");
const modalTexto = document.getElementById("modal-texto");

// Se declaran en el objeto window porque se llaman desde atributos --> onclick="" directamente en el HTML.
window.mostrarMensaje = function (mensaje) {
    modalTexto.textContent = mensaje;
    modalOverlay.classList.add("active");
};

window.cerrarModal = function () {
    modalOverlay.classList.remove("active");
};

// Permite cerrar el modal haciendo click fuera de la caja
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        cerrarModal();
    }
});


// Abre y cierra el panel lateral de comentarios
window.abrirPanelComentarios = function() {
    document.getElementById("panel-comentarios").classList.add("activo");
    document.getElementById("panel-overlay").classList.add("activo");
    document.body.style.overflow = "hidden"; // evita que el fondo se pueda scrollear
};

window.cerrarPanelComentarios = function() {
    document.getElementById("panel-comentarios").classList.remove("activo");
    document.getElementById("panel-overlay").classList.remove("activo");
    document.body.style.overflow = ""; // restaura el scroll
};

// ====== SISTEMA DE LOGROS Y PROGRESO (localStorage) ========
const JUEGOS_IDS = ["sopa", "completa", "imagen", "traza", "canciones", "ruleta", "comprension"];
const LOGROS_KEY = "eduzoo_logros";

const NOMBRES_JUEGOS = {
    sopa: "Sopa de Letras",
    completa: "Completa la Palabra",
    imagen: "Imagen y Palabra",
    traza: "Traza las Letras",
    canciones: "Canciones del Alfabeto",
    ruleta: "Ruleta de Sílabas"
};

// Lee el progreso guardado o crea uno nuevo con todos los juegos en false
function cargarProgreso() {
    try {
        const guardado = localStorage.getItem(LOGROS_KEY);
        if (guardado) return JSON.parse(guardado);
    } catch (e) {
        console.warn("No se pudo leer el progreso guardado:", e);
    }
    
    const inicial = {};
    JUEGOS_IDS.forEach(id => { inicial[id] = false; });
    return inicial;
}

let progresoJuegos = cargarProgreso();

function guardarProgreso() {
    try {
        localStorage.setItem(LOGROS_KEY, JSON.stringify(progresoJuegos));
    } catch (e) {
        console.warn("No se pudo guardar el progreso:", e);
    }
}

// Se llama desde cada juego cuando el chico lo completa
function marcarJuegoCompletado(id) {
    if (!JUEGOS_IDS.includes(id)) return;

    const yaEstabaCompletado = progresoJuegos[id];
    progresoJuegos[id] = true;

    guardarProgreso();
    actualizarPanelProgreso();

    if (yaEstabaCompletado) return;

    // ARREGLO: antes esta cuenta usaba una variable que nunca se calculaba (completosAhora)
    const completados = Object.values(progresoJuegos).filter(Boolean).length;
    const todosCompletados = completados === JUEGOS_IDS.length;

    if (todosCompletados) {
        lanzarCelebracion();
        mostrarMensaje(`🎉 ¡Felicitaciones! Completaste los ${JUEGOS_IDS.length} juegos de EduZOO. ¡Sos un campeón de la lectura! 🏆`);
    } else {
        mostrarMensaje(`🏅 ¡Lograste completar "${NOMBRES_JUEGOS[id]}"! Sumaste una medalla nueva.`);
    }
}

// Actualiza la barra de progreso general y las medallitas de las tarjetas
function actualizarPanelProgreso() {
    const completados = JUEGOS_IDS.filter(id => progresoJuegos[id]).length;
    const total = JUEGOS_IDS.length;

    const barraDOM = document.getElementById("progreso-barra");
    const textoDOM = document.getElementById("progreso-texto");
    
    if (barraDOM) barraDOM.style.width = `${(completados / total) * 100}%`;
    if (textoDOM) textoDOM.textContent = `${completados} / ${total} juegos completados 🏆`;

    JUEGOS_IDS.forEach(id => {
        const tarjeta = document.querySelector(`[data-logro="${id}"]`);
        if (tarjeta) tarjeta.classList.toggle("logro-obtenido", !!progresoJuegos[id]);
    });
}

// Pinta el estado guardado apenas carga la página
document.addEventListener("DOMContentLoaded", actualizarPanelProgreso);

// Animación de celebración al terminar los 7 juegos
function lanzarCelebracion() {
    const contenedor = document.createElement("div");
    contenedor.className = "celebracion-contenedor";
    document.body.appendChild(contenedor);

    const emojisConfeti = ["🎉", "✨", "🏆", "⭐", "🎊", "🌟"];
    const cantidadPiezas = 40;

    for (let i = 0; i < cantidadPiezas; i++) {
        const pieza = document.createElement("span");
        pieza.className = "celebracion-pieza";
        pieza.textContent = emojisConfeti[Math.floor(Math.random() * emojisConfeti.length)];
        pieza.style.left = `${Math.random() * 100}%`;
        pieza.style.fontSize = `${1 + Math.random() * 1.4}rem`;
        pieza.style.animationDelay = `${Math.random() * 0.8}s`;
        pieza.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
        contenedor.appendChild(pieza);
    }

    setTimeout(() => contenedor.remove(), 4500);
}

// Botón del footer para borrar el progreso guardado
document.addEventListener("DOMContentLoaded", () => {
    const btnReiniciarProgreso = document.getElementById("btn-reiniciar-progreso");
    if (!btnReiniciarProgreso) return;

    btnReiniciarProgreso.addEventListener("click", () => {
        const confirmado = window.confirm(
        "¿Seguro que querés borrar todas las medallas y volver a empezar? Esta acción no se puede deshacer."
    );

    if (!confirmado) return;

    JUEGOS_IDS.forEach(id => { progresoJuegos[id] = false; });
        guardarProgreso();
        actualizarPanelProgreso();
        mostrarMensaje("🔄 ¡Listo! Tu progreso se reinició. ¡A jugar de nuevo desde cero!");
    });
});

// ===== SONIDOS DE FEEDBACK ========
const SONIDO_KEY = "eduzoo_sonido_activo";
let sonidoActivo = true;
const guardadoSonido = localStorage.getItem(SONIDO_KEY);
if (guardadoSonido !== null) sonidoActivo = guardadoSonido === "true";
let contextoAudioCompartido = null;

function obtenerContextoAudio() {
    if (!contextoAudioCompartido) {
        contextoAudioCompartido = new (window.AudioContext || window.webkitAudioContext)();
    }
    return contextoAudioCompartido;
}

function reproducirTono(frecuencia, duracionMs, tipo) {
    if (!sonidoActivo) return; // respeta el botón de silenciar
    try {
        const contexto = obtenerContextoAudio();
        if (contexto.state === "suspended") {
            contexto.resume(); 
        }

        const oscilador = contexto.createOscillator();
        const volumen = contexto.createGain();
        oscilador.type = tipo || "sine";
        oscilador.frequency.value = frecuencia;
        volumen.gain.value = 0.08;
        oscilador.connect(volumen);
        volumen.connect(contexto.destination);
        oscilador.start();
        oscilador.stop(contexto.currentTime + duracionMs / 1000);
    } catch (e) {
        console.warn("No se pudo reproducir el sonido:", e);
    }
}

function reproducirSonidoCorrecto() {
    reproducirTono(660, 120, "sine");
    setTimeout(() => reproducirTono(880, 150, "sine"), 120);
}

function reproducirSonidoIncorrecto() {
    reproducirTono(180, 250, "sawtooth");
}

function hablarVerso(texto) {
    if (!sonidoActivo) return; // respeta el botón de mute
    if (!("speechSynthesis" in window)) return; // por si el navegador no lo soporta

    window.speechSynthesis.cancel(); // corta la lectura anterior antes de arrancar la nueva

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "es-ES";  // podés probar "es-AR" o "es-MX" si querés otro acento
    utterance.rate = 0.85;     // un poco más lento, para que se entienda bien
    utterance.pitch = 1.3;     // vocecita más aguda y alegre

    window.speechSynthesis.speak(utterance);
}

function actualizarBotonMute(boton) {
    boton.textContent = sonidoActivo ? "🔊" : "🔇";
    const etiqueta = sonidoActivo ? "Silenciar sonidos" : "Activar sonidos";
    boton.setAttribute("aria-label", etiqueta);
    boton.setAttribute("title", etiqueta);
}

document.addEventListener("DOMContentLoaded", () => {
    const btnMute = document.getElementById("btn-mute");
    if (!btnMute) return;

    actualizarBotonMute(btnMute); // pinta el ícono correcto según lo guardado

    btnMute.addEventListener("click", () => {
        sonidoActivo = !sonidoActivo;
        
        try {
            localStorage.setItem(SONIDO_KEY, String(sonidoActivo));
        } catch (e) {
            console.warn("No se pudo guardar la preferencia de sonido:", e);
        }
        
        actualizarBotonMute(btnMute);
    });
});

// === CAMBIO DE COLOR DE FONDO AL HACER SCROLL
window.addEventListener("scroll", () => {
    let posicion = window.scrollY;

    if (posicion < 300) {
        document.body.style.backgroundColor = "#AEE6FF";
    } else if (posicion < 600) {
        document.body.style.backgroundColor = "#FFF3A3";
    } else {
        document.body.style.backgroundColor = "#B8F5B1";
    }
});

// ====== RESALTAR SECCIÓN ACTIVA EN EL NAV MIENTRAS SE SCROLLEA ========
document.addEventListener("DOMContentLoaded", () => {
    const linksNav = document.querySelectorAll("#nav-principal a");
    
    const secciones = Array.from(linksNav)
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

    if (!secciones.length) return;

    const observer = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const idActivo = entrada.target.getAttribute("id");
                
                linksNav.forEach(link => {
                link.classList.toggle("active", link.getAttribute("href") === `#${idActivo}`);
                });
            }
        });
    }, { rootMargin: "-40% 0px -55% 0px" }); // detecta la sección cuando está cerca del centro de la pantalla

    secciones.forEach(seccion => observer.observe(seccion));
});


// ====== FORMULARIO DE COMENTARIOS ==============
const formulario = document.getElementById("formulario-comentario");
const mensajeExito = document.getElementById("mensaje-exito");
const contadorCaracteres = document.getElementById("char-count");
const nombre = document.getElementById("nombre");
const comentario = document.getElementById("comentario");
const errorNombre = document.getElementById("error-nombre");
const errorComentario = document.getElementById("error-comentario");

// Contador de caracteres
comentario.addEventListener("input", () => {
    contadorCaracteres.textContent =
    `${comentario.value.length} / 200 caracteres`;
});

// Valida el campo nombre y muestra/oculta su error
function validarNombre() {
    const valor = nombre.value.trim();

    if (valor.length === 0) {
        errorNombre.textContent = "¡Contanos cómo te llamás! 😊";
        nombre.classList.add("error");
        return false;
    }

    if (valor.length < 2) {
        errorNombre.textContent = "El nombre es muy cortito, escribí un poco más.";
        nombre.classList.add("error");
        return false;
    }

    errorNombre.textContent = "";
    nombre.classList.remove("error");
    return true;
}

// Valida el campo comentario y muestra/oculta su error
function validarComentario() {
    const valor = comentario.value.trim();

    if (valor.length === 0) {
        errorComentario.textContent = "Escribí un comentario antes de enviar.";
        comentario.classList.add("error");
        return false;
    }

    if (valor.length < 5) {
        errorComentario.textContent = "Contanos un poquito más 🙂";
        comentario.classList.add("error");
        return false;
    }

    errorComentario.textContent = "";
    comentario.classList.remove("error");
    return true;
}

// Limpia el error apenas el usuario empieza a corregir
nombre.addEventListener("input", () => {
    if (nombre.value.trim().length > 0) {
        errorNombre.textContent = "";
        nombre.classList.remove("error");
    }
});

comentario.addEventListener("input", () => {
    if (comentario.value.trim().length > 0) {
        errorComentario.textContent = "";
        comentario.classList.remove("error");
    }
});

// Envío del formulario con validación
formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombreValido = validarNombre();
    const comentarioValido = validarComentario();

    // Si algún campo no es válido, no se muestra el mensaje de éxito
    if (!nombreValido || !comentarioValido) {
    mensajeExito.textContent = "";
    return;
    }

    mensajeExito.textContent = "✅ ¡Tu mensaje fue enviado correctamente!";
    
    formulario.reset();   // Limpia todos los campos

    contadorCaracteres.textContent = "0 / 200 caracteres";  // Reinicia el contador

    // Oculta el mensaje después de 5 segundos
    setTimeout(() => { mensajeExito.textContent = ""; }, 5000);
});

document.addEventListener("DOMContentLoaded", () => {
    // Palabras de animales que queremos en la sopa
    const palabrasAnimales = ["PERRO", "GATO", "LEON", "TIGRE", "MONO", "OSO", "RANA", "PATO"];
    const tamañoGrid = 10;
    let grid = [];

    // Variables para la selección con el ratón
    let seleccionando = false;
    let celdasSeleccionadas = [];

    const gridDOM = document.getElementById("grid-sopa");
    const listaUlDOM = document.getElementById("palabras-ul");
    const btnReiniciar = document.getElementById("reiniciar-btn");

    const seccionSopa = document.getElementById("sopa-de-letras-section");
    const btnAbrirSopa = document.getElementById("btn-abrir-sopa");
    const btnCerrarSopa = document.getElementById("cerrar-sopa-btn");

    // Evento para ABRIR el juego
    btnAbrirSopa.addEventListener("click", () => {
        seccionSopa.classList.add("activo"); // Muestra la sección
        iniciarJuego(); // Genera un tablero nuevo y limpio al entrar
    });

    // Evento para CERRAR el juego
    btnCerrarSopa.addEventListener("click", () => {
        seccionSopa.classList.remove("activo"); // Vuelve a ocultar la sección
        document.getElementById("juegos").scrollIntoView({ behavior: 'smooth' }); // Te devuelve arriba a las tarjetas
    });

    function iniciarJuego() {
        gridDOM.innerHTML = "";
        listaUlDOM.innerHTML = "";
        grid = Array.from({ length: tamañoGrid }, () => Array(tamañoGrid).fill(""));

        // 1. Mostrar palabras en la lista
        palabrasAnimales.forEach(palabra => {
            const li = document.createElement("li");
            li.textContent = palabra;
            li.id = `palabra-${palabra}`;
            listaUlDOM.appendChild(li);
        });

        // 2. Colocar palabras en el tablero (horizontal y vertical)
        palabrasAnimales.forEach(palabra => {
            let colocada = false;
            while (!colocada) {
                let orientacion = Math.random() < 0.5 ? "H" : "V";
                let fila = Math.floor(Math.random() * tamañoGrid);
                let col = Math.floor(Math.random() * tamañoGrid);

                if (puedeColocarPalabra(palabra, fila, col, orientacion)) {
                    for (let i = 0; i < palabra.length; i++) {
                        if (orientacion === "H") grid[fila][col + i] = palabra[i];
                        if (orientacion === "V") grid[fila + i][col] = palabra[i];
                    }
                    colocada = true;
                }
            }
        });

        // 3. Rellenar celdas vacías con letras aleatorias y renderizar
        const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
        for (let f = 0; f < tamañoGrid; f++) {
            for (let c = 0; c < tamañoGrid; c++) {
                if (grid[f][c] === "") {
                    grid[f][c] = letras.charAt(Math.floor(Math.random() * letras.length));
                }

                const celda = document.createElement("div");
                celda.classList.add("celda");
                celda.textContent = grid[f][c];
                celda.dataset.fila = f;
                celda.dataset.col = c;

                // Eventos para seleccionar
                celda.addEventListener("mousedown", iniciarSeleccion);
                celda.addEventListener("mouseenter", arrastrarSeleccion);

                celda.addEventListener("touchstart", (e) => {
                    e.preventDefault(); // evita que la pantalla haga scroll mientras se selecciona
                    iniciarSeleccion({ target: celda });
                });

                celda.addEventListener("touchmove", (e) => {
                    e.preventDefault();
                    const toque = e.touches[0]; // touchmove siempre dispara sobre la celda donde empezó el toque, por eso hay que buscar manualmente qué celda hay debajo del dedo ahora
                    const elementoDebajo = document.elementFromPoint(toque.clientX, toque.clientY);
                    
                    if (elementoDebajo && elementoDebajo.classList.contains("celda")) {
                        arrastrarSeleccion({ target: elementoDebajo });
                    }
                });

                gridDOM.appendChild(celda);
            }
        }
    }

    function puedeColocarPalabra(palabra, fila, col, orientacion) {
        if (orientacion === "H" && col + palabra.length > tamañoGrid) return false;
        if (orientacion === "V" && fila + palabra.length > tamañoGrid) return false;

        for (let i = 0; i < palabra.length; i++) {
            let letraf = orientacion === "V" ? fila + i : fila;
            let letrac = orientacion === "H" ? col + i : col;
            if (grid[letraf][letrac] !== "" && grid[letraf][letrac] !== palabra[i]) {
                return false;
            }
        }
        
        return true;
    }

    // Funciones de interacción con el ratón
    function iniciarSeleccion(e) {
        seleccionando = true;
        limpiarSeleccionActiva();
        agregarCeldaASeleccion(e.target);
    }

    function arrastrarSeleccion(e) {
        if (seleccionando) {
            agregarCeldaASeleccion(e.target);
        }
    }

    function terminarSeleccion() {
        if (!seleccionando) return;
        seleccionando = false;

        // Formar la palabra con las letras seleccionadas
        let palabraSeleccionada = celdasSeleccionadas.map(celda => celda.textContent).join("");
        let palabraInvertida = palabraSeleccionada.split("").reverse().join("");

        // Comprobar si coincide con alguna palabra de la lista
        let acierto = palabrasAnimales.find(p => p === palabraSeleccionada || p === palabraInvertida);

        if (acierto) {   // Marcar celdas como encontradas (verde)
            celdasSeleccionadas.forEach(celda => {
                celda.classList.remove("seleccionada");
                celda.classList.add("encontrada");
            });

            // Tachar en la lista
            document.getElementById(`palabra-${acierto}`).classList.add("tachado");
            reproducirSonidoCorrecto();

            const palabrasTachadas = document.querySelectorAll("#palabras-ul li.tachado").length;
            if (palabrasTachadas === palabrasAnimales.length) {
                marcarJuegoCompletado("sopa");
            }

        } else {
            // Si te equivocas, se borra la selección (quita el azul)
            limpiarSeleccionActiva();
            celdasSeleccionadas = [];
        }

        celdasSeleccionadas = [];
    }

    function agregarCeldaASeleccion(celdaDOM) {
        if (!celdasSeleccionadas.includes(celdaDOM)) {
            celdaDOM.classList.add("seleccionada");
            celdasSeleccionadas.push(celdaDOM);
        }
    }

    function limpiarSeleccionActiva() {
        document.querySelectorAll(".celda.seleccionada").forEach(c => c.classList.remove("seleccionada"));
    }

    // Evento para terminar de seleccionar al soltar el clic en cualquier parte de la pantalla
    document.addEventListener("mouseup", terminarSeleccion);
    document.addEventListener("touchend", terminarSeleccion);

    btnReiniciar.addEventListener("click", iniciarJuego);  // Botón reiniciar

    // Iniciar el juego al cargar la página
    iniciarJuego();
});

// ===== LÓGICA DEL JUEGO: COMPLETA LA PALABRA ============
document.addEventListener("DOMContentLoaded", () => {
    // Referencias para ocultar/mostrar
    const completaSection = document.getElementById("completa-section");
    const btnAbrirCompleta = document.getElementById("btn-abrir-completa");
    const btnCerrarCompleta = document.getElementById("btn-cerrar-completa");

    if(!btnAbrirCompleta) return; // Si no estamos en index.html, no hace nada
    
    // Evento para ABRIR el juego
    btnAbrirCompleta.addEventListener("click", () => {
        completaSection.classList.add("activo");
        indiceActual = 0; // Reinicia el juego cada vez que entrás
        cargarPalabra();
    });

    // Evento para CERRAR el juego
    btnCerrarCompleta.addEventListener("click", () => {
        completaSection.classList.remove("activo");
        document.getElementById("juegos").scrollIntoView({ behavior: 'smooth' });
    });

    // Variables del juego
    const palabras = [
    { prefijo: "", sufijo: "ACA", correcta: "V", opciones: ["B", "V"], emoji: "🐄" },
    { prefijo: "CA", sufijo: "ALLO", correcta: "B", opciones: ["V", "B"], emoji: "🐎" },
    { prefijo: "", sufijo: "APATO", correcta: "Z", opciones: ["S", "Z", "C"], emoji: "👞" },
    { prefijo: "CEBO", sufijo: "A", correcta: "LL", opciones: ["Y", "LL"], emoji: "🧅" },
    { prefijo: "", sufijo: "IRAFA", correcta: "J", opciones: ["G", "J"], emoji: "🦒" },
    { prefijo: "ÁR", sufijo: "OL", correcta: "B", opciones: ["V", "B"], emoji: "🌳" },
    { prefijo: "QUE", sufijo: "O", correcta: "S", opciones: ["Z", "S"], emoji: "🧀" }
    ];

    let indiceActual = 0;

    const emojiDOM = document.getElementById("emoji-display");
    const palabraDOM = document.getElementById("palabra-display");
    const opcionesDOM = document.getElementById("opciones-container");
    const feedbackDOM = document.getElementById("mensaje-feedback");

    function cargarPalabra() {
        if (indiceActual >= palabras.length) {
            emojiDOM.textContent = "🏆";
            palabraDOM.innerHTML = "¡GANASTE!";
            opcionesDOM.innerHTML = `<button class="btn-opcion" id="btn-reiniciar" style="font-size: 1.2rem;">Jugar de nuevo 🔄</button>`;
            feedbackDOM.textContent = "¡Completaste todas las palabras correctamente!";

            document.getElementById("btn-reiniciar").addEventListener("click", () => {
                indiceActual = 0;
                cargarPalabra();
            });

            marcarJuegoCompletado("completa");
            return;
        }

        const actual = palabras[indiceActual];
        emojiDOM.textContent = actual.emoji;
        feedbackDOM.textContent = "";

        palabraDOM.innerHTML = `${actual.prefijo}<span class="hueco">_</span>${actual.sufijo}`;

        opcionesDOM.innerHTML = "";

        actual.opciones.forEach(letra => {
            const btn = document.createElement("button");
            btn.className = "btn-opcion";
            btn.textContent = letra;
            btn.addEventListener("click", () => verificarRespuesta(letra, btn));
            opcionesDOM.appendChild(btn);
        });
    }

    function verificarRespuesta(letra, boton) {
        const actual = palabras[indiceActual];
        const botones = document.querySelectorAll(".btn-opcion");

        botones.forEach(b => b.disabled = true); // Bloquea múltiples clics

        if (letra === actual.correcta) {
            boton.classList.add("correcta");
            palabraDOM.innerHTML = `${actual.prefijo}<span style="color: var(--verde);">${letra}</span>${actual.sufijo}`;
            feedbackDOM.textContent = "¡Excelente! 🎉";
            feedbackDOM.style.color = "var(--verde)";
            reproducirSonidoCorrecto();

            setTimeout(() => {
                indiceActual++;
                cargarPalabra();
            }, 1500);

        } else {
            boton.classList.add("incorrecta");
            feedbackDOM.textContent = "¡Ups! Intenta de nuevo. 😅";
            feedbackDOM.style.color = "var(--rojo)";
            reproducirSonidoIncorrecto();

            setTimeout(() => {
                boton.classList.remove("incorrecta");
                botones.forEach(b => b.disabled = false);
                feedbackDOM.textContent = "";
            }, 1000);
        }
    }
});

// ====== LÓGICA DEL JUEGO: IMAGEN Y PALABRA ============
document.addEventListener("DOMContentLoaded", () => {
    const imagenSection = document.getElementById("imagen-section");
    const btnAbrirImagen = document.getElementById("btn-abrir-imagen");
    const btnCerrarImagen = document.getElementById("btn-cerrar-imagen");

    if (!btnAbrirImagen) return;

    // Evento para ABRIR el juego
    btnAbrirImagen.addEventListener("click", () => {
        imagenSection.classList.add("activo");
        indiceImagenActual = 0;
        cargarJuegoImagen();
    });

    // Evento para CERRAR el juego
    btnCerrarImagen.addEventListener("click", () => {
        imagenSection.classList.remove("activo");
        document.getElementById("juegos").scrollIntoView({ behavior: 'smooth' });
    });

    // Banco de datos: Imagen (Emoji), Palabra Correcta y 4 Opciones
    const preguntasImagen = [
        { emoji: "🪐", correcta: "PLANETA", opciones: ["ESTRELLA", "PLANETA", "COHETE", "LUNA"] },
        { emoji: "🦁", correcta: "LEÓN", opciones: ["GATO", "PERRO", "LEÓN", "TIGRE"] },
        { emoji: "🍎", correcta: "MANZANA", opciones: ["MANZANA", "PLÁTANO", "UVA", "NARANJA"] },
        { emoji: "🚀", correcta: "COHETE", opciones: ["AVIÓN", "AUTO", "BARCO", "COHETE"] },
        { emoji: "🎸", correcta: "GUITARRA", opciones: ["PIANO", "TAMBOR", "GUITARRA", "FLAUTA"] },
        { emoji: "🐬", correcta: "DELFÍN", opciones: ["TIBURÓN", "DELFÍN", "BALLENA", "PEZ"] }
    ];

    let indiceImagenActual = 0;

    const imgDOM = document.getElementById("img-display");
    const opcionesDOM = document.getElementById("img-opciones-container");
    const feedbackDOM = document.getElementById("img-mensaje-feedback");

    function cargarJuegoImagen() {
        if (indiceImagenActual >= preguntasImagen.length) {
            imgDOM.textContent = "🏆";
            opcionesDOM.innerHTML = `<button class="btn-opcion" id="btn-reiniciar-imagen" style="font-size: 1.2rem;">Jugar de nuevo 🔄</button>`;
            feedbackDOM.textContent = "¡Eres un experto relacionando imágenes y palabras!";
            feedbackDOM.style.color = "var(--verde)";
           
            document.getElementById("btn-reiniciar-imagen").addEventListener("click", () => {
                indiceImagenActual = 0;
                cargarJuegoImagen();
            });

            marcarJuegoCompletado("imagen");
            return;
        }

        const actual = preguntasImagen[indiceImagenActual];
        imgDOM.textContent = actual.emoji;
        feedbackDOM.textContent = "";
        opcionesDOM.innerHTML = "";
       
        actual.opciones.forEach(opcion => {
            const btn = document.createElement("button");
            btn.className = "btn-opcion";
            btn.textContent = opcion;
            btn.style.fontSize = "1.3rem"; // Tamaño ideal para niños
            btn.addEventListener("click", () => verificarRespuestaImagen(opcion, btn));
            opcionesDOM.appendChild(btn);
        });
    }

    function verificarRespuestaImagen(seleccion, boton) {
        const actual = preguntasImagen[indiceImagenActual];
        const botones = opcionesDOM.querySelectorAll(".btn-opcion");
       
        botones.forEach(b => b.disabled = true);

        if (seleccion === actual.correcta) {
            boton.classList.add("correcta");
            feedbackDOM.textContent = "¡Excelente combinación! 🎯";
            feedbackDOM.style.color = "var(--verde)";
            reproducirSonidoCorrecto();
           
            setTimeout(() => {
                indiceImagenActual++;
                cargarJuegoImagen();
            }, 1500);
        } else {
            boton.classList.add("incorrecta");
            feedbackDOM.textContent = "¡Esa palabra no es la del dibujo! Intenta otra vez. 👀";
            feedbackDOM.style.color = "var(--rojo)";
            reproducirSonidoIncorrecto();
           
            setTimeout(() => {
                boton.classList.remove("incorrecta");
                botones.forEach(b => b.disabled = false);
                feedbackDOM.textContent = "";
            }, 1200);
        }
    }
});

// ====== LÓGICA DEL JUEGO: RULETA DE SÍLABAS ===========
document.addEventListener("DOMContentLoaded", () => {
    const btnAbrirRuleta = document.getElementById("btn-abrir-ruleta");
    const seccionRuleta = document.getElementById("ruleta-section");
    const btnCerrarRuleta = document.getElementById("btn-cerrar-ruleta");

    if (!btnAbrirRuleta) return; // Si no estamos en index.html, no hace nada

    const silabas = ["MA", "PA", "LO", "TA", "SE", "RI", "CA", "NO", "DA", "LE", "SO", "MI"];
    const coloresRueda = ["#ff3c48", "#ffd23f", "#4bd16f", "#1a74e2", "#48bbd4", "#ff8023"];

    let rotacionActual = 0;
    let silabaSeleccionada = null;
    let girando = false;
    let contadorPalabras = 0;
    const palabrasUsadas = new Set();
    const META_PALABRAS_RULETA = 5;

    const svgRuleta = document.getElementById("svg-ruleta");
    const ruedaDOM = document.getElementById("ruleta-rueda");
    const btnGirar = document.getElementById("btn-girar");
    const silabaResultadoDOM = document.getElementById("silaba-resultado");
    const silabaActualDOM = document.getElementById("silaba-actual");
    const inputPalabra = document.getElementById("input-palabra");
    const btnComprobar = document.getElementById("btn-comprobar");
    const feedbackDOM = document.getElementById("feedback-ruleta");
    const contadorDOM = document.getElementById("contador-palabras");
    const listaFormadasDOM = document.getElementById("palabras-formadas-ul");

    // Evento para ABRIR el juego
    btnAbrirRuleta.addEventListener("click", () => {
        seccionRuleta.classList.add("activo");
        construirRuedaSVG();
    });

    // Evento para CERRAR el juego
    btnCerrarRuleta.addEventListener("click", () => {
        seccionRuleta.classList.remove("activo");
        document.getElementById("juegos").scrollIntoView({ behavior: 'smooth' });
    });

    function construirRuedaSVG() {
        const total = silabas.length;
        const anguloSegmento = 360 / total;
        const cx = 150, cy = 150, r = 140;
        let html = "";

        silabas.forEach((silaba, i) => {
            const a0 = (i * anguloSegmento) * Math.PI / 180;
            const a1 = ((i + 1) * anguloSegmento) * Math.PI / 180;
            const x1 = cx + r * Math.cos(a0);
            const y1 = cy + r * Math.sin(a0);
            const x2 = cx + r * Math.cos(a1);
            const y2 = cy + r * Math.sin(a1);
            const color = coloresRueda[i % coloresRueda.length];
            const medio = i * anguloSegmento + anguloSegmento / 2;

            html += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z" fill="${color}" stroke="#fff" stroke-width="3"/>`;
            html += `<g transform="rotate(${medio} ${cx} ${cy})">
                        <text x="${cx + r - 40}" y="${cy + 6}" font-size="22" font-weight="800"
                          fill="#fff" text-anchor="middle" font-family="'Baloo 2', sans-serif">${silaba}</text>
                      </g>`;
        });

        svgRuleta.innerHTML = html;
    }

    function girarRuleta() {
        if (girando) return;
        girando = true;
        btnGirar.disabled = true;
        silabaResultadoDOM.classList.remove("mostrar");
        feedbackDOM.textContent = "";
        feedbackDOM.className = "feedback-ruleta";

        const vueltasExtra = 5 * 360;
        const offsetAleatorio = Math.floor(Math.random() * 360);
        rotacionActual += vueltasExtra + offsetAleatorio;
        ruedaDOM.style.transform = `rotate(${rotacionActual}deg)`;

        setTimeout(() => {
            const anguloSegmento = 360 / silabas.length;
            const rotacionEfectiva = ((rotacionActual % 360) + 360) % 360;
            // El puntero está arriba => 270° en el sistema de coordenadas del SVG
            const anguloOriginal = ((270 - rotacionEfectiva) % 360 + 360) % 360;
            const indice = Math.floor(anguloOriginal / anguloSegmento) % silabas.length;

            silabaSeleccionada = silabas[indice];
            silabaActualDOM.textContent = silabaSeleccionada;
            silabaResultadoDOM.classList.add("mostrar");
            inputPalabra.value = "";
            inputPalabra.focus();

            girando = false;
            btnGirar.disabled = false;
        }, 4100);
    }

    function normalizar(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function comprobarPalabra() {
        if (!silabaSeleccionada) return;
        const palabra = inputPalabra.value.trim();

        if (palabra.length < 2) {
            mostrarFeedback("Escribí una palabra primero 🙂", false);
            return;
        }

        const palabraNorm = normalizar(palabra);
        const silabaNorm = normalizar(silabaSeleccionada);

        if (!palabraNorm.includes(silabaNorm)) {
            mostrarFeedback(`Esa palabra no tiene "${silabaSeleccionada}" 🤔 ¡Probá de nuevo!`, false);
            return;
        }

        if (palabrasUsadas.has(palabraNorm)) {
            mostrarFeedback("¡Esa palabra ya la usaste! Probá con otra 😉", false);
            return;
        }

        palabrasUsadas.add(palabraNorm);
        contadorPalabras++;
        contadorDOM.textContent = contadorPalabras;

        const li = document.createElement("li");
        li.textContent = `${palabra} (${silabaSeleccionada})`;
        listaFormadasDOM.appendChild(li);

        mostrarFeedback("¡Muy bien! Palabra formada 🎉", true);
        inputPalabra.value = "";
        inputPalabra.focus();

        if (contadorPalabras >= META_PALABRAS_RULETA) {
            marcarJuegoCompletado("ruleta");
        }
    }

    function mostrarFeedback(mensaje, ok) {
        feedbackDOM.textContent = mensaje;
        feedbackDOM.className = "feedback-ruleta " + (ok ? "ok" : "error");
        if (ok) { reproducirSonidoCorrecto(); } else { reproducirSonidoIncorrecto(); }
    }

    btnGirar.addEventListener("click", girarRuleta);
    btnComprobar.addEventListener("click", comprobarPalabra);
    inputPalabra.addEventListener("keyup", (e) => {
        if (e.key === "Enter") comprobarPalabra();
    });
});

// ====== LÓGICA DEL JUEGO: CANCIONES DEL ALFABETO ==========
document.addEventListener("DOMContentLoaded", () => {
    const btnAbrirCanciones = document.getElementById("btn-abrir-canciones");
    const seccionCanciones = document.getElementById("canciones-section");
    const btnCerrarCanciones = document.getElementById("btn-cerrar-canciones");

    if (!btnAbrirCanciones) return; // Si no estamos en index.html, no hace nada

    const abecedario = [
        { letra: "A", emoji: "🕷️", verso: "¡Araña que sube y baja!" },
        { letra: "B", emoji: "🐳", verso: "¡Ballena que nada en el mar!" },
        { letra: "C", emoji: "🏠", verso: "¡Casa donde vive mi gato!" },
        { letra: "D", emoji: "🐬", verso: "¡Delfín que salta feliz!" },
        { letra: "E", emoji: "🐘", verso: "¡Elefante, grande y gris!" },
        { letra: "F", emoji: "🌸", verso: "¡Flor que huele muy bien!" },
        { letra: "G", emoji: "🐱", verso: "¡Gato que juega también!" },
        { letra: "H", emoji: "🐜", verso: "¡Hormiga, chiquita y fuerte!" },
        { letra: "I", emoji: "🏝️", verso: "¡Isla en medio del mar!" },
        { letra: "J", emoji: "🦒", verso: "¡Jirafa que mira hacia arriba!" },
        { letra: "K", emoji: "🐨", verso: "¡Koala que duerme en el árbol!" },
        { letra: "L", emoji: "🦁", verso: "¡León, el rey de la selva!" },
        { letra: "M", emoji: "🐒", verso: "¡Mono que salta de rama en rama!" },
        { letra: "N", emoji: "☁️", verso: "¡Nube blanca y suave!" },
        { letra: "Ñ", emoji: "🐦", verso: "¡Ñandú que corre veloz!" },
        { letra: "O", emoji: "🐻", verso: "¡Oso que come miel!" },
        { letra: "P", emoji: "🐧", verso: "¡Pingüino que camina despacito!" },
        { letra: "Q", emoji: "🧀", verso: "¡Queso amarillito!" },
        { letra: "R", emoji: "🐸", verso: "¡Rana que salta al agua!" },
        { letra: "S", emoji: "🐍", verso: "¡Serpiente que se desliza!" },
        { letra: "T", emoji: "🐯", verso: "¡Tigre con rayas fuertes!" },
        { letra: "U", emoji: "🍇", verso: "¡Uva, dulce y morada!" },
        { letra: "V", emoji: "🐄", verso: "¡Vaca que dice muuu!" },
        { letra: "W", emoji: "🧇", verso: "¡Wafle, riquísimo!" },
        { letra: "X", emoji: "🎶", verso: "¡Xilófon que suena así!" },
        { letra: "Y", emoji: "🌿", verso: "¡Yuyo que crece en el jardín!" },
        { letra: "Z", emoji: "🦊", verso: "¡Zorro, astuto y veloz!" }
    ];

    let indiceLetra = 0;
    let reproduciendo = false;
    let intervaloCancion = null;

    const letraDOM = document.getElementById("letra-actual");
    const emojiDOM = document.getElementById("emoji-verso");
    const versoDOM = document.getElementById("verso-actual");
    const progresoDOM = document.getElementById("progreso-alfabeto");
    const btnAnterior = document.getElementById("btn-anterior-letra");
    const btnSiguiente = document.getElementById("btn-siguiente-letra");
    const btnPlay = document.getElementById("btn-play-cancion");

    // Evento para ABRIR el juego
    btnAbrirCanciones.addEventListener("click", () => {
        seccionCanciones.classList.add("activo");
        construirProgreso();
        mostrarLetra(0);
    });

    // Evento para CERRAR el juego
    btnCerrarCanciones.addEventListener("click", () => {
        detenerCancion();
        seccionCanciones.classList.remove("activo");
        document.getElementById("juegos").scrollIntoView({ behavior: 'smooth' });
    });

    function construirProgreso() {
        progresoDOM.innerHTML = "";
        abecedario.forEach((item) => {
            const span = document.createElement("span");
            span.textContent = item.letra;
            progresoDOM.appendChild(span);
        });
    }

    function mostrarLetra(i) {
        indiceLetra = ((i % abecedario.length) + abecedario.length) % abecedario.length;
        const item = abecedario[indiceLetra];

        letraDOM.classList.remove("cambio");
        void letraDOM.offsetWidth; // reinicia la animación
        letraDOM.classList.add("cambio");

        letraDOM.textContent = item.letra;
        emojiDOM.textContent = item.emoji;
        versoDOM.textContent = item.verso;
        hablarVerso(`${item.letra} de ${item.verso.replace(/[¡!]/g, "")}`); // Lee el versito en voz alta

        [...progresoDOM.children].forEach((span, idx) => {
            span.classList.toggle("activa", idx === indiceLetra);
        });
        const activa = progresoDOM.children[indiceLetra];
        if (activa) activa.scrollIntoView({ block: "nearest", inline: "center" });
        
        // Si ya se visitaron las 27 letras del abecedario, se marca el juego como completado
        if (indiceLetra === abecedario.length - 1) {
            marcarJuegoCompletado("canciones");
        }
    }

    function detenerCancion() {
        reproduciendo = false;
        clearInterval(intervaloCancion);
        btnPlay.textContent = "▶️ Cantar solo";
        btnPlay.classList.remove("reproduciendo");
    }

    function alternarReproduccion() {
        if (reproduciendo) {
            detenerCancion();
            return;
        }

        reproduciendo = true;
        btnPlay.textContent = "⏸️ Pausar";
        btnPlay.classList.add("reproduciendo");

        intervaloCancion = setInterval(() => {
            if (indiceLetra >= abecedario.length - 1) {
                detenerCancion();
                return;
            }
            mostrarLetra(indiceLetra + 1);
        }, 1800);
    }

    btnAnterior.addEventListener("click", () => { detenerCancion(); mostrarLetra(indiceLetra - 1); });
    btnSiguiente.addEventListener("click", () => { detenerCancion(); mostrarLetra(indiceLetra + 1); });
    btnPlay.addEventListener("click", alternarReproduccion);
});

// ===== LÓGICA DEL JUEGO: TRAZA LAS LETRAS ============
document.addEventListener("DOMContentLoaded", () => {
    const trazaSection = document.getElementById("traza-section");
    const btnAbrirTraza = document.getElementById("btn-abrir-traza");
    const btnCerrarTraza = document.getElementById("btn-cerrar-traza");

    if (!btnAbrirTraza) return;

    // Evento para ABRIR el juego
    btnAbrirTraza.addEventListener("click", () => {
        trazaSection.classList.add("activo");
        indiceTrazaActual = 0;
        cargarLetraTraza();
    });

    // Evento para CERRAR el juego
    btnCerrarTraza.addEventListener("click", () => {
        trazaSection.classList.remove("activo");
        document.getElementById("juegos").scrollIntoView({ behavior: 'smooth' });
    });

    // Banco de letras con una palabra y emoji de ejemplo para cada una
    const letrasTraza = [
        { letra: "A", palabra: "ARAÑA", emoji: "🕷️" },
        { letra: "B", palabra: "BALLENA", emoji: "🐋" },
        { letra: "C", palabra: "CASA", emoji: "🏠" },
        { letra: "D", palabra: "DELFÍN", emoji: "🐬" },
        { letra: "E", palabra: "ELEFANTE", emoji: "🐘" },
        { letra: "L", palabra: "LEÓN", emoji: "🦁" },
        { letra: "M", palabra: "MONO", emoji: "🐵" },
        { letra: "O", palabra: "OSO", emoji: "🐻" },
        { letra: "S", palabra: "SAPO", emoji: "🐸" },
        { letra: "T", palabra: "TIGRE", emoji: "🐯" }
    ];

    let indiceTrazaActual = 0;
    let dibujando = false;

    const canvas = document.getElementById("traza-canvas");
    const ctx = canvas.getContext("2d");
    const emojiDOM = document.getElementById("traza-emoji-display");
    const palabraDOM = document.getElementById("traza-palabra-ejemplo");
    const progresoDOM = document.getElementById("traza-progreso");
    const feedbackDOM = document.getElementById("traza-mensaje-feedback");
    const btnBorrar = document.getElementById("btn-borrar-trazo");
    const btnSiguiente = document.getElementById("btn-siguiente-traza");;

    // Dibuja la letra guía punteada en el canvas
    function dibujarGuia() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const actual = letrasTraza[indiceTrazaActual];
        ctx.save();
        ctx.font = "280px 'Baloo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "#c9d6f5";
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 10]);
        ctx.strokeText(actual.letra, canvas.width / 2, canvas.height / 2 + 20);
        ctx.restore();
    }

    function cargarLetraTraza() {
        if (indiceTrazaActual >= letrasTraza.length) {
            emojiDOM.textContent = "🏆";
            palabraDOM.textContent = "¡COMPLETASTE EL ABECEDARIO!";
            progresoDOM.textContent = "";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            feedbackDOM.textContent = "¡Practicaste todas las letras! 🎉";
            feedbackDOM.style.color = "var(--verde)";

            btnSiguiente.textContent = "Jugar de nuevo 🔄";
            btnSiguiente.removeEventListener("click", avanzarLetra);
            btnSiguiente.addEventListener("click", reiniciarTraza);
            
            marcarJuegoCompletado("traza");
            return;
        }

        const actual = letrasTraza[indiceTrazaActual];
        emojiDOM.textContent = actual.emoji;
        palabraDOM.textContent = `${actual.letra} de ${actual.palabra}`;
        progresoDOM.textContent = `(${indiceTrazaActual + 1} / ${letrasTraza.length})`;
        feedbackDOM.textContent = "";
        dibujarGuia();
    }

    function avanzarLetra() {
        indiceTrazaActual++;
        feedbackDOM.textContent = "¡Muy bien hecho! ✏️";
        feedbackDOM.style.color = "var(--verde)";
        reproducirSonidoCorrecto();
        setTimeout(() => cargarLetraTraza(), 600);
    }

    function reiniciarTraza() {
        indiceTrazaActual = 0;
        btnSiguiente.textContent = "Siguiente ➡️";
        btnSiguiente.removeEventListener("click", reiniciarTraza);
        btnSiguiente.addEventListener("click", avanzarLetra);
        cargarLetraTraza();
    }

    btnSiguiente.addEventListener("click", avanzarLetra);

    btnBorrar.addEventListener("click", () => {
        dibujarGuia();
    });

    // Calcula la posición del trazo dentro del canvas (soporta mouse y touch)
    function obtenerPosicion(e) {
        const rect = canvas.getBoundingClientRect();
        const escalaX = canvas.width / rect.width;
        const escalaY = canvas.height / rect.height;
        if (e.touches && e.touches.length > 0) {
            return {
                x: (e.touches[0].clientX - rect.left) * escalaX,
                y: (e.touches[0].clientY - rect.top) * escalaY
            };
        }
        return {
            x: (e.clientX - rect.left) * escalaX,
            y: (e.clientY - rect.top) * escalaY
        };
    }

    function empezarTrazo(e) {
        e.preventDefault();
        dibujando = true;
        const pos = obtenerPosicion(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    function seguirTrazo(e) {
        if (!dibujando) return;
        e.preventDefault();
        const pos = obtenerPosicion(e);
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#ff3c48";
        ctx.setLineDash([]);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    function terminarTrazo() {
        dibujando = false;
    }

    // Eventos de mouse
    canvas.addEventListener("mousedown", empezarTrazo);
    canvas.addEventListener("mousemove", seguirTrazo);
    canvas.addEventListener("mouseup", terminarTrazo);
    canvas.addEventListener("mouseleave", terminarTrazo);

    // Eventos táctiles (celular/tablet)
    canvas.addEventListener("touchstart", empezarTrazo);
    canvas.addEventListener("touchmove", seguirTrazo);
    canvas.addEventListener("touchend", terminarTrazo);
});