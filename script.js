const $ = (sel) => document.querySelector(sel);
const pages = document.querySelectorAll('.page');

const mapTitle = {
  homePage:'Home', marketPage:'Market', tradePage:'Trade',
  discoverPage:'Discover', accountPage:'My Account',
  loginPage:'Login', signupPage:'Sign Up',
};

function navigateTo(id){
  pages.forEach(p=>p.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  const t = document.getElementById('pageTitle');
  if(t) t.textContent = mapTitle[id] || 'App';
  localStorage.setItem('route', id);
  if(id==='accountPage') hydrateAccount();
}

document.addEventListener('DOMContentLoaded', ()=>{
  const saved = localStorage.getItem('route') || 'homePage';
  navigateTo(saved);
  hydrateAccount();
});

function login(e){
  e.preventDefault();
  const user = $('#loginUser').value.trim();
  const pass = $('#loginPass').value.trim();
  if(!user || !pass){ alert('Enter username & password'); return; }
  const u = JSON.parse(localStorage.getItem('user')||'{}');
  if(u.username && user !== u.username){ alert('User not found. Sign Up first.'); return; }
  if(u.password && u.password !== pass){ alert('Wrong password'); return; }
  localStorage.setItem('user', JSON.stringify({ ...(u||{}), username:user, password:pass, email:u.email||'', balance:u.balance||0.27 }));
  hydrateAccount(); navigateTo('marketPage');
}

function signup(e){
  e.preventDefault();
  const username = $('#signupUser').value.trim();
  const email = $('#signupEmail').value.trim();
  const password = $('#signupPass').value.trim();
  if(password.length < 6){ alert('Password must be at least 6 characters'); return; }
  localStorage.setItem('user', JSON.stringify({ username, email, password, balance:0.27 }));
  hydrateAccount(); navigateTo('marketPage');
}

function hydrateAccount(){
  const u = JSON.parse(localStorage.getItem('user')||'{}');
  $('#accUsername') && ($('#accUsername').textContent = u.username || 'Guest');
  $('#accEmail') && ($('#accEmail').textContent    = u.email || '-');
  const bal = typeof u.balance==='number' ? u.balance : 0;
  const hidden = localStorage.getItem('hide_balance')==='1';
  $('#accBalance') && ($('#accBalance').textContent = hidden ? '•••••' : bal.toFixed(2));
}

function toggleBalance(){
  localStorage.setItem('hide_balance', localStorage.getItem('hide_balance')==='1' ? '0' : '1');
  hydrateAccount();
}

window.navigateTo = navigateTo;
window.login = login;
window.signup = signup;
window.toggleBalance = toggleBalance;
