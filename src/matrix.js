/*!
 * Transformation Matrix JS v1.5 (c) Epistemex 2014
 * www.epistemex.com
 * License: MIT, this header required.
 */

/**
 * 2D transformation matrix object initialized with identity matrix.
 *
 * All values are handled as floating point values.
 *
 * @prop {number} a - scale x
 * @prop {number} b - skew y
 * @prop {number} c - skew x
 * @prop {number} d - scale y
 * @prop {number} e - translate x
 * @prop {number} f - translate y
 * @constructor
 */

class Matrix {
    constructor(matrix) {
        this.a = matrix ? matrix.a : 1;
        this.b = matrix ? matrix.b : 0;
        this.c = matrix ? matrix.c : 0;
        this.d = matrix ? matrix.d : 1;
        this.tx = matrix ? matrix.tx : 0;
        this.ty = matrix ? matrix.ty : 0;
    }

    toArray() {
        return [this.a, this.b, this.c, this.d, this.tx, this.ty];
    }

    /**
     * Flips the horizontal values.
     */
    flipX() {
        this.transform(-1, 0, 0, 1, 0, 0);
        return this;
    }

    /**
     * Flips the vertical values.
     */
    flipY() {
        this.transform(1, 0, 0, -1, 0, 0);
        return this;
    }

    /**
     * Short-hand to reset current matrix to an identity matrix.
     */
    reset() {
        this.a = this.d = 1;
        this.b = this.c = this.tx = this.ty = 0;
        return this;
    }

    /**
     * Rotates current matrix accumulative by angle.
     * @param {number} angle - angle in radians
     */
    rotate(angle) {
        let cos = Math.cos(angle),
            sin = Math.sin(angle);
        this.transform(cos, sin, -sin, cos, 0, 0);
        return this;
    }

    /**
     * Helper method to make a rotation based on an angle in degrees.
     * @param {number} angle - angle in degrees
     */
    rotateDeg(angle) {
        this.rotate(angle * 0.017453292519943295);
        return this;
    }

    /**
     * Scales current matrix accumulative.
     * @param {number} sx - scale factor x (1 does nothing)
     * @param {number} sy - scale factor y (1 does nothing)
     */
    scale(sx, sy) {
        this.transform(sx, 0, 0, sy, 0, 0);
        return this;
    }

    /**
     * Scales current matrix on x axis accumulative.
     * @param {number} sx - scale factor x (1 does nothing)
     */
    scaleX(sx) {
        this.transform(sx, 0, 0, 1, 0, 0);
        return this;
    }

    /**
     * Scales current matrix on y axis accumulative.
     * @param {number} sy - scale factor y (1 does nothing)
     */
    scaleY(sy) {
        this.transform(1, 0, 0, sy, 0, 0);
        return this;
    }

    /**
     * Apply skew to the current matrix accumulative.
     * @param {number} sx - amount of skew for x
     * @param {number} sy - amount of skew for y
     */
    skew(sx, sy) {
        this.transform(1, sy, sx, 1, 0, 0);
        return this;
    }

    /**
     * Apply skew for x to the current matrix accumulative.
     * @param {number} sx - amount of skew for x
     */
    skewX(sx) {
        this.transform(1, 0, sx, 1, 0, 0);
        return this;
    }

    /**
     * Apply skew for y to the current matrix accumulative.
     * @param {number} sy - amount of skew for y
     */
    skewY(sy) {
        this.transform(1, sy, 0, 1, 0, 0);
        return this;
    }

    /**
     * Set current matrix to new absolute matrix.
     * @param {number} a - scale x
     * @param {number} b - skew y
     * @param {number} c - skew x
     * @param {number} d - scale y
     * @param {number} e - translate x
     * @param {number} f - translate y
     */
    setTransform(a, b, c, d, tx, ty) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
        return this;
    }

    /**
     * Translate current matrix accumulative.
     * @param {number} tx - translation for x
     * @param {number} ty - translation for y
     */
    translate(tx, ty) {
        this.transform(1, 0, 0, 1, tx, ty);
        return this;
    }

    /**
     * Translate current matrix on x axis accumulative.
     * @param {number} tx - translation for x
     */
    translateX(tx) {
        this.transform(1, 0, 0, 1, tx, 0);
        return this;
    }

    /**
     * Translate current matrix on y axis accumulative.
     * @param {number} ty - translation for y
     */
    translateY(ty) {
        this.transform(1, 0, 0, 1, 0, ty);
        return this;
    }

    /**
     * Multiplies current matrix with new matrix values.
     * @param {number} a2 - scale x
     * @param {number} b2 - skew y
     * @param {number} c2 - skew x
     * @param {number} d2 - scale y
     * @param {number} tx2 - translate x
     * @param {number} ty2 - translate y
     */
    transform(a2, b2, c2, d2, tx2, ty2) {
        let [a1, b1, c1, d1, tx1, ty1] = [this.a, this.b, this.c, this.d, this.tx, this.ty];

        /* matrix order (canvas compatible):
         * ace
         * bdf
         * 001
         */
        this.a = a1 * a2 + c1 * b2;
        this.b = b1 * a2 + d1 * b2;
        this.c = a1 * c2 + c1 * d2;
        this.d = b1 * c2 + d1 * d2;
        this.tx = a1 * tx2 + c1 * ty2 + tx1;
        this.ty = b1 * tx2 + d1 * ty2 + ty1;

        return this;
    }

    /**
     * Get an inverse matrix of current matrix. The method returns a new
     * matrix with values you need to use to get to an identity matrix.
     * Context from parent matrix is not applied to the returned matrix.
     * @returns {Matrix}
     */
    getInverse() {
        let [a, b, c, d, tx, ty] = [this.a, this.b, this.c, this.d, this.tx, this.ty];
        let m = new Matrix();
        let dt = a * d - b * c;

        m.a = d / dt;
        m.b = -b / dt;
        m.c = -c / dt;
        m.d = a / dt;
        m.tx = (c * ty - d * tx) / dt;
        m.ty = -(a * ty - b * tx) / dt;

        return m;
    }

    /**
     * Interpolate this matrix with another and produce a new matrix.
     * t is a value in the range [0.0, 1.0] where 0 is this instance and
     * 1 is equal to the second matrix. The t value is not constrained.
     *
     * Context from parent matrix is not applied to the returned matrix.
     *
     * @param {Matrix} m2 - the matrix to interpolate with.
     * @param {number} t - interpolation [0.0, 1.0]
     * @returns {Matrix} - new instance with the interpolated result
     */
    interpolate(m2, t) {
        let m = new Matrix();

        m.a = this.a + (m2.a - this.a) * t;
        m.b = this.b + (m2.b - this.b) * t;
        m.c = this.c + (m2.c - this.c) * t;
        m.d = this.d + (m2.d - this.d) * t;
        m.tx = this.tx + (m2.tx - this.tx) * t;
        m.ty = this.ty + (m2.ty - this.ty) * t;

        return m;
    }

    /**
     * Apply current matrix to x and y point.
     * Returns a point object.
     *
     * @param {number} x - value for x
     * @param {number} y - value for y
     * @returns {{x: number, y: number}} A new transformed point object
     */
    apply(x, y) {
        return [x * this.a + y * this.c + this.tx, x * this.b + y * this.d + this.ty];
    }

    /**
     * Apply current matrix to array with point objects or point pairs.
     * Returns a new array with points in the same format as the input array.
     *
     * A point object is an object literal:
     *
     * {x: x, y: y}
     *
     * so an array would contain either:
     *
     * [{x: x1, y: y1}, {x: x2, y: y2}, ... {x: xn, y: yn}]
     *
     * or
     * [x1, y1, x2, y2, ... xn, yn]
     *
     * @param {Array} points - array with point objects or pairs
     * @returns {Array} A new array with transformed points
     */
    applyToArray(points) {
        let i = 0,
            p,
            l,
            mxPoints = [];

        if (typeof points[0] === "number") {
            l = points.length;

            while (i < l) {
                mxPoints.push(...this.apply(points[i++], points[i++]));
            }
        } else {
            for (; (p = points[i]); i++) {
                mxPoints.push(...this.apply(p.x, p.y));
            }
        }

        return mxPoints;
    }

    /**
     * Apply current matrix to a typed array with point pairs. Although
     * the input array may be an ordinary array, this method is intended
     * for more performant use where typed arrays are used. The returned
     * array is regardless always returned as a Float32Array.
     *
     * @param {*} points - (typed) array with point pairs
     * @returns {Float32Array} A new array with transformed points
     */
    applyToTypedArray(points) {
        let i = 0,
            p,
            l = points.length,
            mxPoints = new Float32Array(l);

        while (i < l) {
            p = this.apply(points[i], points[i + 1]);
            mxPoints[i++] = p[0];
            mxPoints[i++] = p[1];
        }

        return mxPoints;
    }

    /**
     * Returns true if matrix is an identity matrix (no transforms applied).
     * @returns {boolean} True if identity (not transformed)
     */
    isIdentity() {
        return (
            this._isEqual(this.a, 1) &&
            this._isEqual(this.b, 0) &&
            this._isEqual(this.c, 0) &&
            this._isEqual(this.d, 1) &&
            this._isEqual(this.tx, 0) &&
            this._isEqual(this.ty, 0)
        );
    }

    /**
     * Compares current matrix with another matrix. Returns true if equal
     * (within epsilon tolerance).
     * @param {Matrix} m - matrix to compare this matrix with
     * @returns {boolean}
     */
    isEqual(m) {
        return (
            this._isEqual(this.a, m.a) &&
            this._isEqual(this.b, m.b) &&
            this._isEqual(this.c, m.c) &&
            this._isEqual(this.d, m.d) &&
            this._isEqual(this.tx, m.tx) &&
            this._isEqual(this.ty, m.ty)
        );
    }

    /**
     * Compares floating point values with some tolerance (epsilon)
     * @param {number} ty1 - float 1
     * @param {number} ty2 - float 2
     * @returns {boolean}
     * @private
     */
    _isEqual(ty1, ty2) {
        return Math.abs(ty1 - ty2) < 1e-14;
    }
}

export {Matrix};
