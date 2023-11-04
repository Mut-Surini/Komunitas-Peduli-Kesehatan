const fs = require("fs");
const port = 3000;

var express = require('express'),
    expressLayouts = require('express-layouts'),
    app = express();
app.use(expressLayouts);
 
app.set('view engine', 'ejs');

app.get('/home', function(req, res) {
    res.render('index', {
      layout: 'home-layout', // use home-layout
    });
});


const penyakit = [{
    nama : "Abses Otak",
    desk : "Abses otak atau abses serebri adalah penumpukan nanah di dalam otak akibat infeksi. Abses otak sering disebabkan oleh infeksi bakteri atau jamur di otak yang dipicu oleh cedera kepala, atau infeksi di area tubuh lain yang menyebar ke otak.",
    gejala : ["Sakit kepala yang terus-menerus","Leher atau punggung terasa kaku","Mual dan muntah"],
    pengobatan : ["Antibiotik atau antijamur, untuk mengatasi infeksi, termasuk untuk mengatasi abses otak yang disebabkan oleh toksoplasmosis",
    "Diuretik dan kortikosteroid, untuk mengurangi tekanan dan pembengkakan di otak",
    "Obat antikejang, untuk mengatasi kejang yang bisa terjadi pada abses otak"],
    pencegahan: ["Menjalani pemeriksaan dan pengobatan sampai tuntas jika menderita penyakit infeksi",
    "Menjaga kesehatan dan kebersihan gigi dan mulut, termasuk dengan periksa ke dokter gigi secara rutin",
    "Menggunakan alat pelindung, seperti helm, saat bekerja di lingkungan yang berisiko menimbulkan cedera kepala",
    "Menerapkan perilaku seks yang sehat untuk menghindari penularan HIV/AIDS",
    "Menjalani gaya hidup sehat, seperti berhenti merokok, mengonsumsi makanan sehat dan bergizi seimbang, serta berolahraga secara rutin",
    "Tidak mengonsumsi obat-obatan secara sembarangan",
    "Melakukan vaksinasi guna mencegah infeksi bakteri tertentu, seperti meningitis, pneumonia, dan Hib"]
},{
    nama : "Alergi Susu",
    desk : "Alergi susu adalah reaksi berlebihan sistem kekebalan tubuh terhadap kandungan protein yang terkandung dalam berbagai produk olahan susu. Kondisi ini umumnya ditandai dengan gatal-gatal, muntah, atau diare.",
    gejala : ["Bibir atau mulut gatal-gatal",
    "Bibir atau lidah bengkak",
    "Hidung gatal dan berair",
    "Sesak napas",
    "Perut kram",
    "Mata berair",
    "Muntah",
    "Diare",
    "Mengi"],
    pengobatan :["Obat suntik epinephrine (adrenaline), untuk mencegah reaksi anafilaksis",
        "Antihistamin, untuk meredakan gejala akibat reaksi alergi",
        "Air susu ibu (ASI)",
        "Susu kacang kedelai",
        "Susu formula hipoalergenik"],
    pencegahan : ["Baca label produk kemasan sebelum membeli makanan atau minuman",
    "Bawa makanan atau bekal dari rumah agar lebih aman dikonsumsi",
    "Jika membeli makanan, beri tahu penjual atau juru masak untuk tidak menambahkan produk yang mengandung susu pada makanan",
    "Hindari penggunaan alat masak atau alat makan yang sama dengan orang lain",
    "Beri tahu keluarga atau teman bila Anda atau anak Anda memiliki alergi susu sehingga mereka bisa membantu mencegahnya"]
}];

function upComments(server, user, pernyataan){

    const urlServer = `./Server/${server}/comments.json`;
    const serverComments = require(`./Server/${server}/comments.json`);

    function createArray(pernyataan){
        const array = pernyataan.split(' ');
        return array;
    }

    function createArray2(pernyataan){
        const array = pernyataan.split(' ');
        const array2 = [];
        for(i = 0; i < (array.length-1) ; i++){
            array2.push(array[i] + ' ' + array[i+1]);
        }
        return array2;
    }
    
    function createArray3(pernyataan){
        const array = pernyataan.split(' ');
        const array3 = [];
        for(i = 0; i < (array.length-1) ; i++){
            array3.push(array[i] + ' ' + array[i+1] + ' ' + array[i+2]);
        }
        return array3;
    }
    
    function createArray4(pernyataan){
        const array = pernyataan.split(' ');
        const array4 = [];
        for(i = 0; i < (array.length-1) ; i++){
            array4.push(array[i] + ' ' + array[i+1] + ' ' + array[i+2] + ' ' + array[i+3]);
        }
        return array4;
    }

    function checkArray(array){

        const result = [];
    
        array.forEach(e => {
        penyakit.forEach(f => {
            if(e.toLowerCase() == f.nama.toLowerCase()){
                result.push(f.nama);   
            }
        });
        }); 
    
        return result;
    }
    
    function isiResult(arr){
        arr.forEach(e => {
            result.push(e);
        });
    }
    
    function tambahKomentar(nama, comment){
    
        const result = [];
    
        const arrayPernyataan = createArray(comment);
        const arrayPernyataan2 = createArray2(comment);
        const arrayPernyataan3 = createArray3(comment);
        const arrayPernyataan4 = createArray4(comment);
    
        isiResult(checkArray(arrayPernyataan));
        isiResult(checkArray(arrayPernyataan2));
        isiResult(checkArray(arrayPernyataan3));
        isiResult(checkArray(arrayPernyataan4));
    
        serverComments.push({
            nama,
            comment,
            arrayComment : result
        });
    
        fs.writeFile(urlServer, JSON.stringify(serverComments), function writeJSON(err) {
            if (err) return console.log(err);
            console.log("Add Comment Success");
        });
        
    }

    tambahKomentar(user, pernyataan);
}

// upComments("Global", "Fitrah", "Aku juga mau");

//Server Management

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
// deleteServer("Keluargaku");

// Comments Management

function callComments(nama, kolom){
    const comments = require(`./Server/${nama}/comments.json`);
    
    comments.forEach(e => {
        console.log("Success");
    });
}

// callComments("Global");

app.listen(port, () => {
	console.log(`Listening to port ${port}`);
});



