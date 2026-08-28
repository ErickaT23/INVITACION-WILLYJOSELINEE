document.addEventListener("DOMContentLoaded", function() {
    var audio = document.getElementById("audioPlayer");
    var playPauseButton = document.getElementById("playPauseButton");
    var iconoPlayPause = document.getElementById("iconoPlayPause");
    var progressBar = document.getElementById("progress-bar");
    var currentTimeDisplay = document.getElementById("current-time");
    var durationTimeDisplay = document.getElementById("duration-time");
    var rsvpNombre = document.getElementById("rsvpNombre");
    var rsvpGuestsWrap = document.getElementById("rsvpGuestsWrap");
    var rsvpGuests = document.getElementById("rsvpGuests");
    var btnRsvpSi = document.getElementById("btnRsvpSi");
    var btnRsvpNo = document.getElementById("btnRsvpNo");
    var btnConfirmarRsvp = document.getElementById("btnConfirmarRsvp");
    var msgRsvp = document.getElementById("msgRsvp");

    var modal = document.getElementById('photo-modal');
    var seal = document.getElementById("seal");
    let currentSlide = 0;   
    let isOpeningEnvelope = false;
    const wishes = [];

    // Función para abrir el sobre y reproducir la música
    function openEnvelopeAndPlayMusic() {
        var envelopeTop = document.getElementById("envelope-top");
        var envelopeBottom = document.getElementById("envelope-bottom");
        var envelope = document.getElementById("envelope");
        var invitation = document.getElementById("invitation");
        var guestCard = document.querySelector(".guest-card");

        seal.style.opacity = '0';
        if (guestCard) {
            guestCard.style.opacity = '0';
        }
       
        envelopeTop.style.transform = 'translateY(-100vh)';
        envelopeBottom.style.transform = 'translateY(100vh)';
      
        setTimeout(function() {
            envelope.classList.add('hidden');
            invitation.classList.remove('hidden');
        }, 1000);
      
        audio.play().then(function() {
            iconoPlayPause.classList.remove("fa-play");
            iconoPlayPause.classList.add("fa-pause");
            updateProgress(); 
        }).catch(function(error) {
            console.log('Playback failed: ', error);
            iconoPlayPause.classList.add("fa-play");
            iconoPlayPause.classList.remove("fa-pause");
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
        if (!audio || !iconoPlayPause) return;

        requestAnimationFrame(() => {
            iconoPlayPause.classList.toggle("fa-play");
            iconoPlayPause.classList.toggle("fa-pause");
        });

        setTimeout(() => {
            if (audio.paused) {
                audio.play().catch(console.error);
            } else {
                audio.pause();
            }
        }, 50);
    }

    function updateProgress() {
        audio.addEventListener("timeupdate", function() {
            var progress = (audio.currentTime / audio.duration) * 100;
            progressBar.value = progress;

            var currentMinutes = Math.floor(audio.currentTime / 60);
            var currentSeconds = Math.floor(audio.currentTime % 60);
            currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' + currentSeconds : currentSeconds}`;

            if (!isNaN(audio.duration)) {
                var durationMinutes = Math.floor(audio.duration / 60);
                var durationSeconds = Math.floor(audio.duration % 60);
                durationTimeDisplay.textContent = `${durationMinutes}:${durationSeconds < 10 ? '0' + durationSeconds : durationSeconds}`;
            }
        });
    }

    progressBar.addEventListener("input", function() {
        var newTime = (progressBar.value / 100) * audio.duration;
        audio.currentTime = newTime;
    });

    playPauseButton.addEventListener("click", function() {
        togglePlayPause();
    });

    let rsvpAnswer = null;

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
        btnConfirmarRsvp.addEventListener("click", function() {
            const nombre = rsvpNombre && rsvpNombre.value ? rsvpNombre.value : "Invitado";

            if (!rsvpAnswer) {
                if (msgRsvp) {
                    msgRsvp.textContent = "Selecciona una opción para continuar.";
                    msgRsvp.style.display = "block";
                }
                return;
            }

            const phone = "50247657152";
            let texto = "";

            if (rsvpAnswer === "si") {
                const invitados = rsvpGuests && rsvpGuests.value ? rsvpGuests.value : "1";
                texto = `Hola, soy ${nombre} y confirmo mi asistencia a la boda de Wilson & Joselinee. Asistiremos ${invitados} ${invitados === "1" ? "persona" : "personas"}.`;
            } else {
                texto = `Hola, soy ${nombre} y lamentablemente no podré acompañarlos en la boda de Wilson & Joselinee.`;
            }

            const url = `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
            window.location.href = url;
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
        flip.classList.remove('is-dropping');
        void flip.offsetWidth;
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
            }
        });
    }, { threshold: 0.1 });

    elementsToFade.forEach(element => {
        const delay = [...elementsToFade].indexOf(element) * 0.05;
        element.style.transitionDelay = `${delay}s`;
        observer.observe(element);
    });

    // Galería
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('photo-modal').addEventListener('click', function(event) {
        if (event.target === this) {
            closeModal();
        }
    });

    // Optimización visual
    const title = document.querySelector(".title");
    if (title) {
        title.classList.add("visible");
    }

    // Buenos deseos
    function displayWishes() {
        const wishesDiv = document.getElementById('wishes');
        wishesDiv.innerHTML = wishes.map(wish => `<p><strong>${wish.name}:</strong> ${wish.message}</p>`).join('');
    }

    function toggleWishForm() {
        document.getElementById('wish-form').classList.toggle('hidden');
    }

    function toggleWishes() {
        const wishesDiv = document.getElementById('wishes');
        wishesDiv.classList.toggle('hidden');
      }      

      window.toggleWishes = toggleWishes;


    window.changePhoto = function(element) {
        const mainPhoto = document.getElementById('main-photo');
        const mainPhotoModal = document.getElementById('main-photo-modal');

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

    window.toggleDetails = function() {
        var details = document.getElementById("accountDetails");
        details.style.display = (details.style.display === "none" || details.style.display === "") ? "block" : "none";
    }

    window.submitWish = submitWish;
    window.toggleWishForm = toggleWishForm;
    window.toggleWishes = toggleWishes;
});

window.confirmarWhatsApp = function () {};
  
