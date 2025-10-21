async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 👇 Reemplazá esta cadena con el hash SHA-256 real de tu clave scoutatl26
const HASH_PERMITIDO = "b12d8be2d6bcbcada837be85a3a5b3f8728a5b7a85a0880545ab43a89e247d4a";

document.getElementById("btnEntrar").addEventListener("click", async () => {
  const clave = document.getElementById("claveInput").value.trim();
  const hash = await sha256(clave);
  if (hash === HASH_PERMITIDO) {
    document.getElementById("overlay").style.display = "none";
    cargarCSV();
  } else {
    document.getElementById("mensaje").style.display = "block";
  }
});

// ---- Tabs ----
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    mostrarJugadores(tab.dataset.tab);
  });
});

let jugadoresData = [];

function cargarCSV() {
  Papa.parse("jugadores.csv", {
    download: true,
    header: true,
    complete: (results) => {
      jugadoresData = results.data;
      mostrarJugadores("libres");
    }
  });
}

function mostrarJugadores(tab) {
  const lateral = document.getElementById("jugadoresLateral");
  lateral.innerHTML = "";
  jugadoresData.filter(j => j.tab === tab).forEach(j => {
    const div = document.createElement("div");
    div.className = "jugador";
    div.draggable = true;
    div.dataset.nombre = j.nombre;
    div.innerHTML = `<img src="escudos/${j.escudo}" alt="${j.club}"><span>${j.nombre}</span>`;
    lateral.appendChild(div);
  });
  activarDrag();
}

// ---- Drag & drop ----
const cancha = document.getElementById('canchaContainer');
function activarDrag() {
  document.querySelectorAll('.jugador').forEach(j => {
    j.addEventListener('dragstart', ev => ev.dataTransfer.setData('nombre', j.dataset.nombre));
  });
}
cancha.addEventListener('dragover', ev => ev.preventDefault());
cancha.addEventListener('drop', ev => {
  ev.preventDefault();
  const nombre = ev.dataTransfer.getData('nombre');
  const jugador = jugadoresData.find(j => j.nombre === nombre);
  if (jugador) {
    const x = ev.offsetX - 25;
    const y = ev.offsetY - 25;
    const icon = document.createElement('img');
    icon.src = `escudos/${jugador.escudo}`;
    icon.style.width = "50px";
    icon.style.height = "50px";
    icon.style.position = "absolute";
    icon.style.left = `${x}px`;
    icon.style.top = `${y}px`;
    icon.style.borderRadius = "50%";
    cancha.appendChild(icon);
    guardarPos(no
