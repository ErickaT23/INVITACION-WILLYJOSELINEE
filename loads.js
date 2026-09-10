const guests = [
    { id: "1", name: "Andrea López", passes: 1, gender: "femenino" },
    { id: "2", name: "Carlos Méndez", passes: 1, gender: "masculino" },
    { id: "3", name: "Familia Herrera", passes: 4, gender: "mixto" },
    { id: "4", name: "Sofía Ramírez y acompañante", passes: 2, gender: "femenino" },
    { id: "5", name: "Luis y Fernanda", passes: 2, gender: "mixto" }
];

window.guests = guests;
window.LocalGuestSeeds = {
    ...(window.LocalGuestSeeds || {}),
    "wilson-joselinee-2027": guests.reduce((directory, guest) => {
        directory[guest.id] = {
            id: guest.id,
            nombre: guest.name,
            pases: guest.passes,
            genero: guest.gender,
            activo: true
        };
        return directory;
    }, {})
};

function waitForDatabase(timeout = 8000) {
    return new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const timer = window.setInterval(() => {
            if (window.RSVPDatabase) {
                window.clearInterval(timer);
                resolve(window.RSVPDatabase);
                return;
            }
            if (Date.now() - startedAt > timeout) {
                window.clearInterval(timer);
                reject(new Error("RSVPDatabase no disponible"));
            }
        }, 50);
    });
}

window.seedWillJoselineeEvent = async function seedWillJoselineeEvent() {
    const database = await waitForDatabase();
    const eventId = window.config.event.defaultEventId;
    const source = Object.values(window.LocalGuestSeeds[eventId] || {});
    const result = await database.seedEventData(eventId, source);
    console.log(`Evento ${result.eventId} creado con ${result.invitadosCreados} invitados.`);
    return result;
};

function setCurrentGuest(rawGuest) {
    if (!rawGuest || rawGuest.activo === false) {
        window.currentGuest = null;
        window.dispatchEvent(new CustomEvent("guest:updated", { detail: null }));
        return;
    }

    window.currentGuest = {
        id: String(rawGuest.id),
        name: String(rawGuest.name || rawGuest.nombre || "Invitado").trim() || "Invitado",
        passes: Math.max(1, Number(rawGuest.passes || rawGuest.pases) || 1),
        gender: String(rawGuest.gender || rawGuest.genero || "mixto")
    };

    const guest = window.currentGuest;
    const greeting = guest.passes > 1
        ? "Queridos"
        : (guest.gender === "femenino" ? "Querida" : "Querido");
    const greetingEl = document.getElementById("guestCardGreeting");
    const nameEl = document.getElementById("guestCardName");
    const rsvpNameEl = document.getElementById("rsvpNombre");
    const passesInfoEl = document.getElementById("rsvpPassesInfo");
    const guestsSelectEl = document.getElementById("rsvpGuests");

    if (greetingEl) greetingEl.textContent = greeting;
    if (nameEl) nameEl.textContent = guest.name;
    if (rsvpNameEl) rsvpNameEl.value = guest.name;
    if (passesInfoEl) passesInfoEl.textContent = `${guest.passes} ${guest.passes === 1 ? "pase" : "pases"}`;
    if (guestsSelectEl) {
        guestsSelectEl.innerHTML = Array.from({ length: guest.passes }, (_, index) => {
            const value = index + 1;
            return `<option value="${value}">${value}</option>`;
        }).join("");
    }

    window.dispatchEvent(new CustomEvent("guest:updated", { detail: guest }));
}

document.addEventListener("DOMContentLoaded", async () => {
    const guestId = new URLSearchParams(window.location.search).get("id");
    const localGuest = guests.find(guest => guest.id === guestId);

    if (localGuest) setCurrentGuest(localGuest);
    if (!guestId) {
        setCurrentGuest(null);
        return;
    }

    try {
        const database = await waitForDatabase();
        const eventId = window.config.event.defaultEventId;
        const remoteGuest = await database.getInvitadoById(eventId, guestId);
        if (remoteGuest) {
            setCurrentGuest(remoteGuest);
        } else if (!localGuest) {
            setCurrentGuest(null);
        }
    } catch (error) {
        console.warn("No se pudo consultar el invitado en Firebase:", error);
        if (!localGuest) setCurrentGuest(null);
    }
});
