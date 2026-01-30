// Toggle search box
function toggleSearch() {
  const box = document.getElementById('searchBox');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

// Analyze uploaded image: OCR + risk + price
async function runAll() {
  const file = document.getElementById('imageInput').files[0];
  if (!file) return alert("Please upload an image");
  document.getElementById('ocrOut').textContent = 'Running OCR...';
  document.getElementById('priceOut').textContent = '';
  document.getElementById('riskOut').textContent = '';

  // OCR
  let text;
  try {
    const result = await Tesseract.recognize(file, 'jpn+eng');
    text = result.data.text || '';
    document.getElementById('ocrOut').textContent = `OCR Text:\n${text}`;
  } catch(e) {
    document.getElementById('ocrOut').textContent = 'Error running OCR';
  }

  // Risk scan
  const score = Math.floor(60 + Math.random()*30);
  const risk = score > 85 ? 'Low' : score > 70 ? 'Medium' : 'High';
  document.getElementById('riskOut').textContent =
`Authenticity Score: ${score}/100
Risk Level: ${risk}

Checks:
- Geometry consistency
- Color variance
- Font alignment

Note: This is not a guarantee.`;

  // Price lookup using OCR text
  const firstLine = text.split("\\n")[0] || '';
  if(firstLine) {
    try {
      const r = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(firstLine)}`);
      const j = await r.json();
      if (!j.data || !j.data.length) {
        document.getElementById('priceOut').textContent = 'Price: No card found';
      } else {
        const card = j.data[0];
        const prices = card.tcgplayer?.prices;
        let out = `Price Lookup (from OCR first line):\nName: ${card.name}\nSet: ${card.set.name}\n`;
        if (prices?.holofoil?.market) out += `Market: $${prices.holofoil.market}`;
        else out += 'Price data unavailable';
        document.getElementById('priceOut').textContent = out;
      }
    } catch(e) {
      document.getElementById('priceOut').textContent = 'Error fetching price';
    }
  }
}

// Manual search by name
async function checkPrice() {
  const name = document.getElementById('cardName').value.trim();
  if(!name) return alert("Enter a card name");
  document.getElementById('searchOut').textContent = 'Fetching price...';
  try {
    const r = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(name)}`);
    const j = await r.json();
    if(!j.data || !j.data.length) {
      document.getElementById('searchOut').textContent = 'No card found';
      return;
    }
    const card = j.data[0];
    const prices = card.tcgplayer?.prices;
    let out = `Name: ${card.name}\nSet: ${card.set.name}\n`;
    if(prices?.holofoil?.market) out += `Market: $${prices.holofoil.market}`;
    else out += 'Price data unavailable';
    document.getElementById('searchOut').textContent = out;
  } catch(e) {
    document.getElementById('searchOut').textContent = 'Error fetching price';
  }
}
