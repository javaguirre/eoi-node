const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        text: {
            type: String,
            required: true
        }
    }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
