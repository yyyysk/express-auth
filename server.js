if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const initializePassport = require('./passport-config');
initializePassport(
	passport, 
	(email) => {
		return users.find(user => user.email === email);
	},
	(id) => {
		return users.find(user => user.id === id);
	}
);

const users = [];


app.set('view-engine', 'pug');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false
}));
app.use(methodOverride('_method'));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', checkAuthenticated, (req, res) => {
	res.render('index.pug', { name: req.user.name });
});

app.get('/login', checkNotAuthenticated,  (req, res) => {
	res.render('login.pug');
});

app.get('/register', checkNotAuthenticated,  (req, res) => {
	res.render('register.pug');
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

app.post('/register',async (req, res) => {
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		users.push({
			id: Date.now().toString(),
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword
		});
		res.redirect('/login');
	} catch {
		res.redirect('/register');
	}
	console.log(users);
});

app.delete('/logout', (req, res) => {
	req.logOut();
	res.redirect('/login');
})

function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
	console.log('check')
	if (req.isAuthenticated()) {
		console.log('authenticated');
		return res.redirect('/');
	}
	next();
}


app.listen(3000);
