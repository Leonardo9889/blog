if(process.env.NODE_ENV == "production"){
    module.exports = { mongoURI: "mongodb+srv://Leonardo:<97623962>@blogapp.kptfr.mongodb.net/<BlogApp>?retryWrites=true&w=majority"}
}else{
    module.exports = { mongoURI: "mongodb://localhost/blogapp"}
}