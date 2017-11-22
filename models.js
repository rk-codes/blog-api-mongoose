const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
	title: {type: String, required: true},
	content: {type: String},
	author: {
		firstName: String,
		lastName: String
	},
	created: {type: Date}
});

blogSchema.virtual('authorName').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`.trim()
});

blogSchema.methods.apiRepr = function(){
	return{
		id: this._id,
		title: this.title,
		content: this.content,
		author: this.authorName,
		created: this.created
	}
}

const Blog = mongoose.model('Blog', blogSchema);
module.exports = {Blog};