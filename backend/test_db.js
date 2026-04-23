const mongoose = require('mongoose');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri1 = "mongodb://manyprop:manyprop123@ac-uscz2g6-shard-00-00.p1asphf.mongodb.net:27017,ac-uscz2g6-shard-00-01.p1asphf.mongodb.net:27017,ac-uscz2g6-shard-00-02.p1asphf.mongodb.net:27017/manyprop?ssl=true&replicaSet=atlas-kv1y5b-shard-0&authSource=admin";
const uri2 = "mongodb+srv://manyprop:manyprop123@cluster0.p1asphf.mongodb.net/manyprop?retryWrites=true&w=majority";

async function test(uri, label) {
    console.log(`Testing ${label}...`);
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log(`${label} Success!`);
        await mongoose.connection.close();
    } catch (err) {
        console.error(`${label} Failed:`, err.message);
    }
}

async function run() {
    await test(uri1, "Direct Shards");
    await test(uri2, "SRV");
}

run();
