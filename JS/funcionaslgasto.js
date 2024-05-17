// VARIABLES DE LOS SELECTORES
const formulario = document.getElementById('agregar-gasto');
const listadogasto = document.querySelector('#gastos ul');
const btnGastoMayor = document.getElementById('btn-gasto-mayor');

// Crear los eventos
EventListener();

function EventListener() {
    document.addEventListener('DOMContentLoaded', Preguntarpresupuesto);
    formulario.addEventListener('submit', agregarGasto);
    listadogasto.addEventListener('click', eliminarGasto);
    btnGastoMayor.addEventListener('click', gastoMayor);
}

// Clases
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter(gasto => gasto.id.toString() !== id.toString());
        this.calcularRestante();
    }

    gastoMayor() {
        if (this.gastos.length === 0) {
            return null;
        }

        let gastoMayor = this.gastos[0];
        this.gastos.forEach(gasto => {
            if (gasto.cantidad > gastoMayor.cantidad) {
                gastoMayor = gasto;
            }
        });

        return gastoMayor;
    }
}

class UI {
    insertarPresupuesto(cantidad) {
        document.querySelector('#total').textContent = cantidad.presupuesto;
        document.querySelector('#restante').textContent = cantidad.restante;
    }

    imprimirAlerta(mensaje, tipo) {
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if (tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        divMensaje.textContent = mensaje;
        document.querySelector('.gastos').insertBefore(divMensaje, formulario);

        setTimeout(() => {
            document.querySelector('.gastos .alert').remove();
        }, 5000);
    }

    agregarGastolistado(gasto) {
        this.limpiarHTML();

        gasto.forEach(gasto => {
            const { nombre, cantidad, id } = gasto;
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$ ${cantidad}</span>`;

            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.textContent = 'Borrar';
            nuevoGasto.appendChild(btnBorrar);

            listadogasto.appendChild(nuevoGasto);
        });
    }

    actualizarpresupuesto(restante) {
        document.querySelector('span#restante').textContent = restante;
    }

    comprobarpresupuesto(presupuestoobj) {
        const { presupuesto, restante } = presupuestoobj;
        const restantediv = document.querySelector('.restante');

        if ((presupuesto / 4) > restante) {
            restantediv.classList.remove('alert-success', 'alert-warning');
            restantediv.classList.add('alert-danger');
        } else if ((presupuesto / 2) > restante) {
            restantediv.classList.remove('alert-success');
            restantediv.classList.add('alert-warning');
        } else {
            restantediv.classList.remove('alert-danger', 'alert-warning');
            restantediv.classList.add('alert-success');
        }

        if (restante <= 0) {
            this.imprimirAlerta('El presupuesto está agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }

    limpiarHTML() {
        while (listadogasto.firstChild) {
            listadogasto.removeChild(listadogasto.firstChild);
        }
    }

    mostrarPresupuesto(presupuesto) {
        this.insertarPresupuesto(presupuesto);
    }
}

const ui = new UI();
let presupuesto;

function Preguntarpresupuesto() {
    const preguntar = prompt('¿Cuál es tu presupuesto?');
    if (preguntar === '' || preguntar === null || isNaN(preguntar) || preguntar <= 0) {
        alert('Presupuesto no válido. Por favor, ingresa un número mayor que 0.');
        window.location.reload();
    } else {
        presupuesto = new Presupuesto(preguntar);
        ui.insertarPresupuesto(presupuesto);
        alert(`Tu presupuesto es: $${presupuesto.presupuesto}`);
        ui.imprimirAlerta(`Tu presupuesto es: $${presupuesto.presupuesto}`, 'correcto');
    }
}

function agregarGasto(e) {
    e.preventDefault();

    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

    if (nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
    } else if (cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('Cantidad no válida', 'error');
    } else {
        const gasto = { nombre, cantidad, id: Date.now() };
        presupuesto.nuevoGasto(gasto);

        ui.imprimirAlerta('Gasto agregado correctamente', 'correcto');
        const { gastos } = presupuesto;
        ui.agregarGastolistado(gastos);
        ui.comprobarpresupuesto(presupuesto);
        ui.actualizarpresupuesto(presupuesto.restante);

        formulario.reset();
    }
}

function eliminarGasto(event) {
    if (event.target.classList.contains('borrar-gasto')) {
        const id = event.target.parentElement.dataset.id;
        presupuesto.eliminarGasto(id);
        ui.agregarGastolistado(presupuesto.gastos);
        ui.comprobarpresupuesto(presupuesto);
        ui.actualizarpresupuesto(presupuesto.restante);
    }
}

function gastoMayor() {
    const gastoMayor = presupuesto.gastoMayor();
    if (gastoMayor) {
        const mensaje = `El gasto mayor es: ${gastoMayor.nombre} - $${gastoMayor.cantidad}`;
        ui.imprimirAlerta(mensaje, 'correcto');
    } else {
        ui.imprimirAlerta('No hay gastos aún', 'error');
    }
}
