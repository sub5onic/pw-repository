var { Client } = require('pg'); // { Pool }


async function GetDbClient() {
    const client = new Client({
        user: 'jp', // 'pw_auto_data_logger', // 'pw_front_end_reader', //
        host: 'localhost',
        database: 'pwdemo',
        password: 'Brigant3',
        port: 5432
    })
    await client.connect();
    return client;
}

async function GetPlants() {
    const client = await GetDbClient();
    var tmp = await client.query(`SELECT * FROM plants;`);
    await client.end();
    // console.log(tmp);
    return tmp.rows;
}

let counter = 0;
async function SetData(time, plant, object, type, value) {
    const client = await GetDbClient();
    var tmp = await client.query(
        'INSERT INTO data ("time", plant, object, type, value) VALUES ($1, $2, $3, $4, $5) RETURNING *;'
        , [time, plant, object, type, value]);
    var res = tmp.rows[0];
    // console.log(res);
    // var id = tmp.rows[0].id;
    // console.log(`New record [${id}] stored.`);
    await client.end();
}

async function SetDataTest(data) {
    const client = await GetDbClient();
    var tmp = await client.query(
        // `INSERT INTO datatest (time, ip, data) VALUES ($1, $2, $3);`, ['2017-03-18 08:21:36.175627+07','10.0.0.110',++counter]);
        'INSERT INTO datatest (time, ip, data) VALUES ($1, $2, $3) RETURNING *;'
        , [new Date(Date.now()), "10.0.0.10", data]); //`{ data test ${Math.round(Math.random()*100)}}`]);
    var res = tmp.rows[0];
    console.log(res);
    // var id = tmp.rows[0].id;
    // console.log(`New record [${id}] stored.`);
    // var created = await GetDataTest(id);
    await client.end();
    // return created;
    // return id;
}

async function GetDataTest(id) {
    const client = await GetDbClient();
    var tmp = await client.query(`SELECT * FROM datatest WHERE id = $1;`, [id]);
    await client.end();
    return tmp.rows[0];
}
async function GetLastIstant() {
    const client = await GetDbClient();
    // var tmp = await client.query(`SELECT * FROM data ORDER BY time DESC LIMIT 1;`);
    var tmp = await client.query(`SELECT MAX(time) FROM data;`);
    // console.log(tmp.rows[0].max);
    await client.end();
    return tmp.rows[0].max;
}

async function GetData(begin, end) {
    const client = await GetDbClient();
    let tmp;
    if (end) tmp = await client.query(`SELECT * FROM data WHERE time BETWEEN $1 AND $2;`, [begin, end]);
    else tmp = await client.query(`SELECT * FROM data WHERE time BETWEEN $1 AND NOW() ORDER BY time ASC;`, [begin]);
    // console.log(tmp.rows);
    await client.end();
    return tmp.rows;
}

async function GetLast(){
   return await GetData(await GetLastIstant());
}

async function GetLastNthIstant(num){
    const client = await GetDbClient();
    var tmp = await client.query(`SELECT MIN(time) FROM (SELECT DISTINCT time FROM data ORDER BY time DESC LIMIT $1) AS nested;`, [num]);
    // console.log(tmp.rows);
    await client.end();
    return tmp.rows[0].min;
}
async function GetLastN(num){
    let lastIstant = await GetLastNthIstant(num);
    // console.log(lastIstant);
    return await GetData(lastIstant);
 }
 
async function DeleteAll(id) {
    const client = await GetDbClient();
    await client.query('DELETE FROM data WHERE true;');
    await client.query('ALTER SEQUENCE data_id_seq RESTART WITH 1;')
    await client.end();
}
module.exports = {
    GetPlants,
    GetLastNthIstant,
    GetLastN,
    GetLast,
    GetData,
    GetLastIstant,
    DeleteAll,
    SetData,
    SetDataTest,
    GetDataTest
}