import csv from 'csvtojson';
import fs from 'fs';

const rs = fs.createReadStream('./module1/csv/Book1.csv');
const ws = fs.createWriteStream('./module1/results/task2.txt');

const handleError = e => console.error(e);

const handleComplete = () => console.log("Complete");

csv()
    .fromStream(rs)
    .subscribe(json => {
        return new Promise((resolve, reject) => {
            try {
                const formatted = Object.keys(json).reduce((result, item) => {
                    const key = item.toLowerCase();
                    if (key !== "amount") {
                        return {
                            ...result,
                            [key]: json[item],
                        };
                    }
                    return result;
                }, {});

                ws.write(`${JSON.stringify(formatted)}\n`);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    })
    .then(() => handleComplete())
    .catch(e => handleError(e))