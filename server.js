const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

let threads = [];
let comments = [];
let likes = {};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  const keyword = req.query.q?.toLowerCase() || '';
  const filteredThreads = threads
    .map(thread => {
      const threadComments = comments.filter(c => c.threadId === thread.id);
      const match = thread.title.toLowerCase().includes(keyword) ||
                    threadComments.some(c =>
                      c.name.toLowerCase().includes(keyword) ||
                      c.content.toLowerCase().includes(keyword));
      return match ? { ...thread, count: threadComments.length } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.time - a.time);
  res.render('index', { threads: filteredThreads, keyword });
});

app.get('/thread/:id', (req, res) => {
  const thread = threads.find(t => t.id === req.params.id);
  const threadComments = comments.filter(c => c.threadId === req.params.id);
  res.render('thread', { thread, comments: threadComments, likes });
});

app.post('/thread', (req, res) => {
  const { title } = req.body;
  const id = Date.now().toString();
  threads.push({ id, title, time: new Date() });
  res.redirect('/');
});

app.post('/comment', upload.single('image'), (req, res) => {
  const { name, content, threadId, parentId } = req.body;
  const image = req.file ? '/uploads/' + req.file.filename : null;
  const id = Date.now().toString();
  const comment = { id, threadId, name, content, image, parentId: parentId || null, time: new Date() };
  comments.push(comment);
  res.redirect('/thread/' + threadId);
});

app.post('/like', (req, res) => {
  const { id } = req.body;
  likes[id] = (likes[id] || 0) + 1;
  res.json({ count: likes[id] });
});

app.post('/delete', (req, res) => {
  const { id, threadId } = req.body;
  comments = comments.filter(c => c.id !== id && c.parentId !== id);
  res.redirect('/thread/' + threadId);
});

app.listen(port, () => {
  console.log(`yuki-bbs with threads running on http://localhost:${port}`);
});
