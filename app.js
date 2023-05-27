const express = require('express');
const db = require('./db')
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = db.connection;

app.get('/', (req, res) => {
	//Display top page
	res.redirect('/index');
});

app.get('/index', (req, res) => {
	connection.query(
		'SELECT * FROM memos',
		(error, results) => {
			console.log(results);
			res.render('index.ejs', {memos: results});
		}
	);
});

app.get('/new', (req, res) => {
	res.render('new.ejs');
});

app.get('/test', (req, res) => {
	res.render('test.ejs')
})

app.post('/create', (req, res) => {
	connection.query(
		'INSERT INTO memos (title, content) VALUES (?, ?)',
		[req.body.memoTitle, req.body.memoContent],
		(error, results) => {
			res.redirect('/index');
		}
	);
});

app.post('/delete/:id', (req, res) => {
	connection.query(
		'DELETE FROM memos WHERE id = ?',
		[req.params.id],
		(error, results) => {
			res.redirect('/index');
		}
	);
});

app.get('/edit/:id', (req, res) => {
	connection.query(
		'SELECT * FROM memos WHERE id = ?',
		[req.params.id],
		(error, results) => {
			res.render('edit.ejs', {memo: results[0]});
		}
	);
});

app.post('/update/:id', (req, res) => {
	connection.query(
		'UPDATE memos SET title = ?, content= ?  WHERE id = ?',
		[req.body.memoTitle, req.body.memoContent, req.params.id],
		(error, results) => {
			res.redirect('/index');
		}
	);
});

const port = process.env.PORT || 3000;

connection.connect((err) => {
	if (err) {
		console.log('error connecting: ' + err.stack);
		return;
	}
	app.listen(port, () => {
		console.info(`Listeninng on ${port}`);
	});
});
