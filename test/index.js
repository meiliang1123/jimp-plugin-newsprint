// npx babel-node test
import Jimp from 'jimp';
import configure from '@jimp/custom';

import newsprint from "../";
configure({ plugins: [newsprint] }, Jimp);

async function test() {

    const img = await Jimp.read('./test/in.jpg');
    console.log('start');
    img.newsprint('line', 25).writeAsync('./test/out.jpg');
    // img.posterize(1).writeAsync('./test/out.jpg')

    console.log('done');
}

test();

