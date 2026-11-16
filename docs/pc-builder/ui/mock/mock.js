/* compzy PC Builder mock: screen routing, shared chrome, live total.
   The mock is a design artefact: it shows every state the UI map describes. */
(function () {
  'use strict';

  var ICONS = {
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0.8 14.55 9.45 23.2 12 14.55 14.55 12 23.2 9.45 14.55 0.8 12 9.45 9.45Z" fill="currentColor"/></svg>',
    alert: '<svg class="notice__icon" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="6.6"/><path d="M8 4.6v4M8 11.2v.4"/></svg>',
    error: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="6.6"/><path d="M8 4.6v4M8 11.2v.4"/></svg>'
  };

  function rupiah(n) {
    return 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /* ---- Language: English and Indonesian on every page (REQ-042 to REQ-057) ----
     Static copy is translated from one dictionary, the copy the script writes is
     written through tx(), and the choice is remembered on the device. Product
     names, prices and the order reference are never translated (REQ-050). */
  var LANG_KEY = 'compzy.lang';
  var current = 'id'; // a first-time visitor sees Indonesian (REQ-044)
  try {
    var savedLang = window.localStorage.getItem(LANG_KEY);
    if (savedLang === 'en' || savedLang === 'id') current = savedLang;
  } catch (e) { /* the preview's sandbox may block storage; the default stands */ }

  var ID = {
    /* chrome */
    'Build': 'Rakit',
    'Order review': 'Tinjau pesanan',
    'Sign in': 'Masuk',
    'Sign out': 'Keluar',
    'Language': 'Bahasa',
    'Main': 'Utama',
    'Footer': 'Kaki halaman',
    'Footer bar': 'Bilah kaki halaman',
    'Quick links': 'Tautan cepat',
    'Build a PC': 'Rakit PC',
    'Review your order': 'Tinjau pesanan Anda',
    'Review order': 'Tinjau pesanan',
    'Create an account': 'Buat akun',
    'compzy, back to the builder': 'compzy, kembali ke Rakit PC',
    'Custom PCs, built part by part. Pick seven parts, watch the total, and order it.': 'PC kustom, dirakit komponen demi komponen. Pilih tujuh komponen, pantau totalnya, lalu pesan.',
    'Pick the parts. Watch the total. Order it.': 'Pilih komponennya. Pantau totalnya. Pesan.',
    'Seven categories, one part in each, the graphics card optional. Prices in rupiah, with no tax and no shipping added.': 'Tujuh kategori, satu komponen tiap kategori, kartu grafis opsional. Harga dalam rupiah, tanpa pajak dan biaya kirim.',
    'A customer writing notes beside a laptop': 'Pelanggan menulis catatan di samping laptop',
    'compzy · Custom PCs, built part by part': 'compzy · PC kustom, dirakit komponen demi komponen',

    /* builder hero, ribbons, facts */
    'Custom PCs, built part by part': 'PC kustom, komponen demi komponen',
    'Seven categories, one part in each. Pick what you want, watch the total move, and check out when it looks right.': 'Tujuh kategori, masing-masing satu komponen. Pilih yang Anda inginkan, pantau totalnya, lalu lanjutkan ke pemesanan saat sudah sesuai.',
    'Total so far': 'Total sejauh ini',
    'Start choosing': 'Mulai memilih',
    'Keep choosing': 'Lanjut memilih',
    'A build in progress, one part at a time': 'Rakitan yang sedang dikerjakan, satu komponen demi satu komponen',
    'A motherboard seated in a PC case, mid-build': 'Papan induk terpasang di dalam casing PC, dalam proses perakitan',
    'Someone working at a laptop in daylight': 'Seseorang bekerja dengan laptop di siang hari',
    'Seven categories': 'Tujuh kategori',
    'One part each': 'Satu komponen tiap kategori',
    'The total updates as you choose': 'Total diperbarui saat Anda memilih',
    'No account needed to start': 'Tidak perlu akun untuk memulai',
    '21 parts in the catalogue': '21 komponen dalam katalog',
    'Prices in rupiah': 'Harga dalam rupiah',
    'No tax, no shipping': 'Tanpa pajak, tanpa pengiriman',
    'Seven': 'Tujuh',
    'part categories': 'kategori komponen',
    'Six': 'Enam',
    'required, one optional': 'wajib, satu opsional',
    'where the total starts': 'titik awal total',
    'a complete mid-range build': 'rakitan menengah lengkap',

    /* categories and parts */
    'Processor (CPU)': 'Prosesor (CPU)',
    'Motherboard': 'Papan Induk',
    'Storage (SSD)': 'Penyimpanan (SSD)',
    'Graphics Card': 'Kartu Grafis',
    'Power Supply': 'Catu Daya',
    'PC Case': 'Casing PC',
    'Required': 'Wajib',
    'Optional': 'Opsional',
    '3 parts': '3 komponen',
    'The chip that does the work.': 'Chip yang menjalankan seluruh pekerjaan.',
    'The board every other part sits on.': 'Papan tempat semua komponen lainnya terpasang.',
    'Working memory for everything open at once.': 'Memori kerja untuk semua aplikasi yang sedang terbuka.',
    'Where your files, games and photos live.': 'Tempat file, game, dan foto Anda tersimpan.',
    'Optional. Choose one for games or video work.': 'Opsional. Pilih satu untuk game atau mengolah video.',
    'Feeds power to the whole build.': 'Memberi daya ke seluruh rakitan.',
    'The frame that holds it all together.': 'Rangka yang menyatukan semuanya.',
    'Part 01': 'Komponen 01',
    'Part 02': 'Komponen 02',
    'Part 03': 'Komponen 03',

    /* build panel and its states */
    'Your build': 'Rakitan Anda',
    'Choose': 'Pilih',
    'Remove': 'Hapus',
    'Not chosen yet': 'Belum dipilih',
    ' of 7 chosen': ' dari 7 dipilih',
    'Still needed: ': 'Masih perlu: ',
    'Every required category is filled. The graphics card is optional.': 'Semua kategori wajib sudah diisi. Kartu grafis opsional.',
    'Checkout': 'Lanjut ke pemesanan',
    'No tax and no shipping. Prices in Indonesian rupiah.': 'Tanpa pajak dan biaya pengiriman. Harga dalam rupiah.',
    'Close': 'Tutup',
    'You are signed out.': 'Anda telah keluar.',
    'Your build is still here. Checkout now asks you to sign in again.': 'Rakitan Anda masih tersimpan. Untuk melanjutkan pemesanan, silakan masuk kembali.',
    'Checkout needs one part in every required category.': 'Untuk melanjutkan pemesanan, setiap kategori wajib berisi satu komponen.',
    'Still empty: RAM, Storage (SSD), Power Supply, PC Case. The graphics card is optional.': 'Masih kosong: RAM, Penyimpanan (SSD), Catu Daya, Casing PC. Kartu grafis opsional.',
    'The Kingston Fury 16GB DDR4-3200 is no longer offered.': 'Kingston Fury 16GB DDR4-3200 tidak tersedia lagi.',
    'Your build is still here without it. Choose another RAM and the total updates.': 'Rakitan Anda tetap tersimpan tanpanya. Pilih RAM lain dan total akan diperbarui.',
    'Loading the parts catalogue': 'Memuat katalog komponen',
    'The total appears once the catalogue has loaded.': 'Total akan muncul setelah katalog selesai dimuat.',
    'Try again': 'Coba lagi',
    'We could not load the parts catalogue.': 'Kami tidak dapat memuat katalog komponen.',
    'The store could not be reached just now. Nothing was lost: try again in a moment.': 'Toko tidak dapat dihubungi saat ini. Tidak ada yang hilang: coba lagi sebentar lagi.',

    /* sign in */
    'Welcome back': 'Selamat datang kembali',
    'Sign in to place the order for the build you made.': 'Masuk untuk memesan rakitan yang Anda buat.',
    'Your build is saved.': 'Rakitan Anda tersimpan.',
    '7 parts, Rp 12.020.000. It comes back with you after you sign in.': '7 komponen, Rp 12.020.000. Rakitan Anda akan tersedia kembali setelah Anda masuk.',
    'Email address': 'Alamat email',
    'Password': 'Kata sandi',
    'New here?': 'Belum punya akun?',
    'Your parts stay put while you sign in': 'Komponen Anda tetap di tempatnya saat Anda masuk',
    'Enter your email address.': 'Masukkan alamat email Anda.',
    'Enter your password.': 'Masukkan kata sandi Anda.',
    'The email address or password is not correct.': 'Alamat email atau kata sandi tidak benar.',
    'Check both and try again.': 'Periksa keduanya, lalu coba lagi.',
    'Signing in': 'Sedang masuk',
    'Your session has ended.': 'Sesi Anda telah berakhir.',
    'Sign in again to finish this order. Your build comes back with you and nothing is ordered twice.': 'Masuk kembali untuk menyelesaikan pesanan ini. Rakitan Anda akan tersedia kembali dan tidak ada pesanan yang dibuat dua kali.',
    'Sign in again': 'Masuk kembali',

    /* create account */
    'Create account': 'Buat akun',
    'Create your account': 'Buat akun Anda',
    'An account lets you place orders. Your build stays exactly as you left it.': 'Akun memungkinkan Anda membuat pesanan. Rakitan Anda tetap persis seperti semula.',
    '7 parts, Rp 12.020.000. It comes back with you after you create your account.': '7 komponen, Rp 12.020.000. Rakitan Anda tersedia kembali setelah akun Anda dibuat.',
    'Full name': 'Nama lengkap',
    'At least 8 characters, with at least one letter and one number.': 'Minimal 8 karakter, dengan setidaknya satu huruf dan satu angka.',
    'Already have an account?': 'Sudah punya akun?',
    'One account, your orders': 'Satu akun, pesanan Anda',
    'Enter your full name.': 'Masukkan nama lengkap Anda.',
    'Enter a password.': 'Masukkan kata sandi.',
    'Use 8 to 128 characters, with at least one letter and one number.': 'Gunakan 8 hingga 128 karakter, dengan setidaknya satu huruf dan satu angka.',
    'This email address already has an account.': 'Alamat email ini sudah memiliki akun.',
    'Sign in instead': 'Masuk di sini',
    ', or use another address.': ', atau gunakan alamat lain.',

    /* order review */
    'Check your build': 'Periksa rakitan Anda',
    'One part in every required category, the graphics card included. Placing the order takes no payment.': 'Satu komponen di setiap kategori wajib, ditambah kartu grafis. Tanpa pembayaran.',
    'Final total': 'Total akhir',
    'Place order': 'Buat pesanan',
    'Change a part': 'Ubah komponen',
    'No tax. No shipping. Prices in Indonesian rupiah.': 'Tanpa pajak. Tanpa biaya kirim. Harga dalam rupiah.',
    'This is the total that will be recorded with the order.': 'Ini adalah total yang akan dicatat pada pesanan.',
    'Placing your order': 'Sedang membuat pesanan',
    'Your order was not placed. Choose another RAM and the total below is the total you will confirm.': 'Pesanan Anda tidak dibuat. Pilih RAM lain, lalu konfirmasi total di bawah ini.',
    'No longer available': 'Tidak lagi tersedia',
    'Choose another RAM': 'Pilih RAM lain',
    'Sign in again to place this order. Your build and this total are kept.': 'Masuk kembali untuk membuat pesanan ini. Rakitan dan total Anda tetap tersimpan.',
    'Compzy · Built part by part ·': 'Compzy · Dirakit bertahap ·',

    /* confirmation */
    'Order confirmed': 'Pesanan dikonfirmasi',
    'Order placed': 'Pesanan dibuat',
    'Here are the parts you ordered and the total you agreed to. Keep this reference.': 'Berikut komponen yang Anda pesan dan total yang Anda setujui. Simpan nomor pesanan ini.',
    'Order': 'Pesanan',
    'Placed': 'Dibuat',
    'Parts': 'Komponen',
    'Start a new build': 'Mulai rakitan baru',
    'No payment was taken and no delivery details were asked for. The store has the order.': 'Tidak ada pembayaran yang diproses dan tidak ada data pengiriman yang diminta. Pesanan sudah tercatat di toko.',

    /* not found */
    'Page not found · 404': 'Halaman tidak ditemukan · 404',
    'This page is not here': 'Halaman ini tidak ada',
    'The address you followed does not match any page in the store. Your build is safe; head back and carry on.': 'Alamat yang Anda tuju tidak cocok dengan halaman mana pun di toko. Rakitan Anda aman; kembali dan lanjutkan.',
    'Back to the builder': 'Kembali ke Rakit PC'
  };

  /* The hero headline carries a marked word, so its two versions are kept whole. */
  var HTML_ID = {
    'Build your own<br><span class="disc">PC</span>': 'Rakit <span class="disc">PC</span><br>Anda sendiri'
  };
  var PAGE_ID = {
    'Builder': 'Perakit',
    'Sign in': 'Masuk',
    'Create account': 'Buat akun',
    'Order review': 'Tinjau pesanan',
    'Order confirmation': 'Konfirmasi pesanan',
    'Not found': 'Halaman tidak ditemukan'
  };

  function tx(s) {
    return current === 'id' ? (ID[s] || s) : s;
  }

  function languageSwitch() {
    return (
      '<div class="lang" role="group" aria-label="Language">' +
      '<button class="lang__opt" type="button" data-set-lang="en" lang="en">English</button>' +
      '<span class="lang__sep" aria-hidden="true"></span>' +
      '<button class="lang__opt" type="button" data-set-lang="id" lang="id">Bahasa Indonesia</button>' +
      '</div>' +
      '<span class="lang__pick"><select data-set-lang-select aria-label="Language">' +
      '<option value="id" lang="id">Bahasa Indonesia</option>' +
      '<option value="en" lang="en">English</option>' +
      '</select></span>'
    );
  }

  function header(user, nav) {
    var signed = user === 'in';
    function link(href, label, key) {
      return (
        '<a href="' + href + '"' + (nav === key ? ' aria-current="page"' : '') + '>' + label + '</a>'
      );
    }
    return (
      '<header class="hdr"><div class="hdr__in">' +
      '<a class="brand" href="#builder-empty" aria-label="compzy, back to the builder">' +
      '<span class="brand__disc">' + ICONS.star + '</span>' +
      '<span class="brand__word">compzy</span></a>' +
      '<nav class="nav" aria-label="Main">' +
      link('#builder-empty', 'Build', 'build') +
      (signed && nav !== 'none' ? link('#review-default', 'Order review', 'review') : '') +
      (signed ? link('#builder-signed-out', 'Sign out', 'out') : link('#signin-default', 'Sign in', 'signin')) +
      '</nav>' +
      (signed ? '<span class="who"><span class="name">Rina</span></span>' : '') +
      languageSwitch() +
      '</div></header>'
    );
  }

  function footer(user, nav) {
    var signed = user === 'in' && nav !== 'none';
    return (
      '<footer class="ftr"><div class="ftr__in">' +
      '<div class="ftr__col"><p class="ftr__mark"><span class="brand__disc">' + ICONS.star + '</span><span class="brand__word">compzy</span></p>' +
      '<p class="ftr__note">Custom PCs, built part by part. Pick seven parts, watch the total, and order it.</p>' +
      '<span class="label">Quick links</span>' +
      '<nav class="ftr__links" aria-label="Footer">' +
      '<a href="#builder-empty">Build a PC</a>' +
      (signed ? '<a href="#review-default">Review your order</a>' : '<a href="#signin-default">Sign in</a><a href="#signup-default">Create an account</a>') +
      '</nav></div>' +
      '<div class="ftr__col">' +
      '<span class="ftr__star">' + ICONS.star + '</span>' +
      '<h2>Pick the parts. Watch the total. Order it.</h2>' +
      '<p class="ftr__note">Seven categories, one part in each, the graphics card optional. Prices in rupiah, with no tax and no shipping added.</p>' +
      '</div>' +
      '<div class="ftr__photo"><img src="assets/img/footer.webp" alt="A customer writing notes beside a laptop"></div>' +
      '</div>' +
      '<div class="ftr__bar"><span>compzy · Custom PCs, built part by part</span>' +
      '<nav aria-label="Footer bar"><a href="#builder-empty">Build a PC</a>' +
      (signed ? '<a href="#review-default">Review order</a>' : '<a href="#signin-default">Sign in</a>') +
      '</nav>' +
      '</div></footer>'
    );
  }

  var screens = Array.prototype.slice.call(document.querySelectorAll('.screen'));

  // Shared chrome, so the header and footer exist in one place.
  screens.forEach(function (s) {
    var user = s.dataset.user || 'guest';
    var page = document.createElement('div');
    page.className =
      'page' +
      (s.dataset.bar === 'true' ? '' : ' page--no-bar') +
      (s.dataset.night === 'true' ? ' night' : '');
    page.innerHTML = header(user, s.dataset.navkey) + s.innerHTML + footer(user, s.dataset.navkey);
    s.innerHTML = '';
    s.appendChild(page);
    if (s.dataset.bar === 'true') {
      var bar = document.createElement('div');
      bar.className = 'build-bar';
      bar.innerHTML =
        '<div><span class="label">Total</span><span class="amount num" data-total>' +
        (s.dataset.total || 'Rp 0') +
        '</span></div>' +
        '<button class="btn" type="button" data-panel-toggle data-i18n-live aria-expanded="false" aria-controls="build-panel-' +
        s.id +
        '">' + tx('Your build') + '</button>';
      s.querySelector('.page').appendChild(bar);
    }
  });

  // Builder: one control per card, the total recomputed from what is chosen.
  function initBuilder(screen) {
    // only real categories; the loading and error states draw placeholders that carry no data
    var cats = Array.prototype.slice.call(screen.querySelectorAll('.cat[data-cat-name]'));
    if (!cats.length) return;
    var rowsEl = screen.querySelector('[data-panel-rows]');
    var needEl = screen.querySelector('[data-need]');
    var countEl = screen.querySelector('[data-count]');
    var checkoutEl = screen.querySelector('[data-checkout]');

    function read() {
      return cats.map(function (cat) {
        var chosen = cat.querySelector('.part.is-chosen');
        return {
          el: cat,
          name: cat.dataset.catName,
          required: cat.dataset.required === 'true',
          part: chosen
            ? { name: chosen.dataset.name, price: parseInt(chosen.dataset.price, 10) }
            : null
        };
      });
    }

    function paintCard(card) {
      var chosen = card.classList.contains('is-chosen');
      var action = card.querySelector('[data-choose]');
      if (action) {
        action.textContent = tx(chosen ? 'Remove' : 'Choose');
        action.setAttribute('data-i18n-live', '');
      }
      card.setAttribute('aria-pressed', chosen ? 'true' : 'false');
    }

    function render() {
      var data = read();
      var total = data.reduce(function (t, c) {
        return t + (c.part ? c.part.price : 0);
      }, 0);
      var missing = data.filter(function (c) {
        return c.required && !c.part;
      });
      var chosenCount = data.filter(function (c) {
        return c.part;
      }).length;

      if (rowsEl) {
        rowsEl.setAttribute('data-i18n-live', '');
        rowsEl.innerHTML = data
          .map(function (c) {
            var row = c.part
              ? '<div class="prow"><div><span class="prow__cat">' + tx(c.name) + '</span>' +
                '<div class="prow__part">' + c.part.name + '</div>' +
                '<button class="prow__remove" type="button" data-remove="' + c.name + '">' + tx('Remove') + '</button></div>' +
                '<div class="prow__price num">' + rupiah(c.part.price) + '</div></div>'
              : '<div class="prow"><div><span class="prow__cat">' + tx(c.name) + '</span>' +
                '<div class="prow__part none">' + tx('Not chosen yet') + '</div></div>' +
                '<div class="prow__price num">-</div></div>';
            return row;
          })
          .join('');
      }
      screen.querySelectorAll('[data-total]').forEach(function (el) {
        el.textContent = rupiah(total);
      });
      if (countEl) {
        countEl.setAttribute('data-i18n-live', '');
        countEl.textContent = chosenCount + tx(' of 7 chosen');
      }
      if (needEl) {
        needEl.setAttribute('data-i18n-live', '');
        needEl.textContent = missing.length
          ? tx('Still needed: ') + missing.map(function (c) { return tx(c.name); }).join(', ') + '.'
          : tx('Every required category is filled. The graphics card is optional.');
        needEl.className = missing.length ? 'panel__need' : 'panel__fine';
      }
      if (checkoutEl) {
        var guest = screen.dataset.user !== 'in';
        checkoutEl.setAttribute(
          'href',
          missing.length ? '#builder-checkout-refused' : guest ? '#signin-default' : '#review-default'
        );
      }
    }

    screen.addEventListener('click', function (e) {
      var jump = e.target.closest('[data-jump]');
      if (jump) {
        var first = screen.querySelector('.cat');
        if (first) {
          e.preventDefault();
          first.scrollIntoView();
        }
        return;
      }
      var action = e.target.closest('[data-choose]');
      if (action) {
        var card = action.closest('.part');
        var cat = card.closest('.cat');
        var wasChosen = card.classList.contains('is-chosen');
        cat.querySelectorAll('.part').forEach(function (p) {
          p.classList.remove('is-chosen');
          paintCard(p);
        });
        if (!wasChosen) card.classList.add('is-chosen');
        paintCard(card);
        render();
        return;
      }
      var remove = e.target.closest('[data-remove]');
      if (remove) {
        var name = remove.getAttribute('data-remove');
        cats.forEach(function (c) {
          if (c.dataset.catName !== name) return;
          c.querySelectorAll('.part').forEach(function (p) {
            if (p.classList.contains('is-chosen')) paintCard(p);
            p.classList.remove('is-chosen');
          });
        });
        render();
      }
    });

    cats.forEach(function (c) {
      c.querySelectorAll('.part').forEach(paintCard);
    });
    render();

    var toggle = screen.querySelector('[data-panel-toggle]');
    var panel = screen.querySelector('.panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = panel.classList.toggle('is-open');
        toggle.textContent = tx(open ? 'Close' : 'Your build');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    /* The language switch redraws every generated label in the new language. */
    return function refresh() {
      cats.forEach(function (c) {
        c.querySelectorAll('.part').forEach(paintCard);
      });
      render();
      if (toggle && panel) toggle.textContent = tx(panel.classList.contains('is-open') ? 'Close' : 'Your build');
    };
  }

  var builders = [];
  screens.forEach(function (s) {
    var refresh = initBuilder(s);
    if (refresh) builders.push(refresh);
  });

  // Routing: #<screen-id> shows that screen; anything else keeps the current one.
  function show() {
    var id = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    var target = screens.filter(function (s) {
      return s.id === id;
    })[0];
    if (!target) return;
    screens.forEach(function (s) {
      s.classList.toggle('is-active', s === target);
    });
    updateTitle();
    var sel = document.querySelector('.switcher select');
    if (sel) sel.value = id;
    document.querySelectorAll('.switcher a').forEach(function (a) {
      a.setAttribute('aria-current', a.getAttribute('href') === '#' + id ? 'true' : 'false');
    });
    window.scrollTo(0, 0);
  }

  // The mock's own screen switcher (hidden in the preview and screenshots).
  var sw = document.querySelector('.switcher');
  if (sw) {
    var select = sw.querySelector('select');
    screens.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.id;
      select.appendChild(o);
    });
    select.addEventListener('change', function () {
      location.hash = select.value;
    });
  }

  /* ---- Language switching -------------------------------------------------
     Every static string is translated by exact match, so product names,
     prices and the order reference pass through untouched. The script's own
     labels are marked data-i18n-live and redrawn by the builders. */
  var SKIP = '[data-i18n-live], [data-i18n-html], .switcher, script, style';

  function translateTree(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      var parent = node.parentElement;
      if (!parent || parent.closest(SKIP)) continue;
      if (node.__en === undefined) node.__en = node.nodeValue;
      var raw = node.__en;
      var key = raw.trim();
      var out = current === 'id' ? ID[key] : undefined;
      node.nodeValue = out === undefined ? raw : raw.replace(key, out);
    }
    root.querySelectorAll('[alt], [aria-label], [placeholder], [title]').forEach(function (el) {
      if (el.closest(SKIP)) return;
      ['alt', 'aria-label', 'placeholder', 'title'].forEach(function (attr) {
        if (!el.hasAttribute(attr)) return;
        var store = '__en_' + attr;
        if (el[store] === undefined) el[store] = el.getAttribute(attr);
        var raw = el[store];
        el.setAttribute(attr, current === 'id' ? ID[raw] || raw : raw);
      });
    });
  }

  function translateDocument() {
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      if (el.__enHtml === undefined) el.__enHtml = el.innerHTML;
      var key = el.__enHtml.trim();
      var next = current === 'id' ? HTML_ID[key] || ID[key] : el.__enHtml;
      if (next && el.innerHTML.trim() !== next.trim()) el.innerHTML = next;
    });
    translateTree(document.body);
    document.documentElement.lang = current;
  }

  function updateTitle() {
    var active = screens.filter(function (s) {
      return s.classList.contains('is-active');
    })[0];
    var page = active && active.dataset.page ? active.dataset.page : 'Builder';
    document.title =
      (current === 'id' ? PAGE_ID[page] || page : page) +
      (current === 'id' ? ' · compzy Perakit PC' : ' · compzy PC Builder');
  }

  function updateSwitcher() {
    document.querySelectorAll('.lang__opt').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-set-lang') === current ? 'true' : 'false');
    });
    document.querySelectorAll('[data-set-lang-select]').forEach(function (s) {
      s.value = current;
    });
  }

  function setLang(lang) {
    if (lang !== 'en' && lang !== 'id') lang = 'id';
    if (lang === current) return;
    current = lang;
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch (e) { /* storage blocked: the choice lasts for this page only */ }
    builders.forEach(function (refresh) {
      refresh();
    });
    translateDocument();
    updateSwitcher();
    updateTitle();
  }

  document.addEventListener('click', function (e) {
    var option = e.target.closest('[data-set-lang]');
    if (option) setLang(option.getAttribute('data-set-lang'));
  });
  document.addEventListener('change', function (e) {
    var picker = e.target.closest('[data-set-lang-select]');
    if (picker) setLang(picker.value);
  });

  translateDocument();
  updateSwitcher();
  window.addEventListener('hashchange', show);
  show();
})();
