//Carregar módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const admin = require("../routes/admin.js")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require('../routes/usuario')
const passport = require("passport")
require("../config/auth")(passport)
const db = require("../config/db")
//Configs
//Session
    app.use(session({
        secret: "segredo@123",
        resave: true,
        saveUninitialized:true
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())
//Middleware
    app.use((req, res, next) =>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null
        next()
    })    
//Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
//Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
//mongoose
    mongoose.Promise = global.Promise
    mongoose.connect(db.mongoURI,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(()=>{
        console.log('Banco de dados em execusão')
    }).catch((err)=>{
        console.log('Falha ao se conectar com o banco'+err)
    })

// Public
    app.use(express.static(path.join(__dirname,"public")))
//Rotas
app.get('/', (req, res) =>{
    Postagem.find().populate("categoria").lean().sort({data:"desc"}).then((postagens)=>{
        res.render("index", {postagens:postagens})
    }).catch((err) =>{
        req.flash("error_msg", "Ocorreu um erro interno")
        res.redirect("/404")
    })
})
app.get("/postagem/:slug", (req,res)=>{
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
        if (postagem) {
            res.render("postagem/index", {postagem: postagem})
        } else {
            req.flash("error_msg" , "Postagem não encontrada!!!")
            res.redirect("/")
        }
    }).catch((err)=>{
        req.flash("error_msg", "Ocorreu um erro interno, verifique com a empresa responsável.")
        res.redirect("/")
    })
})

app.get("/categoria", (req,res)=>{
    Categoria.find().lean().then((categoria)=>{
        res.render("categoria/index", {categoria:categoria})
    }).catch((err)=>{
        req.flash("error_msg","Ocorreu um erro ao listar asa categorias")
        res.redirect("/")
    })
})

app.get("/categoria/:slug", (req,res) =>{
    Categoria.findOne({slug : req.params.slug}).lean().then((categoria)=>{
        if (categoria) {
            Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{
                res.render("categoria/postagens", {postagens: postagens, categoria: categoria})
            }).catch((err) =>{
                req.flash("Erro ao listar as postagens!!!")
            })
        } else {
            req.flash("error_msg", "Não encontramos esta categoria!!!")
            res.redirect("/")
        }
    }).catch((err) =>{
        console.log(err)
        req.flash("error_msg", "Falha ao carregar a página desta categoria!!!")
        res.redirect("/")
    })
})

app.get('/404', (req, res)=>{
    res.send("Erro 404!")
})
app.use('/admin', admin)
app.use('/usuarios', usuarios)
//Outros
const PORT = process.env.PORT || 8181
app.listen(PORT, ()=>{
console.log('Sevidor em operação...')
})