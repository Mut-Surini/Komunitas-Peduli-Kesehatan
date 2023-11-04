const fs = require("fs");

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

const user = {
    nama : "Fitrah",
    gender : "Laki Laki"
}


const globalServerInfo = require("./Server/Global/info.json");
const globalServerComments = "./Server/Global/comments.json";
const newGlobalServerComments = require("./Server/Global/comments.json");

console.log(newGlobalServerComments);

const pernyataan = "Aku punya penyakit alergi susu";

function tambahKomentar(nama, comment){

    newGlobalServerComments.push({
        nama,
        comment,
        arrayComment : []
    });

    fs.writeFile(globalServerComments, JSON.stringify(newGlobalServerComments), function writeJSON(err) {
        if (err) return console.log(err);
        console.log("Add Comment Success");
    });
    
}

// tambahKomentar(user.nama, pernyataan);

console.log(globalServerComments);





