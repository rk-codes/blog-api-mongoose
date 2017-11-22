const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const {PORT, DATABASE_URL} = require('./config');
const {Blog} = require('./models');

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));

mongoose.Promise = global.Promise;

//GET request
app.get('/blogs', (req, res) => {
	Blog
	.find()
	.then(blogs => {
		res.json({
			blogs: blogs.map(
				(blogPost) => blogPost.apiRepr())
		});
	})
	.catch(
		err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		}
		);
});

//GET by id
app.get('/blogs/:id', (req, res) => {
	Blog
	.findById(req.params.id)
	.then(blogPost => res.json(blogPost.apiRepr()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: 'Internal server error'});
	});
});

//POST request
app.post('/blogs', (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	for(let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if(! (field in req.body)) {
			const message = `Missing \`${field}\` in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}
	Blog
	.create({
		title: req.body.title,
		content: req.body.content,
		author: req.body.author
	})
	.then(
		blogPost => res.status(201).json(blogPost.apiRepr()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: 'Internal server error'});
	});
});

//PUT request
app.put('/blogs/:id', (req, res) => {
	if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
		console.error(message);
		return res.status(400).json({message: message});
	}
	const toUpdate = {};
	const updatableFields = ['title', 'content', 'author'];
	updatableFields.forEach(field => {
		if(field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});
	Blog
	.findByIdAndUpdate(req.params.id, {$set: toUpdate})
	.then(blogPost => res.status(200).json(blogPost.apiRepr()))
	.catch(err => res.status(500).json({message: 'Internal server error'}));
});

//DELETE request
app.delete('/blogs/:id', (req, res) => {
	Blog
	.findByIdAndRemove(req.params.id)
	.then(blogPost => res.status(204).end())
	.catch(err => res.status(500).json({message: 'Internal server error'}));
});

let sever;
//// this function connects to our database, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if(err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`);
				resolve();
			})
			.on('error', err => {
				mongoose.disonnect();
				reject(err);
			});
		});
	});
}
// this function closes the server, and returns a promise
function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};