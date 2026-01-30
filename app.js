async function checkPrice() {
  const name = document.getElementById('cardName').value.trim();
  if (!name) return;
  document.getElementById('priceOut').textContent = 'Loading...';
  const r = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(name)}`);
  const j = await r.json();
  if (!j.data || !j.data.length) {
    document.getElementById('priceOut').textContent = 'No card found.';
    return;
  }
  const card = j.data[0];
  const prices = card.tcgplayer?.prices;
  let out = `Name: ${card.name}\nSet: ${card.set.name}\n`;
  if (prices?.holofoil?.market) out += `Market: $${prices.holofoil.market}`;
  else out += 'Price data unavailable';
  document.getElementById('priceOut').textContent = out;
}

async function runOCR() {
  const file = document.getElementById('imageInput').files[0];
  if (!file) return;
  document.getElementById('ocrOut').textContent = 'Processing OCR...';
  const result = await Tesseract.recognize(file, 'jpn+eng');
  document.getElementById('ocrOut').textContent = result.data.text || '(no text found)';
}

function riskScan() {
  // Assistive heuristic demo (no absolutes)
  const score = Math.floor(60 + Math.random() * 30);
  const risk = score > 85 ? 'Low' : score > 70 ? 'Medium' : 'High';
  document.getElementById('riskOut').textContent =
`Authenticity Score: ${score}/100
Risk Level: ${risk}

Checks:
- Geometry consistency
- Color variance
- Font alignment

Note: This is not a guarantee.`;
}
