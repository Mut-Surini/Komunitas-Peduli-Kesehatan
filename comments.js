const fs = require('fs');

function callComments(nama){
    const comments = require(`./Server/${nama}/comments.json`);
    
    comments.forEach(e => {
        console.log(`Nama : ${e.nama}
        Komentar : ${e.comment}`);
    });
}

callComments("Global");