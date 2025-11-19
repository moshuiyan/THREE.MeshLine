			import * as THREE from 'three';
			import { MeshLine, MeshLineGeometry, MeshLineMaterial } from '../src/THREE.MeshLine.js';
			import { OrbitControls } from './js/OrbitControls.js';
			import {Bird } from './js/Bird.js';
			var scene = new THREE.Scene();

			var SCREEN_WIDTH = window.innerWidth,
					SCREEN_HEIGHT = window.innerHeight,
					SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
					SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;

			var camera, controls, renderer
					;

			const birds = [],
				boids = [];

			var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

			// Based on http://www.openprocessing.org/visuals/?visualID=6910

			class Boid {
    constructor() {
        
        const self = this;

        var vector = new THREE.Vector3(), _acceleration, _width = 500, _height = 500, _depth = 200, _goal, _neighborhoodRadius = 100, _maxSpeed = 4, _maxSteerForce = 0.1, _avoidWalls = false;

        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        _acceleration = new THREE.Vector3();
        this.trail_initialized = false;

        // delay so trails grow organically
        setTimeout(function () {
            self.initTrail();
        }, 250);

        this.initTrail = function () {
            // Create the line geometry used for storing verticies
            const trailPoints = [];
            for (var i = 0; i < 100; i++) {
                // must initialize it to the number of positions it will keep or it will throw an error
                trailPoints.push(...this.position);
            }

            // Create the line mesh
            this.trail_line = new MeshLineGeometry();
            this.trail_line.setPoints(trailPoints, function (p) { return p; }); // makes width taper


            // Create the line material
            this.trail_material = new MeshLineMaterial({
                color: new THREE.Color("rgb(255, 2, 2)"),
                opacity: 1,
                resolution: resolution,
                sizeAttenuation: 1,
                lineWidth: 1,
                depthTest: false,
                blending: THREE.AdditiveBlending,
                transparent: false,
                side: THREE.DoubleSide
            });

            this.trail_mesh = new MeshLine(this.trail_line, this.trail_material); // this syntax could definitely be improved!
            this.trail_mesh.frustumCulled = false;

            scene.add(this.trail_mesh);

            this.trail_initialized = true;
        };

        this.setGoal = function (target) {

            _goal = target;

        };

        this.setAvoidWalls = function (value) {

            _avoidWalls = value;

        };

        this.setWorldSize = function (width, height, depth) {

            _width = width;
            _height = height;
            _depth = depth;

        };

        this.run = function (boids) {

            if (_avoidWalls) {

                vector.set(-_width, this.position.y, this.position.z);
                vector = this.avoid(vector);
                vector.multiplyScalar(5);
                _acceleration.add(vector);

                vector.set(_width, this.position.y, this.position.z);
                vector = this.avoid(vector);
                vector.multiplyScalar(5);
                _acceleration.add(vector);

                vector.set(this.position.x, -_height, this.position.z);
                vector = this.avoid(vector);
                vector.multiplyScalar(5);
                _acceleration.add(vector);

                vector.set(this.position.x, _height, this.position.z);
                vector = this.avoid(vector);
                vector.multiplyScalar(5);
                _acceleration.add(vector);

                vector.set(this.position.x, this.position.y, -_depth);
                vector = this.avoid(vector);
                vector.multiplyScalar(5);
                _acceleration.add(vector);

                vector.set(this.position.x, this.position.y, _depth);
                vector = this.avoid(vector);
                vector.multiplyScalar(5);
                _acceleration.add(vector);

            } /* else {

                this.checkBounds();

            }
            */






            if (Math.random() > 0.5) {

                this.flock(boids);

            }

            this.move();

        };

        this.flock = function (boids) {

            if (_goal) {

                _acceleration.add(this.reach(_goal, 0.005));

            }

            _acceleration.add(this.alignment(boids));
            _acceleration.add(this.cohesion(boids));
            _acceleration.add(this.separation(boids));

        };

        this.move = function () {

            this.velocity.add(_acceleration);

            var l = this.velocity.length();

            if (l > _maxSpeed) {

                this.velocity.divideScalar(l / _maxSpeed);

            }

            this.position.add(this.velocity);
            _acceleration.set(0, 0, 0);

            // Advance the trail by one position
            if (this.trail_initialized) this.trail_line.advance(this.position);
        };

        this.checkBounds = function () {

            if (this.position.x > _width) this.position.x = -_width;
            if (this.position.x < -_width) this.position.x = _width;
            if (this.position.y > _height) this.position.y = -_height;
            if (this.position.y < -_height) this.position.y = _height;
            if (this.position.z > _depth) this.position.z = -_depth;
            if (this.position.z < -_depth) this.position.z = _depth;

        };

        //
        this.avoid = function (target) {

            var steer = new THREE.Vector3();

            steer.copy(this.position);
            steer.sub(target);

            steer.multiplyScalar(1 / this.position.distanceToSquared(target));

            return steer;

        };

        this.repulse = function (target) {

            var distance = this.position.distanceTo(target);

            if (distance < 150) {

                var steer = new THREE.Vector3();

                steer.subVectors(this.position, target);
                steer.multiplyScalar(0.5 / distance);

                _acceleration.add(steer);

            }

        };

        this.reach = function (target, amount) {

            var steer = new THREE.Vector3();

            steer.subVectors(target, this.position);
            steer.multiplyScalar(amount);

            return steer;

        };

        this.alignment = function (boids) {

            var boid, velSum = new THREE.Vector3(), count = 0,distance;

            for (var i = 0, il = boids.length; i < il; i++) {

                if (Math.random() > 0.6) continue;

                boid = boids[i];

                distance = boid.position.distanceTo(this.position);

                if (distance > 0 && distance <= _neighborhoodRadius) {

                    velSum.add(boid.velocity);
                    count++;

                }

            }

            if (count > 0) {

                velSum.divideScalar(count);

                var l = velSum.length();

                if (l > _maxSteerForce) {

                    velSum.divideScalar(l / _maxSteerForce);

                }

            }

            return velSum;

        };

        this.cohesion = function (boids) {

            var boid, distance, posSum = new THREE.Vector3(), steer = new THREE.Vector3(), count = 0;

            for (var i = 0, il = boids.length; i < il; i++) {

                if (Math.random() > 0.6) continue;

                boid = boids[i];
                distance = boid.position.distanceTo(this.position);

                if (distance > 0 && distance <= _neighborhoodRadius) {

                    posSum.add(boid.position);
                    count++;

                }

            }

            if (count > 0) {

                posSum.divideScalar(count);

            }

            steer.subVectors(posSum, this.position);

            var l = steer.length();

            if (l > _maxSteerForce) {

                steer.divideScalar(l / _maxSteerForce);

            }

            return steer;

        };

        this.separation = function (boids) {

            var boid, distance, posSum = new THREE.Vector3(), repulse = new THREE.Vector3();

            for (var i = 0, il = boids.length; i < il; i++) {

                if (Math.random() > 0.6) continue;

                boid = boids[i];
                distance = boid.position.distanceTo(this.position);

                if (distance > 0 && distance <= _neighborhoodRadius) {

                    repulse.subVectors(this.position, boid.position);
                    repulse.normalize();
                    repulse.divideScalar(distance);
                    posSum.add(repulse);

                }

            }

            return posSum;

        };

    }
}


			init();
			animate();

			function init() {

				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .1, 1000 );
				camera.position.set( 0, 0, -500 );

				var container = document.getElementById( 'container' );

				renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true });
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setPixelRatio( window.devicePixelRatio );
				container.appendChild( renderer.domElement );

				
                let boid,bird;
				for ( var i = 0; i < 100; i ++ ) {

					boid = boids[ i ] = new Boid();
					boid.position.x = Math.random() * 400 - 200;
					boid.position.y = Math.random() * 400 - 200;
					boid.position.z = Math.random() * 400 - 200;
					boid.velocity.x = Math.random() * 2 - 1;
					boid.velocity.y = Math.random() * 2 - 1;
					boid.velocity.z = Math.random() * 2 - 1;
					boid.setAvoidWalls( true );
					boid.setWorldSize( 300, 300, 300 );

					bird = birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color:Math.random() * 0xffffff, side: THREE.DoubleSide } ) );
					bird.phase = Math.floor( Math.random() * 62.83 );
					scene.add( bird );
				}

				controls = new OrbitControls( camera,  renderer.domElement  );
				controls.enableDamping = true;
				controls.dampingFactor = 0.25;
				controls.enableZoom = false;

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );

				window.addEventListener( 'resize', onWindowResize, false );
				onWindowResize();

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				resolution.set( window.innerWidth, window.innerHeight );
				boids.forEach( function ( boid ) {
					if( boid.trail_initialized ) boid.trail_material.uniforms.resolution.value.copy( resolution );
				} );

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onDocumentMouseMove( event ) {

				var vector = new THREE.Vector3( event.clientX - SCREEN_WIDTH_HALF, - event.clientY + SCREEN_HEIGHT_HALF, 0 );
                let boid;    
				for ( var i = 0, il = boids.length; i < il; i++ ) {

					boid = boids[ i ];

					vector.z = boid.position.z;

					boid.repulse( vector );

				}

			}

			//

			function animate() {

				requestAnimationFrame( animate );

				controls.update();
                let boid,bird,color,y;
				for ( var i = 0, il = birds.length; i < il; i++ ) {

					boid = boids[ i ];
					boid.run( boids );

					bird = birds[ i ];
					bird.position.copy( boids[ i ].position );

					color = bird.material.color;
//					color.r = color.g = color.b = ( 500 - bird.position.z ) / 1000;

					if (boid.trail_initialized)
						boid.trail_material.uniforms.color.value = color;

					bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
					bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

					bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
                    y =Math.sin( bird.phase ) * 5
                    bird.geometry.attributes.position.array[4*3 +1] = y;
                    bird.geometry.attributes.position.array[3*3 +1] = y;
                    bird.geometry.attributes.position.needsUpdate = true;
					// bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;
				}

				render();
			}

			function render() {
				renderer.render( scene, camera );
			}

		