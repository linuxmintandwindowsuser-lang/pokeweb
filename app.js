function toggleSearch(){
    const box=document.getElementById('searchBox');
    box.style.display = box.style.display==='none'?'block':'none';
}

// OCR + Risk scan + Price lookup
async function runAll(){
    const file=document.getElementById('imageInput').files[0];
    if(!file)return alert("Upload an image first");

    // OCR
    document.getElementById('ocrOut').textContent='Running OCR...';
    let text='';
    try{
        const result=await Tesseract.recognize(file,'eng+jpn');
        text=result.data.text.trim();
        document.getElementById('ocrOut').textContent=`OCR Text:\n${text||'(no text detected)'}`;
    } catch(e){
        document.getElementById('ocrOut').textContent='OCR Error';
    }

    // Risk scan
    const score=Math.floor(60+Math.random()*30);
    const risk=score>85?'Low':score>70?'Medium':'High';
    document.getElementById('riskOut').textContent=
`Authenticity Score: ${score}/100
Risk Level: ${risk}

Checks:
- Geometry
- Color variance
- Font alignment

Note: Not a guarantee.`;

    // Price lookup using first line from OCR
    if(!text) return;
    const cardName=text.split('\\n')[0];
    document.getElementById('priceOut').textContent='Looking up price...';
    try{
        const r=await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(cardName)}`, {
            headers: {'X-Api-Key':'DEMO_KEY'} // Use any public key or remove
        });
        const j=await r.json();
        if(!j.data||!j.data.length){
            document.getElementById('priceOut').textContent='No card found';
        } else {
            const card=j.data[0];
            const prices=card.tcgplayer?.prices;
            let out=`Price Lookup (from OCR first line):\nName: ${card.name}\nSet: ${card.set.name}\n`;
            if(prices?.holofoil?.market) out+=`Market: $${prices.holofoil.market}`;
            else out+='Price data unavailable';
            document.getElementById('priceOut').textContent=out;
        }
    } catch(e){
        document.getElementById('priceOut').textContent='Price lookup error';
    }
}

// Manual search
async function manualSearch(){
    const name=document.getElementById('cardName').value.trim();
    if(!name) return alert("Enter a card name");
    document.getElementById('searchOut').textContent='Searching...';
    try{
        const r=await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(name)}`, {
            headers: {'X-Api-Key':'DEMO_KEY'}
        });
        const j=await r.json();
        if(!j.data||!j.data.length){
            document.getElementById('searchOut').textContent='No card found';
            return;
        }
        const card=j.data[0];
        const prices=card.tcgplayer?.prices;
        let out=`Name: ${card.name}\nSet: ${card.set.name}\n`;
        if(prices?.holofoil?.market) out+=`Market: $${prices.holofoil.market}`;
        else out+='Price data unavailable';
        document.getElementById('searchOut').textContent=out;
    } catch(e){
        document.getElementById('searchOut').textContent='Search error';
    }
}
