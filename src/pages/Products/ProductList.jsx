import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Pagination from '../../components/Pagination/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { products, categories } from '../../data/products';
import './ProductList.css';

const ITEMS_PER_PAGE = 8;

const sortOptions = [
  { value: 'default',     label: 'Featured' },
  { value: 'price-asc',   label: 'Price: Low to High' },
  { value: 'price-desc',  label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'name-asc',    label: 'Name: A–Z' },
];

function StarRating({ rating, size = 13 }) {
  return (
    <div className="star-rating" aria-label={`${rating} out of 5`}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke="#f59e0b" strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="star-rating__value">{rating}</span>
    </div>
  );
}

const statusVariant = { 'In Stock': 'success', 'Low Stock': 'warning', 'Out of Stock': 'danger' };

/* ── Product Detail Modal ─────────────────────────── */
function ProductModal({ product, onClose, onAddToCart }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handler); };
  }, [onClose]);

  if (!product) return null;

  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="pm-overlay animate-fadeIn" ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="pm animate-fadeInScale" role="dialog" aria-modal="true" aria-label={product.name}>
        {/* Header */}
        <div className="pm__header">
          <h2 className="pm__title">Product Details</h2>
          <button className="pm__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="pm__body">
          {/* Image zone */}
          <div className="pm__image-zone">
            <img src={product.image} alt={product.name} className="pm__image" />
            {discount > 0 && (
              <span className="pm__discount-badge">SAVE {discount}%</span>
            )}
            {/* Brand chip */}
            <div className="pm__brand-chip">{product.brand}</div>
          </div>

          {/* Info */}
          <div className="pm__info">
            <h3 className="pm__name">{product.name}</h3>
            <p className="pm__desc">{product.description}</p>

            <table className="pm__table">
              <tbody>
                <tr>
                  <td>Availability</td>
                  <td>
                    <Badge variant={statusVariant[product.status]} dot>{product.status}</Badge>
                  </td>
                </tr>
                <tr><td>SKU</td><td><strong>{product.sku}</strong></td></tr>
                <tr><td>Category</td><td>{product.category}</td></tr>
                <tr>
                  <td>Rating</td>
                  <td><StarRating rating={product.rating} /></td>
                </tr>
                <tr><td>Reviews</td><td>{product.reviews.toLocaleString()} reviews</td></tr>
                <tr>
                  <td>Price</td>
                  <td>
                    <span className="pm__price">${product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="pm__original">${product.originalPrice}</span>
                    )}
                  </td>
                </tr>
                {product.features && (
                  <tr>
                    <td>Features</td>
                    <td>
                      <ul className="pm__features">
                        {product.features.slice(0,4).map(f => <li key={f}>{f}</li>)}
                      </ul>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pm__footer">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button
            disabled={product.status === 'Out of Stock'}
            onClick={() => { onClose(); onAddToCart(product.id); }}
          >
            {product.status === 'Out of Stock' ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────── */
function ProductList() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort]         = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [selected, setSelected] = useState(null);

  const handleAddToCart = (productId) => {
    navigate(`/products/${productId}?cart=1`);
  };

  const filtered = useMemo(() => {
    let data = [...products];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (category !== 'All') data = data.filter(p => p.category === category);
    switch (sort) {
      case 'price-asc':   data.sort((a,b) => a.price - b.price); break;
      case 'price-desc':  data.sort((a,b) => b.price - a.price); break;
      case 'rating-desc': data.sort((a,b) => b.rating - a.rating); break;
      case 'name-asc':    data.sort((a,b) => a.name.localeCompare(b.name)); break;
    }
    return data;
  }, [search, category, sort]);

  const { paginatedData, currentPage, totalPages, goToPage, hasNext, hasPrev } = usePagination(filtered, ITEMS_PER_PAGE);

  return (
    <>
      <div className="product-list animate-fadeIn">
        {/* Page header */}
        <div className="product-list__header">
          <div>
            <h1 className="product-list__title">Products</h1>
            <p className="product-list__subtitle">{filtered.length} products available</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="product-list__toolbar">
          <div className="product-list__search-wrap">
            <span className="product-list__search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input type="text" placeholder="Search products…" value={search}
              onChange={e => { setSearch(e.target.value); goToPage(1); }}
              className="product-list__search" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="product-list__select">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="product-list__view-btns">
            <button className={`plvb${viewMode==='grid'?' plvb--active':''}`} onClick={() => setViewMode('grid')} aria-label="Grid view">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button className={`plvb${viewMode==='list'?' plvb--active':''}`} onClick={() => setViewMode('list')} aria-label="List view">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="product-list__categories">
          {categories.map(cat => (
            <button key={cat}
              className={`product-list__cat-btn${category===cat?' product-list__cat-btn--active':''}`}
              onClick={() => { setCategory(cat); goToPage(1); }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid / List */}
        {paginatedData.length === 0 ? (
          <div className="product-list__empty">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter.</p>
            <Button onClick={() => { setSearch(''); setCategory('All'); }}>Clear Filters</Button>
          </div>
        ) : (
          <div className={`product-grid product-grid--${viewMode}`}>
            {paginatedData.map((product, i) => (
              <div key={product.id}
                className="product-card"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => setSelected(product)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelected(product)}>
                <div className="product-card__img-wrap">
                  <img src={product.image} alt={product.name} className="product-card__img" loading="lazy"/>
                  {product.originalPrice > product.price && (
                    <span className="product-card__discount-chip">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  )}
                  <div className="product-card__hover-overlay">
                    <span>View Details</span>
                  </div>
                </div>
                <div className="product-card__body">
                  <div className="product-card__meta">
                    <span className="product-card__category">{product.category}</span>
                    <Badge variant={statusVariant[product.status]} size="xs">{product.status}</Badge>
                  </div>
                  <h3 className="product-card__name">{product.name}</h3>
                  <p className="product-card__brand">{product.brand}</p>
                  <StarRating rating={product.rating}/>
                  <div className="product-card__pricing">
                    <span className="product-card__price">${product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="product-card__original">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="product-list__footer">
          <p className="product-list__count">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} hasNext={hasNext} hasPrev={hasPrev}/>
        </div>
      </div>

      {/* Product modal */}
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAddToCart={handleAddToCart}/>}
    </>
  );
}

export default ProductList;
