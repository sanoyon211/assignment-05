document.getElementById('login-btn').addEventListener('click', function (e) {
  e.preventDefault(); // ← এটাই সমস্যার সমাধান

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('error-msg');

  if (username === 'admin' && password === 'admin123') {
    errorMsg.classList.add('hidden');
    window.location.assign('home.html'); // alert সরিয়ে দিলাম
  } else {
    errorMsg.classList.remove('hidden');
  }
});
