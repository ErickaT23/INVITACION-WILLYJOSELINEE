import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, get, onValue, ref, runTransaction, set } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAqOZQ5YFOdhL6dblHI5wIx10m6n4xt2Fg",
    authDomain: "buenosdeseos-twodesign.firebaseapp.com",
    databaseURL: "https://buenosdeseos-twodesign-default-rtdb.firebaseio.com",
    projectId: "buenosdeseos-twodesign",
    storageBucket: "buenosdeseos-twodesign.firebasestorage.app",
    messagingSenderId: "577908051871",
    appId: "1:577908051871:web:27fbd4e06b3d18da14b7aa"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function sanitizeKey(value) {
    return (String(value || "").trim() || "default").replace(/[.#$\[\]/]/g, "_");
}

function resolveEventId(explicitEventId) {
    const configured = window.config && window.config.event && window.config.event.defaultEventId;
    return sanitizeKey(explicitEventId || configured || "wilson-joselinee-2027");
}

function eventPath(eventId, section) {
    return `eventos/${resolveEventId(eventId)}/${section}`;
}

function snapshotToArray(snapshot) {
    if (!snapshot.exists()) return [];
    return Object.entries(snapshot.val() || {}).map(([key, value]) => ({
        ...(value && typeof value === "object" ? value : {}),
        _key: key
    }));
}

function normalizeGuest(raw, fallbackId) {
    const id = String(raw && raw.id || fallbackId || "").trim();
    if (!id) return null;
    return {
        id,
        nombre: String(raw && (raw.nombre || raw.name) || "Invitado").trim() || "Invitado",
        pases: Math.max(1, Number(raw && (raw.pases || raw.passes)) || 1),
        genero: String(raw && (raw.genero || raw.gender) || "mixto").trim() || "mixto",
        activo: raw && typeof raw.activo !== "undefined" ? Boolean(raw.activo) : true
    };
}

async function getInvitadoById(eventId, guestId) {
    const snapshot = await get(ref(db, `${eventPath(eventId, "invitados")}/${sanitizeKey(guestId)}`));
    if (!snapshot.exists()) return null;
    return normalizeGuest(snapshot.val(), guestId);
}

async function saveInvitado(eventId, guest) {
    const record = normalizeGuest(guest, guest && guest.id);
    if (!record || !record.nombre) throw new Error("INVITADO_INVALIDO");
    await set(ref(db, `${eventPath(eventId, "invitados")}/${sanitizeKey(record.id)}`), record);
    return record;
}

async function deactivateInvitado(eventId, guest) {
    return saveInvitado(eventId, { ...guest, activo: false });
}

async function seedEventData(eventId, guests) {
    const resolvedEventId = resolveEventId(eventId);
    const source = Array.isArray(guests) ? guests : [];
    const records = source.map((guest, index) => normalizeGuest(guest, guest && guest.id || index + 1)).filter(Boolean);

    await set(ref(db, eventPath(resolvedEventId, "config")), {
        nombres: window.config && window.config.pareja && window.config.pareja.nombres || "Wilson & Joselinee",
        fecha: window.config && window.config.pareja && window.config.pareja.fechaVisible || "16.01.2027",
        actualizadoEn: Date.now()
    });
    await Promise.all(records.map(guest => saveInvitado(resolvedEventId, guest)));

    return { ok: true, eventId: resolvedEventId, invitadosCreados: records.length };
}

async function saveConfirmation(eventId, payload) {
    const guestId = String(payload && payload.id || "").trim();
    if (!guestId) throw new Error("INVITADO_ID_REQUERIDO");

    const record = {
        id: guestId,
        nombre: String(payload.nombre || "Invitado").trim() || "Invitado",
        pasesAsignados: Math.max(1, Number(payload.pasesAsignados) || 1),
        respuesta: payload.respuesta === "no" ? "no" : "si",
        cantidadConfirmada: payload.respuesta === "no" ? 0 : Math.max(1, Number(payload.cantidadConfirmada) || 1),
        confirmado: true,
        fechaConfirmacion: Date.now()
    };

    const target = ref(db, `${eventPath(eventId, "rsvp")}/${sanitizeKey(guestId)}`);
    const result = await runTransaction(target, current => {
        if (current && current.confirmado) return;
        return record;
    }, { applyLocally: false });

    if (!result.committed) {
        const error = new Error("RSVP_ALREADY_CONFIRMED");
        error.code = "RSVP_ALREADY_CONFIRMED";
        throw error;
    }
    return result.snapshot.val();
}

function subscribeToInvitados(eventId, onChange, onError) {
    return onValue(ref(db, eventPath(eventId, "invitados")), snapshot => {
        const guests = snapshotToArray(snapshot)
            .map(item => normalizeGuest(item, item._key))
            .filter(Boolean);
        onChange(guests);
    }, onError);
}

function subscribeToConfirmations(eventId, onChange, onError) {
    return onValue(ref(db, eventPath(eventId, "rsvp")), snapshot => {
        onChange(snapshotToArray(snapshot).filter(item => item.id));
    }, onError);
}

window.RSVPDatabase = {
    resolveEventId,
    getInvitadoById,
    saveInvitado,
    deactivateInvitado,
    seedEventData,
    saveConfirmation,
    subscribeToInvitados,
    subscribeToConfirmations
};

export {
    resolveEventId,
    getInvitadoById,
    saveInvitado,
    deactivateInvitado,
    seedEventData,
    saveConfirmation,
    subscribeToInvitados,
    subscribeToConfirmations
};
