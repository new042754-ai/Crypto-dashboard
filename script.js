// ==== Routing helpers ====
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const pages = $$('.page');
const titleEl = $('#pageTitle');

function show(id){
  pages.forEach(p=>p.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  titleEl.textContent = id==='chartPage' ? 'Chart' : 'Market';
}

function navigateTo(id){
  // update hash so refresh par same page aaye
  location.hash = id === 'chartPage' ? `#/chart/${state.sym}` : '#/market';
  show(id);
}

// ==== Market list ====
const symbols = [
  {sym:'BTCUSDT', name:'BTC/USDT'},
  {sym:'ETHUSDT', name:'ETH/USDT'},
  {sym:'SOLUSDT', name:'SOL/USDT'},
  {sym:'XRPUSDT', name:'XRP/USDT'},
  {sym:'DOGEUSDT',name:'DOGE/USDT'},
  {sym:'TRXUSDT', name:'TRX/USDT'},
  {sym:'ADAUSDT', name:'ADA/USDT'},
  {sym:'ETCUSDT', name:'ETC/USDT'},
];

const state = {
  sym: 'BTCUSDT',
  tf: 15, // minutes
  tv: null,
  priceTimer: null
};

async function getPrice(sym){
  try{
    const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}`);
    return await r.json(); // {symbol, price}
  }catch(e){ return null; }
}

async function renderMarket(){
  const wrap = $('#marketList');
  wrap.innerHTML = '';
  for(const s of symbols){
    const data = await getPrice(s.sym);
    const p = data ? parseFloat(data.price) : 0;
    const row = document.createElement('div');
    row.className = 'market-row';
    row.innerHTML = `
      <span>${s.name}</span>
      <span class="red">${p ? p.toFixed(2) : '--'}</span>
      <span class="green">${p ? p.toFixed(2) : '--'}</span>
    `;
    row.onclick = () => openChart(s.sym, s.name);
    wrap.appendChild(row);
  }
}

function openChart(sym, title){
  state.sym = sym;
  $('#chartTitle').textContent = title;
  $('#livePrice').textContent = '';
  mountTV(); // create chart
  navigateTo('chartPage');
}

// ==== TradingView Chart ====
function mountTV(){
  const containerId = 'tv-container';
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // clear old
  const intervalMap = {1:'1',5:'5',15:'15',30:'30',60:'60',240:'240'};

  // create widget
  state.tv = new TradingView.widget({
    autosize: true,
    symbol: `BINANCE:${state.sym}`,
    interval: intervalMap[state.tf] || '15',
    timezone: "Etc/UTC",
    theme: "light",
    style: "1",
    locale: "en",
    hide_top_toolbar: false,
    container_id: containerId,
    allow_symbol_change: false,
    withdateranges: true
  });

  // live price updater
  if(state.priceTimer) clearInterval(state.priceTimer);
  state.priceTimer = setInterval(async ()=>{
    const data = await getPrice(state.sym);
    if(data){
      $('#livePrice').textContent = parseFloat(data.price).toFixed(2);
    }
  }, 4000);
}

// timeframe buttons
function wireTF(){
  $$('#tfTabs .tf').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('#tfTabs .tf').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.tf = parseInt(btn.dataset.tf,10);
      mountTV();
    });
  });
}

// ==== Hash routing (refresh safe) ====
function applyHashRoute(){
  const hash = location.hash || '#/market';
  if(hash.startsWith('#/chart/')){
    const sym = hash.split('/')[2] || 'BTCUSDT';
    const found = symbols.find(s=>s.sym===sym) || symbols[0];
    openChart(found.sym, found.name);
    show('chartPage');
  }else{
    show('marketPage');
  }
}

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  wireTF();
  renderMarket();
  applyHashRoute();
  window.addEventListener('hashchange', applyHashRoute);
});
