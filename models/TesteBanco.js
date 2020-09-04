const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Teste = new Schema ({
    descricao: {type:String, require: true}
})

mongoose.model('testes', Teste)