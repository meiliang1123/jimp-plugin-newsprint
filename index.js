function spot_line(x, y){
    return Math.abs(y);
}
function spot_round (x, y)
{
    return 1 - (x * x + y * y);
}
function spot_diamond (x, y)
{
    let xy = Math.abs (x) + Math.abs (y);
    /* spot only valid for 0 <= xy <= 2 */
    return ((xy <= 1) ?
        2 * xy * xy :
        2 * xy * xy - 4 * (xy - 1) * (xy - 1)) / 4;
}

const spotfn_list = {
    "line":{
        name:'',
        fn:spot_line,
        balanced:1
    },
    "round":{
        name:'',
        fn:spot_round,
        balanced:1
    },
    "diamond":{
        name:'',
        fn:spot_diamond,
        balanced:1
    }
};

function spot2thresh ( type, width) {

    let wid2 = width * width;
    // let balanced = spotfn_list[type].balanced;

    let thresh = [];
    let spotfn = spotfn_list[type].fn;

    let order = [];

    let i = 0;
    for (let y = 0; y < width; y++)
    {
        for (let x = 0; x < width; x++)
        {
            order[i] = {};
            /* scale x & y to -1 ... +1 inclusive */
            let sx = ((x) / (width - 1) - 0.5) * 2;
            let sy = ((y) / (width - 1) - 0.5) * 2;
            let val = spotfn(sx, sy);
            val = clamp(val, -1, 1); /* interval is inclusive */

            order[i].index = i;
            order[i].value = val;
            i++;
        }
    }


    // if (!balanced)
    // {
    //     /* now sort array of (point, value) pairs in ascending order */
    //     qsort (order, wid2, sizeof (order_t), order_cmp);
    // }

    /* compile threshold matrix in order from darkest to lightest */
    for (i = 0; i < wid2; i++)
    {
        // if (balanced)
        thresh[order[i].index] = order[i].value * 0xfe;
        // else
        //     thresh[order[i].index] = i * 0xff / wid2;
    }

    return thresh;
}

function clamp(val, x, y) {
    return Math.min(Math.max(val, x), y);
}

/**
 * Applies a newsprint effect to the image without oversample
 * @param cellType cell type of the effect
 * @param cellWidth cell width of the effect
 * @param angle angle of the effect
 * @returns {Jimp} this for chaining of methods
 */
export default () => ({
    newsprint(cellType = 'line', cellWidth = 50, angle = -45) {
        let rot = angle * Math.PI / 180;
        const x1 = 0;
        const y1 = 0;
        const x2 = this.bitmap.width;
        const y2 = this.bitmap.height;

        const thresh = spot2thresh(cellType, cellWidth, angle);

        for (let y = y1; y < y2; y += cellWidth - (y % cellWidth))
        {
            for (let x = x1; x < x2; x += cellWidth - (x % cellWidth))
            {

                for (let row = 0; row < cellWidth; row++)
                {

                    for (let col = 0; col < cellWidth; col++)
                    {
                        let p1 = {
                            x: x + col,
                            y:y + row
                        };
                        let r = Math.sqrt (p1.x ** 2 + p1.y ** 2);
                        let theta = Math.atan2 ( (p1.y), (p1.x));

                        let p2 = {
                            x:Math.round (r * Math.cos (theta + rot)),
                            y:Math.round (r * Math.sin (theta + rot))
                        };

                        p2.x %= cellWidth;
                        p2.y %= cellWidth;
                        if(p2.x < 0) p2.x += cellWidth;
                        if(p2.y < 0) p2.y += cellWidth;

                        let idxThresh = (p2.y * cellWidth + p2.x);

                        let idx = (p1.x + p1.y * this.bitmap.width) << 2;

                        let val = idxThresh < thresh.length ? thresh[idxThresh] : 0;

                        this.bitmap.data[idx] = this.bitmap.data[idx] > val ? 255 : 0;
                        this.bitmap.data[idx + 1] = this.bitmap.data[idx];
                        this.bitmap.data[idx + 2] = this.bitmap.data[idx];

                    }
                }
            }
        }
        return this;
    }
});
