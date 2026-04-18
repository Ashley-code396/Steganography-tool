const encodeForm = document.getElementById('encode-form');
const encodeResult = document.getElementById('encode-result');
const imageInput = encodeForm.querySelector('input[name="image"]');
const imgBefore = document.getElementById('img-before');
const imgAfter = document.getElementById('img-after');
let currentBeforeUrl = null;
let currentAfterUrl = null;

encodeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  encodeResult.textContent = 'Encoding...';

  const fd = new FormData(form);
  try {
    const res = await fetch('/encode', { method: 'POST', body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      encodeResult.textContent = 'Error: ' + (err.error || res.statusText);
      return;
    }

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);

    // provide download link; preserve original filename to avoid accidental overwrite
    const originalFile = form.querySelector('input[name="image"]').files[0];
    let downloadName = 'stego.png';
    if (originalFile && originalFile.name) {
      const base = originalFile.name.replace(/\.[^/.]+$/, '');
      downloadName = `${base}-stego.png`;
    }

    // show download link and the stego preview side-by-side with original
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = downloadName;
    a.textContent = 'Download stego image';

    encodeResult.innerHTML = '';
    encodeResult.appendChild(a);

    // set stego preview image
    if (currentAfterUrl) {
      try { URL.revokeObjectURL(currentAfterUrl); } catch (e) {}
    }
    currentAfterUrl = blobUrl;
    imgAfter.src = blobUrl;
  } catch (err) {
    encodeResult.textContent = 'Error: ' + err.message;
  }
});

const decodeForm = document.getElementById('decode-form');
const decodeResult = document.getElementById('decode-result');

decodeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  decodeResult.textContent = 'Decoding...';
  try {
    const res = await fetch('/decode', { method: 'POST', body: fd });
    const body = await res.json();
    if (!res.ok) {
      decodeResult.textContent = 'Error: ' + (body.error || res.statusText);
      return;
    }
    decodeResult.textContent = body.message || '';
  } catch (err) {
    decodeResult.textContent = 'Error: ' + err.message;
  }
});

// preview for decode input
const decodeImageInput = decodeForm.querySelector('input[name="image"]');
const imgDecode = document.getElementById('img-decode');
if (decodeImageInput) {
  decodeImageInput.addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) {
      imgDecode.src = '';
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      imgDecode.src = reader.result;
      // clear previous decode result when user chooses a new image
      decodeResult.textContent = '';
    });
    reader.readAsDataURL(file);
  });
}

// show a preview of the selected original image immediately
if (imageInput) {
  imageInput.addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;

    // prefer data URL for immediate preview (preserves orientation for small images)
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      // revoke previous created object URL if any
      if (currentBeforeUrl) {
        try { URL.revokeObjectURL(currentBeforeUrl); } catch (e) {}
        currentBeforeUrl = null;
      }
      imgBefore.src = reader.result;

      // clear previous stego preview when a new source is chosen
      imgAfter.src = '';
      if (currentAfterUrl) {
        try { URL.revokeObjectURL(currentAfterUrl); } catch (e) {}
        currentAfterUrl = null;
      }
      encodeResult.textContent = '';
    });
    reader.readAsDataURL(file);
  });
}
