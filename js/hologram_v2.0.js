//定义宽高
var width = window.innerWidth;
var height = window.innerHeight;
//初始化需要旋转和缩放的模型类数组
var rotateTypeArr=[],scaleTypeArr=[];

//定义场景
var scene;
var init_scene = function(){
	scene = new THREE.Scene();
}
init_scene();

//定义光照
var ambientlight, directionallight;
var init_light = function(){
	ambientlight = new THREE.AmbientLight(0xf0f0f0);
	directionallight = new THREE.DirectionalLight(0xffffff,0.6);
	directionallight.castShadow = true;
	scene.add(ambientlight);
	scene.add(directionallight);
}
init_light();

//定义渲染器
var renderer;
var init_renderer = function(){
	var renderer_width = width>=height?height:width;
	var renderer_height = renderer_width;
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(renderer_width,renderer_height,false);
	var canvas = renderer.domElement;
	canvas.style.position = 'absolute';
	canvas.style.width = renderer_width+'px';
	if(width>height){
		canvas.style.left = (width-renderer_width)/2+'px';
	}else{
		canvas.style.top = (height-renderer_height)/2+'px';
	}
	document.body.appendChild(canvas);
}
init_renderer();

//定义模型
var fbx_arr = ['asset/source/threejs_mars.fbx','asset/source/threejs_marscloud.fbx'];
var model_arr=new Array();
var init_models = function(){
	fbx_arr.forEach(function(fbx,index){
		var loader = new THREE.FBXLoader();
		loader.load(fbx,function(model){
			model.receiveShadow = true;
			rotateTypeArr.push(model.rotation) ;
			scaleTypeArr.push(model.scale.x);
			scene.add(model);
			model_arr.push(model);
		});
	});
}
init_models();

//定义视口参数
var view = function(left,top,width,height,position,up){
	this.left = left;
	this.top = top;
	this.width = width;
	this.height = height;
	this.angle = 75;
	this.ratio = 1;
	this.nearest = 0.1;
	this.farthest = 1000.0;
	this.camera = new THREE.PerspectiveCamera(this.angle,this.ratio,this.nearest,this.farthest);
	this.camera.position.fromArray(position);
	this.camera.up.fromArray(up);
}

var view_size = renderer.getSize().width/3.0;
var position = [0.0,0.0,250.0];
var up = [0,1,0];
//初始化前后左右四个视口
var front_view = new view(view_size,view_size*2,view_size,view_size,position,up);
var back_view = new view(view_size,0,view_size,view_size,position,up);
var left_view = new view(0,view_size,view_size,view_size,position,up);
var right_view = new view(view_size*2,view_size,view_size,view_size,position,up);
var views=[front_view,left_view,back_view,right_view];

//定义播放
var rotateSpeed = 0.01;
var update = function(){
	if(touchDown)
		return;
	model_arr.forEach(function(model){
		model.rotation.y += rotateSpeed;
	})
}

var render = function(){
	views.forEach(function(view,index){
		var camera;		
		if(index==0){
			//front_camera
			camera = view.camera.clone();   
		}else if(index==1){
			//left_camera
			camera = view.camera.clone().translateX(-1*view.camera.position.z).translateZ(-1*view.camera.position.z).rotateY(-Math.PI/2).rotateZ(Math.PI/2);
		}else if(index==2){
			//back_camera
			camera = view.camera.clone().translateZ(-2*view.camera.position.z).rotateY(Math.PI).rotateZ(Math.PI);
		}else{
			//right_camera
			camera = view.camera.clone().translateX(view.camera.position.z).translateZ(-1*view.camera.position.z).rotateY(Math.PI/2).rotateZ(-Math.PI/2);
		}
		renderer.setViewport( view.left, view.top, view.width, view.height );
		renderer.setScissor( view.left, view.top, view.width, view.height );
		renderer.setScissorTest( true );		
		renderer.setClearColor(new THREE.Color(0x000000));
		renderer.render(scene,camera);
	});	
}

var gameloop = function(){
	requestAnimationFrame(gameloop);
	update();
	render();
}

gameloop();