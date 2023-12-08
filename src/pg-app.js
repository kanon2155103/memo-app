const express = require('express');
const mod = require('./module')
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const pool = mod.pool;

// ルートURLへのアクセスがあった際に/indexにリダイレクトする
app.get('/', (req, res) => {
	res.redirect('/index');
});

// Memo Listの取得
app.get('/index', (req, res) => {
	pool.query(
		'SELECT * FROM memos WHERE is_removed = false ORDER BY id',
		(error, results) => {
			console.log(results.rows);
			res.render('index.ejs', {memos: results.rows});
		}
	);
});

// 新規メモの作成ページを表示
app.get('/new', (req, res) => {
	res.render('new.ejs');
});

// 新規メモを保存
app.post('/create', (req, res) => {
	pool.query(
		'INSERT INTO memos (title, content) VALUES ($1, $2)',
		[req.body.memoTitle, req.body.memoContent],
		(error, results) => {
			res.redirect('/index');
		}
	);
});

// メモの編集ページを取得
app.get('/edit/:id', (req, res) => {
	pool.query(
		'SELECT * FROM memos WHERE id = $1',
		[req.params.id],
		(error, results) => {
			res.render('edit.ejs', {memo: results.rows[0]});
		}
	);
});

// メモを更新
app.post('/update/:id', (req, res) => {
	pool.query(
		'UPDATE memos SET title = $1, content= $2 WHERE id = $3',
		[req.body.memoTitle, req.body.memoContent, req.params.id],
		(error, results) => {
			res.redirect('/index');
		}
	);
});

// Trash Listの取得
app.get('/trash', (req, res) => {
	pool.query(
		'SELECT * FROM memos WHERE is_removed = true ORDER BY id',
		(error, results) => {
			const result = results.rows;
			console.log(result);
			res.render('trash.ejs', {memos: result});
		}
	);
});

// メモを/indexから/trashへ
app.post('/remove/:id', (req, res) => {
	const id = req.params.id;
	pool.query(
		'UPDATE memos SET is_removed = true WHERE id = $1',
		[id],
		(error, results) => {
			res.redirect('/index');
		}
	);
});

// メモを/trashから/indexへ
app.post('/restore/:id', (req, res) => {
	const id = req.params.id;
	pool.query(
		'UPDATE memos SET is_removed = false WHERE id = $1',
		[id],
		(error, results) => {
			res.redirect('/trash');
		}
	);
});

// /trashからメモを完全削除
app.post('/delete/:id', (req, res) => {
	const id = req.params.id;
	pool.query(
		'DELETE FROM memos WHERE id = $1',
		[id],
		(error, results) => {
			res.redirect('/trash');
		}
	);
});

// Trash Listを空にする
app.post('/empty', (req, res) => {
	pool.query(
		'DELETE FROM memos WHERE is_removed = true',
		(error, results) => {
			res.redirect('/trash');
		}
	);
});

const port = process.env.PORT || 8002;
pool.connect((err) => {
	if (err) {
		console.log('error connecting: ' + err.stack);
		return;
	}
	app.listen(port, () => {
		console.info(`Listeninng on ${port}`);
	});
});
