


const gcd = (x, y) => {
    let c = 0
    let a =x, b= y
    while (b > 0) {
        c = b;
        b = a % b;
        a = c;
    }

    return a;
}

const binPow = (a, b) => {
    let ans = 1;
    while (b > 0) {
        if (b & 1) ans *= a;
        b >>= 1;
        a *= a;
    }

    return ans;
}


module.exports = {
    gcd,
    binPow
}