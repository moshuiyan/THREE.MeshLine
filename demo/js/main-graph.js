import * as THREE from 'three';
import {OrbitControls} from './OrbitControls.js';
import { OBJLoader } from './OBJLoader.js';
import { MeshLine,MeshLineMaterial } from '../../src/THREE.MeshLine.js';


let autoRotate = true;

var container = document.getElementById( 'container' );

var scene = new THREE.Scene();
let  cameraP = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .1, 1000 );
let camera   =  new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 );
camera.position.set( 25, 5, 0 );
var frustumSize = 100;

var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
container.appendChild( renderer.domElement );

var controls = new OrbitControls( camera, renderer.domElement );
var clock = new THREE.Clock();

var colors = [
	0xed6a5a,
	0xf4f1bb,
	0x9bc1bc,
	0x5ca4a9,
	0xe6ebe0,
	0xf0b67f,
	0xfe5f55,
	0xd6d1b1,
	0xc7efcf,
	0xeef5db,
	0x50514f,
	0xf25f5c,
	0xffe066,
	0x247ba0,
	0x70c1b3
];

var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
var graph = new THREE.Object3D();
scene.add( graph );

init()
render();
console.log(scene,camera)

function makeLine( geo, c ) {

	var g = new MeshLine();
	if(geo.type == "BufferGeometry"){
		g.setGeometry( geo );
	}else  {
		g.setPoints( geo );
	}


	var material = new MeshLineMaterial( {
		useMap: false,
		color: new THREE.Color( colors[ c ] ),
		opacity: 1,
		resolution: resolution,
		sizeAttenuation: false,
		lineWidth: 10,
	});
	var mesh = new THREE.Mesh( g.geometry, material );
	graph.add( mesh );

}

function init() {

	createLines();

}

function createLines() {

	var line = new Float32Array( 600 );
	for( var j = 0; j < 200 * 3; j += 3 ) {
		line[ j ] = -30 + .1 * j;
		line[ j + 1 ] = 5 * Math.sin( .01 *  j );
		line[ j + 2 ] = -20;
	}
	makeLine( line, 0 );

	var line = new Float32Array( 600 );
	for( var j = 0; j < 200 * 3; j += 3 ) {
		line[ j ] = -30 + .1 * j;
		line[ j + 1 ] = 5 * Math.cos( .02 *  j );
		line[ j + 2 ] = -10;
	}
	makeLine( line, 1 );

	var line = new Float32Array( 600 );
	for( var j = 0; j < 200 * 3; j += 3 ) {
		line[ j ] = -30 + .1 * j;
		line[ j + 1 ] = 5 * Math.sin( .01 *  j ) * Math.cos( .005 * j );
		line[ j + 2 ] = 0;
	}
	makeLine( line, 2 );

	var line = new Float32Array( 600 );
	for( var j = 0; j < 200 * 3; j += 3 ) {
		line[ j ] = -30 + .1 * j;
		line[ j + 1 ] = .02 * j + 5 * Math.sin( .01 *  j ) * Math.cos( .005 * j );
		line[ j + 2 ] = 10;
	}
	makeLine( line, 3 );

	var line = new Float32Array( 600 );
	for( var j = 0; j < 200 * 3; j += 3 ) {
		line[ j ] = -30 + .1 * j;
		line[ j + 1 ] = Math.exp( .005 * j );
		line[ j + 2 ] = 20;
	}
	makeLine( line, 4 );

	// xyz axes
	var line = new THREE.BufferGeometry(),vertices = [];
	vertices.push(  -30, -30, -30  );
	vertices.push(  30, -30, -30  );
	line.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	makeLine( line, 5 );

	 line = new THREE.BufferGeometry(),vertices = [];
	vertices.push(  -30, -30, -30  );
	vertices.push(  -30, 30, -30  );
	line.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	makeLine( line, 6 );

	 line = new THREE.BufferGeometry(),vertices = [];
	vertices.push(  -30, -30, -30  );
	vertices.push(  -30, -30, 30  );
	line.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	makeLine( line, 7 );

}

onWindowResize();

function onWindowResize() {

	var w = container.clientWidth;
	var h = container.clientHeight;

	var aspect = w / h;

	camera.left   = - frustumSize * aspect / 2;
	camera.right  =   frustumSize * aspect / 2;
	camera.top    =   frustumSize / 2;
	camera.bottom = - frustumSize / 2;

	camera.updateProjectionMatrix();

	renderer.setSize( w, h );

	resolution.set( w, h );

}


window.addEventListener( 'resize', onWindowResize );
window.addEventListener('keydown', (e)=>{
	if( e.key == " "){
		autoRotate = !autoRotate;
	}
})

function render() {

	requestAnimationFrame( render );
	controls.update();
	autoRotate && (graph.rotation.y += .25 * clock.getDelta());

	renderer.render( scene, camera );

}
