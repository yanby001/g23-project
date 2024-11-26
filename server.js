const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const Recipe = require('./models/recipe');

const app = express();
const PORT = process.env.PORT || 8099;

// Connect to MongoDB
mongoose.connect('mongodb+srv://yanboyang086:Yby66635090@cluster0.go37o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

// Authentication Middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Routes
app.get('/', isAuthenticated, (req, res) => {
  res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Simple authentication (replace with real user authentication)
  if (username === 'user' && password === 'password') {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/create', isAuthenticated, (req, res) => {
  res.render('create');
});

app.post('/create', isAuthenticated, (req, res) => {
  const { title, ingredients, instructions } = req.body;
  const newRecipe = new Recipe({ title, ingredients, instructions });
  newRecipe.save((err) => {
    if (err) return res.send(err);
    res.redirect('/read');
  });
});

app.get('/read', isAuthenticated, (req, res) => {
  Recipe.find({}, (err, recipes) => {
    if (err) return res.send(err);
    res.render('read', { recipes });
  });
});

app.get('/update', isAuthenticated, (req, res) => {
  Recipe.find({}, (err, recipes) => {
    if (err) return res.send(err);
    res.render('update', { recipes });
  });
});

app.post('/update', isAuthenticated, (req, res) => {
  const { id, title, ingredients, instructions } = req.body;
  Recipe.findByIdAndUpdate(id, { title, ingredients, instructions }, (err) => {
    if (err) return res.send(err);
    res.redirect('/read');
  });
});

app.get('/delete', isAuthenticated, (req, res) => {
  Recipe.find({}, (err, recipes) => {
    if (err) return res.send(err);
    res.render('delete', { recipes });
  });
});

app.post('/delete', isAuthenticated, (req, res) => {
  const { id } = req.body;
  Recipe.findByIdAndDelete(id, (err) => {
    if (err) return res.send(err);
    res.redirect('/read');
  });
});

// RESTful API
app.get('/api/recipes', (req, res) => {
  Recipe.find({}, (err, recipes) => {
    if (err) return res.send(err);
    res.json(recipes);
  });
});

app.post('/api/recipes', (req, res) => {
  const { title, ingredients, instructions } = req.body;
  const newRecipe = new Recipe({ title, ingredients, instructions });
  newRecipe.save((err) => {
    if (err) return res.send(err);
    res.json(newRecipe);
  });
});

app.put('/api/recipes/:id', (req, res) => {
  const { title, ingredients, instructions } = req.body;
  Recipe.findByIdAndUpdate(req.params.id, { title, ingredients, instructions }, { new: true }, (err, recipe) => {
    if (err) return res.send(err);
    res.json(recipe);
  });
});

app.delete('/api/recipes/:id', (req, res) => {
  Recipe.findByIdAndDelete(req.params.id, (err) => {
    if (err) return res.send(err);
    res.json({ message: 'Recipe deleted' });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port 'http://localhost:${PORT}'`);
});
