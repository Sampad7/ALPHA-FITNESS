// ===== FORGE ATHLETIC CLUB — shared behaviour =====

document.addEventListener('DOMContentLoaded', () => {

  /* ---- mobile nav toggle ---- */
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('is-open', !open);
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
      });
    });
  }

  /* ---- scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 60, 300)}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---- stat counters ---- */
  const counters = document.querySelectorAll('[data-count-to]');
  if ('IntersectionObserver' in window && counters.length) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.countTo, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 900;
        const start = performance.now();
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
          el.textContent = target + suffix;
        } else {
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
        countIO.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => countIO.observe(el));
  }

  /* ---- contact form (Web3Forms) ---- */
  const form = document.querySelector('#contact-form');
  if (form) {
    const status = document.querySelector('#form-status');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'Send Message';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });
        const result = await response.json().catch(() => ({}));

        if (response.ok && (result.success === true || result.message || result.status === 'success')) {
          form.reset();
          if (status) {
            status.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Message received — a coach will get back to you within 24 hours.</span>';
            status.setAttribute('data-visible', 'true');
            status.style.display = 'flex';
            status.style.visibility = 'visible';
            status.style.opacity = '1';
          }
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (error) {
        console.error('Web3Forms submission error', error);
        if (status) {
          status.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>There was a problem sending the message. Please try again.</span>';
          status.setAttribute('data-visible', 'true');
          status.style.display = 'flex';
          status.style.visibility = 'visible';
          status.style.opacity = '1';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  /* ---- prefill interest from ?plan= query param (set by pricing page CTAs) ---- */
  const interestSelect = document.querySelector('#interest');
  if (interestSelect) {
    const plan = new URLSearchParams(window.location.search).get('plan');
    const planMap = { starter: 'membership-starter', pro: 'membership-pro', elite: 'membership-elite' };
    if (plan && planMap[plan]) interestSelect.value = planMap[plan];
  }

  /* ---- footer year ---- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});
