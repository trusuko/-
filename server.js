const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

let comments = [];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.render('index', { comments });
});

app.post('/comment', upload.single('image'), (req, res) => {
  const { name, content, parentId } = req.body;
  const image = req.file ? '/uploads/' + req.file.filename : null;
  const id = Date.now().toString();
  const comment = { id, name, content, image, parentId: parentId || null, time: new Date() };
  comments.push(comment);
  res.redirect('/');
});

app.post('/delete', (req, res) => {
  const { id } = req.body;
  comments = comments.filter(c => c.id !== id && c.parentId !== id); // 子コメントごと削除
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`yuki-bbs running on http://localhost:${port}`);
});
