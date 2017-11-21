const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Blog} = require('./models');

const app = express();
app.use(bodyParser.json());


//GET request
app.get('/blogs', (req, res) => {
	Blog
	 .find()
	 .limit(10)
	 .then(blogs => {
	 	res.json({
	 		blogs: blogs.map(
	 			(blog) => blog.apiRepr())
	 	});
	 })
	 .catch(
	 	err => {
	 		console.error(err);
	 		res.status(500).json({message: 'Internal server error'});
	 	});
});

//GET by id
app.get('/blogs/:id', (req, res) => {
	Blog
	.findById(req.params.id)
	.then(blog => res.json(blog.apiRepr()))
	.catch(
		err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
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