// helpers
const $ = s => document.querySelector(s);
const show = id => {
  ['pgMarket','pgChart'].forEach(p => document.getElementById(p).classList.remove('active'));
  document.getElementById(id).classList.add('active');
  $('#title').textContent = id === 'pgChart' ? 'Chart' : 'Market';
};

// state
const state = { sym: 'BTCUSDT', name: 'BTC/USDT', tv: null, priceTimer: null };

// price from binance
async function getPrice(sym){
  try {
    const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}`);
    return await r.json(); // {symbol, price}
  } catch(e){ return null; }
}

// render one BTC row
async function renderMarket(){
  const data = await getPrice('BTCUSDT');
  const p = data ? parseFloat(data.price) : 0;
  $('#list').innerHTML = `
    <div class="row" id="rowBTC">
      <div class="name">BTC/USDT</div>
      <div class="price">${p ? p.toFixed(2) : '--'}</div>
    </div>
  `;
  $('#rowBTC').onclick = () => openChart('BTCUSDT','BTC/USDT');
}

// open chart
function openChart(sym, name){
  state.sym = sym;
  state.name = name;
  $('#pair').textContent = name;
  $('#live').textContent = '';
  mountTV();
  location.hash = `#/chart/${sym}`; // refresh-safe
  show('pgChart');
}

// mount TradingView
function mountTV(){
  const id = 'tv';
  document.getElementById(id).innerHTML = ''; // clear
  state.tv = new TradingView.widget({
    autosize: true,
    symbol: `BINANCE:${state.sym}`,
    interval: '15',
    timezone: 'Etc/UTC',
    theme: 'light',
    style: '1',
    container_id: id,
    allow_symbol_change: false,
    withdateranges: true
  });
  if(state.priceTimer) clearInterval(state.priceTimer);
  state.priceTimer = setInterval(async () => {
    const d = await getPrice(state.sym);
    if(d) $('#live').textContent = parseFloat(d.price).toFixed(2);
  }, 4000);
}

// back button
$('#btnBack')?.addEventListener('click', ()=>{
  location.hash = '#/market';
  show('pgMarket');
});

// hash routing
function route(){
  if(location.hash.startsWith('#/chart/')){
    const sym = location.hash.split('/')[2] || 'BTCUSDT';
    openChart(sym, sym.replace('USDT','/USDT'));
    show('pgChart');
  } else {
    show('pgMarket');
  }
}

// init
document.addEventListener('DOMContentLoaded', async ()=>{
  await renderMarket();
  route();
  window.addEventListener('hashchange', route);
});
