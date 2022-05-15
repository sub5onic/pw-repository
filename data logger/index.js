
var ejs = require('ejs');
var provider = require('./provider');
var bodyParser = require('body-parser');
const axios = require('axios');

let host = "localhost";
let port = "3000";
var url;// = `http://${host}:${port}/status`;
let commands = ["panels", "batteries", "loads"];

var plants = [];
var selectedStationId;// = 0;

// Want to use async/await? Add the `async` keyword to your outer function/method.
async function getData(type) {
    try {
        const promise = await axios.get(`${url}/${type}`);
        return { time: promise.headers.date, data: promise.data };
    } catch (error) {
        console.error(`${error}`);
        return null;
    }
}

// function cicleGets() {
//     for (let i = 0; i < 3; i++) {
//         // getData(commands[i]);
//         getData(commands[i]).then(data => console.log(data));
//     }
// }
// function cicleSetsTest() {
//     for (let i = 0; i < 3; i++) {
//         // getData(commands[i]);
//         // getData(commands[i]).then(data => console.log(data));    }
//         getData(commands[i]).then(data => provider.SetDataTest(data));
//     }
// }

async function datalogPanels() {
    let item = 'panels';
    result = await getData(item);
    // console.log(result.data.reduce((acc, cur) => { acc.push(cur.voltage); return acc; }, []));
    provider.SetData(result.time, plants[selectedStationId].id, `'${item}'`, 'voltage', result.data.reduce((acc, cur) => { acc.push(cur.voltage); return acc; }, []));
}

async function datalogBatteries() {
    let item = 'batteries';
    result = await getData(item);
    // console.log(result.data.reduce((acc, cur) => { acc.push(cur.voltage); return acc; }, []));
    provider.SetData(result.time, plants[selectedStationId].id, `'${item}'`, 'voltage', result.data.reduce((acc, cur) => { acc.push(cur.voltage); return acc; }, []));
    provider.SetData(result.time, plants[selectedStationId].id, `'${item}'`, 'temperature', result.data.reduce((acc, cur) => { acc.push(cur.temperature); return acc; }, []));
}

async function datalogLoad() {
    let item = 'loads';
    result = await getData(item);
    // console.log(item, result.data.outputLoad);
    provider.SetData(result.time, plants[selectedStationId].id, `'${item}'`, 'outputLoad', [result.data.outputLoad]);
}

async function datalog() {
    await datalogPanels();
    await datalogBatteries();
    await datalogLoad();
}

async function cicleStations() {
    // console.log(plants);
    const num = plants.length;
    console.log(`Cicling throught ${num} stations.`)
    for (let i = 0; i < num; i++) {
        selectedStationId = i;//++selectedStationId % plants.lenght;
        host = plants[i].ip;
        url = `http://${host}:${port}/status`;
        try {
            console.log(`Gatering data from plant ${plants[selectedStationId].id} '${plants[i].name}' ${url}.`)
            await datalog();
        } catch (error) {
            // console.error(error);
            console.log(`ERROR plant  ${plants[selectedStationId].id} '${plants[i].name}' ${url}.`)
        }
    }
}

// datalog();
async function setup() {
    plants = await provider.GetPlants();
    console.log(plants);
}

setup();
provider.DeleteAll();
setInterval(cicleStations, 5000);

async function prova() {
    // let last = await provider.GetLastIstant();
    // console.log(last);
    // let lasts = await provider.GetLast();
    // let lasts = await provider.GetLastN(5);
    // let lasts = await provider.GetData('2022-05-14T08:06:02.000Z', new Date());
    // console.log(lasts);
    let data = await provider.GetLastN(2);
    console.log(data);
}

// prova();

// provider.GetLastNthIstant(5);

// cicleSetsTest();
// getData('loads').then(data => provider.SetDataTest(data));
// let date = new Date(Date.now());
// console.log(date);

// cicleGets();
// cicleSets();

//setInterval(cicleSets, 1000) 


//  pans.forEach(p => {
//     console.log (p);
//  }); 


// nextval('datatest_id_seq'::regclass)


// let arr = [1, 2, 3, 4, 5, 6];
// let arr2 = arr.reduce((accumulator, current, index) => {
//     if (index % 2 === 0) {
//         accumulator.push(current);
//     };
//     return accumulator;
// }, []);

// console.log(arr, arr2);

// let batt = { batteries: [{ a: 10, b: 20 }, { a: null, b: 21 }, { a: 12, b: 22 }, { a: 13, b: 23 }] };
// let aa = batt.batteries.reduce((acc, cur) => { acc.push(cur.a); return acc; }, []);
// let bb = batt.batteries.reduce(
//     (acc, cur) => {
//         acc.push(cur.b);
//         return acc;
//     },
//     []
// );

// console.log(batt, aa, bb);