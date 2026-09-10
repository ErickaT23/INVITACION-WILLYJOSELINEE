(function () {
    const config = window.config || {};
    const eventConfig = config.event || {};
    const adminConfig = config.admin || {};
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get(eventConfig.eventIdParam || "eventId") || eventConfig.defaultEventId;
    const providedKey = params.get(adminConfig.keyParam || "key");
    const state = { guests: new Map(), confirmations: new Map(), rows: [], qr: null };

    function byId(id) { return document.getElementById(id); }

    function waitForDatabase(timeout = 8000) {
        return new Promise((resolve, reject) => {
            const startedAt = Date.now();
            const timer = window.setInterval(() => {
                if (window.RSVPDatabase) {
                    window.clearInterval(timer);
                    resolve(window.RSVPDatabase);
                } else if (Date.now() - startedAt > timeout) {
                    window.clearInterval(timer);
                    reject(new Error("Firebase no disponible"));
                }
            }, 50);
        });
    }

    function setStatus(text, error = false) {
        const element = byId("admin-status");
        element.textContent = text;
        element.style.color = error ? "#a23d3d" : "#746d67";
    }

    function localGuests() {
        return Object.values(window.LocalGuestSeeds && window.LocalGuestSeeds[eventId] || {});
    }

    function normalizeResponse(value) {
        return value === "si" || value === "no" ? value : "pendiente";
    }

    function buildRows() {
        const rows = [];
        state.guests.forEach(guest => {
            const confirmation = state.confirmations.get(guest.id);
            rows.push({
                ...guest,
                respuesta: normalizeResponse(confirmation && confirmation.respuesta),
                cantidadConfirmada: Number(confirmation && confirmation.cantidadConfirmada) || 0,
                fechaConfirmacion: Number(confirmation && confirmation.fechaConfirmacion) || null
            });
        });
        state.rows = rows.sort((a, b) => String(a.id).localeCompare(String(b.id), "es", { numeric: true }));
        return state.rows;
    }

    function formatDate(timestamp) {
        if (!timestamp) return "--";
        return new Date(timestamp).toLocaleString("es-GT", { dateStyle: "short", timeStyle: "short" });
    }

    function createButton(text, className, onClick) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `button small ${className || ""}`.trim();
        button.textContent = text;
        button.addEventListener("click", onClick);
        return button;
    }

    function inviteUrl(guestId) {
        const basePath = window.location.pathname.replace(/admin\.html$/, "");
        const url = new URL(basePath || "/", window.location.origin);
        url.searchParams.set("id", guestId);
        return url.toString();
    }

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
    }

    function showQr(row) {
        const container = byId("qr-container");
        container.replaceChildren();
        byId("qr-name").textContent = row.nombre;
        state.qr = row;
        new window.QRCode(container, { text: inviteUrl(row.id), width: 210, height: 210 });
        byId("qr-modal").classList.remove("hidden");
    }

    function downloadQr() {
        if (!state.qr) return;
        const container = byId("qr-container");
        const canvas = container.querySelector("canvas");
        const image = container.querySelector("img");
        const href = canvas ? canvas.toDataURL("image/png") : image && image.src;
        if (!href) return;
        const link = document.createElement("a");
        link.href = href;
        link.download = `qr-${state.qr.id}-${state.qr.nombre.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
        link.click();
    }

    function safeFileName(value) {
        return String(value || "invitado")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "invitado";
    }

    function createQrDataUrl(text) {
        return new Promise((resolve, reject) => {
            const container = document.createElement("div");
            container.style.position = "fixed";
            container.style.left = "-9999px";
            document.body.appendChild(container);
            new window.QRCode(container, { text, width: 210, height: 210 });

            window.setTimeout(() => {
                const canvas = container.querySelector("canvas");
                const image = container.querySelector("img");
                const dataUrl = canvas ? canvas.toDataURL("image/png") : image && image.src;
                container.remove();
                if (dataUrl) resolve(dataUrl);
                else reject(new Error("No se pudo generar el código QR"));
            }, 80);
        });
    }

    async function downloadAllQrs() {
        const rows = state.rows.filter(row => row.activo !== false);
        if (!rows.length) {
            setStatus("No hay invitados activos para generar QR.", true);
            return;
        }
        if (!window.QRCode || !window.JSZip) {
            setStatus("No se cargaron las librerías necesarias para generar el ZIP.", true);
            return;
        }

        const button = byId("download-all-qrs");
        const zip = new window.JSZip();
        button.disabled = true;

        try {
            for (let index = 0; index < rows.length; index += 1) {
                const row = rows[index];
                setStatus(`Generando QR ${index + 1} de ${rows.length}...`);
                const dataUrl = await createQrDataUrl(inviteUrl(row.id));
                zip.file(`qr_${safeFileName(row.nombre)}-${safeFileName(row.id)}.png`, dataUrl.split(",")[1], { base64: true });
            }

            setStatus("Comprimiendo códigos QR...");
            const blob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `qrs-${eventId}.zip`;
            link.click();
            URL.revokeObjectURL(url);
            setStatus("Todos los códigos QR fueron descargados.");
        } catch (error) {
            console.error("Error al generar QR:", error);
            setStatus("No se pudieron generar todos los códigos QR.", true);
        } finally {
            button.disabled = false;
        }
    }

    async function editGuest(row, database) {
        const nombre = window.prompt("Nombre del invitado", row.nombre);
        if (nombre === null) return;
        const passesInput = window.prompt("Número de pases", String(row.pases));
        if (passesInput === null) return;
        const pases = Number(passesInput);
        if (!nombre.trim() || !Number.isInteger(pases) || pases < 1) {
            setStatus("Nombre o número de pases inválido.", true);
            return;
        }
        await database.saveInvitado(eventId, { ...row, nombre: nombre.trim(), pases });
        setStatus("Invitado actualizado.");
    }

    function render(database) {
        const rows = buildRows();
        const activeRows = rows.filter(row => row.activo !== false);
        byId("metric-total").textContent = activeRows.length;
        byId("metric-yes").textContent = activeRows.filter(row => row.respuesta === "si").length;
        byId("metric-no").textContent = activeRows.filter(row => row.respuesta === "no").length;
        byId("metric-pending").textContent = activeRows.filter(row => row.respuesta === "pendiente").length;
        byId("metric-people").textContent = activeRows.reduce((total, row) => total + (row.respuesta === "si" ? row.cantidadConfirmada : 0), 0);

        const tbody = byId("admin-table");
        tbody.replaceChildren();
        rows.forEach(row => {
            const tr = document.createElement("tr");
            if (row.activo === false) tr.className = "inactive";
            const values = [row.id, row.nombre, row.pases];
            values.forEach(value => {
                const td = document.createElement("td");
                td.textContent = value;
                tr.appendChild(td);
            });

            const responseTd = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = `badge ${row.respuesta}`;
            badge.textContent = row.respuesta === "si" ? "Confirmado" : row.respuesta === "no" ? "No asistirá" : "Pendiente";
            responseTd.appendChild(badge);

            const confirmedTd = document.createElement("td");
            confirmedTd.textContent = row.respuesta === "pendiente" ? "--" : row.cantidadConfirmada;
            const dateTd = document.createElement("td");
            dateTd.textContent = formatDate(row.fechaConfirmacion);
            const actionsTd = document.createElement("td");
            actionsTd.className = "row-actions";
            actionsTd.append(
                createButton("Link", "secondary", async () => {
                    await copyText(inviteUrl(row.id));
                    setStatus(`Enlace de ${row.nombre} copiado.`);
                }),
                createButton("QR", "secondary", () => showQr(row))
            );
            if (row.activo !== false) {
                actionsTd.append(
                    createButton("Editar", "secondary", () => editGuest(row, database).catch(error => setStatus(error.message, true))),
                    createButton("Desactivar", "danger", async () => {
                        if (!window.confirm(`¿Desactivar a ${row.nombre}?`)) return;
                        await database.deactivateInvitado(eventId, row);
                    })
                );
            } else {
                actionsTd.append(createButton("Reactivar", "secondary", () => database.saveInvitado(eventId, { ...row, activo: true })));
            }
            tr.append(responseTd, confirmedTd, dateTd, actionsTd);
            tbody.appendChild(tr);
        });
        setStatus(`Sincronizado en tiempo real. ${rows.length} registros.`);
    }

    function exportCsv() {
        const lines = [["ID", "Nombre", "Pases", "Respuesta", "Confirmados", "Fecha"]];
        state.rows.forEach(row => lines.push([row.id, row.nombre, row.pases, row.respuesta, row.cantidadConfirmada, formatDate(row.fechaConfirmacion)]));
        const csv = "\uFEFF" + lines.map(line => line.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        link.download = `rsvp-${eventId}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    async function init() {
        if (!providedKey || providedKey !== adminConfig.adminKey) {
            byId("restricted").classList.remove("hidden");
            return;
        }
        byId("admin-app").classList.remove("hidden");
        byId("event-name").textContent = eventId;
        byId("dashboard-link").href = "/dashboard";

        try {
            const database = await waitForDatabase();
            localGuests().forEach(guest => state.guests.set(String(guest.id), guest));
            render(database);

            database.subscribeToInvitados(eventId, remoteGuests => {
                remoteGuests.forEach(guest => state.guests.set(String(guest.id), guest));
                render(database);
            }, error => setStatus(`Error de invitados: ${error.message}`, true));

            database.subscribeToConfirmations(eventId, confirmations => {
                state.confirmations.clear();
                confirmations.forEach(item => state.confirmations.set(String(item.id), item));
                render(database);
            }, error => setStatus(`Error de confirmaciones: ${error.message}`, true));

            byId("toggle-form").addEventListener("click", () => byId("guest-form").classList.toggle("hidden"));
            byId("guest-form").addEventListener("submit", async event => {
                event.preventDefault();
                const numericIds = Array.from(state.guests.keys()).filter(id => /^\d+$/.test(id)).map(Number);
                const id = String((numericIds.length ? Math.max(...numericIds) : 0) + 1);
                await database.saveInvitado(eventId, {
                    id,
                    nombre: byId("guest-name").value.trim(),
                    pases: Number(byId("guest-passes").value),
                    genero: byId("guest-gender").value,
                    activo: true
                });
                event.target.reset();
                byId("guest-form").classList.add("hidden");
            });

            byId("copy-all").addEventListener("click", async () => {
                const text = state.rows.filter(row => row.activo !== false).map(row => `${row.nombre} - ${inviteUrl(row.id)}`).join("\n");
                await copyText(text);
                setStatus("Todos los enlaces activos fueron copiados.");
            });
            byId("export-admin").addEventListener("click", exportCsv);
            byId("download-all-qrs").addEventListener("click", downloadAllQrs);
            byId("close-qr").addEventListener("click", () => byId("qr-modal").classList.add("hidden"));
            byId("download-qr").addEventListener("click", downloadQr);
        } catch (error) {
            setStatus(`No se pudo iniciar el panel: ${error.message}`, true);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
})();
