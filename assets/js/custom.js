document.addEventListener('DOMContentLoaded', function () {
  // 1. Sliderių reikšmių rodymas
  const sliders = document.querySelectorAll('.rating-slider');

  function updateSliderLabels() {
    sliders.forEach(function (slider) {
      const valueSpan = document.querySelector(
        `.rating-value[data-for="${slider.id}"]`
      );

      if (!valueSpan) return;

      valueSpan.textContent = slider.value;
    });
  }

  // pradinis užpildymas
  updateSliderLabels();

  // atnaujinimas tempiant
  sliders.forEach(function (slider) {
    slider.addEventListener('input', function () {
      const valueSpan = document.querySelector(
        `.rating-value[data-for="${slider.id}"]`
      );
      if (!valueSpan) return;
      valueSpan.textContent = slider.value;
    });
  });

  // 2. Formos apdorojimas
  const form = document.querySelector('#contact .php-email-form');
  if (!form) return;

  const loading = form.querySelector('.loading');
  const errorMessage = form.querySelector('.error-message');
  const sentMessage = form.querySelector('.sent-message');
  const submitBtn = form.querySelector('button[type="submit"]');

  // vieta rezultatui po forma
  let resultBox = document.createElement('div');
  resultBox.id = 'form-result';
  resultBox.style.marginTop = '20px';
  resultBox.style.padding = '15px';
  resultBox.style.backgroundColor = '#f8f9fa';
  resultBox.style.borderRadius = '6px';
  form.parentNode.appendChild(resultBox);

  // 3. Overlay (užkrovimo langas)
  const overlay = document.createElement('div');
  overlay.id = 'form-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999'
  });

  const overlayBox = document.createElement('div');
  Object.assign(overlayBox.style, {
    backgroundColor: '#ffffff',
    padding: '20px 30px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    fontSize: '18px',
    fontWeight: '500'
  });
  overlayBox.textContent = 'Siunčiama...';
  overlay.appendChild(overlayBox);

  document.body.appendChild(overlay);

  // 4. Submit apdorojimas (capture fazė)
 form.addEventListener(
  'submit',
  function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (errorMessage) errorMessage.style.display = 'none';
    if (sentMessage) sentMessage.style.display = 'none';
    if (loading) loading.style.display = 'none';

    overlay.style.display = 'flex';
    if (submitBtn) submitBtn.disabled = true;

    const data = {
      firstName: document.getElementById('first-name').value.trim(),
      lastName: document.getElementById('last-name').value.trim(),
      email: document.getElementById('email-field').value.trim(),
      phone: document.getElementById('phone-field').value.trim(),
      address: document.getElementById('address-field').value.trim(),
      ratingDesign: document.getElementById('q1').value,
      ratingContent: document.getElementById('q2').value,
      ratingOverall: document.getElementById('q3').value
    };

    // ⬇️ Vidurkis apskaičiuojamas TIK VIENĄ KARTĄ
    const avg =
      (Number(data.ratingDesign) +
        Number(data.ratingContent) +
        Number(data.ratingOverall)) / 3;

    const avgFormatted = avg.toFixed(1);

    // Įdedam vidurkį į objektą (kad matytųsi console log)
    data.average = avgFormatted;

    console.log("Formos duomenys:", data);
    console.log(`${data.firstName} ${data.lastName}, vidurkis: ${avgFormatted}`);


    setTimeout(function () {
      overlay.style.display = 'none';
      if (submitBtn) submitBtn.disabled = false;

      if (sentMessage) {
        sentMessage.style.display = 'block';
        sentMessage.textContent = 'Atsiliepimas priimtas. Ačiū!';
      }

      resultBox.innerHTML = `
        <p><strong>Vardas:</strong> ${data.firstName}</p>
        <p><strong>Pavardė:</strong> ${data.lastName}</p>
        <p><strong>El. paštas:</strong> 
          <a href="mailto:${data.email}">${data.email}</a>
        </p>
        <p><strong>Tel. numeris:</strong> ${data.phone}</p>
        <p><strong>Adresas:</strong> ${data.address}</p>
        <p><strong>CV dizaino vertinimas:</strong> ${data.ratingDesign} / 10</p>
        <p><strong>Informacijos vertinimas:</strong> ${data.ratingContent} / 10</p>
        <p><strong>Bendras įspūdis:</strong> ${data.ratingOverall} / 10</p>
        <hr>
        <p><strong>${data.firstName} ${data.lastName}:</strong> ${avgFormatted}</p>
      `;

      form.reset();
      updateSliderLabels();
    }, 1000);
  },
  true
);

});
