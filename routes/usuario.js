const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")


router.get("/registro", (req,res) =>{
    res.render("usuarios/registro")
})


router.post("/registro", (req,res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.email == undefined || req.body.nome == null) {
        erros.push({texto: "O nome não pode ser registrado"})
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "E-mail inválido"})
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: "Senha iválida"})
    }
    if (req.body.senha.length < 8) {
        erros.push({texto: "A senha precisa ter nomínimo oito caracteres"})
    }
    if (req.body.senha != req.body.senha2) {
        erros.push({texto: "As senhas não estão iguais, tente novamente!"})
    }

    if (erros.length > 0) {
        res.render("usuarios/registro", {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) =>{
            if (usuario) {
                req.flash("error_msg", "Email já cadastrado em nosso sistema")
                res.redirect("/usuarios/registro")
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome, 
                    email: req.body.email,
                    senha: req.body.senha
                })
                bcrypt.genSalt(10, (err, salt) =>{
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                        if (err) {
                            req.flash("error_msg" , "Ocorreu um erro ao salvar este usuario")
                        }

                        novoUsuario.senha = hash
                        novoUsuario.save().then(() =>{
                            req.flash("success_msg", "Usuário cadastrado com sucesso!!!")
                            res.redirect("/")
                        }).catch((err) =>{
                            req.flash("error_msg", "Ocorreu um erro ao criar este usuário, tente novamente. ")
                            res.redirect("/usuarios/registro")
                        })
                    })
                })
            }
        }).catch((err) =>{
            req.flash("error_msg", "Ocorreu um erro interno")
            res.redirect("/")
        })
    }
})

router.get("/login", (req,res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req,res) => {
    req.logOut()
    req.flash("success_msg", "Conta deslogada, até outro momento :)")
    res.redirect("/")
})

module.exports = router