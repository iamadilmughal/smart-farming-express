var mongoose = require('mongoose');

var CommentSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    date: {
        type: String,
        default: Date.now
    },
    text: {
        type: String,
        require: true
    }
});

var PostSchema = mongoose.Schema({
    postTitle: {
        type: String,
        require: true
    },
    postedBy: {
        type: String,
        require: true
    },
    category: String,
    datePosted: {
        type: String,
        require: true,
        default: Date.now
    },
    postDescription: String,
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    image: String,
    comments: [CommentSchema]
});

module.exports = mongoose.model('Posts', PostSchema);