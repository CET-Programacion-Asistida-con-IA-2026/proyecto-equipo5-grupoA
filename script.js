
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
});