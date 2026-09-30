let products = [];
async function loadProducts(){
  try{
    const r=await fetch('/api/products',{cache:'no-store'});
    const data=await r.json();
    products=Array.isArray(data.products)?data.products:[];
    loadProducts();
  }catch(e){
    products=[]; renderProducts(); updateBag();
  }
}

let bag = JSON.parse(localStorage.getItem("eloraBag") || "[]");
let currentFilter = "all";

const grid = document.getElementById("productGrid");
const count = document.getElementById("bagCount");
const drawer = document.getElementById("drawer");
const bagItems = document.getElementById("bagItems");
const totalEl = document.getElementById("bagTotal");
const toast = document.getElementById("toast");

function money(n){ return "৳ " + n.toLocaleString("en-BD"); }
function save(){ localStorage.setItem("eloraBag",JSON.stringify(bag)); updateBag(); }
function showToast(t){toast.textContent=t;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1600)}

function renderProducts(){
  const q = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
  const visible = products.filter(p => (currentFilter==="all" || p.cat===currentFilter) && (!q || (p.name+" "+p.type).toLowerCase().includes(q)));
  grid.innerHTML = visible.map(p=>`
    <article class="product">
      <div class="product-media ${p.tone||""}" style="${p.image_url?`background-image:url('${p.image_url}');background-size:cover;background-position:center;`:''}">
        <span class="product-badge">${p.badge||''}</span>
        <button class="product-wish" onclick="showToast('Wishlist will be available soon')">♡</button>
      </div>
      <div class="product-info">
        <span class="type">${p.type}</span>
        <h3>${p.name}</h3>
        <div class="product-row"><b class="price">${money(p.price)}</b><button class="add" onclick="addToBag(${p.id})">ADD TO BAG</button></div>
      </div>
    </article>`).join("") || `<p style="grid-column:1/-1;color:#888">No products found.</p>`;
}
function addToBag(id){
  const p=products.find(x=>x.id===id);
  if(!p){showToast('Product unavailable');return}
  const existing=bag.find(x=>x.id===id);
  if(existing) existing.qty++; else bag.push({id:p.id,qty:1});
  save(); showToast(p.name+" added to your bag");
}
function updateBag(){
  const qty=bag.reduce((s,x)=>s+x.qty,0); count.textContent=qty;
  if(!bag.length){bagItems.innerHTML='<div class="bag-empty">Your bag is empty.<br><br>Discover something beautiful from our collections.</div>';totalEl.textContent="৳ 0";return}
  let total=0;
  bagItems.innerHTML=bag.map(x=>{
    const p=products.find(y=>y.id===x.id); total+=p.price*x.qty;
    return `<div class="bag-line"><div class="bag-thumb"></div><div><h4>${p.name}</h4><p>${money(p.price)} × ${x.qty}</p><button class="remove" onclick="removeItem(${p.id})">Remove</button></div><b>${money(p.price*x.qty)}</b></div>`
  }).join("");
  totalEl.textContent=money(total);
}
function removeItem(id){bag=bag.filter(x=>x.id!==id);save();}

document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active"); currentFilter=btn.dataset.filter; renderProducts();
}));
document.querySelectorAll("[data-set-filter]").forEach(a=>a.addEventListener("click",()=>{
  setTimeout(()=>{document.querySelector(`.filter[data-filter="${a.dataset.setFilter}"]`)?.click()},50);
}));
document.getElementById("bagOpen").onclick=()=>{drawer.classList.add("open");drawer.setAttribute("aria-hidden","false")};
function closeDrawer(){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true")}
document.getElementById("drawerClose").onclick=closeDrawer;
document.getElementById("drawerX").onclick=closeDrawer;
document.getElementById("searchOpen").onclick=()=>{document.getElementById("searchPanel").classList.add("open");document.getElementById("searchInput").focus()};
document.getElementById("searchClose").onclick=()=>document.getElementById("searchPanel").classList.remove("open");
document.getElementById("searchInput").addEventListener("input",renderProducts);

document.getElementById("mobileMenu").onclick=()=>document.getElementById("mobileNav").classList.toggle("open");
document.querySelectorAll(".mobile-nav a").forEach(a=>a.onclick=()=>document.getElementById("mobileNav").classList.remove("open"));

const modal=document.getElementById("checkoutModal");
document.getElementById("checkoutBtn").onclick=()=>{
 if(!bag.length){showToast("Your bag is empty");return}
 modal.classList.add("open"); closeDrawer();
};
document.getElementById("checkoutClose").onclick=()=>modal.classList.remove("open");
document.getElementById("orderForm").onsubmit=(e)=>{
 e.preventDefault();
 const data=new FormData(e.target);
 const lines=bag.map(x=>{const p=products.find(y=>y.id===x.id);return `${p.name} × ${x.qty} = ${money(p.price*x.qty)}`}).join("%0A");
 const total=bag.reduce((s,x)=>s+products.find(y=>y.id===x.id).price*x.qty,0);
 const msg=`Hello Elora by Emon,%0A%0AI would like to place an order:%0A${lines}%0A%0ATotal: ${money(total)}%0A%0AName: ${encodeURIComponent(data.get("name"))}%0APhone: ${encodeURIComponent(data.get("phone"))}%0AAddress: ${encodeURIComponent(data.get("address"))}`;
 window.open("https://wa.me/8801340772818?text="+msg,"_blank");
};
renderProducts(); updateBag();
