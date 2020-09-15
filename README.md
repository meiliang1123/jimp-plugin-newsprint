jimp-plugin-newsprint
===============

install
```js
npm i jimp-plugin-newsprint
```

usage

```js
import Jimp from 'jimp';
import configure from '@jimp/custom';
import newsprint from "jimp-plugin-newsprint";
configure({ plugins: [newsprint] }, Jimp);

Jimp.read('some picture').newsprint()
```

params

```js
newsprint(cellType, cellWidth, angle)

// cellType string "line"(default) | "round" | "diamond"
// cellWidth number 50(default)
// angle number rotation angle in degree  -45(default)
```

