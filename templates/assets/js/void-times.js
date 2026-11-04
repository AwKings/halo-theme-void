(function () {
  'use strict';

  var API = '/apis/api.voidtimes.halo.run/v1alpha1/times';

  function vote(button) {
    if (button.dataset.loading === '1') {
      return;
    }
    button.dataset.loading = '1';
    fetch(API + '/' + encodeURIComponent(button.dataset.name) + '/like', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin'
    })
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .then(function (data) {
        if (!data) {
          return;
        }
        var value = button.querySelector('.value');
        if (value && typeof data.likes === 'number') {
          value.textContent = data.likes;
        }
        button.classList.add('done');
      })
      .catch(function () {})
      .then(function () {
        button.dataset.loading = '';
      });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('.void-like');
    if (!button) {
      return;
    }
    event.preventDefault();
    vote(button);
  });
})();
