// Time Rush — Store & Storage Helpers
// Handles products/settings (localStorage) + cart.

(function(){
  const KEYS = {
    products: 'tr_products_v1',
    settings: 'tr_settings_v1',
    cart: 'tr_cart_v1',
    adminPass: 'tr_admin_pass_v1'
  };

  function safeParse(json, fallback){
    try{ return JSON.parse(json); }catch{ return fallback; }
  }

  function loadSettings(){
    const saved = safeParse(localStorage.getItem(KEYS.settings), null);
    return saved && typeof saved === 'object' ? { ...window.TR_DEFAULT_SETTINGS, ...saved } : { ...window.TR_DEFAULT_SETTINGS };
  }

  function saveSettings(settings){
    localStorage.setItem(KEYS.settings, JSON.stringify(settings));
  }

  function loadProducts(){
    const saved = safeParse(localStorage.getItem(KEYS.products), null);
    if(Array.isArray(saved) && saved.length){
      // Merge minimal defaults to avoid missing fields
      return saved.map(p => ({
        id: String(p.id || '').trim(),
        name: String(p.name || '').trim(),
        brand: String(p.brand || '').trim(),
        category: String(p.category || 'classic').trim(),
        price: Number(p.price || 0),
        compareAtPrice: Number(p.compareAtPrice || 0),
        badge: String(p.badge || ''),
        image: String(p.image || ''),
        images: Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []),
        shortDescription: String(p.shortDescription || ''),
        description: String(p.description || ''),
        highlights: Array.isArray(p.highlights) ? p.highlights : [],
        specs: p.specs && typeof p.specs === 'object' ? p.specs : {},
        active: p.active !== false,
      })).filter(p => p.id && p.name);
    }
    // Default
    return (window.TR_DEFAULT_PRODUCTS || []).map(p=>({ ...p, active: p.active !== false }));
  }

  function saveProducts(products){
    localStorage.setItem(KEYS.products, JSON.stringify(products));
  }

  function resetProductsToDefault(){
    saveProducts(window.TR_DEFAULT_PRODUCTS || []);
    return loadProducts();
  }

  function loadCart(){
    const c = safeParse(localStorage.getItem(KEYS.cart), {});
    return c && typeof c === 'object' ? c : {};
  }

  function saveCart(cart){
    localStorage.setItem(KEYS.cart, JSON.stringify(cart));
  }

  function cartCount(cart){
    return Object.values(cart).reduce((sum, n)=> sum + (Number(n)||0), 0);
  }

  function addToCart(id, qty=1){
    const cart = loadCart();
    cart[id] = (Number(cart[id])||0) + (Number(qty)||1);
    if(cart[id] <= 0) delete cart[id];
    saveCart(cart);
    return cart;
  }

  function setQty(id, qty){
    const cart = loadCart();
    const q = Number(qty)||0;
    if(q <= 0) delete cart[id];
    else cart[id] = q;
    saveCart(cart);
    return cart;
  }

  function removeFromCart(id){
    const cart = loadCart();
    delete cart[id];
    saveCart(cart);
    return cart;
  }

  function clearCart(){
    saveCart({});
    return {};
  }

  function findProduct(products, id){
    return products.find(p=>p.id === id);
  }

  function formatMoney(value, settings){
    const s = settings || loadSettings();
    const num = Number(value || 0);
    return `${s.currencySymbol}${num.toFixed(2)}`;
  }

  function discountPercent(product){
    // Returns integer discount percent when compareAtPrice > price.
    // Example: compareAtPrice=100, price=80 -> 20
    const compare = Number(product?.compareAtPrice || 0);
    const price = Number(product?.price || 0);
    if(!Number.isFinite(compare) || !Number.isFinite(price)) return 0;
    if(compare <= 0 || price <= 0) return 0;
    if(compare <= price) return 0;
    // Round to nearest whole percent.
    return Math.round((1 - (price / compare)) * 100);
  }

  function getParam(name){
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  function ensureAdminPassword(){
    // Default password for demo. User can change it inside admin.
    const current = localStorage.getItem(KEYS.adminPass);
    if(!current){
      localStorage.setItem(KEYS.adminPass, 'timerush');
    }
  }

  function getAdminPassword(){
    ensureAdminPassword();
    return localStorage.getItem(KEYS.adminPass) || 'timerush';
  }

  function setAdminPassword(newPass){
    localStorage.setItem(KEYS.adminPass, String(newPass||'').trim());
  }

  window.TR = {
    KEYS,
    loadSettings,
    saveSettings,
    loadProducts,
    saveProducts,
    resetProductsToDefault,
    loadCart,
    saveCart,
    cartCount,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    findProduct,
    formatMoney,
    discountPercent,
    getParam,
    getAdminPassword,
    setAdminPassword
  };
})();
