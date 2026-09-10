import { subscribeToConfirmations, subscribeToInvitados } from "./database.js";

const params = new URLSearchParams(window.location.search);
const eventId = params.get(window.config.event.eventIdParam) || window.config.event.defaultEventId;
const state = { guests: new Map(), confirmations: new Map(), rows: [], filter: "todos", search: "" };

function byId(id) { return document.getElementById(id); }

function normalizeText(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function dateParts(timestamp) {
    if (!timestamp) return { date: "--", time: "--" };
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return { date: "--", time: "--" };
    return {
        date: date.toLocaleDateString("es-GT", { day: "2-digit", month: "2-digit", year: "2-digit" }),
        time: date.toLocaleTimeString("es-GT", { hour: "numeric", minute: "2-digit", hour12: true })
    };
}

function formatDate(timestamp) {
    const parts = dateParts(timestamp);
    return parts.date === "--" ? "--" : `${parts.date} ${parts.time}`;
}

function responseLabel(response) {
    if (response === "si") return "Confirmado";
    if (response === "no") return "No asistirá";
    return "Pendiente";
}

function buildRows() {
    const rows = [];
    state.guests.forEach(guest => {
        if (guest.activo === false) return;
        const confirmation = state.confirmations.get(String(guest.id));
        const response = confirmation && ["si", "no"].includes(confirmation.respuesta)
            ? confirmation.respuesta
            : "pendiente";
        rows.push({
            id: String(guest.id),
            nombre: guest.nombre || guest.name || "Invitado",
            pases: Math.max(1, Number(guest.pases || guest.passes) || 1),
            respuesta: response,
            cantidadConfirmada: response === "si" ? Number(confirmation.cantidadConfirmada) || 0 : 0,
            fechaConfirmacion: confirmation && Number(confirmation.fechaConfirmacion) || null
        });
    });
    state.rows = rows.sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true }));
}

function setSummary() {
    byId("summary-total-guests").textContent = state.rows.length;
    byId("summary-yes").textContent = state.rows.filter(row => row.respuesta === "si").length;
    byId("summary-no").textContent = state.rows.filter(row => row.respuesta === "no").length;
    byId("summary-pending").textContent = state.rows.filter(row => row.respuesta === "pendiente").length;
    byId("summary-confirmed-people").textContent = state.rows.reduce((total, row) => total + row.cantidadConfirmada, 0);
}

function visibleRows() {
    return state.rows.filter(row => {
        if (state.filter !== "todos" && row.respuesta !== state.filter) return false;
        return normalizeText(row.nombre).includes(normalizeText(state.search));
    });
}

function createBadge(response) {
    const badge = document.createElement("span");
    badge.className = `status-badge status-badge--${response}`;
    badge.textContent = responseLabel(response);
    return badge;
}

function renderDesktop(rows) {
    const tbody = byId("confirmations-table-body");
    tbody.replaceChildren();
    if (!rows.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.className = "empty-state";
        td.colSpan = 6;
        td.textContent = "No hay registros para mostrar.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    rows.forEach(row => {
        const tr = document.createElement("tr");
        const idCell = document.createElement("td");
        idCell.className = "id-cell";
        idCell.textContent = `#${row.id}`;
        const nameCell = document.createElement("td");
        nameCell.className = "name-cell";
        nameCell.textContent = row.nombre;
        const passesCell = document.createElement("td");
        passesCell.textContent = row.pases;
        const responseCell = document.createElement("td");
        responseCell.appendChild(createBadge(row.respuesta));
        const confirmedCell = document.createElement("td");
        confirmedCell.textContent = row.respuesta === "pendiente" ? "--" : row.cantidadConfirmada;
        const dateCell = document.createElement("td");
        dateCell.className = "date-cell";
        const parts = dateParts(row.fechaConfirmacion);
        const date = document.createElement("span");
        date.className = "date-main";
        date.textContent = parts.date;
        const time = document.createElement("span");
        time.className = "date-sub";
        time.textContent = parts.time;
        dateCell.append(date, time);
        tr.append(idCell, nameCell, passesCell, responseCell, confirmedCell, dateCell);
        tbody.appendChild(tr);
    });
}

function cardLine(label, value) {
    const line = document.createElement("div");
    line.className = "confirmation-card-line";
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const valueElement = document.createElement("strong");
    valueElement.textContent = value;
    line.append(labelElement, valueElement);
    return line;
}

function renderMobile(rows) {
    const container = byId("confirmations-mobile-list");
    container.replaceChildren();
    if (!rows.length) {
        const empty = document.createElement("div");
        empty.className = "mobile-empty-state";
        empty.textContent = "No hay registros para mostrar.";
        container.appendChild(empty);
        return;
    }

    rows.forEach(row => {
        const card = document.createElement("article");
        card.className = "confirmation-card";
        const title = document.createElement("h3");
        title.className = "confirmation-card-name";
        const id = document.createElement("span");
        id.className = "confirmation-card-id-inline";
        id.textContent = `#${row.id}`;
        title.append(id, document.createTextNode(` · ${row.nombre}`));
        const status = document.createElement("div");
        status.className = "confirmation-card-status";
        status.appendChild(createBadge(row.respuesta));
        const details = document.createElement("div");
        details.className = "confirmation-card-details";
        const parts = dateParts(row.fechaConfirmacion);
        details.append(
            cardLine("Pases", row.pases),
            cardLine("Pases confirmados", row.respuesta === "pendiente" ? "--" : row.cantidadConfirmada),
            cardLine("Fecha de confirmación", parts.date),
            cardLine("Hora de confirmación", parts.time)
        );
        card.append(title, status, details);
        container.appendChild(card);
    });
}

function render() {
    buildRows();
    setSummary();
    const rows = visibleRows();
    renderDesktop(rows);
    renderMobile(rows);
    byId("dashboard-export").disabled = rows.length === 0;
    byId("dashboard-status").textContent = `Sincronizado en tiempo real. Mostrando ${rows.length} de ${state.rows.length}.`;
}

function csvValue(value) {
    return `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
}

function exportCsv() {
    const lines = [["ID", "Nombre", "Pases", "Respuesta", "Confirmados", "Fecha"]];
    visibleRows().forEach(row => lines.push([row.id, row.nombre, row.pases, responseLabel(row.respuesta), row.cantidadConfirmada, formatDate(row.fechaConfirmacion)]));
    const content = "\uFEFF" + lines.map(line => line.map(csvValue).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `confirmaciones-${eventId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

function syncFilterButtons() {
    document.querySelectorAll(".filter-chip").forEach(button => {
        const active = button.dataset.filter === state.filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
    });
}

document.addEventListener("DOMContentLoaded", () => {
    byId("dashboard-event-current").textContent = `Evento activo: ${eventId}`;
    Object.values(window.LocalGuestSeeds && window.LocalGuestSeeds[eventId] || {}).forEach(guest => state.guests.set(String(guest.id), guest));
    render();

    byId("dashboard-search").addEventListener("input", event => {
        state.search = event.target.value;
        render();
    });
    byId("dashboard-clear").addEventListener("click", () => {
        state.search = "";
        state.filter = "todos";
        byId("dashboard-search").value = "";
        syncFilterButtons();
        render();
    });
    document.querySelectorAll(".filter-chip").forEach(button => {
        button.addEventListener("click", () => {
            state.filter = button.dataset.filter;
            syncFilterButtons();
            render();
        });
    });
    byId("dashboard-export").addEventListener("click", exportCsv);

    subscribeToInvitados(eventId, guests => {
        state.guests.clear();
        guests.forEach(guest => state.guests.set(String(guest.id), guest));
        render();
    }, error => {
        byId("dashboard-status").textContent = `Error al leer invitados: ${error.message}`;
    });
    subscribeToConfirmations(eventId, confirmations => {
        state.confirmations.clear();
        confirmations.forEach(confirmation => state.confirmations.set(String(confirmation.id), confirmation));
        render();
    }, error => {
        byId("dashboard-status").textContent = `Error al leer confirmaciones: ${error.message}`;
    });
});
