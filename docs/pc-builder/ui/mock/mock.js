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
        '<button class="btn" type="button" data-panel-toggle aria-expanded="false" aria-controls="build-panel-' +
        s.id +
        '">Your build</button>';
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
      if (action) action.textContent = chosen ? 'Remove' : 'Choose';
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
        rowsEl.innerHTML = data
          .map(function (c) {
            var row = c.part
              ? '<div class="prow"><div><span class="prow__cat">' + c.name + '</span>' +
                '<div class="prow__part">' + c.part.name + '</div>' +
                '<button class="prow__remove" type="button" data-remove="' + c.name + '">Remove</button></div>' +
                '<div class="prow__price num">' + rupiah(c.part.price) + '</div></div>'
              : '<div class="prow"><div><span class="prow__cat">' + c.name + '</span>' +
                '<div class="prow__part none">Not chosen yet</div></div>' +
                '<div class="prow__price num">-</div></div>';
            return row;
          })
          .join('');
      }
      screen.querySelectorAll('[data-total]').forEach(function (el) {
        el.textContent = rupiah(total);
      });
      if (countEl) countEl.textContent = chosenCount + ' of 7 chosen';
      if (needEl) {
        needEl.textContent = missing.length
          ? 'Still needed: ' + missing.map(function (c) { return c.name; }).join(', ') + '.'
          : 'Every required category is filled. The graphics card is optional.';
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
        toggle.textContent = open ? 'Close' : 'Your build';
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  screens.forEach(initBuilder);

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
    document.title = (target.dataset.page || 'compzy') + ' · compzy PC Builder';
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

  window.addEventListener('hashchange', show);
  show();
})();
