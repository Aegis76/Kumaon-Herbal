// ============================================================
// CART STATE
// ============================================================
let cart = JSON.parse(localStorage.getItem('kumaon_cart')) || [];
let activeStock = Infinity;

function getStock(id) {
  if (typeof id !== 'string') return Infinity;
  const card = document.querySelector('.card[data-id="' + id + '"]');
  if (!card || !card.hasAttribute('data-stock')) return Infinity;
  return parseInt(card.getAttribute('data-stock') || '0', 10);
}

// ============================================================
// PRODUCTS DATABASE
// ============================================================
const productsDB = {
  'amla-juice': {
    title: 'Amla Juice', breadcrumb: 'Home / Juices / Amla Juice',
    priceNow: '₹150', priceOld: '₹200', badge: 'Sale!',
    img: '/images/amla juice.jpeg',
    shortDesc: 'Pure Himalayan Amla juice — Vitamin C powerhouse for immunity.',
    descPara1: 'Our Amla Juice is cold-pressed from wild-harvested Indian Gooseberries found in the lower Himalayan ranges. It is a natural source of Vitamin C and antioxidants.',
    descPara2: 'Regular consumption helps in detoxifying the body, improving skin health, and strengthening the immune system.',
    benefits: ['Extremely high in Vitamin C', 'Boosts immunity', 'Improves digestion', 'Great for hair and skin'],
    pros: ['100% pure juice', 'No added sugar', 'Wild-harvested'],
    cons: ['Very sour taste', 'Best consumed diluted'],
    specials: ['Cold-pressed extraction', 'Sourced from Almora region']
  },
  'haldi-latte': {
    title: 'Haldi Latte', breadcrumb: 'Home / Herbal / Wellness',
    priceNow: '₹190', priceOld: '₹200', badge: 'New',
    img: '/images/haldi latte.jpeg',
    shortDesc: 'Golden Milk blend with high-curcumin turmeric & mountain spices.',
    descPara1: 'Our Haldi Latte mix is a proprietary blend of high-altitude Himalayan turmeric, ginger, black pepper, and cardamom.',
    descPara2: 'Designed for the perfect "Golden Milk", it provides anti-inflammatory benefits and a soothing, warm experience before bedtime.',
    benefits: ['Anti-inflammatory', 'Relieves joint pain', 'Improves sleep quality', 'Natural antioxidant'],
    pros: ['Easy to prepare', 'Traditional recipe', 'High curcumin content'],
    cons: ['Needs to be mixed with warm milk/water'],
    specials: ['Stone-ground spices', 'Infused with black pepper for curcumin absorption']
  },
  'litchi': {
    title: 'Litchi Squash', breadcrumb: 'Home / Juices / Litchi Squash',
    priceNow: '₹190', priceOld: '₹200', badge: 'Sale!',
    img: '/images/litchi squash.jpeg',
    shortDesc: 'Rich in Vitamin C, Natural Energy Booster, Balances Electrolytes.',
    descPara1: 'Our Litchi Squash is made from the finest hand-picked litchis from the Himalayan foothills. It offers a refreshing and revitalizing taste that instantly quenches your thirst.',
    descPara2: 'Free from artificial colors and excess sugar, it provides a natural way to stay hydrated and energetic throughout the day.',
    benefits: ['High in Vitamin C for immunity', 'Natural cooling properties', 'Rich in antioxidants', 'Supports digestion'],
    pros: ['100% natural ingredients', 'No artificial colors', 'Refreshing taste'],
    cons: ['Needs refrigeration after opening', 'Consume within 30 days'],
    specials: ['Made with pure Himalayan spring water', 'Cold-pressed extraction method']
  },
  'buransh': {
    title: 'Buransh Juice', breadcrumb: 'Home / Juices / Buransh Juice',
    priceNow: '₹249', priceOld: '₹320', badge: 'Sale!',
    img: '/images/buransh juice.jpeg',
    shortDesc: 'Rare rhododendron flower juice — floral, tangy & rich in antioxidants.',
    descPara1: 'The rhododendron (Buransh) is the state tree of Uttarakhand. Its bright red flowers are hand-harvested in early spring to create this highly medicinal, vibrant juice.',
    descPara2: 'Traditionally used to support heart health and treat mountain sickness, this juice is a pure, tangy elixir that captures the essence of the Himalayas.',
    benefits: ['Excellent for heart health', 'Anti-inflammatory properties', 'Rich source of iron and potassium', 'Relieves fatigue'],
    pros: ['Wild-harvested flowers', 'Traditional recipe', 'Highly nutritious'],
    cons: ['Slightly tart taste', 'Seasonal availability'],
    specials: ['Sourced from forests above 2000m altitude', 'Zero chemical preservatives']
  },
  'aam': {
    title: 'Aam Panna', breadcrumb: 'Home / Juices / Aam Panna',
    priceNow: '₹199', priceOld: '', badge: 'New',
    img: '/images/aam panna.jpeg',
    shortDesc: 'Classic raw mango summer cooler with cumin, black salt & fresh mint.',
    descPara1: 'Aam Panna is India\'s ultimate summer drink. Our version is made using raw green mangoes roasted over open fire, blended with digestive spices like cumin, black salt, and mint.',
    descPara2: 'It instantly restores electrolytes lost through sweat and protects the body against intense heat and sunstroke.',
    benefits: ['Prevents heat stroke', 'Cures digestive disorders', 'Rich in vitamins A, B, and C', 'Restores sodium levels'],
    pros: ['Authentic roasted flavor', 'Perfect balance of sweet and tangy', 'Cooling effect on the body'],
    cons: ['Contains added natural cane sugar'],
    specials: ['Wood-fire roasted mangoes', 'Infused with organic Himalayan mint']
  },
  'mango': {
    title: 'Raw Mango Aam Achar', breadcrumb: 'Home / Pickles / Mango Achar',
    priceNow: '₹189', priceOld: '₹240', badge: 'Bestseller',
    img: 'https://images.unsplash.com/photo-1583394293914-b9f4e0e53a7d?w=500&q=80',
    shortDesc: 'Sun-dried raw mango pieces in mustard oil with kuti mirch & traditional Kumaoni spices.',
    descPara1: 'Our signature Aam Achar is made following a 3-generation old family recipe. We use crisp, sour raw mangoes, sun-dry them on our terraces, and marinate them in cold-pressed mustard oil.',
    descPara2: 'The slow, natural fermentation under the Himalayan sun allows the spices—fennel, nigella, and mountain chili—to mature perfectly, creating an unmatched depth of flavor.',
    benefits: ['Promotes gut health (probiotic)', 'Aids in digestion', 'Authentic traditional taste'],
    pros: ['No synthetic vinegar', 'Naturally sun-cured', 'Cold-pressed mustard oil base'],
    cons: ['Spicy profile', 'Oil content required for preservation'],
    specials: ['Matured in traditional clay martabans', 'Made by a women\'s cooperative in Almora']
  },
  'chilli': {
    title: 'Green Chilli & Garlic Achar', breadcrumb: 'Home / Pickles / Green Chilli Achar',
    priceNow: '₹169', priceOld: '', badge: 'Organic',
    img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=500&q=80',
    shortDesc: 'Fiery hill chillis slow-fermented with roasted garlic — bold & probiotic-rich.',
    descPara1: 'A bold, pungent pickle designed for spice lovers. We use thin, fiery green chilies grown in local organic farms, combined with roasted garlic cloves.',
    descPara2: 'The garlic infuses the mustard oil, mellowing its bite, while the chilies retain their crunch. A tiny spoonful is enough to elevate any simple Indian meal.',
    benefits: ['Metabolism booster', 'Garlic aids heart health', 'Rich in Vitamin C'],
    pros: ['Very flavorful', 'Hand-cut ingredients', 'Zero artificial colors'],
    cons: ['Extremely spicy', 'Strong garlic aroma'],
    specials: ['Uses indigenous mountain garlic', '100% Organic ingredients']
  },
  'lahsun': {
    title: 'Pahadi Lahsun Achar', breadcrumb: 'Home / Pickles / Lahsun Achar',
    priceNow: '₹219', priceOld: '₹280', badge: 'New',
    img: 'https://images.unsplash.com/photo-1612200523018-bcd15ea966?w=500&q=80',
    shortDesc: 'Mountain garlic fermented in cold-pressed mustard oil with Himalayan black salt.',
    descPara1: 'Pahadi Lahsun (Mountain Garlic) is smaller, sweeter, and more potent than regular garlic. We peel each clove by hand and pickle it whole in a minimal spice blend to let the garlic shine.',
    descPara2: 'As it ages, the garlic softens and absorbs the tangy mustard, becoming a delicious, spreadable condiment that is fantastic for immunity.',
    benefits: ['Immunity booster', 'Helps lower cholesterol', 'Rich in allicin'],
    pros: ['Unique sweet-pungent taste', 'Highly medicinal', 'Soft, spreadable texture over time'],
    cons: ['Pungent smell', 'Takes 2-3 weeks to fully mature after opening'],
    specials: ['Single-clove Himalayan garlic', 'Aged for 45 days before packing']
  },
  'tulsi': {
    title: 'Himalayan Tulsi Green Tea', breadcrumb: 'Home / Herbal / Tulsi Green Tea',
    priceNow: '₹349', priceOld: '₹420', badge: 'Popular',
    img: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=500&q=80',
    shortDesc: 'Hand-picked tulsi leaves blended with first-flush Kumaon green tea. Stress relief in every cup.',
    descPara1: 'This soothing blend combines the adaptogenic properties of Rama and Krishna Tulsi with the antioxidant power of high-altitude Kumaon green tea.',
    descPara2: 'It offers a smooth, non-bitter taste with refreshing herbal notes. Perfect for winding down after a long day or starting your morning with calm focus.',
    benefits: ['Reduces stress and cortisol levels', 'Boosts metabolism', 'Detoxifies the body', 'Supports respiratory health'],
    pros: ['Whole leaf tea', 'Pyramid teabags for better infusion', 'No bitter aftertaste'],
    cons: ['Contains mild caffeine', 'Not suitable right before sleep for sensitive individuals'],
    specials: ['First-flush harvest only', 'Sourced from chemical-free estates']
  },
  'honey': {
    title: 'Wild Himalayan Forest Honey', breadcrumb: 'Home / Herbal / Forest Honey',
    priceNow: '₹499', priceOld: '₹620', badge: 'Organic',
    img: 'https://images.unsplash.com/photo-1571745544682-143ea663cf2c?w=500&q=80',
    shortDesc: 'Raw, unfiltered honey from wild Apis dorsata bees — collected from rhododendron forests.',
    descPara1: 'Our honey is sustainably harvested by local tribal communities from deep within the Kumaon forests. It is completely raw, unpasteurized, and unfiltered.',
    descPara2: 'Because it is multifloral, taking nectar from hundreds of medicinal alpine plants, its color, texture, and flavor change with the seasons, making every batch uniquely potent.',
    benefits: ['Soothes coughs and sore throats', 'Natural energy booster', 'Antibacterial and antifungal properties', 'Enhances skin glow'],
    pros: ['100% raw and unprocessed', 'Rich in natural pollen and enzymes', 'Cruelty-free harvesting'],
    cons: ['May crystallize in winter (which proves its purity)', 'Not suitable for infants under 1 year'],
    specials: ['Contains traces of medicinal Himalayan pollen', 'Wood-pressed extraction']
  },
  'peach': {
    title: 'Peach & Buransh Blend', breadcrumb: 'Home / Juices / Peach Blend',
    priceNow: '₹329', priceOld: '₹400', badge: 'Popular',
    img: '/images/litchi squash.jpeg',
    shortDesc: 'Kumaoni hill peach with rhododendron flower extract — sweet, floral & rich in iron.',
    descPara1: 'A unique blend of juicy hill peaches and scarlet Buransh flowers. This refreshing drink combines the vitamins of peach with the heart-healthy benefits of rhododendron.',
    descPara2: 'Naturally sweet and tangy, it is a perfect representation of mountain flavors, enjoyed best chilled or as a base for mocktails.',
    benefits: ['Rich in dietary fiber and vitamins', 'Supports cardiovascular health', 'Improves skin texture', 'Natural blood purifier'],
    pros: ['Unique flavor combination', 'No artificial sweeteners', 'High fruit pulp content'],
    cons: ['Limited seasonal production'],
    specials: ['Sun-ripened Kumaoni peaches', 'Infused with wild Buransh nectar']
  },
  'nimbu': {
    title: 'Nimbu Masala Achar', breadcrumb: 'Home / Pickles / Nimbu Achar',
    priceNow: '₹159', priceOld: '', badge: 'Traditional',
    img: 'https://images.unsplash.com/photo-1601066584547-a4f4e92b6c1b?w=500&q=80',
    shortDesc: 'Juicy hill lemons stuffed with cumin, fenugreek & turmeric — aged 3 months naturally.',
    descPara1: 'Nimbu Masala Achar is a staple in Pahadi households. We use thin-skinned lemons, slit them, and stuff them with a roasted spice mix including carom seeds, fennel, and black salt.',
    descPara2: 'The lemons are then cured in their own juices for months. No oil is used in this recipe, making it a very healthy, oil-free digestive aid.',
    benefits: ['Great for digestion', 'Oil-free recipe', 'Rich in Vitamin C and enzymes'],
    pros: ['Zero oil', 'Long shelf life', 'Sharp, intense flavor'],
    cons: ['Very sour/tangy'],
    specials: ['Zero oil added', 'Aged naturally for 90 days']
  },
  'eucalyptus': {
    title: 'Eucalyptus & Camphor Oil', breadcrumb: 'Home / Herbal / Essential Oil',
    priceNow: '₹379', priceOld: '₹450', badge: 'Top Pick',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80',
    shortDesc: 'Steam-distilled from mountain eucalyptus — used for cold relief, massage & aromatherapy.',
    descPara1: 'Our Eucalyptus oil is steam-distilled in small batches from leaves collected in the high-altitude forests of Kumaon. It is then infused with natural camphor.',
    descPara2: 'It provides instant relief from respiratory congestion and muscle pain. Its crisp, woody aroma also helps clear the mind and improve focus.',
    benefits: ['Relieves respiratory issues', 'Eases muscle and joint pain', 'Natural insect repellent', 'Refreshes the environment'],
    pros: ['100% pure essential oil', 'Potent medicinal properties', 'Versatile use cases'],
    cons: ['Must be diluted before skin application', 'Strong aroma'],
    specials: ['Steam-distilled in Almora', 'Infused with natural camphor crystals']
  },
  'facepack': {
    title: 'Chandan & Haldi Face Pack', breadcrumb: 'Home / Herbal / Skincare',
    priceNow: '₹229', priceOld: '', badge: 'Organic',
    img: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500&q=80',
    shortDesc: 'Wild sandalwood & turmeric blend for clear, glowing skin — chemical free & 100% natural.',
    descPara1: 'Experience the ancient Ayurvedic beauty secret. This face pack combines cooling sandalwood (Chandan) with antiseptic Himalayan turmeric (Haldi).',
    descPara2: 'It helps in reducing acne, evening out skin tone, and providing a natural radiance without the use of any synthetic chemicals or preservatives.',
    benefits: ['Brightens complexion', 'Anti-acne and anti-blemish', 'Soothes skin irritation', 'Removes tan'],
    pros: ['100% edible-grade ingredients', 'Suitable for all skin types', 'No artificial fragrance'],
    cons: ['Needs to be mixed with water/rose water'],
    specials: ['Wild-sourced sandalwood', 'High-curcumin mountain turmeric']
  },
  'buransh-syrup': {
    title: 'Buransh (Rhododendron) Syrup', breadcrumb: 'Home / Herbal / Supplements',
    priceNow: '₹289', priceOld: '', badge: 'New',
    img: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=600&q=80',
    shortDesc: 'Heart-healthy rhododendron flower concentrate — rich in antioxidants & vitamin C.',
    descPara1: 'A thick, ruby-red concentrate made from wild Buransh flowers. This syrup is a powerhouse of nutrients, traditionally given to strengthen the heart and improve blood circulation.',
    descPara2: 'Simply mix with water or soda for a refreshing health drink, or drizzle over desserts for a floral Himalayan touch.',
    benefits: ['Natural heart tonic', 'Boosts hemoglobin', 'Relieves seasonal allergies', 'High Vitamin C'],
    pros: ['Traditional extraction', 'Rich floral aroma', 'Highly concentrated'],
    cons: ['Seasonal availability'],
    specials: ['Hand-pressed petals', 'Sustainably wild-crafted']
  }
};

// ============================================================
// ADVANCED SEO (dynamic, JS-side)
// Updates title/description/OG + injects per-product Product
// JSON-LD when a product detail is opened (virtual page view).
// ============================================================
const __SEO_DEFAULTS = {
  title: document.title,
  desc: document.querySelector('meta[name="description"]') ?
        document.querySelector('meta[name="description"]').content : ''
};
function __setMeta(name, content) {
  let m = document.querySelector('meta[name="' + name + '"]');
  if (!m) { m = document.createElement('meta'); m.setAttribute('name', name); document.head.appendChild(m); }
  m.setAttribute('content', content);
}
function __setOG(prop, content) {
  let m = document.querySelector('meta[property="' + prop + '"]');
  if (!m) { m = document.createElement('meta'); m.setAttribute('property', prop); document.head.appendChild(m); }
  m.setAttribute('content', content);
}
function __injectJSONLD(id, obj) {
  let s = document.getElementById(id);
  if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = id; document.head.appendChild(s); }
  s.textContent = JSON.stringify(obj);
}
function __priceNum(str) { return parseInt(String(str || '').replace(/[^\d]/g, ''), 10) || 0; }
function __absUrl(u) { try { return new URL(u, location.origin).href; } catch (e) { return u; } }

function updateSEOForProduct(p, id) {
  if (!p) return;
  document.title = p.title + ' – Buy Online | Kumaon Herbal';
  __setMeta('description', p.shortDesc || __SEO_DEFAULTS.desc);
  __setOG('og:type', 'product');
  __setOG('og:title', p.title + ' | Kumaon Herbal');
  __setOG('og:description', p.shortDesc || '');
  if (p.img) __setOG('og:image', __absUrl(p.img));
  __injectJSONLD('jsonld-active-product', {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.title,
    "description": p.descPara1 || p.shortDesc || "",
    "image": p.img ? __absUrl(p.img) : undefined,
    "brand": { "@type": "Brand", "name": "Kumaon Herbal" },
    "offers": {
      "@type": "Offer",
      "price": String(__priceNum(p.priceNow)),
      "priceCurrency": "INR",
      "availability": (getStock(id) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock")
    }
  });
}
function resetSEO() {
  document.title = __SEO_DEFAULTS.title;
  __setMeta('description', __SEO_DEFAULTS.desc);
  const s = document.getElementById('jsonld-active-product');
  if (s) s.remove();
}

// ============================================================
// DOMContentLoaded — ALL INITIALIZATION MERGED HERE
// ============================================================
document.addEventListener('DOMContentLoaded', function() {

  // ---- NAVBAR SCROLL EFFECT ----
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // ---- HAMBURGER MENU ----
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (hamburger) hamburger.classList.remove('active');
      if (navLinks) navLinks.classList.remove('active');
    });
  });

  // ---- CART BUTTON ----
  const cartBtn = document.querySelector('.nav-cart');
  if (cartBtn) {
    cartBtn.addEventListener('click', toggleCart);
  }
  updateCartUI();

  // ---- ADD TO CART FEEDBACK ----
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('padd') || e.target.classList.contains('add-btn') || e.target.classList.contains('do-cart-btn')) {
      const btn = e.target;
      let pId = null;
      const card = btn.closest('.card') || btn.closest('.pcard');
      if (card) {
        pId = card.getAttribute('data-id') || findIdByTitle(card.querySelector('.card-title, .ptitle')?.textContent);
      } else if (btn.classList.contains('do-cart-btn')) {
        const title = document.getElementById('do-title')?.textContent;
        pId = findIdByTitle(title);
      }
      if (pId) {
        const added = addToCart(pId);
        if (!added) return;
        const orig = btn.textContent;
        btn.textContent = '✓ Added!';
        const origBg = btn.style.background;
        btn.style.background = 'var(--green-light)';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = origBg;
        }, 1500);
      }
    }
  });

  // ---- NEWSLETTER ----
  const nlBtn = document.getElementById('nlbtn') || document.querySelector('.nl-form button');
  if (nlBtn) {
    nlBtn.addEventListener('click', function() {
      const input = document.querySelector('.nl-form input');
      if (input && input.value.includes('@')) {
        const orig = this.textContent;
        this.textContent = '✓ Subscribed!';
        this.style.background = 'var(--green-light)';
        input.value = '';
        setTimeout(() => {
          this.textContent = orig;
          this.style.background = '';
        }, 3000);
      }
    });
  }

  // ---- WISHLIST TOGGLE ----
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.textContent = btn.textContent === '♡' ? '♥' : '♡';
      btn.style.color = btn.textContent === '♥' ? '#e05a5a' : '';
    });
  });

  // ---- BLOG FILTER BUTTONS (FULL LOGIC) ----
  const filterButtons = document.querySelectorAll('.filter-bar .f-btn');
  const blogCards = document.querySelectorAll('.blog-grid .blog-card');
  const featuredPost = document.querySelector('.featured-post');

  const categoryMap = {
    '🌿 Herbs & Plants': ['🌿', '🌸'],
    '🍹 Juices & Drinks': ['🍹'],
    '🫙 Pickles & Recipes': ['🫙'],
    '💚 Wellness': ['💚', '🍯'],
    '🏔️ Kumaon Stories': ['🏔️']
  };

  blogCards.forEach(card => card.style.display = 'block');

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      const filterText = this.textContent.trim();

      blogCards.forEach(card => {
        const tagElement = card.querySelector('.bc-cat-tag');
        if (!tagElement) {
          card.style.display = 'block';
          return;
        }
        const tagText = tagElement.textContent.trim();
        let show = false;
        if (filterText === 'All Posts') {
          show = true;
        } else {
          const matchingEmojis = categoryMap[filterText] || [];
          show = matchingEmojis.some(emoji => tagText.includes(emoji));
        }
        card.style.display = show ? 'block' : 'none';
      });

      if (featuredPost) {
        const featuredTag = featuredPost.querySelector('.fp-cat');
        if (featuredTag) {
          const tagText = featuredTag.textContent.trim();
          let showFeatured = false;
          if (filterText === 'All Posts') {
            showFeatured = true;
          } else {
            const matchingEmojis = categoryMap[filterText] || [];
            showFeatured = matchingEmojis.some(emoji => tagText.includes(emoji));
          }
          featuredPost.style.display = showFeatured ? 'flex' : 'none';
        }
      }
    });
  });

  // ---- PRODUCT CARDS CLICK (Open detail overlay) ----
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains('add-btn') || e.target.classList.contains('wishlist-btn')) return;
      const id = card.getAttribute("data-id");
      if (id) openDetail(id);
    });
  });

});

// ============================================================
// CART FUNCTIONS
// ============================================================
function toggleCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  if (!cartOverlay) createCartHTML();
  const co = document.getElementById('cart-overlay');
  if (co.style.display === 'flex') {
    co.style.display = 'none';
    document.body.style.overflow = '';
  } else {
    co.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    updateCartUI();
  }
}

function createCartHTML() {
  const html = `
    <div id="cart-overlay" style="position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:3000; display:none; justify-content:flex-end;">
      <div id="cart-drawer" style="width:100%; max-width:400px; background:#fff; height:100%; display:flex; flex-direction:column; box-shadow:-10px 0 30px rgba(0,0,0,0.1); animation:slideInRight 0.4s ease;">
        <div style="padding:1.5rem; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-family:'Playfair Display',serif; color:var(--green-deep); margin:0;">Your Shopping Bag</h3>
          <button onclick="toggleCart()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-dark);">&times;</button>
        </div>
        <div id="cart-items" style="flex:1; overflow-y:auto; padding:1.5rem;"></div>
        <div id="cart-footer" style="padding:1.5rem; border-top:1px solid #eee; background:#fdfaf4;">
          <div style="display:flex; justify-content:space-between; margin-bottom:1rem; font-weight:600; color:var(--green-deep);">
            <span>Subtotal</span>
            <span id="cart-total">₹0</span>
          </div>
          <button class="btn-primary" style="width:100%; padding:1rem;" onclick="showPaymentDetails()">Proceed to Checkout</button>
          <p style="text-align:center; font-size:0.75rem; color:var(--text-light); margin-top:0.8rem;">Shipping and taxes calculated at checkout.</p>
        </div>
      </div>
    </div>
    <style>
      @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      .cart-item { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; }
      .cart-item img { width: 70px; height: 70px; object-fit: cover; border-radius: 8px; }
      .cart-item-info { flex: 1; }
      .cart-item-info h4 { margin: 0 0 0.3rem; font-size: 0.95rem; color: var(--green-deep); }
      .cart-item-info p { margin: 0; font-size: 0.85rem; color: var(--text-mid); }
      .qty-control { display: flex; align-items: center; gap: 0.8rem; margin-top: 0.5rem; }
      .qty-control button { width: 24px; height: 24px; border-radius: 50%; border: 1px solid #ddd; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
      .remove-item { background: none; border: none; color: #e05a5a; font-size: 0.75rem; cursor: pointer; padding: 0; margin-top: 0.5rem; text-decoration: underline; }
    </style>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('cart-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'cart-overlay') toggleCart();
  });
}

function addToCart(pId) {
  const product = productsDB[pId];
  if (!product) return false;
  const stock = getStock(pId);
  const existingItem = cart.find(item => item.id === pId);
  const inCart = existingItem ? existingItem.quantity : 0;
  const qtyInput = document.getElementById('do-qty');
  let addedQty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
  if (stock <= 0) {
    alert(product.title + ' is currently out of stock.');
    return false;
  }
  if (inCart >= stock) {
    alert('You already have all ' + stock + ' available of ' + product.title + ' in your bag.');
    return false;
  }
  if (inCart + addedQty > stock) {
    addedQty = stock - inCart;
    alert('Only ' + stock + ' of ' + product.title + ' in stock — adding ' + addedQty + ' to your bag.');
  }
  if (existingItem) {
    existingItem.quantity += addedQty;
  } else {
    cart.push({
      id: pId,
      title: product.title,
      price: parseInt(product.priceNow.replace('₹', '')),
      img: product.img,
      quantity: addedQty
    });
  }
  if (qtyInput) qtyInput.value = 1;
  saveCart();
  updateCartUI();
  return true;
}

function removeFromCart(pId) {
  cart = cart.filter(item => item.id !== pId);
  saveCart();
  updateCartUI();
}

function updateQuantity(pId, delta) {
  const item = cart.find(item => item.id === pId);
  if (item) {
    if (delta > 0) {
      const stock = getStock(pId);
      if (item.quantity >= stock) {
        alert('Only ' + stock + ' in stock.');
        return;
      }
    }
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(pId);
    } else {
      saveCart();
      updateCartUI();
    }
  }
}

function saveCart() {
  localStorage.setItem('kumaon_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const itemsContainer = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const navCartEls = document.querySelectorAll('.nav-cart');
  let total = 0;
  let count = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    count += item.quantity;
  });
  navCartEls.forEach(el => {
    el.textContent = `🛒 Cart (${count})`;
  });
  if (!itemsContainer) return;
  if (cart.length === 0) {
    itemsContainer.innerHTML = `<div style="text-align:center; padding:3rem 0; color:var(--text-light);">Your bag is empty.</div>`;
    totalEl.textContent = '₹0';
    return;
  }
  itemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.title}">
      <div class="cart-item-info">
        <h4>${item.title}</h4>
        <p>₹${item.price}</p>
        <div class="qty-control">
          <button onclick="updateQuantity('${item.id}', -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity('${item.id}', 1)">+</button>
        </div>
        <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
      <div style="font-weight:600; color:var(--green-deep);">₹${item.price * item.quantity}</div>
    </div>
  `).join('');
  totalEl.textContent = `₹${total}`;
}

function findIdByTitle(title) {
  if (!title) return null;
  const cleanTitle = title.trim().toLowerCase();
  for (let id in productsDB) {
    if (productsDB[id].title.toLowerCase() === cleanTitle) return id;
  }
  for (let id in productsDB) {
    if (cleanTitle.includes(id.toLowerCase())) return id;
  }
  return null;
}

// ============================================================
// PRODUCT DETAIL OVERLAY
// ============================================================
function openDetail(pId) {
  const p = typeof pId === 'string' ? productsDB[pId] : pId;
  if (!p) return;
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  };
  setText('do-title', p.title);
  setText('do-breadcrumb', p.breadcrumb);
  setText('do-price-now', p.priceNow);
  setText('do-short-desc', p.shortDesc);
  setText('do-desc-title', 'About ' + (p.title || 'Product'));
  setText('do-desc-para1', p.descPara1);
  setText('do-desc-para2', p.descPara2);
  const oldPriceEl = document.getElementById('do-price-old');
  if (oldPriceEl) {
    oldPriceEl.textContent = p.priceOld || '';
    oldPriceEl.style.display = p.priceOld ? 'inline-block' : 'none';
  }
  const badgeEl = document.getElementById('do-badge');
  if (badgeEl) {
    badgeEl.textContent = p.badge || '';
    badgeEl.style.display = p.badge ? 'inline-block' : 'none';
  }
  const imgEl = document.getElementById('do-main-img');
  if (imgEl && p.img) {
    imgEl.src = p.img;
    imgEl.alt = p.title;
  }
  const benefitsList = document.getElementById('do-benefits-list');
  const benefitsTitle = document.getElementById('do-benefits-title');
  if (benefitsList && benefitsTitle) {
    if (p.benefits && p.benefits.length > 0) {
      benefitsTitle.style.display = 'block';
      benefitsList.style.display = 'grid';
      benefitsList.innerHTML = p.benefits.map((b, i) => `<li><div class="do-benefit-num">${i + 1}</div><div>${b}</div></li>`).join('');
    } else {
      benefitsTitle.style.display = 'none';
      benefitsList.style.display = 'none';
    }
  }
  const prosDiv = document.getElementById('do-pros');
  const consDiv = document.getElementById('do-cons');
  if (prosDiv) prosDiv.innerHTML = (p.pros || []).map(x => `<div class="do-pc-item"><div class="do-pc-dot"></div>${x}</div>`).join('');
  if (consDiv) consDiv.innerHTML = (p.cons || []).map(x => `<div class="do-pc-item"><div class="do-pc-dot"></div>${x}</div>`).join('');
  const specialsDiv = document.getElementById('do-why-specials');
  if (specialsDiv) specialsDiv.innerHTML = (p.specials || []).map(x => `<div class="do-special-item">✨ ${x}</div>`).join('');

  const sid = typeof pId === 'string' ? pId : null;
  activeStock = sid ? getStock(sid) : Infinity;
  const buyBtn = document.querySelector('.do-cart-btn');
  if (buyBtn) {
    if (activeStock <= 0) {
      buyBtn.disabled = true;
      buyBtn.textContent = 'Sold Out';
    } else {
      buyBtn.disabled = false;
      buyBtn.textContent = 'Add to Bag';
    }
  }
  const qtyReset = document.getElementById('do-qty');
  if (qtyReset) qtyReset.value = 1;

  document.querySelectorAll('.do-tab').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('.do-tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === 'tab-desc'));

  // ---- ADVANCED SEO: reflect this product as a virtual page view ----
  updateSEOForProduct(p, sid);

  const ov = document.getElementById('detail-overlay');
  if (ov) {
    ov.style.display = 'block';
    ov.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
}

function closeDetail() {
  const ov = document.getElementById('detail-overlay');
  if (ov) ov.style.display = 'none';
  document.body.style.overflow = '';
  resetSEO();
}

function changeQty(delta) {
  const input = document.getElementById('do-qty');
  if (input) {
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    if (activeStock && val > activeStock) {
      val = activeStock;
      alert('Only ' + activeStock + ' in stock.');
    }
    input.value = val;
  }
}

function switchTab(btn, tabId) {
  document.querySelectorAll('.do-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.do-tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById(tabId);
  if (panel) panel.classList.add('active');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDetail();
    if (document.getElementById('cart-overlay')?.style.display === 'flex') toggleCart();
  }
});

// ============================================================
// ORDER DESTINATION CONFIG  ← edit these
// ============================================================
const ORDER_CONFIG = {
  // Business name shown on the checkout.
  BUSINESS_NAME: "Kumaon Herbal",

  // WhatsApp number that receives orders (country code + number, no +, spaces or dashes)
  WHATSAPP_NUMBER: "919761420066",

  // Your UPI ID and the QR image shown on the checkout.
  UPI_ID: "YOUR_UPI_ID@bank",
  QR_IMAGE_URL: "https://github.com/Aegis76/Kumaon-Herbal/blob/main/WhatsApp%20Image%202026-06-18%20at%202.13.04%20PM.jpeg?raw=true",

  // Email that receives orders (Web3Forms delivers to the inbox your ACCESS KEY is registered to).
  ORDER_EMAIL: "Kumaonherbal@gmail.com",

  // Get this from https://web3forms.com (sign up with the ORDER_EMAIL above).
  WEB3FORMS_ACCESS_KEY: "YOUR_WEB3FORMS_ACCESS_KEY",

  // Attach the payment screenshot to the EMAIL too (Web3Forms Pro feature).
  ATTACH_SCREENSHOT_TO_EMAIL: false,
};

// ============================================================
// PAYMENT SCREENSHOT VERIFICATION (on-device OCR)
// Reads the uploaded image and checks for payment markers.
// If it doesn't look like a payment screenshot → shows a BEWARE
// warning and requires explicit confirmation before sending.
// ============================================================
let __shotState = '';          // '' | 'checking' | 'valid' | 'beware' | 'unverified'
let __payTotal = 0;
let __ocrLoading = false;

const PAY_KEYWORDS = [
  'paid', 'payment', 'upi', 'transaction', 'txn', 'successful', 'success',
  'completed', 'sent', 'received', 'debited', 'credited', 'transferred',
  'ref no', 'ref:', 'reference', 'utr', 'gpay', 'google pay', 'phonepe',
  'phone pe', 'paytm', 'bhim', 'amazon pay', 'banking', 'inr', 'rupee', '₹'
];

function loadTesseract() {
  return new Promise((resolve) => {
    if (window.Tesseract) { resolve(true); return; }
    if (__ocrLoading) {
      const t = setInterval(() => {
        if (window.Tesseract) { clearInterval(t); resolve(true); }
      }, 300);
      setTimeout(() => { clearInterval(t); resolve(!!window.Tesseract); }, 9000);
      return;
    }
    __ocrLoading = true;
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

function setShotState(state) {
  __shotState = state;
  const st = document.getElementById('kh-shot-status');
  const cw = document.getElementById('kh-shot-confirm-wrap');
  if (st) {
    const map = {
      checking:   '⏳ Verifying your screenshot…',
      valid:      '✓ Looks like a valid payment screenshot.',
      beware:     '⚠️ Beware — this doesn’t look like a payment screenshot. Please upload your correct UPI / payment confirmation.',
      unverified: 'ℹ️ Couldn’t auto-verify this image. Please confirm it is your payment screenshot below.'
    };
    st.textContent = map[state] || '';
    st.className = 'kh-shot-status kh-' + (state || 'none');
    st.style.display = state ? 'block' : 'none';
  }
  if (cw) cw.style.display = (state === 'beware' || state === 'unverified') ? 'flex' : 'none';
  const c = document.getElementById('kh-shot-confirm');
  if (c && (state === 'valid' || state === 'checking' || state === '')) c.checked = false;
}

async function validateScreenshot(file) {
  setShotState('checking');
  const ok = await loadTesseract();
  if (!ok || !window.Tesseract) { setShotState('unverified'); return; }
  try {
    const result = await window.Tesseract.recognize(file, 'eng');
    const text = ((result && result.data && result.data.text) || '').toLowerCase();
    const hasKeyword = PAY_KEYWORDS.some(k => text.includes(k));
    const compact = text.replace(/[,\s]/g, '');
    const hasAmount = __payTotal > 0 && compact.includes(String(__payTotal));
    setShotState((hasKeyword || hasAmount) ? 'valid' : 'beware');
  } catch (err) {
    console.warn('OCR failed:', err);
    setShotState('unverified');
  }
}

function screenshotApproved() {
  const file = document.getElementById('cust-screenshot')?.files[0];
  if (!file) return false;
  if (__shotState === 'valid') return true;
  if (__shotState === 'beware' || __shotState === 'unverified') {
    const c = document.getElementById('kh-shot-confirm');
    return !!(c && c.checked);
  }
  return false; // 'checking' or unset
}

// ============================================================
// PAYMENT & ORDER FUNCTIONS
// ============================================================
function ensurePayStyles() {
  if (document.getElementById('kh-pay-styles')) return;
  const css = `
  #payment-popup{position:fixed;inset:0;background:rgba(12,28,20,.72);backdrop-filter:blur(3px);z-index:99999;display:flex;justify-content:center;align-items:flex-start;padding:28px 14px;overflow-y:auto;font-family:'Jost',system-ui,sans-serif;}
  .kh-pay{background:#fff;width:100%;max-width:860px;border-radius:20px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.4);animation:khPop .3s ease;}
  @keyframes khPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
  .kh-head{background:linear-gradient(135deg,#14432e,#1f5e3a);color:#fff;padding:20px 26px;display:flex;justify-content:space-between;align-items:center;}
  .kh-head h2{font-family:'Playfair Display',serif;font-size:1.5rem;margin:0;font-weight:700;}
  .kh-head .kh-sub{font-size:.78rem;letter-spacing:.04em;opacity:.85;margin-top:2px;display:flex;align-items:center;gap:6px;}
  .kh-close{background:rgba(255,255,255,.15);border:none;color:#fff;width:34px;height:34px;border-radius:50%;font-size:1.4rem;line-height:1;cursor:pointer;flex:0 0 auto;}
  .kh-body{display:grid;grid-template-columns:1fr 1fr;gap:0;}
  .kh-col{padding:24px 26px;}
  .kh-col.left{border-right:1px solid #eee;}
  .kh-step{font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2e7d32;margin:0 0 12px;display:flex;align-items:center;gap:8px;}
  .kh-step b{background:#2e7d32;color:#fff;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.72rem;}
  .kh-field{margin-bottom:11px;}
  .kh-field input,.kh-field textarea{width:100%;padding:11px 13px;border:1px solid #dcdcd2;border-radius:10px;font-size:.92rem;font-family:inherit;box-sizing:border-box;background:#fcfcf9;}
  .kh-field input:focus,.kh-field textarea:focus{outline:none;border-color:#2e7d32;background:#fff;}
  .kh-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .kh-summary{background:#f6f8f3;border:1px solid #e6ece1;border-radius:12px;padding:14px 16px;margin-bottom:16px;}
  .kh-summary .kh-line{display:flex;justify-content:space-between;font-size:.86rem;color:#3a4a3f;padding:3px 0;}
  .kh-summary .kh-tot{display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:10px;border-top:1px dashed #cdd8c8;}
  .kh-summary .kh-tot b{font-family:'Playfair Display',serif;font-size:1.5rem;color:#14432e;}
  .kh-qr-wrap{text-align:center;background:#f6f8f3;border:1px solid #e6ece1;border-radius:14px;padding:16px;margin-bottom:14px;}
  .kh-qr-wrap img{width:190px;max-width:100%;border-radius:10px;background:#fff;border:1px solid #e0e0d6;}
  .kh-pay-amt{font-family:'Playfair Display',serif;font-size:1.7rem;font-weight:700;color:#14432e;margin:10px 0 4px;}
  .kh-upi{display:flex;gap:8px;align-items:center;justify-content:center;margin-top:8px;}
  .kh-upi code{background:#fff;border:1px dashed #2e7d32;border-radius:8px;padding:7px 10px;font-size:.85rem;color:#14432e;}
  .kh-upi button{background:#14432e;color:#fff;border:none;border-radius:8px;padding:8px 12px;font-size:.78rem;font-weight:600;cursor:pointer;}
  .kh-shot-box{border:1.5px dashed #cdd8c8;border-radius:12px;padding:14px;margin-top:6px;}
  .kh-shot-box input[type=file]{width:100%;font-size:.85rem;}
  .kh-shot-preview{display:none;width:100%;max-height:160px;object-fit:contain;border-radius:10px;margin-top:10px;background:#f3f3ec;}
  .kh-shot-status{display:none;margin-top:10px;padding:10px 12px;border-radius:9px;font-size:.82rem;font-weight:600;line-height:1.5;}
  .kh-shot-status.kh-checking{background:#eef3ee;color:#3a4a3f;}
  .kh-shot-status.kh-valid{background:#e8f3e9;color:#2e7d32;}
  .kh-shot-status.kh-beware{background:#fde8e6;color:#b3261e;border:1px solid #f3b6af;}
  .kh-shot-status.kh-unverified{background:#fbf0dd;color:#9a6a00;}
  .kh-confirm{display:none;align-items:flex-start;gap:8px;margin-top:10px;font-size:.82rem;color:#555;cursor:pointer;}
  .kh-confirm input{margin-top:3px;}
  .kh-send{width:100%;margin-top:16px;padding:14px;background:#25D366;color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s;}
  .kh-send:hover{background:#1faa53;}
  .kh-note{font-size:.74rem;color:#7a857d;text-align:center;margin-top:9px;line-height:1.5;}
  @media (max-width:760px){.kh-body{grid-template-columns:1fr;}.kh-col.left{border-right:none;border-bottom:1px solid #eee;}}
  `;
  const tag = document.createElement('style');
  tag.id = 'kh-pay-styles';
  tag.textContent = css;
  document.head.appendChild(tag);
}

function showPaymentDetails() {
  if (cart.length === 0) { alert("Your cart is empty."); return; }
  ensurePayStyles();
  let total = 0;
  cart.forEach(item => { total += item.price * item.quantity; });
  __payTotal = total;
  __shotState = '';

  const itemsHTML = cart.map(it =>
    `<div class="kh-line"><span>${it.title} × ${it.quantity}</span><span>₹${it.price * it.quantity}</span></div>`
  ).join('');

  const html = `
  <div id="payment-popup">
    <div class="kh-pay">
      <div class="kh-head">
        <div>
          <h2>Secure Checkout</h2>
          <div class="kh-sub">🔒 ${ORDER_CONFIG.BUSINESS_NAME} · Pay by UPI</div>
        </div>
        <button class="kh-close" onclick="closePaymentPopup()" aria-label="Close">×</button>
      </div>

      <div class="kh-body">
        <!-- LEFT: details + summary -->
        <div class="kh-col left">
          <p class="kh-step"><b>1</b> Your details</p>
          <div class="kh-field"><input id="cust-name" type="text" placeholder="Full name *"></div>
          <div class="kh-field"><input id="cust-phone" type="tel" placeholder="Mobile number *"></div>
          <div class="kh-field"><input id="cust-email" type="email" placeholder="Email address"></div>
          <div class="kh-field"><textarea id="cust-address" placeholder="Full delivery address *" style="height:74px;"></textarea></div>
          <div class="kh-row">
            <div class="kh-field"><input id="cust-city" type="text" placeholder="City"></div>
            <div class="kh-field"><input id="cust-state" type="text" placeholder="State"></div>
          </div>
          <div class="kh-field"><input id="cust-pincode" type="text" placeholder="PIN code"></div>

          <div class="kh-summary">
            ${itemsHTML}
            <div class="kh-tot"><span>Total payable</span><b>₹${total}</b></div>
          </div>
        </div>

        <!-- RIGHT: pay + screenshot -->
        <div class="kh-col right">
          <p class="kh-step"><b>2</b> Scan &amp; pay</p>
          <div class="kh-qr-wrap">
            <img src="${ORDER_CONFIG.QR_IMAGE_URL}" alt="UPI QR code for ${ORDER_CONFIG.BUSINESS_NAME}">
            <div class="kh-pay-amt">Pay ₹${total}</div>
            <div class="kh-upi">
              <code id="kh-upi-id">${ORDER_CONFIG.UPI_ID}</code>
              <button onclick="copyUPI()">Copy</button>
            </div>
          </div>

          <p class="kh-step" style="margin-top:18px;"><b>3</b> Upload payment screenshot *</p>
          <div class="kh-shot-box">
            <input id="cust-screenshot" type="file" accept="image/*">
            <img id="kh-shot-preview" class="kh-shot-preview" alt="Payment screenshot preview">
            <div id="kh-shot-status" class="kh-shot-status"></div>
            <label id="kh-shot-confirm-wrap" class="kh-confirm">
              <input type="checkbox" id="kh-shot-confirm">
              <span>I confirm this is my genuine payment screenshot for this order.</span>
            </label>
          </div>

          <button class="kh-send" id="kh-send-btn" onclick="sendOrder(${total})">
            ✅ Send order on WhatsApp
          </button>
          <p class="kh-note">Your screenshot &amp; details are shared straight to our WhatsApp. A copy is also emailed to us.</p>
        </div>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  document.body.style.overflow = 'hidden';

  // Bind screenshot input → live OCR verification
  const fileInput = document.getElementById('cust-screenshot');
  if (fileInput) {
    fileInput.addEventListener('change', function () {
      const f = this.files && this.files[0];
      const prev = document.getElementById('kh-shot-preview');
      if (!f) { setShotState(''); if (prev) prev.style.display = 'none'; return; }
      if (prev) { prev.src = URL.createObjectURL(f); prev.style.display = 'block'; }
      validateScreenshot(f);
    });
  }
}

function buildOrderMessage(total) {
  const v = id => (document.getElementById(id)?.value || '');
  let msg = `🛍️ NEW ORDER - KUMAON HERBAL\n\n👤 Name: ${v('cust-name')}\n📞 Phone: ${v('cust-phone')}\n📧 Email: ${v('cust-email')}\n\n📍 DELIVERY ADDRESS\n${v('cust-address')}\n${v('cust-city')}, ${v('cust-state')} - ${v('cust-pincode')}\n\nORDER ITEMS`;
  cart.forEach(item => {
    msg += `\n• ${item.title} x${item.quantity} = ₹${item.price * item.quantity}`;
  });
  msg += `\n\nTOTAL: ₹${total}\n✅ Payment done — screenshot attached.`;
  return msg;
}

// Emails the order to ORDER_EMAIL via Web3Forms. Fails silently so it never
// blocks the WhatsApp flow. Skipped until a real access key is set.
async function sendEmailOrder(total) {
  if (!ORDER_CONFIG.WEB3FORMS_ACCESS_KEY ||
      ORDER_CONFIG.WEB3FORMS_ACCESS_KEY === "YOUR_WEB3FORMS_ACCESS_KEY") {
    return;
  }
  const v = id => (document.getElementById(id)?.value || '');

  const formData = new FormData();
  formData.append("access_key", ORDER_CONFIG.WEB3FORMS_ACCESS_KEY);
  formData.append("subject", `🛍️ New Order - Kumaon Herbal - ₹${total}`);
  formData.append("from_name", v('cust-name') || "Kumaon Herbal Website");
  formData.append("email", v('cust-email') || ORDER_CONFIG.ORDER_EMAIL);
  formData.append("message", buildOrderMessage(total));
  formData.append("Customer Name", v('cust-name'));
  formData.append("Phone", v('cust-phone'));
  formData.append("Customer Email", v('cust-email'));
  formData.append("Address", v('cust-address'));
  formData.append("City", v('cust-city'));
  formData.append("State", v('cust-state'));
  formData.append("PIN Code", v('cust-pincode'));
  formData.append("Order Total", `₹${total}`);

  if (ORDER_CONFIG.ATTACH_SCREENSHOT_TO_EMAIL) {
    const file = document.getElementById('cust-screenshot')?.files[0];
    if (file) formData.append("attachment", file);
  }

  try {
    await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
  } catch (err) {
    console.error("Email order failed (WhatsApp still works):", err);
  }
}

async function sendOrder(total) {
  const v = id => (document.getElementById(id)?.value || '');
  if (!v('cust-name') || !v('cust-phone') || !v('cust-address')) {
    alert("Please fill Name, Mobile Number and Address.");
    return;
  }
  const file = document.getElementById('cust-screenshot')?.files[0];
  if (!file) { alert("Please attach your payment screenshot first."); return; }

  if (__shotState === 'checking') {
    alert("Still verifying your screenshot — please wait a moment, then tap Send again.");
    return;
  }

  // Screenshot gate: only a genuine payment screenshot passes automatically.
  // Anything else triggers the BEWARE warning + must be explicitly confirmed.
  if (!screenshotApproved()) {
    alert("⚠️ BEWARE: This doesn’t look like a payment screenshot.\n\nPlease upload your correct UPI / payment confirmation. If you are sure it is correct, tick the confirmation box and try again.");
    return;
  }

  const message = buildOrderMessage(total);

  // 1) Email the full order (+ screenshot on Web3Forms Pro) in the background.
  sendEmailOrder(total);

  // 2) Try to SHARE the screenshot + details straight to WhatsApp.
  //    The Web Share API is the only browser API that can push the image file
  //    INTO WhatsApp (wa.me links cannot pre-attach files). The customer picks
  //    your chat from the share sheet.
  const canFiles = navigator.canShare && navigator.canShare({ files: [file] });
  if (canFiles) {
    try {
      await navigator.share({
        files: [file],
        text: message,
        title: ORDER_CONFIG.BUSINESS_NAME + ' Order'
      });
      orderSuccessUI(message);
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return; // user cancelled the share sheet
      // otherwise fall through to the wa.me fallback below
    }
  }

  // 3) Fallback (mostly desktop): open the chat to your number with the order
  //    pre-filled as text. Customer attaches the screenshot manually; the email
  //    copy already carries everything.
  const waUrl = "https://wa.me/" + ORDER_CONFIG.WHATSAPP_NUMBER +
                "?text=" + encodeURIComponent(message + "\n\n(Please attach the payment screenshot in this chat.)");
  window.open(waUrl, "_blank");
  alert("WhatsApp is opening with your order. Tap SEND, then attach your payment screenshot in the chat. A copy has also been emailed to us.");
}

// Success screen after a share, with a guaranteed link to the business number.
function orderSuccessUI(message) {
  const popup = document.getElementById('payment-popup');
  if (!popup) return;
  const waUrl = "https://wa.me/" + ORDER_CONFIG.WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  popup.querySelector('.kh-pay').innerHTML = `
    <div class="kh-head"><div><h2>Order Sent 🎉</h2><div class="kh-sub">Thank you for shopping with ${ORDER_CONFIG.BUSINESS_NAME}</div></div>
      <button class="kh-close" onclick="closePaymentPopup()">×</button></div>
    <div style="padding:30px 26px;text-align:center;">
      <div style="font-size:2.6rem;margin-bottom:8px;">✅</div>
      <p style="color:#3a4a3f;line-height:1.7;font-size:.95rem;max-width:42ch;margin:0 auto 18px;">
        Your order and payment screenshot have been shared. If you didn’t send it to our official chat,
        use the button below to reach us directly.</p>
      <a href="${waUrl}" target="_blank" rel="noopener"
         style="display:inline-flex;gap:8px;align-items:center;background:#25D366;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:12px;">💬 Message us on WhatsApp</a>
    </div>`;
}

function closePaymentPopup() {
  const popup = document.getElementById('payment-popup');
  if (popup) popup.remove();
  document.body.style.overflow = '';
  __shotState = '';
}

function copyUPI() {
  const id = ORDER_CONFIG.UPI_ID;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(id).then(
      () => alert("UPI ID copied: " + id),
      () => alert("UPI ID: " + id)
    );
  } else {
    alert("UPI ID: " + id);
  }
    }
