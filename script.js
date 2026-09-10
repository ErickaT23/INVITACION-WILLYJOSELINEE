document.addEventListener("DOMContentLoaded", function() {
    var audio = document.getElementById("audioPlayer");
    var audioBubble = document.querySelector(".contenedor-play");
    var playPauseButton = document.getElementById("playPauseButton");
    var iconoPlayPause = document.getElementById("iconoPlayPause");
    var rsvpNombre = document.getElementById("rsvpNombre");
    var rsvpGuestsWrap = document.getElementById("rsvpGuestsWrap");
    var rsvpGuests = document.getElementById("rsvpGuests");
    var btnRsvpSi = document.getElementById("btnRsvpSi");
    var btnRsvpNo = document.getElementById("btnRsvpNo");
    var btnConfirmarRsvp = document.getElementById("btnConfirmarRsvp");
    var msgRsvp = document.getElementById("msgRsvp");

    var modal = document.getElementById('photo-modal');
    const galleryImages = [
        "/images/GA1.webp",
        "/images/GA2.webp",
        "/images/GA3.webp",
        "/images/GA4.webp",
        "/images/GA5.webp",
        "/images/GA6.webp",
        "/images/GA7.webp"
    ];
    var seal = document.getElementById("seal");
    let currentSlide = 0;   
    let isOpeningEnvelope = false;

    // Función para abrir el sobre y reproducir la música
    function openEnvelopeAndPlayMusic() {
        var envelopeTop = document.getElementById("envelope-top");
        var envelopeBottom = document.getElementById("envelope-bottom");
        var envelope = document.getElementById("envelope");
        var invitation = document.getElementById("invitation");
        var guestCard = document.querySelector(".guest-card");

        envelope.classList.add('is-opening');
        seal.style.opacity = '0';
        if (guestCard) {
            guestCard.style.opacity = '0';
        }
      
        setTimeout(function() {
            envelope.classList.add('hidden');
            invitation.classList.remove('hidden');
            if (audioBubble) {
                audioBubble.classList.remove('hidden');
                audioBubble.setAttribute('aria-hidden', 'false');
            }
        }, 1000);
      
        audio.play().then(function() {
            iconoPlayPause.classList.remove("fa-play");
            iconoPlayPause.classList.add("fa-pause");
            playPauseButton.setAttribute("aria-label", "Pausar música");
        }).catch(function(error) {
            console.log('Playback failed: ', error);
            iconoPlayPause.classList.add("fa-play");
            iconoPlayPause.classList.remove("fa-pause");
            playPauseButton.setAttribute("aria-label", "Reproducir música");
        });
      }
      
      // 👇 Esta línea es la clave:
      window.openEnvelopeAndPlayMusic = openEnvelopeAndPlayMusic;
      

    // ✅ Solo un listener para el sello (corregido)
    seal.addEventListener("click", function(event) {
        event.stopPropagation();

        if (isOpeningEnvelope) return;

        isOpeningEnvelope = true;
        seal.classList.add("is-stamping");

        setTimeout(function() {
            openEnvelopeAndPlayMusic();
        }, 320);
    });

    function togglePlayPause() {
        if (!audio || !iconoPlayPause || !playPauseButton) return;

        if (audio.paused) {
            audio.play().then(function() {
                iconoPlayPause.classList.remove("fa-play");
                iconoPlayPause.classList.add("fa-pause");
                playPauseButton.setAttribute("aria-label", "Pausar música");
            }).catch(console.error);
            return;
        }

        audio.pause();
        iconoPlayPause.classList.add("fa-play");
        iconoPlayPause.classList.remove("fa-pause");
        playPauseButton.setAttribute("aria-label", "Reproducir música");
    }

    if (playPauseButton) {
        playPauseButton.addEventListener("click", function() {
            togglePlayPause();
        });
    }

    if (audioBubble && window.matchMedia("(pointer: fine)").matches) {
        var ticking = false;

        function updateBubbleOffset() {
            var bubbleOffset = Math.max(-12, Math.min(12, window.scrollY * 0.05));
            audioBubble.style.setProperty("--sound-bubble-offset", bubbleOffset + "px");
            ticking = false;
        }

        updateBubbleOffset();

        window.addEventListener("scroll", function() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(updateBubbleOffset);
        }, { passive: true });
    }

    let rsvpAnswer = null;

    function setRsvpMessage(message, isError) {
        if (!msgRsvp) return;
        msgRsvp.textContent = message;
        msgRsvp.classList.toggle("error", Boolean(isError));
        msgRsvp.classList.toggle("ok", !isError);
        msgRsvp.style.display = "block";
    }

    function setRsvpChoice(answer) {
        rsvpAnswer = answer;
        if (btnRsvpSi) btnRsvpSi.classList.toggle("is-active", answer === "si");
        if (btnRsvpNo) btnRsvpNo.classList.toggle("is-active", answer === "no");
        if (rsvpGuestsWrap) rsvpGuestsWrap.style.display = answer === "si" ? "block" : "none";
        if (msgRsvp) msgRsvp.style.display = "none";
    }

    if (btnRsvpSi) {
        btnRsvpSi.addEventListener("click", function() {
            setRsvpChoice("si");
        });
    }

    if (btnRsvpNo) {
        btnRsvpNo.addEventListener("click", function() {
            setRsvpChoice("no");
        });
    }

    if (btnConfirmarRsvp) {
        btnConfirmarRsvp.addEventListener("click", async function() {
            if (!rsvpAnswer) {
                setRsvpMessage("Selecciona una opción para continuar.", true);
                return;
            }

            const guest = window.currentGuest;
            if (!guest || !guest.id) {
                setRsvpMessage("Esta invitación no tiene un invitado válido. Abre el enlace personal que recibiste.", true);
                return;
            }

            const database = window.RSVPDatabase;
            if (!database || typeof database.saveConfirmation !== "function") {
                setRsvpMessage("No pudimos conectar con el sistema. Intenta nuevamente.", true);
                return;
            }

            const confirmedGuests = rsvpAnswer === "si"
                ? Math.min(guest.passes, Math.max(1, Number(rsvpGuests && rsvpGuests.value) || 1))
                : 0;

            btnConfirmarRsvp.disabled = true;
            setRsvpMessage("Guardando tu respuesta...", false);

            try {
                await database.saveConfirmation(window.config.event.defaultEventId, {
                    id: guest.id,
                    nombre: guest.name,
                    pasesAsignados: guest.passes,
                    respuesta: rsvpAnswer,
                    cantidadConfirmada: confirmedGuests
                });

                btnRsvpSi.disabled = true;
                btnRsvpNo.disabled = true;
                setRsvpMessage("Gracias, tu respuesta quedó registrada.", false);

                const phone = "";
                const texto = rsvpAnswer === "si"
                    ? `Hola, soy ${guest.name} y confirmo mi asistencia a la boda de Wilson & Joselinee. Asistiremos ${confirmedGuests} ${confirmedGuests === 1 ? "persona" : "personas"}.`
                    : `Hola, soy ${guest.name} y lamentablemente no podré acompañarlos en la boda de Wilson & Joselinee.`;
                if (phone) {
                    window.setTimeout(function() {
                        window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
                    }, 700);
                }
            } catch (error) {
                console.error("Error al guardar RSVP:", error);
                btnConfirmarRsvp.disabled = false;
                setRsvpMessage(
                    error && error.code === "RSVP_ALREADY_CONFIRMED"
                        ? "Esta invitación ya fue confirmada anteriormente."
                        : "No pudimos guardar tu respuesta. Verifica tu conexión e intenta nuevamente.",
                    true
                );
            }
        });
    }

    function updateFlipUnit(id, value) {
        const flip = document.getElementById(id);
        if (!flip) return;

        const nextValue = String(value).padStart(2, '0');
        const topDigit = flip.querySelector('.top .digit');
        const bottomDigit = flip.querySelector('.bottom .digit');
        const topFlipDigit = flip.querySelector('.top-flip .digit');
        const bottomFlipDigit = flip.querySelector('.bottom-flip .digit');
        const currentValue = topDigit.textContent;

        if (currentValue === nextValue) return;

        topFlipDigit.textContent = currentValue;
        bottomFlipDigit.textContent = nextValue;
        bottomDigit.textContent = nextValue;
        flip.classList.add('is-dropping');

        setTimeout(() => {
            topDigit.textContent = nextValue;
            flip.classList.remove('is-dropping');
        }, 420);
    }

    const targetDate = new Date('2027-01-16T00:00:00').getTime();
    const countdown = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        updateFlipUnit('flipDays', days);
        updateFlipUnit('flipHours', hours);
        updateFlipUnit('flipMins', minutes);
        updateFlipUnit('flipSecs', seconds);

        if (distance < 0) {
            clearInterval(countdown);
            const countdownSection = document.getElementById('countdown');
            if (countdownSection) {
                countdownSection.innerHTML = '<h3>Gracias por habernos acompañado en este día tan especial.</h3>';
            }
        }
    }, 1000);

    // Aparición de textos con scroll
    const elementsToFade = document.querySelectorAll('.fade-in-element');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elementsToFade.forEach(element => {
        const delay = [...elementsToFade].indexOf(element) * 0.05;
        element.style.transitionDelay = `${delay}s`;
        observer.observe(element);
    });

    // Galería
    const closeButton = document.querySelector('.close');
    const mainPhoto = document.getElementById('main-photo');
    const mainPhotoModal = document.getElementById('main-photo-modal');

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal();
            }
        });
    }

    if (mainPhoto) {
        let galleryIsVisible = false;
        const galleryObserver = new IntersectionObserver((entries) => {
            galleryIsVisible = entries[0].isIntersecting;
        }, { rootMargin: '200px 0px' });

        galleryObserver.observe(mainPhoto);

        setInterval(function() {
            if (!galleryIsVisible || document.hidden) return;

            currentSlide = (currentSlide + 1) % galleryImages.length;
            mainPhoto.style.opacity = '0.7';

            setTimeout(function() {
                mainPhoto.src = galleryImages[currentSlide];
                if (mainPhotoModal && modal && modal.classList.contains('is-open')) {
                    mainPhotoModal.src = galleryImages[currentSlide];
                }
                mainPhoto.style.opacity = '1';
            }, 180);
        }, 5000);
    }

    // Optimización visual
    const title = document.querySelector(".title");
    if (title) {
        title.classList.add("visible");
    }

    window.changePhoto = function(element) {
        if (!mainPhoto || !mainPhotoModal) return;

        mainPhoto.src = element.src;
        mainPhotoModal.src = element.src;

        openModal();
    }

    function openModal() {
        const photoModal = document.getElementById('photo-modal');
        if (!photoModal) return;

        photoModal.classList.remove('is-closing');
        photoModal.classList.add('is-opening');

        requestAnimationFrame(() => {
            photoModal.classList.add('is-open');
        });
    }

    function closeModal() {
        const photoModal = document.getElementById('photo-modal');
        if (!photoModal) return;

        photoModal.classList.remove('is-open', 'is-opening');
        photoModal.classList.add('is-closing');

        setTimeout(() => {
            photoModal.classList.remove('is-closing');
        }, 280);
    }

});

window.confirmarWhatsApp = function () {};
  
