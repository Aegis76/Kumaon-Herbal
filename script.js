let cart = JSON.parse(localStorage.getItem('kumaon_cart')) || [];
let activeStock = Infinity; // stock of the product currently open in the detail overlay

// Read live stock straight off the card's data-stock (single source of truth).
// Products in productsDB that have no card on the page are treated as unlimited.
function getStock(id) {
  if (typeof id !== 'string') return Infinity;
  const card = document.querySelector('.card[data-id="' + id + '"]');
  if (!card || !card.hasAttribute('data-stock')) return Infinity;
  return parseInt(card.getAttribute('data-stock') || '0', 10);
}

document.addEventListener('DOMContentLoaded', () => {
  // NAVBAR SCROLL EFFECT
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // HAMBURGER MENU
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // Close mobile menu when a link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (hamburger) hamburger.classList.remove('active');
      if (navLinks) navLinks.classList.remove('active');
    });
  });

  // CART BUTTON CLICK
  const cartBtn = document.querySelector('.nav-cart');
  if (cartBtn) {
    cartBtn.addEventListener('click', toggleCart);
  }

  // INITIAL CART UI UPDATE
  updateCartUI();

  // ADD TO CART FEEDBACK & LOGIC
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('padd') || e.target.classList.contains('add-btn') || e.target.classList.contains('do-cart-btn')) {
      const btn = e.target;
      let pId = null;

      // Try to find product ID from card or database context
      const card = btn.closest('.card') || btn.closest('.pcard');
      if (card) {
        pId = card.getAttribute('data-id') || findIdByTitle(card.querySelector('.card-title, .ptitle')?.textContent);
      } else if (btn.classList.contains('do-cart-btn')) {
        const title = document.getElementById('do-title')?.textContent;
        pId = findIdByTitle(title);
      }

      if (pId) {
        const added = addToCart(pId);
        if (!added) return; // out of stock — skip the "Added!" animation

        // Visual feedback
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

  // NEWSLETTER
  const nlBtn = document.getElementById('nlbtn') || document.querySelector('.nl-form button');
  if (nlBtn) {
    nlBtn.addEventListener('click', function () {
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

  // WISHLIST TOGGLE
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.textContent = btn.textContent === '♡' ? '♥' : '♡';
      btn.style.color = btn.textContent === '♥' ? '#e05a5a' : '';
    });
  });

  // BLOG FILTER BUTTONS
  document.querySelectorAll('.f-btn').forEach(b => {
    b.addEventListener('click', function () {
      document.querySelectorAll('.f-btn').forEach(x => x.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // PRODUCT CARDS CLICK (Open detail overlay)
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains('add-btn') || e.target.classList.contains('wishlist-btn')) return;
      const id = card.getAttribute("data-id");
      if (id) openDetail(id);
    });
  });
});

// CART FUNCTIONS

function toggleCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  if (!cartOverlay) {
    createCartHTML();
  }
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
       <button class="btn-primary" style="width:100%; padding: 1rem;" onclick="showPaymentDetails()">
  Proceed to Checkout
</button>
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

  // Close when clicking overlay
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

  // Stock guard (client-side UX only — the server must still verify on checkout)
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

  // Reset qty input if on detail page
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
    // don't let + push past available stock
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
  // Loose match
  for (let id in productsDB) {
    if (cleanTitle.includes(id.toLowerCase())) return id;
  }
  return null;
}

// Global functions for inline onclicks

function filterCards(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? 'flex' : 'none';
  });

  const groups = [
    { gid: 'grid-juice', hid: 'sh-juice', c: 'juice' },
    { gid: 'grid-pickle', hid: 'sh-pickle', c: 'pickle' },
    { gid: 'grid-herbal', hid: 'sh-herbal', c: 'herbal' }
  ];

  groups.forEach(({ gid, hid, c }) => {
    const grid = document.getElementById(gid);
    const header = document.getElementById(hid);
    const show = cat === 'all' || cat === c;
    if (grid) grid.style.display = show ? 'grid' : 'none';
    if (header) header.style.display = show ? 'flex' : 'none';
  });

  document.querySelectorAll('.banner-strip, .photo-divider').forEach(el => {
    el.style.display = cat === 'all' ? (el.classList.contains('banner-strip') ? 'flex' : 'grid') : 'none';
  });
}

function submitForm() {
  const f = document.getElementById('fname');
  const e = document.getElementById('email');
  const m = document.getElementById('message');
  const s = document.getElementById('subject');

  if (!f || !e || !m || !s || !f.value || !e.value || !m.value || !s.value) {
    alert('Please fill in all required fields (*).');
    return;
  }

  if (!e.value.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  const btn = document.querySelector('.submit-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    const successMsg = document.getElementById('successMsg');
    if (successMsg) successMsg.style.display = 'block';
    btn.textContent = '✓ Message Sent!';
    btn.style.background = 'var(--green-light)';

    [f, e, m, s, document.getElementById('lname'), document.getElementById('phone')].forEach(el => {
      if (el) el.value = '';
    });
  }, 1200);
}

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

  // ---- STOCK: gate the detail-overlay buy button ----
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

  // reset to Description tab each time a product opens
  document.querySelectorAll('.do-tab').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('.do-tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === 'tab-desc'));

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
// ================= PAYMENT & ORDER FUNCTIONS =================

function showPaymentDetails() {
  if (cart.length === 0) { alert("Your cart is empty."); return; }

  let total = 0;
  cart.forEach(item => { total += item.price * item.quantity; });

  const html = `
  <div id="payment-popup" style="position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:99999;display:flex;justify-content:center;align-items:center;">
    <div style="background:#fff;width:95%;max-width:650px;max-height:90vh;overflow:auto;padding:25px;border-radius:15px;position:relative;">
      <button onclick="closePaymentPopup()" style="position:absolute;top:10px;right:15px;border:none;background:none;font-size:28px;cursor:pointer;">×</button>
      <h2>Checkout</h2>
      <h3 style="color:green;text-align:center;">Total Amount: ₹${total}</h3>
      <hr>
      <h3>Customer Details</h3>
      <input id="cust-name" type="text" placeholder="Full Name *" style="width:100%;padding:10px;margin-bottom:10px;">
      <input id="cust-phone" type="tel" placeholder="Mobile Number *" style="width:100%;padding:10px;margin-bottom:10px;">
      <input id="cust-email" type="email" placeholder="Email Address" style="width:100%;padding:10px;margin-bottom:10px;">
      <textarea id="cust-address" placeholder="Full Delivery Address *" style="width:100%;padding:10px;height:90px;margin-bottom:10px;"></textarea>
      <input id="cust-city" type="text" placeholder="City" style="width:100%;padding:10px;margin-bottom:10px;">
      <input id="cust-state" type="text" placeholder="State" style="width:100%;padding:10px;margin-bottom:10px;">
      <input id="cust-pincode" type="text" placeholder="PIN Code" style="width:100%;padding:10px;margin-bottom:20px;">
      <hr>
      <h3>Scan & Pay</h3>
      <img src="https://github.com/Aegis76/Kumaon-Herbal/blob/main/WhatsApp%20Image%202026-06-18%20at%202.13.04%20PM.jpeg?raw=true" alt="UPI QR" style="width:250px;display:block;margin:auto;border:1px solid #ddd;border-radius:10px;">
      <div style="text-align:center;margin-top:15px;font-size:26px;font-weight:700;color:#1a3a2a;">Pay ₹${total}</div>
      <p style="text-align:center;margin-top:10px;"><strong>UPI ID</strong><br>YOUR_UPI_ID</p>
      <button onclick="copyUPI()" style="width:100%;padding:10px;cursor:pointer;">Copy UPI ID</button>
      <hr>
      <h3>Upload Payment Screenshot *</h3>
      <input id="cust-screenshot" type="file" accept="image/*" style="width:100%;padding:10px;margin-bottom:10px;">
      <div style="margin-top:5px;padding:15px;background:#fff8e1;border-left:4px solid #ff9800;border-radius:8px;font-size:14px;">
        📸 After payment, attach your screenshot above, then tap the button. WhatsApp will open with your order and screenshot ready to send.
      </div>
      <hr>
      <button onclick="sendOrder(${total})" style="width:100%;padding:14px;background:#25D366;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:600;">
        ✅ Send Order on WhatsApp
      </button>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
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

async function sendOrder(total) {
  const name = document.getElementById('cust-name').value;
  const phone = document.getElementById('cust-phone').value;
  const address = document.getElementById('cust-address').value;
  if (!name || !phone || !address) { alert("Please fill Name, Mobile Number and Address."); return; }

  const file = document.getElementById('cust-screenshot')?.files[0];
  if (!file) { alert("Please attach your payment screenshot first."); return; }

  const message = buildOrderMessage(total);

  // Mobile: share screenshot + order text via the share sheet (customer taps WhatsApp)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: message, title: 'Kumaon Herbal Order' });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // customer cancelled the share sheet
    }
  }

  // Desktop / unsupported fallback: open chat with order text, attach manually.
  // REPLACE 91XXXXXXXXXX with your real WhatsApp number (country code, no + or spaces).
  alert("This device can't auto-attach the image. WhatsApp will open with your order — please attach the screenshot manually before sending.");
  window.open("https://wa.me/919761420066?text=" + encodeURIComponent(message), "_blank");
}

function closePaymentPopup() {
  const popup = document.getElementById('payment-popup');
  if (popup) popup.remove();
}

function copyUPI() {
  navigator.clipboard.writeText("YOUR_UPI_ID");
  alert("UPI ID copied successfully.");
}
