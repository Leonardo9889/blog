const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require('../models/Categoria')
const Categoria = mongoose.model("categorias")
require('../models/Postagem')
const Postagem = mongoose.model("postagens")
require('../models/TesteBanco')
const Teste = mongoose.model('testes')
const {eAdmin} = require("../helpers/eAdmin")


router.get('/categoria', eAdmin, (req,res)=>{
    //foi necessário adicionar ".sort({date:'desc'}).lean()" para mostrar na tela
    Categoria.find().lean().sort({date: 'desc'}).then((categorias)=>{
        res.render('admin/categoria', {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar")
        res.redirect('/admin')
    })
})

router.get('/categoria/add', eAdmin, (req,res)=>{
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req,res)=>{

    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto:"Nome invalido"})
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: "Slug invalido"})
    }

    if (req.body.nome.length < 2) {
        erros.push({texto: "Tamanho para o nome invalido"})
    }

    if(erros.length){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria ={
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Registro realizado com sucesso")
            res.redirect("/admin/categoria")
            if (document.getElementsByName('exit').onClick) {
                res.redirect('/admin/categoria')
            }
        }).catch((err)=>{
            req.flash("error_msg", "Falha ao registrar, tente novamente")
            req.redirect("/admin")
        })
    }
    
})
//renderiza as categorias em tela 
router.get('/categoria/edit/:id', eAdmin, (req,res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategoria', {categoria:categoria})
    }).catch((err)=>{
        req.flash("error_msg", "Categoria não encontrada")
        res.redirect('/admin/categoria')
    })
})

router.post('/categoria/edit', eAdmin, (req,res)=>{
    var errosEdit = []

    if (typeof req.body.nome == undefined || req.body.nome == null || !req.body.nome) {
        errosEdit.push({texto: "edicao do nome invalido"})
    }
    if (typeof req.body.slug == undefined || req.body.slug == null || !req.body.slug ) {
        errosEdit.push({texto: " Edicao do slug invalido"})
    }
    if (req.body.nome.length < 2) {
        erros.push({texto: "Tamanho para o nome invalido"})
    }
    if (errosEdit.length) {
        res.render("admin/editcategoria", {errosEdit: errosEdit})
    }else{
       Categoria.findOne({_id: req.body.id}).then((categoria) =>{
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(()=>{
                req.flash("success_msg", "Categoria editada")
                res.redirect("/admin/categoria")
            }).catch((err)=>{
                req.flash("error_msg", "Ocorreu um erro ao editar a categira, verifique os campos")
                res.redirect("/admin/categoria")
            })
       }).catch((err)=>{
           res.redirect("/admin/categoria")
       })
    }
})

router.post("/categoria/delete", eAdmin, (req,res)=>{
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect('/admin/categoria')
    }).catch((err)=>{
        req.flash("error_msg","Ocorreu um erro ao deletar o arquivo, contacte o suporte")
        res.redirect('/admin/categoria')
    })
})

router.get("/post", eAdmin, (req,res)=>{
    Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens)=>{
       res.render("admin/post", {postagens: postagens}) 
    }).catch((err)=>{
        req.flash("error_msg", "Ocorreu um erro ao listar as postagens")
        res.redirect("/admin")
    })
})

router.get("/post/add", eAdmin, (req,res)=>{
    Categoria.find().lean().then((categoria)=>{
        res.render("admin/addpost", {categoria:categoria})
    }).catch((err)=>{
        req.flash("error_msg", "Ocorreu um erro ao carregar o formulário")
        res.redirect("/admin")
    })
    
})

router.post("/post/novo", eAdmin, (req,res)=> {
    var error = []

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        error.push({texto: "Não foi possível cadastrar este título, verifique o campo"})
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        error.push({texto: "Não foi possível cadastrar este slug, verifique o campo"})
    }

    if (req.body.conteudo == "") {
        error.push({texto: "Adicione uma descrição ao campo"})
    }

    if (req.body.categoria == "0") {
        error.push({texto: "Categoria não encontrada, cadastre-a"})
    }

    if(error.length > 0){
        res.render("admin/addpost", {error: error})
    }else{
        const novaPostagem = {
           titulo: req.body.titulo,
           slug: req.body.slug,
           descricao: req.body.descricao,
           categoria: req.body.categoria,
           conteudo: req.body.conteudo 
        }
        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "Postagem criada com sucesso!!!")
            res.redirect("/admin/post")
        }).catch((err)=>{
            req.flash("error_msg", "Ocorreu um erro ao savar a postagem" +err)
            res.redirect("/admin/post")
        }) 
    }
})
router.get("/post/edit/:id", eAdmin,(req,res)=>{
    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=> {
        Categoria.find().lean().then((categoria)=>{
            res.render("admin/editPost", {categoria:categoria, postagem: postagem})
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao listar as categorias")
            res.redirect("/admin/post")
        })

    }).catch((err)=> {
        req.flash("error_msg", "Ocorreu um erro ao carregar o formulario de edição")
        res.redirect("/admin/post")
    })
})

router.post("/post/edit", eAdmin, (req,res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) =>{
        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria

        postagem.save().then(() =>{
            req.flash("success_msg", "Postagem editada com sucesso!!! ")
            res.redirect("/admin/post")
        }).catch((err) =>{
            console.log(err)
            req.flash("error_msg", "Erro ao editar a postagem, entre em contato com a empresa")
            res.redirect("/admin/post")
        })
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro ao editar a postagem!!!")
        res.redirect("/admin/post")
    })
})

router.post("/post/delete", eAdmin, (req,res)=>{
    Postagem.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Post deletado com sucesso!!!")
        res.redirect("/admin/post")
    }).catch((err) =>{
        req.flash("error_msg", "Ocorreu um erro ao deletar o post")
        res.redirect("/admin/post")
    })
})




module.exports = router