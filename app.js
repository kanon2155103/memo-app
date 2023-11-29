const express = require('express');
const mod = require('./module')
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mod.connection;

// ルートURLへのアクセスがあった際に/indexにリダイレクトする
app.get('/', (req, res) => {
	res.redirect('/index');
});

// Memo Listの取得
app.get('/index', (req, res) => {
	connection.query(
		'SELECT * FROM memos WHERE isRemoved = 0',
		(error, results) => {
			console.log(results);
			res.render('index.ejs', {memos: results});
		}
	);
});

// 新規メモの作成ページを表示
app.get('/new', (req, res) => {
	res.render('new.ejs');
});

// 新規メモを保存
app.post('/create', (req, res) => {
	connection.query(
		'INSERT INTO memos (title, content) VALUES (?, ?)',
		[req.body.memoTitle, req.body.memoContent],
		(error, results) => {
			res.redirect('/index');
		}
	);
});

// メモの編集ページを取得
app.get('/edit/:id', (req, res) => {
	connection.query(
		'SELECT * FROM memos WHERE id = ?',
		[req.params.id],
		(error, results) => {
			res.render('edit.ejs', {memo: results[0]});
		}
	);
});

// メモを更新
app.post('/update/:id', (req, res) => {
	connection.query(
		'UPDATE memos SET title = ?, content= ?  WHERE id = ?',
		[req.body.memoTitle, req.body.memoContent, req.params.id],
		(error, results) => {
			res.redirect('/index');
		}
	);
});

// Trash Listの取得
app.get('/trash', (req, res) => {
	connection.query(
		'SELECT * FROM memos WHERE isRemoved = 1',
		(error, results) => {
			console.log(results);
			res.render('trash.ejs', {memos: results});
		}
		);
});

// メモを/indexから/trashへ
app.post('/remove/:id', (req, res) => {
	const id = req.params.id;
	connection.query(
		'UPDATE memos SET isRemoved = 1 WHERE id = ?',
		[id],
		(error, results) => {
			res.redirect('/index');
		}
	);
});

// メモを/trashから/indexへ
app.post('/restore/:id', (req, res) => {
	const id = req.params.id;
	connection.query(
		'UPDATE memos SET isRemoved = 0 WHERE id = ?',
		[id],
		(error, results) => {
			res.redirect('/trash');
		}
	);
});

// /trashからメモを完全削除
app.post('/delete/:id', (req, res) => {
	const id = req.params.id;
	connection.query(
		'DELETE FROM memos WHERE id = ?',
		[id],
		(error, results) => {
			res.redirect('/trash');
		}
	);
});

// Trash Listを空にする
app.post('/empty', (req, res) => {
	connection.query(
		'DELETE FROM memos WHERE isRemoved = 1',
		(error, results) => {
			res.redirect('/trash');
		}
	);
});

const port = process.env.PORT || 8001;

connection.connect((err) => {
	if (err) {
		console.log('error connecting: ' + err.stack);
		return;
	}
	app.listen(port, () => {
		console.info(`Listeninng on ${port}`);
	});
});
