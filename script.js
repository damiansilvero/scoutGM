// SHA-256 hash helper
async function sha256(text){
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

// ⚠️ Inserta aquí tu hash SHA-256 de "scoutatl26"
const HASH_PERMITIDO = "b12d8be2d6bcbcada837be85a3a5b3f8728a5b7a85a0880545ab43a89e247d4a";

const overlay = document.getElementById("overlay");
const msg = document.getElementById("mensaje");
document.getElementById("btnEntrar").onclick = async ()=>{
  const val = document.getElementById("claveInput").value.trim();
  const hash = await sha256(val);
  if(hash===HASH_PERMITIDO){ overlay.style.display="none"; cargarJugadores(); }
  else msg.style.display="block";
};

// --------- Manejo de pestañas ----------
const tabs = document.querySelectorAll(".tab");
tabs.forEach(t=>{
  t.onclick=()=>{ 
    tabs.forEach(x=>x.classList.remove("active"));
    t.classList.add("active");
    filtrarJugadores(t.dataset.tab);
  };
});

// --------- Cargar CSV y generar jugadores ----------
let todosJugadores=[];
function cargarJugadores(){
  Papa.parse("jugadores.csv",{
    download:true,
    header:true,
    complete:function(results){
      todosJugadores = results.data;
      filtrarJugadores("libres");
    }
  });
}

function filtrarJugadores(tab){
  const cont = document.getElementById("jugadoresLateral");
  cont.innerHTML="";
  todosJugadores.filter(j=>j.tab===tab).forEach(j=>{
    const div=document.createElement("div");
    div.className="jugador";
    div.draggable=true;
    div.dataset.nombre=j.nombre;
    div.innerHTML=`<img src="escudos/${j.escudo}" alt="${j.club}"><span>${j.nombre}</span>`;
    cont.appendChild(div);
  });
  activarDrag();
}

// --------- Drag & Drop sobre cancha ----------
function activarDrag(){
  const cancha=document.getElementById("canchaContainer");
  document.querySelectorAll(".jugador").forEach(j=>{
    j.addEventListener("dragstart",e=>{
      e.dataTransfer.setData("nombre",j.dataset.nombre);
      e.dataTransfer.setData("html",j.outerHTML);
    });
  });
  cancha.ondragover=e=>e.preventDefault();
  cancha.ondrop=e=>{
    e.preventDefault();
    const html=e.dataTransfer.getData("html");
    const nodo=document.createElement("div");
    nodo.innerHTML=html;
    const j=nodo.firstChild;
    j.style.position="absolute";
    j.style.left=(e.offsetX-25)+"px";
    j.style.top=(e.offsetY-25)+"px";
    cancha.appendChild(j);
    guardarPosiciones();
  };
  restaurarPosiciones();
}

function guardarPosiciones(){
  const pos=[];
  document.querySelectorAll("#canchaContainer .jugador").forEach(j=>{
    pos.push({html:j.outerHTML,left:j.style.left,top:j.style.top});
  });
  localStorage.setItem("posiciones",JSON.stringify(pos));
}
function restaurarPosiciones(){
  const cancha=document.getElementById("canchaContainer");
  const pos=JSON.parse(localStorage.getItem("posiciones")||"[]");
  cancha.innerHTML="";
  pos.forEach(p=>{
    const d=document.createElement("div");
    d.innerHTML=p.html;
    const j=d.firstChild;
    j.style.position="absolute";
    j.style.left=p.left; j.style.top=p.top;
    cancha.appendChild(j);
  });
}

document.getElementById("resetBtn").onclick=()=>{
  localStorage.removeItem("posiciones");
  document.getElementById("canchaContainer").innerHTML="";
};

// --------- Formulario Agregar Jugador ----------
document.getElementById("addPlayerForm").onsubmit=function(e){
  e.preventDefault();
  const nuevo={
    nombre:nombre.value.trim(),
    club:club.value.trim(),
    escudo:escudo.value.trim(),
    tab:tab.value
  };
  todosJugadores.push(nuevo);
  const csv=Papa.unparse(todosJugadores);
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="jugadores_actualizado.csv";
  link.click();
  filtrarJugadores(tab.value);
  this.reset();
};
