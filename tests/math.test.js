
const {gcd, binPow} = require('../src/math');


test('GCD function', () => {
    const ans = gcd(48, 38)
    if (ans != 2) {
        throw new Error(`Calculated gcd(48, 38), got ${ans}. Expected 2`);
    }
})

test('Power Function', () => {
    const ans = binPow(2, 10);
    expect(ans).toBe(1024);
})