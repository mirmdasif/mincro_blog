var mongoLocation = 'mongodb'
var Db = require(mongoLocation).Db;
var Connection = require(mongoLocation).Connection;
var Server = require(mongoLocation).Server;
var BSON = require(mongoLocation).BSON;
var ObjectID = require(mongoLocation).ObjectID;


//Create My Article Provider Object
var ArticleProvider = function (host,port) {
  //Create The Database 
  this.db = new Db('node-mongo-blog',new Server(host,port,{auto_reconnect:true},{}));
  this.db.open(function(){
    //console.log("Data base success fully created");
  });
};

// Get 'articles' collection form database
ArticleProvider.prototype.getCollection = function (callback) {
  this.db.collection('articles',function (error,article_collection){
    if(error){ 
      callback(error);
    }
    else {
      callback(null,article_collection);
    }
  });
};


// get all entry of the articles
ArticleProvider.prototype.findAll = function (callback) {
  this.getCollection(function(error,article_collection){
    if(error) {
      callback(error);
    }
    else {
      article_collection.find().toArray(function (error,result){
        if(error) {
          callback(error);
        }
        else {
          callback(null,result);
        }
      });
    }
  });
  
};



ArticleProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};
// saving an article
ArticleProvider.prototype.save = function(articles, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        if( typeof(articles.length)=="undefined")
          articles = [articles];

        for( var i =0;i< articles.length;i++ ) {
          article = articles[i];
          article.created_at = new Date();
          
          // article is posted for the first time
          // it has no commenct
          if( article.comments === undefined ) article.comments = [];
          
          for(var j =0;j< article.comments.length; j++) {
            article.comments[j].created_at = new Date();
          }
        }

        article_collection.insert(articles, function() {
          callback(null, articles);
        });
      }
    });
};

// for adding  comment
ArticleProvider.prototype.addCommentToArticle = function(articleId, comment, callback) {
  this.getCollection(function(error, article_collection) {
    if( error ) callback( error );
    else {
      article_collection.update(
        {_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
        {"$push": {comments: comment}},
        function(error, article){
          if( error ) callback(error);
          else callback(null, article)
        });
    }
  });
};
exports.ArticleProvider = ArticleProvider;