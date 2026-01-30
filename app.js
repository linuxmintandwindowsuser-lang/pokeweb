// State
let currentCardName = '';
let currentOCR = '';
let currentPrice = '';
let currentRisk = '';

// Toggle search box
function toggleSearch(){
  const box=document.getElementById('searchBox');
  box.style.display = box.style.display==='none'?'block':'none';
}

// Image upload flow
async function runImage(){
  const file=document.getElementById('imageInput').files[0];
  if(!file) return alert("Upload an image first");
  document.getElementById('ocrOut').textContent='Running OCR...';
  document.getElementById('riskOut').textContent='';
  document.getElementById('priceOut').textContent='';
  document.getElementById('generalOut').textContent='';

  // OCR
  try{
    const result=await Tesseract.recognize(file,'eng+jpn');
    currentOCR=result.data.text.trim();
    document.getElementById('ocrOut').textContent=`OCR Text:\n${currentOCR||'(no text detected)'}`;
    currentCardName=currentOCR.split('\n')[0] || '';
  }catch(e){
    document.getElementById('ocrOut').textContent='OCR Error';
    return;
  }

  enableActionButtons();
  lookupPrice(currentCardName);
  computeRisk();
}

// Manual search
async function runSearch(){
  const name=document.getElementById('cardName').value.trim();
  if(!name) return alert("Enter a card name");
  currentCardName=name;
  document.getElementById('ocrOut').textContent='Manual search selected';
  enableActionButtons();
  lookupPrice(name);
  computeRisk();
}

// Enable risk/price/general buttons
function enableActionButtons(){
  document.getElementById('riskBtn').disabled=false;
  document.getElementById('priceBtn').disabled=false;
  document.getElementById('generalBtn').disabled=false;
}

// Risk scan (simulated)
function computeRisk(){
  const score=Math.floor(60+Math.random()*30);
  const risk=score>85?'Low':score>70?'Medium':'High';
  currentRisk=`Authenticity Score: ${score}/100\nRisk Level: ${risk}\n\nChecks:\n- Geometry\n- Color variance\n- Font alignment\n\nNote: Not a guarantee.`;
  document.getElementById('riskOut').textContent=currentRisk;
}

// Price lookup
async function lookupPrice(name){
  document.getElementById('priceOut').textContent='Looking up price...';
  try{
    const r=await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(name)}`);
    const j=await r.json();
    if(!j.data||!j.data.length){
      currentPrice='Price: No card found';
    }else{
      const card=j.data[0];
      const prices=card.tcgplayer?.prices;
      let out=`Name: ${card.name}\nSet: ${card.set.name}\n`;
      if(prices?.holofoil?.market) out+=`Market: $${prices.holofoil.market}`;
      else out+='Price data unavailable';
      currentPrice=out;
    }
    document.getElementById('priceOut').textContent=currentPrice;
  }catch(e){
    currentPrice='Price lookup error';
    document.getElementById('priceOut').textContent=currentPrice;
  }
}

// Action buttons
function showRisk(){ document.getElementById('riskOut').textContent=currentRisk; }
function showPrice(){ document.getElementById('priceOut').textContent=currentPrice; }
function showGeneral(){
  document.getElementById('generalOut').textContent=
`--- General Info (Beta) ---
Card Name: ${currentCardName}
OCR Text: ${currentOCR}
Price Info: ${currentPrice}
Risk Info: ${currentRisk}`;
}
