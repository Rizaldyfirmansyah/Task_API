const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 2000;
const secretKey = 'secret_key'; // Gantilah dengan kunci rahasia yang aman

app.use(bodyParser.json());

// Fungsi untuk menghasilkan token JWT
function generateToken(user) {
  const payload = {
    username: user.username,
  };
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

// Endpoint untuk login pengguna
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Baca data pengguna dari file users.json
  const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

  // Cek apakah pengguna ada dalam database
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    res.status(401).json({ message: 'Gagal login: Pengguna tidak ditemukan.' });
    return;
  }

  // Jika pengguna valid, hasilkan token JWT
  const token = generateToken(user);

  res.json({ token });
});

// Middleware untuk memeriksa token JWT
function checkToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Tidak ada token JWT. Autentikasi diperlukan.' });
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      res.status(401).json({ message: 'Akses ditolak: Token tidak valid.' });
    } else {
      // Token valid, lanjutkan ke endpoint berikutnya
      next();
    }
  });
}

// Endpoint untuk mendapatkan semua data guru
app.get('/teachers', checkToken, (req, res) => {
  // Baca data guru dari file teachers.json
  const teachers = JSON.parse(fs.readFileSync('teachers.json', 'utf8'));

  res.json(teachers);
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
