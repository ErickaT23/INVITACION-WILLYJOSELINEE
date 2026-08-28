const guests = [
    { id: "1", name: "Andrea Lopez", passes: 1, gender: "femenino" },
    { id: "2", name: "Carlos Mendez", passes: 1, gender: "masculino" },
    { id: "3", name: "Fam. Herrera", passes: 3, gender: "mixto" },
    { id: "4", name: "Sofia Ramirez", passes: 2, gender: "femenino" },
    { id: "5", name: "Luis y Fernanda", passes: 2, gender: "mixto" },
  ];  

  document.addEventListener("DOMContentLoaded", function () {
    function getQueryParams() {
      const params = {};
      const queryString = window.location.search.substring(1);
      if (!queryString) return params;
  
      const pairs = queryString.split("&");
      for (const pair of pairs) {
        const [key, value] = pair.split("=");
        params[decodeURIComponent(key)] = decodeURIComponent((value || "").replace(/\+/g, " "));
      }
      return params;
    }
  
    const queryParams = getQueryParams();
    const guestId = queryParams.id;
  
    const guest = guests.find(g => g.id === guestId);
    const guestCardNameEl = document.getElementById("guestCardName");
    const guestCardSeatsEl = document.getElementById("guestCardSeats");
    const guestCardSeatsTxtEl = document.getElementById("guestCardSeatsTxt");
    const rsvpNombreEl = document.getElementById("rsvpNombre");
    const rsvpGuestsEl = document.getElementById("rsvpGuests");
  
    if (guest) {
      // 👇 DISPONIBLE PARA script.js (WhatsApp, etc.)
      window.currentGuest = guest;
  
      let invitText = "";
  
      if (guest.passes === 1) {
        invitText = guest.gender === "femenino"
          ? `¡${guest.name}, está invitada!`
          : `¡${guest.name}, está invitado!`;
      } else {
        if (guest.gender === "femenino") {
          invitText = `¡${guest.name}, están invitadas!`;
        } else {
          invitText = `¡${guest.name}, están invitados!`;
        }
      }
  
      const guestNameEl = document.getElementById("guest-name");
      const passesEl = document.getElementById("passes");

      if (guestNameEl) guestNameEl.textContent = invitText;
      if (passesEl) passesEl.textContent = `${guest.passes} ${guest.passes === 1 ? "pase" : "pases"}`;
      if (guestCardNameEl) guestCardNameEl.textContent = guest.name;
      if (guestCardSeatsEl) guestCardSeatsEl.textContent = guest.passes;
      if (guestCardSeatsTxtEl) guestCardSeatsTxtEl.textContent = guest.passes === 1 ? "lugar" : "lugares";
      if (rsvpNombreEl) rsvpNombreEl.value = guest.name;
      if (rsvpGuestsEl) {
        rsvpGuestsEl.innerHTML = Array.from({ length: guest.passes }, (_, index) => {
          const value = index + 1;
          return `<option value="${value}">${value}</option>`;
        }).join("");
      }
    } else {
      window.currentGuest = null;

      const guestNameEl = document.getElementById("guest-name");
      if (guestNameEl) guestNameEl.textContent = "¡Invitado no encontrado!";

      if (guestCardNameEl) guestCardNameEl.textContent = "Invitado especial";
      if (guestCardSeatsEl) guestCardSeatsEl.textContent = "1";
      if (guestCardSeatsTxtEl) guestCardSeatsTxtEl.textContent = "lugar";
      if (rsvpNombreEl) rsvpNombreEl.value = "Invitado especial";
      if (rsvpGuestsEl) rsvpGuestsEl.innerHTML = '<option value="1">1</option>';

      const section = document.querySelector(".invitation-info-section");
      if (section) section.style.display = "none";
    }
  });
  
