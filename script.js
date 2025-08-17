// helpers
const $ = s => document.querySelector(s);
const $all = s => document.querySelectorAll(s);
const setTitle = t => $('#title').textContent = t;
const show = id => {
  ['pgMarket','pgChart'].forEach(x => document.getElementById(x).classList.remove('active'));
  document.getElementById(id).classList.add('active');
  setTitle(id==='pgChart' ? 'Chart' : 'Market');
};

// state
const coins = [
  {sym:'BTCUSDT',name:'BTC/USDT', logo:'₿'},
  {sym:'ETHUSDT',name:'ETH/USDT', logo:'Ξ'},
  {sym:'SOLUSDT',name:'SOL/USDT', logo:'S'},
  {sym:'XRPUSDT',name:'XRP/USDT', logo:'X'},
  {sym:'DOGEUSDT',name:'DOGE/USDT',logo:'Ð'},
  {sym:'TRXUSDT',name:'TRX/USDT', logo:'T'},
  {sym:'ADAUSDT',name:'ADA/USDT', logo:'A'},
  {sym:'ETCUSDT',name:'ETC/USDT', logo:'E'},
];

const state = { sym:'BTCUSDT', name:'BTC/USDT', tf:15, tv:null, priceTimer:null };

// api
async function getPrice(sym){
  try{
    const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}`);
    return await r.json(); // {symbol, price}
  }catch(e){ return null; }
}

// market render
async function renderMarket(){
  const wrap = $('#list'); wrap.innerHTML = '';
  for (const c of coins){
    const d = await getPrice(c.sym);
    const px = d ? parseFloat(d.price) : 0;
    const row = document.createElement('div');
    row.className = 'coin-row';
    row.innerHTML = `
      <div class="left">
        <div class="logo">${c.logo}</div>
        <div class="name">${c.name}</div>
      </div>
      <div class="px">${px ? px.toFixed(2) : '--'}</div>
    `;
    row.onclick = () => openChart(c.sym, c.name);
    wrap.appendChild(row);
  }
}

// chart
function openChart(sym, name){
  state.sym = sym; state.name = name;
  $('#pair').textContent = name; $('#live').textContent = '';
  mountTV(); routeTo('#/chart/'+sym);
}

function mountTV(){
  const id = 'tv'; document.getElementById(id).innerHTML = '';
  const map = {1:'1',5:'5',15:'15',30:'30',60:'60',240:'240'};
  state.tv = new TradingView.widget({
    autosize:true,
    symbol: `BINANCE:${state.sym}`,
    interval: map[state.tf] || '15',
    timezone:'Etc/UTC',
    theme:'light',
    style:'1',
    container_id:id,
    allow_symbol_change:false,
    withdateranges:true
  });
  if(state.priceTimer) clearInterval(state.priceTimer);
  state.priceTimer = setInterval(async ()=>{
    const d = await getPrice(state.sym);
    if(d) $('#live').textContent = parseFloat(d.price).toFixed(2);
  }, 4000);
}

// timeframe buttons
function wireTF(){
  $all('#tfTabs .tf').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $all('#tfTabs .tf').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.tf = parseInt(btn.dataset.tf,10);
      mountTV();
    });
  });
}

// routing
function route(){
  if(location.hash.startsWith('#/chart/')){
    const sym = location.hash.split('/')[2] || 'BTCUSDT';
    const found = coins.find(x=>x.sym===sym) || coins[0];
    openChart(found.sym, found.name);
    show('pgChart');
  }else{
    show('pgMarket');
  }
}
function routeTo(hash){ location.hash = hash; route(); }
function goto(where){
  if(where==='chart'){ openChart(state.sym, state.name); }
  else routeTo('#/market');
}

// back
$('#btnBack')?.addEventListener('click', ()=>routeTo('#/market'));

// init
document.addEventListener('DOMContentLoaded', async ()=>{
  wireTF();
  await renderMarket();
  route();
  window.addEventListener('hashchange', route);
});
