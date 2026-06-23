console.log("JavaScript conectado");
// FORMULARIO DE COMENTARIOS
const formulario = document.getElementById("formulario-comentario");
const mensajeExito = document.getElementById("mensaje-exito");
const contadorCaracteres = document.getElementById("char-count");
const comentario = document.getElementById("comentario");

// Contador de caracteres
comentario.addEventListener("input", () => {
  contadorCaracteres.textContent =
    `${comentario.value.length} / 200 caracteres`;
});

// Simulación de envío
formulario.addEventListener("submit", (e) => {
  e.preventDefault();

  mensajeExito.textContent =
    "✅ ¡Tu mensaje fue enviado correctamente!";


  // Limpia todos los campos
  formulario.reset();

  // Reinicia el contador
  contadorCaracteres.textContent = "0 / 200 caracteres";

  // Oculta el mensaje después de 5 segundos
  setTimeout(() => {
    mensajeExito.textContent = "";
  }, 5000);
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

    // NUEVAS VARIABLES PARA MOSTRAR/OCULTAR
    const seccionSopa = document.getElementById("sopa-de-letras-section");
    const btnAbrirSopa = document.getElementById("btn-abrir-sopa");
    const btnCerrarSopa = document.getElementById("cerrar-sopa-btn");

    // Evento para ABRIR el juego
    btnAbrirSopa.addEventListener("click", () => {
        seccionSopa.classList.add("activo"); // Muestra la sección
        iniciarJuego(); // Genera un tablero nuevo y limpio al entrar
        seccionSopa.scrollIntoView({ behavior: 'smooth' }); // Desplazamiento suave hacia el juego
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

        if (acierto) {
            // Marcar celdas como encontradas (verde)
            celdasSeleccionadas.forEach(celda => {
                celda.classList.remove("seleccionada");
                celda.classList.add("encontrada");
            });
            // Tachar en la lista
            document.getElementById(`palabra-${acierto}`).classList.add("tachado");
        } else {
            // Si te equivocas, se borra la selección (quita el azul)
            limpiarSeleccionActiva();
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
    
    // Botón reiniciar
    btnReiniciar.addEventListener("click", iniciarJuego);

    // Iniciar el juego al cargar la página
    iniciarJuego();
});
// ============================================
// LÓGICA DEL JUEGO: COMPLETA LA PALABRA
// ============================================
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
        completaSection.scrollIntoView({ behavior: 'smooth' });
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
            
            setTimeout(() => {
                indiceActual++;
                cargarPalabra();
            }, 1500);
        } else {
            boton.classList.add("incorrecta");
            feedbackDOM.textContent = "¡Ups! Intenta de nuevo. 😅";
            feedbackDOM.style.color = "var(--rojo)";
            
            setTimeout(() => {
                boton.classList.remove("incorrecta");
                botones.forEach(b => b.disabled = false);
                feedbackDOM.textContent = "";
            }, 1000);
        }
    }
});