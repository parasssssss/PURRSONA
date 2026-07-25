const cardContent = document.getElementById('cardContent');
const downloadButton = document.getElementById('downloadButton');
const restartButton = document.getElementById('restartButton');

const rawResult = sessionStorage.getItem('catQuizResult');
const result = rawResult ? JSON.parse(rawResult) : null;

function renderCard() {
  if (!result || !result.category) {
    cardContent.innerHTML = `
      <div class="rounded-[24px] border-2 border-[var(--ink)] bg-white p-8 text-center">
        <p class="text-base uppercase tracking-[0.3em] text-[var(--ink)]/70">No result found</p>
        <h1 class="font-display text-3xl mt-4">Looks like the quiz result disappeared.</h1>
        <p class="mt-3 text-[var(--ink)]/80">Please return to the quiz and try again.</p>
      </div>
    `;
    if (downloadButton) downloadButton.style.display = 'none';
    return;
  }

const categoryEmoji = getCategoryEmoji(result.category);
let imageUrl;
if (result.gif_path){
imageUrl=`https://purrsona.onrender.com/static/${result.gif_path}`;
}
else{
    imageUrl=`https://purrsona.onrender.com/static/${result.image_path}`
}
  cardContent.innerHTML = `
    <div class="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
      ${imageUrl ? `<div class="photo-block mx-auto md:mx-0 rounded-[28px] overflow-hidden border-2 border-[var(--ink)] shadow-[0_14px_40px_-20px_rgba(0,0,0,0.75)]"><img
    src="${imageUrl}"
    crossorigin="anonymous"
    alt="${result.display_name}"
    class="w-full h-full object-cover"
/></div>` : ''}

      <div class="md:flex-1 flex flex-col justify-between gap-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="font-display text-4xl tracking-tight uppercase leading-none text-[var(--ink)]">${(result.display_name || 'Luna').toString().toUpperCase()}</p>
            <p class="text-base text-[var(--ink)]/70 mt-2 uppercase tracking-[0.16em]">${result.title || 'Master of Side-Eye'}</p>
          </div>
          <div class="accent-pill">
            <span>${categoryEmoji}</span>
            ${result.category || 'JUDGMENTAL'}
          </div>
        </div>

        <div class="rounded-[28px] border-2 border-[var(--ink)] bg-white p-6 space-y-4">
          <p class="text-[var(--ink)]/90 leading-relaxed">${result.description || 'You silently judge everyone while pretending you are not.'}</p>

        </div>
      </div>
    </div>
  `;
}

if (downloadButton) {
  downloadButton.addEventListener('click', async () => {
    const downloaded = await downloadCardImage();
    if (downloaded) {
      downloadButton.textContent = 'Downloaded!';
      setTimeout(() => { downloadButton.textContent = 'Download Card Image'; }, 2200);
      return;
    }

    downloadButton.textContent = 'Download failed';
    setTimeout(() => { downloadButton.textContent = 'Download Card Image'; }, 2200);
  });
}

async function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    } else {
      const dataUrl = canvas.toDataURL('image/png');
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => resolve(blob))
        .catch(() => resolve(null));
    }
  });
}

async function downloadCardImage() {
  const cardPanel = document.querySelector('.card-panel');
  if (!cardPanel) {
    console.warn('Card panel not found.');
    return false;
  }
  if (typeof html2canvas === 'undefined') {
    console.warn('html2canvas script did not load.');
    return false;
  }

  try {
    // Make sure fonts + images are fully ready before snapshotting
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const canvas = await html2canvas(cardPanel, {
      backgroundColor: '#ffffff', // solid color instead of null — kills the "transparent = gray" look
      scale: Math.max(2, window.devicePixelRatio || 1), // sharper export
      useCORS: true,
      logging: false,
      allowTaint: true,
      imageTimeout: 20000,
      onclone: (clonedDoc) => {
        const clonedPanel = clonedDoc.querySelector('.card-panel');
        if (clonedPanel) {
          // Force the animation to its finished state so the clone
          // isn't captured mid-fade (opacity < 1 / scale < 1)
          clonedPanel.style.animation = 'none';
          clonedPanel.style.opacity = '1';
          clonedPanel.style.transform = 'none';
        }
      },
    });

    if (!canvas) {
      console.warn('html2canvas returned no canvas.');
      return false;
    }

    const blob = await canvasToBlob(canvas);
    if (!blob) {
      console.warn('Failed to create blob from canvas.');
      return false;
    }

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'purrsona-card.png');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true }));
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Card image download failed:', error);
    return false;
  }
}

function getCategoryEmoji(category) {
  if (!category) return '😼';
  const normalized = category.toString().trim().toLowerCase();
  const map = {
  chaotic: '🤪',
  confused: '🧐',
  sleepy: '😴',
  chill: '😎',
  grumpy: '😾',
  goofy: '😹',
  judgmental: '😼',
  mischievous: '😏',
  freaky: '🕶️'
};
  return map[normalized] || '😼';
}

restartButton.addEventListener('click', () => {
  sessionStorage.removeItem('catQuizResult');
  window.location.href = 'quiz.html';
});

renderCard();
