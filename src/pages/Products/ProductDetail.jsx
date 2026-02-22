import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import { products } from '../../data/products';
import './ProductDetail.css';

const stockBadge   = { 'In Stock': 'success', 'Low Stock': 'warning', 'Out of Stock': 'danger' };
const hcBg         = ['#e9f3ff','#f0fdf4','#fffbeb','#fef2f2','#f3e8ff','#eff6ff'];
const hcColor      = ['#1b84ff','#22c55e','#f59e0b','#ef4444','#a855f7','#3b82f6'];

/* ── Star rating ── */
function Stars({ rating, size = 15 }) {
  return (
    <div className="pd-stars">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke="#f59e0b" strokeWidth="1.6">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="pd-stars__val">{rating}</span>
    </div>
  );
}

/* ── Cart toast ── */
function CartToast({ product, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="pd-toast animate-slideInRight">
      <img src={product.image} alt="" className="pd-toast__img"/>
      <div className="pd-toast__body">
        <p className="pd-toast__label">Added to cart!</p>
        <p className="pd-toast__name">{product.name}</p>
      </div>
      <button className="pd-toast__x" onClick={onClose}>✕</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   DETAIL PANEL  — shown on the right for selected product
══════════════════════════════════════════════════ */
function DetailPanel({ product, cartItems, setCartItems, onNavigate }) {
  const [selImg,    setSelImg]   = useState(0);
  const [qty,       setQty]      = useState(1);
  const [tab,       setTab]      = useState('description');
  const [wishlist,  setWishlist] = useState(false);
  const [showToast, setToast]    = useState(false);

  /* reset when product changes */
  useEffect(() => { setSelImg(0); setQty(1); setTab('description'); setWishlist(false); }, [product.id]);

  const images   = product.images || [product.image];
  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const related  = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  const addToCart = () => {
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { id: product.id, name: product.name, image: product.image, price: product.price, qty }];
    });
    setToast(true);
  };

  return (
    <div className="pd-panel animate-fadeIn" key={product.id}>
      {showToast && <CartToast product={product} onClose={() => setToast(false)}/>}

      {/* ── Image gallery ── */}
      <div className="pd-panel__gallery">
        <div className="pd-panel__main-img">
          <img src={images[selImg]} alt={product.name}/>
          {discount > 0 && <span className="pd-panel__discount">-{discount}%</span>}
          {wishlist && <span className="pd-panel__wl-badge">♥ Wishlisted</span>}
        </div>
        {images.length > 1 && (
          <div className="pd-panel__thumbs">
            {images.map((img, i) => (
              <button key={i}
                className={`pd-panel__thumb${selImg===i?' pd-panel__thumb--active':''}`}
                onClick={() => setSelImg(i)}>
                <img src={img} alt={`view ${i+1}`}/>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="pd-panel__info">
        {/* Badges */}
        <div className="pd-panel__badges">
          <Badge variant={stockBadge[product.status]} dot>{product.status}</Badge>
          <Badge variant="default">{product.category}</Badge>
        </div>

        <h2 className="pd-panel__name">{product.name}</h2>
        <p className="pd-panel__brand">
          by <strong>{product.brand}</strong>
          <span className="pd-panel__sku">SKU: {product.sku}</span>
        </p>

        <div className="pd-panel__rating">
          <Stars rating={product.rating}/>
          <span className="pd-panel__reviews">({product.reviews.toLocaleString()} reviews)</span>
        </div>

        {/* Pricing */}
        <div className="pd-panel__price-row">
          <span className="pd-panel__price">${product.price}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="pd-panel__orig">${product.originalPrice}</span>
              <span className="pd-panel__save">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
            </>
          )}
        </div>

        <p className="pd-panel__desc">{product.description}</p>

        {/* Quantity */}
        {product.status !== 'Out of Stock' && (
          <div className="pd-panel__qty-row">
            <span className="pd-panel__qty-label">Qty</span>
            <div className="pd-panel__qty">
              <button onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q+1))}>+</button>
            </div>
            <span className="pd-panel__stock">{product.stock} in stock</span>
          </div>
        )}

        {/* Actions */}
        <div className="pd-panel__actions">
          <Button size="lg" fullWidth
            disabled={product.status === 'Out of Stock'}
            onClick={addToCart}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6}}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {product.status === 'Out of Stock' ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          <button
            className={`pd-panel__wl-btn${wishlist?' pd-panel__wl-btn--on':''}`}
            onClick={() => setWishlist(v => !v)}>
            <svg width="19" height="19" viewBox="0 0 24 24"
              fill={wishlist?'#ef4444':'none'} stroke={wishlist?'#ef4444':'currentColor'} strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        {/* Tags */}
        <div className="pd-panel__tags">
          {product.tags.map(t => <span key={t} className="pd-panel__tag">#{t}</span>)}
        </div>

        {/* Delivery */}
        <div className="pd-panel__delivery">
          {[
            { icon:'🚚', title:'Free Delivery', desc:'Orders over $50 · 3–5 days' },
            { icon:'↩️', title:'30-Day Returns', desc:'No questions asked' },
            { icon:'🛡️', title:'2-Year Warranty', desc:'Manufacturer covered' },
            { icon:'💬', title:'24/7 Support',   desc:'Live chat & phone' },
          ].map((d,i) => (
            <div key={i} className="pd-panel__del-item">
              <span className="pd-panel__del-icon">{d.icon}</span>
              <div>
                <p className="pd-panel__del-title">{d.title}</p>
                <p className="pd-panel__del-desc">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Highlights ── */}
      <div className="pd-panel__highlights">
        <h3 className="pd-panel__section-title">Product Highlights</h3>
        <div className="pd-panel__hl-grid">
          {product.features.map((f,i) => (
            <div key={i} className="pd-panel__hl-card"
              style={{'--hc-bg':hcBg[i%hcBg.length],'--hc-color':hcColor[i%hcColor.length]}}>
              <div className="pd-panel__hl-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="pd-panel__tabs">
        <div className="pd-panel__tabs-nav">
          {['description','features','reviews'].map(t => (
            <button key={t}
              className={`pd-panel__tab-btn${tab===t?' pd-panel__tab-btn--active':''}`}
              onClick={() => setTab(t)}>
              {t[0].toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        <div className="pd-panel__tab-body">
          {tab === 'description' && (
            <p className="pd-panel__tab-text">{product.description}</p>
          )}
          {tab === 'features' && (
            <ul className="pd-panel__feat-list">
              {product.features.map((f,i) => (
                <li key={i} className="pd-panel__feat-item">
                  <span className="pd-panel__feat-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          )}
          {tab === 'reviews' && (
            <div className="pd-panel__reviews">
              <div className="pd-panel__rev-score">
                <span className="pd-panel__rev-big">{product.rating}</span>
                <div>
                  <Stars rating={product.rating} size={14}/>
                  <p className="pd-panel__rev-count">{product.reviews.toLocaleString()} reviews</p>
                </div>
              </div>
              <div className="pd-panel__rev-bars">
                {[5,4,3,2,1].map(star => {
                  const pct = star===5?62:star===4?23:star===3?10:star===2?3:2;
                  return (
                    <div key={star} className="pd-panel__rev-row">
                      <span>{star}★</span>
                      <div className="pd-panel__rev-track">
                        <div className="pd-panel__rev-fill" style={{width:`${pct}%`}}/>
                      </div>
                      <span>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <div className="pd-panel__related">
          <h3 className="pd-panel__section-title">You May Also Like</h3>
          <div className="pd-panel__rel-grid">
            {related.map(p => (
              <div key={p.id} className="pd-panel__rel-card" onClick={() => onNavigate(p.id)}>
                <div className="pd-panel__rel-img">
                  <img src={p.image} alt={p.name}/>
                </div>
                <p className="pd-panel__rel-name">{p.name}</p>
                <p className="pd-panel__rel-price">${p.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
function ProductDetailPage() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  const activeId = id ? parseInt(id) : products[0].id;
  const product  = products.find(p => p.id === activeId) || products[0];

  const [cartItems, setCartItems] = useState([]);
  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [showCart,  setShowCart]  = useState(false);
  const [removed,   setRemoved]   = useState(null); // for undo toast

  /* Auto-add when coming from product list popup */
  useEffect(() => {
    if (searchParams.get('cart') === '1') {
      setCartItems(prev => {
        const idx = prev.findIndex(i => i.id === product.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
          return next;
        }
        return [...prev, { id: product.id, name: product.name, image: product.image, price: product.price, qty: 1 }];
      });
      setShowCart(true);
    }
  }, []);

  /* Cart helpers */
  const updateQty = (id, delta) => {
    setCartItems(prev => prev
      .map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  };

  const removeItem = (id) => {
    const item = cartItems.find(i => i.id === id);
    setCartItems(prev => prev.filter(i => i.id !== id));
    setRemoved(item);
    setTimeout(() => setRemoved(null), 4000);
  };

  const undoRemove = () => {
    if (removed) {
      setCartItems(prev => [...prev, removed]);
      setRemoved(null);
    }
  };

  const clearCart = () => setCartItems([]);

  const cats     = ['All', ...new Set(products.map(p => p.category))];
  const list     = products.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      && (filterCat === 'All' || p.category === filterCat);
  });

  const totalQty = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalAmt = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const goToProduct = (pid) => navigate(`/products/${pid}`);

  return (
    <div className="pdp animate-fadeIn">

      {/* ── Page header ── */}
      <div className="pdp__header">
        <div>
          <h1 className="pdp__title">Product Details</h1>
          <p className="pdp__sub">{products.length} products · Select any to view full details</p>
        </div>
        <div className="pdp__header-right">
          <button className="pdp__cart-btn" onClick={() => setShowCart(v => !v)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Cart
            {totalQty > 0 && <span className="pdp__cart-badge">{totalQty}</span>}
          </button>
          <button className="pdp__back-btn" onClick={() => navigate('/products')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Product List
          </button>
        </div>
      </div>

      {/* ── Undo remove toast ── */}
      {removed && (
        <div className="pdp__undo-toast animate-slideInRight">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
          </svg>
          <span><strong>{removed.name}</strong> removed</span>
          <button onClick={undoRemove} className="pdp__undo-btn">Undo</button>
        </div>
      )}

      {/* ── Cart drawer ── */}
      {showCart && (
        <div className="pdp__cart-drawer animate-fadeIn">
          {/* Header */}
          <div className="pdp__cart-head">
            <div className="pdp__cart-head-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <h3>Your Cart {totalQty > 0 && <span className="pdp__cart-count">({totalQty})</span>}</h3>
            </div>
            <div className="pdp__cart-head-right">
              {cartItems.length > 0 && (
                <button className="pdp__clear-btn" onClick={clearCart}>Clear all</button>
              )}
              <button className="pdp__cart-close" onClick={() => setShowCart(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Empty state */}
          {cartItems.length === 0 ? (
            <div className="pdp__cart-empty">
              <div className="pdp__cart-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <p className="pdp__cart-empty-title">Your cart is empty</p>
              <p className="pdp__cart-empty-sub">Add products using the "Add to Cart" button</p>
            </div>
          ) : (
            <>
              {/* Items list */}
              <div className="pdp__cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="pdp__cart-item">
                    <img src={item.image} alt={item.name} className="pdp__cart-item-img"/>
                    <div className="pdp__cart-item-info">
                      <p className="pdp__cart-item-name">{item.name}</p>
                      <p className="pdp__cart-item-unit">${item.price} each</p>
                      {/* Qty controls */}
                      <div className="pdp__cart-item-qty">
                        <button
                          className="pdp__qty-btn"
                          onClick={() => updateQty(item.id, -1)}
                          disabled={item.qty <= 1}
                        >−</button>
                        <span className="pdp__qty-val">{item.qty}</span>
                        <button
                          className="pdp__qty-btn"
                          onClick={() => updateQty(item.id, 1)}
                        >+</button>
                        <span className="pdp__item-subtotal">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    </div>
                    {/* Remove button */}
                    <button
                      className="pdp__cart-item-remove"
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="pdp__cart-summary">
                <div className="pdp__cart-summary-row">
                  <span>Subtotal ({totalQty} items)</span>
                  <span>${totalAmt.toFixed(2)}</span>
                </div>
                <div className="pdp__cart-summary-row">
                  <span>Shipping</span>
                  <span className="pdp__cart-free">FREE</span>
                </div>
                <div className="pdp__cart-summary-row pdp__cart-summary-row--total">
                  <span>Total</span>
                  <strong>${totalAmt.toFixed(2)}</strong>
                </div>
              </div>

              <Button fullWidth size="lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6}}>
                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                  <path d="M16 8h4l3 5v3h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                Proceed to Checkout
              </Button>
            </>
          )}
        </div>
      )}

      <div className="pdp__body">

        {/* ── LEFT: Product list sidebar ── */}
        <aside className="pdp__sidebar">
          {/* Search */}
          <div className="pdp__search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="pdp__search"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="pdp__search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>

          {/* Category filter */}
          <div className="pdp__cats">
            {cats.map(c => (
              <button key={c}
                className={`pdp__cat${filterCat===c?' pdp__cat--active':''}`}
                onClick={() => setFilterCat(c)}>
                {c}
              </button>
            ))}
          </div>

          {/* Product count */}
          <p className="pdp__count">{list.length} product{list.length !== 1 ? 's' : ''}</p>

          {/* Product list */}
          <div className="pdp__list">
            {list.length === 0 ? (
              <div className="pdp__empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p>No products found</p>
              </div>
            ) : list.map(p => {
              const isActive = p.id === activeId;
              const disc = p.originalPrice > p.price
                ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
              return (
                <div key={p.id}
                  className={`pdp__item${isActive?' pdp__item--active':''}`}
                  onClick={() => goToProduct(p.id)}>
                  <div className="pdp__item-img">
                    <img src={p.image} alt={p.name}/>
                    {disc > 0 && <span className="pdp__item-disc">-{disc}%</span>}
                  </div>
                  <div className="pdp__item-info">
                    <p className="pdp__item-name">{p.name}</p>
                    <p className="pdp__item-cat">{p.category}</p>
                    <div className="pdp__item-bottom">
                      <span className="pdp__item-price">${p.price}</span>
                      <span className={`pdp__item-status pdp__item-status--${
                        p.status === 'In Stock' ? 'in' : p.status === 'Low Stock' ? 'low' : 'out'
                      }`}>{p.status}</span>
                    </div>
                    <div className="pdp__item-stars">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width="10" height="10" viewBox="0 0 24 24"
                          fill={s<=Math.round(p.rating)?'#f59e0b':'none'} stroke="#f59e0b" strokeWidth="1.8">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                      <span>{p.rating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── RIGHT: Detail panel ── */}
        <main className="pdp__detail">
          <DetailPanel
            product={product}
            cartItems={cartItems}
            setCartItems={setCartItems}
            onNavigate={goToProduct}
          />
        </main>
      </div>
    </div>
  );
}

export default ProductDetailPage;
