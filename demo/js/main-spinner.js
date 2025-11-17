import * as THREE from 'three';
import {OrbitControls} from './OrbitControls.js';
import { MeshLineGeometry,MeshLine,MeshLineMaterial } from '../../src/THREE.MeshLine.js';
const gui = new dat.GUI();
const config = {
	edit:true,
	offsetX:0,
	offsetY:0,
	repeatX:1,
	repeatY:1,
	dpr:window.devicePixelRatio,
	pick:false,
	lineWidth:5,
}
let  mode = 'edit';// view 
gui.add(config,'dpr')
/**
 * 改为 按空格切换编辑模式和观察模式
 * 他好像是打算，绘制完毕之后，就保存，id+1
 */
var container = document.getElementById( 'container' );

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, .1, 1000 );
camera.position.z = -50;
camera.lookAt( scene.position );

var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
container.appendChild( renderer.domElement );
const controls = new OrbitControls( camera, renderer.domElement );
controls.enabled = false;
controls.enablePan =false;
const modeController= gui.add(config,'edit').onChange((value)=>{
    mode = value ? 'edit' : 'view';
	controls.enabled = !value;
})
var directions = document.getElementById( 'directions' );

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
const pickPoint = new THREE.Points( new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3(0,0,0) ] ), new THREE.PointsMaterial( { size: 5,sizeAttenuation:false, color: 0xff9900 } ) );
var loader = new THREE.TextureLoader();
const  strokeTexture =loader.load( 'assets/stroke.png', function( texture ) {
	
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	console.log(texture)
	init(); } );
var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
var geo = [];

var raycaster = new THREE.Raycaster();
var mouse = {};
var nMouse = {
	0: new THREE.Vector2(),
};
const mp = new THREE.Vector2();
var tmpVector = new THREE.Vector2();
var angle = 0;
var meshes = {}, plane;
const lines = []

var center = new THREE.Vector2( .5, .5 );
const material = new MeshLineMaterial( {
		useMap: true,
		map: strokeTexture,
		color: new THREE.Color( new THREE.Color( colors[ ~~Maf.randomInRange( 0, colors.length ) ] ) ),
		opacity: 1,
		resolution: resolution,
		sizeAttenuation: true,
		lineWidth: 5,
		depthTest: false,
		blending: THREE.NormalBlending,
		transparent: true,
		repeat: new THREE.Vector2( 1,2 )
	});

	scene.add( pickPoint );

function prepareMesh() {

	var geo = new Float32Array( 200 * 3 );
	for( var j = 0; j < geo.length; j += 3 ) {
		geo[ j ] = geo[ j + 1 ] = geo[ j + 2 ] = 0;
	}

	var g = new MeshLineGeometry();
	g.setPoints( geo, function( p ) { return p; } );
	material.color = new THREE.Color( new THREE.Color( colors[ ~~Maf.randomInRange( 0, colors.length ) ] ) );


	var mesh = new MeshLine( g, material );

	lines.push(mesh)
	scene.add( mesh );

	return mesh;

}

/**
 * 初始化函数，设置GUI界面、平面几何体和事件监听器
 */
function init() {

    // 添加GUI控制器，用于调整纹理的X轴偏移量，范围从-100到100，当值改变时更新strokeTexture的offset.x
	gui.add( config, 'offsetX', -100, 100 ).onChange((v)=>{
    	strokeTexture.offset.x = v;
	});
    // 添加GUI控制器，用于调整纹理的Y轴偏移量，范围从-100到100，当值改变时更新strokeTexture的offset.y
	gui.add( config, 'offsetY', -100, 100 ).onChange((v)=>{
    	strokeTexture.offset.y = v;
	})
    // 添加GUI控制器，用于调整纹理在X轴上的重复次数，范围从0到10，当值改变时更新strokeTexture的repeat.x
	gui.add( config, 'repeatX', 0, 10 ).onChange((v)=>{
    	strokeTexture.repeat.x = v;
	})
    // 添加GUI控制器，用于调整纹理在Y轴上的重复次数，范围从0到10，当值改变时更新strokeTexture的repeat.y
	gui.add( config, 'repeatY', 0, 10 ).onChange((v)=>{
    	strokeTexture.repeat.y = v;
	})
    // 添加GUI控制器，用于调整线条宽度，范围从1到20，当值改变时更新material的lineWidth
	gui.add( config ,'lineWidth', 1, 20 ).onChange((v)=>{ 
		material.lineWidth = v;
	})
    // 添加GUI控制器，用于拾取功能，当前onChange回调为空
	gui.add( config, 'pick' ).onChange((v)=>{
	    
	})
    // 创建一个平面网格，使用法线材质，并设置为双面可见
	plane = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), new THREE.MeshNormalMaterial( { side: THREE.DoubleSide,  } ) );
    // 设置平面材质不可见
	plane.material.visible = false;
    // 将平面添加到场景中
	scene.add( plane );

    // 添加鼠标移动事件监听器
	window.addEventListener( 'mousemove', onMouseMove );
    // 添加触摸移动事件监听器
	window.addEventListener( 'touchmove', onTouchMove );
    // 添加鼠标按下事件监听器
	window.addEventListener( 'mousedown', onMouseDown );
    // 添加触摸开始事件监听器
	window.addEventListener( 'touchstart', onTouchStart );
    // 添加鼠标释放事件监听器
	window.addEventListener( 'mouseup', onMouseEnd );
    // 注释掉的鼠标离开事件监听器
	// window.addEventListener( 'mouseout', onMouseEnd );
    // 添加触摸结束事件监听器
	window.addEventListener( 'touchend', onTouchEnd );
    // 添加触摸取消事件监听器
	window.addEventListener( 'touchcancel', onTouchEnd );

    // 添加窗口大小改变事件监听器
	window.addEventListener( 'resize', onWindowResize );
    // 初始化窗口大小

	onWindowResize();
    // 开始渲染
	render();

}

var userInteracting = false;

function onMouseDown( e ) {
	if(config.pick) pickLine(mp);

	if( mode !== 'edit' ) return  console.log(mode,'mode');
	 
	directions.style.opacity = 0;

	if( !meshes[ 0 ] ) {
		meshes[ 0 ] = prepareMesh();
		nMouse[ 0 ] = new THREE.Vector2();
		mouse[ 0 ] = new THREE.Vector2();
	}

	userInteracting = true;
	controls.enabled = false;

	e.preventDefault();

}

function onMouseEnd( e ) {

	userInteracting = false;

	var id = 0;
	var m = meshes[ id ];
	// scene.remove( m );
	delete meshes[ id ];
	delete nMouse[ id ];
	delete mouse[ id ];

	modeController.setValue(false);
	controls.enabled = true;
	e.preventDefault();

}

function onTouchStart( e ) {

	directions.style.opacity = 0;

	for( var j = 0; j < e.touches.length; j++ ) {
		if( !meshes[ e.touches[ j ].identifier ] ) {
			meshes[ e.touches[ j ].identifier ] = prepareMesh();
			nMouse[ e.touches[ j ].identifier ] = new THREE.Vector2();
			mouse[ e.touches[ j ].identifier ] = new THREE.Vector2();
		}
	}

	e.preventDefault();

}

function onTouchEnd( e ) {

	userInteracting = false;

	for( var j = 0; j < e.changedTouches.length; j++ ) {
		var id = e.changedTouches[ j ].identifier;
		var m = meshes[ id ];
		scene.remove( m );
		delete meshes[ id ];
		delete nMouse[ id ];
		delete mouse[ id ];
	}

	e.preventDefault();

}

function onMouseMove ( e ) {
		mp.set( ( e.clientX / renderer.domElement.clientWidth ) * 2 - 1, - ( e.clientY / renderer.domElement.clientHeight ) * 2 + 1 );
	     if(userInteracting){
			nMouse[0].copy( mp );
		 }

		//  checkIntersection( 0 );
	

	e.preventDefault();

}
function pickLine(mp) {
	raycaster.setFromCamera( mp, camera );

	const intersects = [];
	// for (let line of lines) {
	// 	line.geometry.raycast(raycaster,intersects);
	// }
	raycaster.intersectObjects(lines, true, intersects);
	if ( intersects.length > 0 ) {
		const p = intersects[ 0 ].point;
		const vertices =  pickPoint.geometry.attributes.position.array;
		vertices.set(p.toArray())
		console.log(p);
		
		pickPoint.geometry.attributes.position.needsUpdate = true;
	}
}

function onTouchMove ( e ) {

	for( var j = 0; j < e.changedTouches.length; j++ ) {
		nMouse[ e.changedTouches[ j ].identifier ].x = ( e.changedTouches[ j ].clientX / renderer.domElement.clientWidth ) * 2 - 1;
		nMouse[ e.changedTouches[ j ].identifier ].y = - ( e.changedTouches[ j ].clientY / renderer.domElement.clientHeight ) * 2 + 1;
		//checkIntersection( e.changedTouches[ j ].identifier );
	}

	e.preventDefault();

}

function checkIntersection( id ) {
	if( !userInteracting ) return;
	tmpVector.copy( nMouse[ id ] ).sub( mouse[ id ] ).multiplyScalar( .1 );
	Maf.clamp( tmpVector.x, -1, 1 );
	Maf.clamp( tmpVector.y, -1, 1 );

	mouse[ id ].add( tmpVector );

	raycaster.setFromCamera( mouse[ id ], camera );

	// See if the ray from the camera into the world hits one of our meshes
	var intersects = raycaster.intersectObject( plane );

	// Toggle rotation bool for meshes that we clicked
	if ( intersects.length > 0 ) {

		var mesh = meshes[ id ];
		// 这命名先这样吧
		var g = mesh.geometry;
		var geo = g._points;

		var d = intersects[ 0 ].point.x;

		for( var j = 0; j < geo.length; j+= 3 ) {
			geo[ j ] = geo[ j + 3 ] * 1.001;
			geo[ j + 1 ] = geo[ j + 4 ] * 1.001;
			geo[ j + 2 ] = geo[ j + 5 ] * 1.001;
		}

		geo[ geo.length - 3 ] = d * Math.cos( angle );
		geo[ geo.length - 2 ] = intersects[ 0 ].point.y;
		geo[ geo.length - 1 ] = d * Math.sin( angle );

		g.setPoints( geo );

	}

}

function onWindowResize() {

	var w = container.clientWidth;
	var h = container.clientHeight;

	camera.aspect = w / h;
	camera.updateProjectionMatrix();

	renderer.setSize( w, h );

	resolution.set( w, h );

}

var tmpVector = new THREE.Vector3();

function check() {
	if( mode === 'edit' ){
		for( var i in nMouse ) { checkIntersection( i ); }
	}
	setTimeout( check, 20 );

}
check();

function render() {

	requestAnimationFrame( render );
	if( mode=== 'edit'){

		angle += .05;
		
		for( var i in meshes ) {
			var mesh = meshes[ i ];
			mesh.rotation.y = angle;
		}
	}

	/*for( var i in meshes ) {
		var geo = meshes[ i ].geo;
		for( var j = 0; j < geo.length; j+= 3 ) {
			geo[ j ] *= 1.01;
			geo[ j + 1 ] *= 1.01;
			geo[ j + 2 ] *= 1.01;
		}
		meshes[ i ].g.setGeometry( geo );
	}*/

	renderer.render( scene, camera );

}
