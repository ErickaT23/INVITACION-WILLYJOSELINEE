const guests = [
    { id: "1", name: "Ada Olivares", passes: 1, gender: "femenino" },
    { id: "2", name: "Alexander Sucuqui", passes: 1, gender: "masculino" },
    { id: "3", name: "Alexis Zapeta y Esposa", passes: 2, gender: "mixto" },
    { id: "4", name: "Ana Arzú", passes: 1, gender: "femenino" },
    { id: "5", name: "Anthony Pérez", passes: 1, gender: "masculino" },
    { id: "6", name: "Ariel Pérez", passes: 1, gender: "masculino" },
    { id: "7", name: "Bryan Quevedo", passes: 1, gender: "masculino" },
    { id: "8", name: "Cony Castellanos", passes: 1, gender: "femenino" },
    { id: "9", name: "Diego y Fabiola", passes: 2, gender: "mixto" },
    { id: "10", name: "Dilan y Darian", passes: 2, gender: "mixto" },
    { id: "11", name: "Domingo Tuch y esposa", passes: 2, gender: "mixto" },
    { id: "12", name: "Estuardo Pérez", passes: 1, gender: "masculino" },
    { id: "13", name: "Fam. Ajín Hernández", passes: 5, gender: "fam" },
    { id: "14", name: "Fam. Arias Hernández", passes: 2, gender: "fam" },
    { id: "15", name: "Fam. Baltodano Zapeta", passes: 3, gender: "fam" },
    { id: "16", name: "Fam. Barrientos Corona", passes: 4, gender: "fam" },
    { id: "17", name: "Fam. Barrios Barrientos", passes: 4, gender: "fam" },
    { id: "18", name: "Fam. Barrios Vega", passes: 4, gender: "fam" },
    { id: "19", name: "Fam. Cabrera Xinico", passes: 4, gender: "fam" },
    { id: "20", name: "Fam. Carranza Tamat", passes: 2, gender: "fam" },
    { id: "21", name: "Fam. Castellanos Valdez", passes: 2, gender: "fam" },
    { id: "22", name: "Fam. Chamale Coy", passes: 2, gender: "fam" },
    { id: "23", name: "Fam. Chicojay Castellanos", passes: 4, gender: "fam" },
    { id: "24", name: "Fam. Corado Salguero", passes: 5, gender: "fam" },
    { id: "25", name: "Fam. Corona Abaj", passes: 3, gender: "fam" },
    { id: "26", name: "Fam. Corona González", passes: 2, gender: "fam" },
    { id: "27", name: "Fam. Corona Lemus", passes: 4, gender: "fam" },
    { id: "28", name: "Fam. Coti Bosarreyes", passes: 2, gender: "fam" },
    { id: "29", name: "Fam. Coy Santos", passes: 4, gender: "fam" },
    { id: "30", name: "Fam. Escobar Villalobos", passes: 2, gender: "fam" },
    { id: "31", name: "Fam. García Pelén", passes: 3, gender: "fam" },
    { id: "32", name: "Fam. Golón Mijangos", passes: 3, gender: "fam" },
    { id: "33", name: "Fam. Golón Vega", passes: 3, gender: "fam" },
    { id: "34", name: "Fam. Gómez Vásquez", passes: 2, gender: "fam" },
    { id: "35", name: "Fam. González López", passes: 3, gender: "fam" },
    { id: "36", name: "Fam. López Cruz", passes: 3, gender: "fam" },
    { id: "37", name: "Fam. López Galindo", passes: 3, gender: "fam" },
    { id: "38", name: "Fam. López González", passes: 5, gender: "fam" },
    { id: "39", name: "Fam. López López", passes: 4, gender: "fam" },
    { id: "40", name: "Fam. López Muralles", passes: 4, gender: "fam" },
    { id: "41", name: "Fam. López Sequén", passes: 4, gender: "fam" },
    { id: "42", name: "Fam. López Vega", passes: 3, gender: "fam" },
    { id: "43", name: "Fam. López Zuleta", passes: 2, gender: "fam" },
    { id: "44", name: "Fam. López Zuñiga", passes: 2, gender: "fam" },
    { id: "45", name: "Fam. Medio Gómez", passes: 2, gender: "fam" },
    { id: "46", name: "Fam. Morales Vásquez", passes: 4, gender: "fam" },
    { id: "47", name: "Fam. Muralles López", passes: 2, gender: "fam" },
    { id: "48", name: "Fam. Pereira Godoy", passes: 3, gender: "fam" },
    { id: "49", name: "Fam. Ramírez Corona", passes: 4, gender: "fam" },
    { id: "50", name: "Fam. Roquel Coy", passes: 2, gender: "fam" },
    { id: "51", name: "Fam. Ruíz Monzón", passes: 3, gender: "fam" },
    { id: "52", name: "Fam. Sánchez López", passes: 5, gender: "fam" },
    { id: "53", name: "Fam. Trigueros Caceres", passes: 3, gender: "fam" },
    { id: "54", name: "Fam. Vega", passes: 3, gender: "fam" },
    { id: "55", name: "Fam. Vega Bosarreyes", passes: 2, gender: "fam" },
    { id: "56", name: "Fam. Vicente Valdez", passes: 2, gender: "fam" },
    { id: "57", name: "Fam. Zapeta Corona", passes: 3, gender: "fam" },
    { id: "58", name: "Fam. Zapeta González", passes: 4, gender: "fam" },
    { id: "59", name: "Fam. Zapeta Sical", passes: 2, gender: "fam" },
    { id: "60", name: "Fam. Zapeta Sutuj", passes: 2, gender: "fam" },
    { id: "61", name: "Francisco Bosarreyes", passes: 1, gender: "mixto" },
    { id: "62", name: "Francisco Vega", passes: 1, gender: "mixto" },
    { id: "63", name: "Gregoria Martinez e hijos", passes: 3, gender: "mixto" },
    { id: "64", name: "José López", passes: 1, gender: "mixto" },
    { id: "65", name: "Josué Mendoza", passes: 1, gender: "mixto" },
    { id: "66", name: "Juan José Alvarado", passes: 1, gender: "mixto" },
    { id: "67", name: "Lesli Bobadilla", passes: 1, gender: "mixto" },
    { id: "68", name: "Luis y Claudia", passes: 2, gender: "mixto" },
    { id: "69", name: "Miguel y Jacky", passes: 2, gender: "mixto" },
    { id: "70", name: "Neftalí Corona y Esposa", passes: 2, gender: "mixto" },
    { id: "71", name: "Nelson y Sheyla", passes: 2, gender: "mixto" },
    { id: "72", name: "Noé Rojas", passes: 1, gender: "mixto" },
    { id: "73", name: "Nohemí y Gerardo", passes: 2, gender: "mixto" },
    { id: "74", name: "Paty Reyes e hijas", passes: 3, gender: "femenino" },
    { id: "75", name: "Raquel Vega e hijos", passes: 6, gender: "mixto" },
    { id: "76", name: "Reginaldo y Libny", passes: 2, gender: "mixto" },
    { id: "77", name: "Ruth Vásquez", passes: 1, gender: "femenino" },
    { id: "78", name: "Samuel Zapeta", passes: 1, gender: "mixto" },
    { id: "79", name: "Sergio y Lupe", passes: 2, gender: "mixto" },
    { id: "80", name: "Silvia y Andrea Castellanos", passes: 2, gender: "femenino" },
    { id: "81", name: "Vero Bosarreyes", passes: 1, gender: "femenino" },
    { id: "82", name: "Victor Cundini", passes: 1, gender: "mixto" },
    { id: "83", name: "Yeimy y Celeste", passes: 2, gender: "femenino" },
    { id: "84", name: "Marleny Chicojay", passes: 1, gender: "femenino" },
    { id: "85", name: "Leonardo Estrada", passes: 1, gender: "masculino" },
    { id: "86", name: "Segio y Lupe", passes: 2, gender: "mixto" },
    { id: "87", name: "Lesbia Vega", passes: 1, gender: "femenino" },
    { id: "88", name: "Fam. Leonardo Estrada", passes: 2, gender: "mixto" },
    { id: "89", name: "Fátima Fuentes", passes: 1, gender: "femenino" },
    { id: "90", name: "Daniel y Geraldine", passes: 2, gender: "mixto" },
    { id: "91", name: "Jose Chic", passes: 1, gender: "masculino" }
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
    const isFallbackGuest = guest.name === "Invitado";
    const isFamily = /^fam(?:ilia)?\.?\b/i.test(guest.name.trim());
    const greeting = isFallbackGuest
        ? "Invitado"
        : isFamily
        ? "Querida"
        : (guest.passes > 1
            ? (guest.gender.toLowerCase() === "femenino" ? "Queridas" : "Queridos")
            : (guest.gender.toLowerCase() === "femenino" ? "Querida" : "Querido"));
    const greetingEl = document.getElementById("guestCardGreeting");
    const nameEl = document.getElementById("guestCardName");
    const rsvpNameEl = document.getElementById("rsvpNombre");
    const passesInfoEl = document.getElementById("rsvpPassesInfo");
    const guestsSelectEl = document.getElementById("rsvpGuests");

    if (greetingEl) greetingEl.textContent = greeting;
    if (nameEl) nameEl.textContent = isFallbackGuest ? "" : guest.name;
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

    if (!guestId) {
        setCurrentGuest(null);
        return;
    }

    try {
        const database = await waitForDatabase();
        const eventId = window.config.event.defaultEventId;
        const remoteGuest = await database.getInvitadoById(eventId, guestId);
        // Firebase contains the latest changes made from the admin panel.
        if (remoteGuest) {
            setCurrentGuest(remoteGuest);
        } else if (localGuest) {
            setCurrentGuest(localGuest);
        } else {
            setCurrentGuest({ id: guestId, name: "Invitado", passes: 1, gender: "mixto" });
        }
    } catch (error) {
        console.warn("No se pudo consultar el invitado en Firebase:", error);
        if (localGuest) setCurrentGuest(localGuest);
        else setCurrentGuest({ id: guestId, name: "Invitado", passes: 1, gender: "mixto" });
    }
});
