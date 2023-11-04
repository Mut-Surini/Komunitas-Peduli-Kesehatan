const fs = require('fs');
let kode = 1234;

function createServer(nama, user){
    fs.mkdir(`./Server/${nama}`, { recursive: true }, (err) => {
        if (err) throw err;
      });

    const info = [{
        "namaServer" : nama,
        "kodeServer" : kode+1,
        "admin" : user,
        "users" : []
    }];

    const comments = [];

    fs.writeFile(`./Server/${nama}/info.json`, JSON.stringify(info), (err) => {
        if(err) throw err;
        console.log('Server Create');
    });

    fs.writeFile(`./Server/${nama}/comments.json`, JSON.stringify(comments), (err) => {
        if(err) throw err;
    });

    kode += 1;
}

function deleteServer(nama){

    const path = require(`path`);

    const deleteFolderRecursive = function (directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
          const curPath = path.join(directoryPath, file);
          if (fs.lstatSync(curPath).isDirectory()) {
           // recurse
            deleteFolderRecursive(curPath);
          } else {
            // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(directoryPath);
      }
    };

    deleteFolderRecursive(`./Server/${nama}`);
}

// createServer("Keluargaku", "Fitrah");
deleteServer("Keluargaku");