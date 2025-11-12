import { BufferGeometry, Float32BufferAttribute } from "three";

		function v(x, y, z,vertices) {

			vertices.push(x, y, z);

		}

		function f3(a, b, c,indexes) {

			indexes.push(a, b, c);

		}
export class Bird  extends BufferGeometry {
	constructor() {
		super()
		const scope = this;
		const vertices = [];
		const indexes = [];
		v(5, 0, 0, vertices);
		v(-5, -2, 1, vertices);
		v(-5, 0, 0, vertices);
		v(-5, -2, -1, vertices);

		v(0, 2, -6, vertices);
		v(0, 2, 6, vertices);
		v(2, 0, 0, vertices);
		v(-3, 0, 0, vertices);

		f3(0, 2, 1,indexes);
		// f3( 0, 3, 2 ,indexes);
		f3(4, 7, 6,indexes);
		f3(5, 6, 7,indexes);
		this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
		this.setIndex(indexes);

		this.computeVertexNormals();


	}
}

