import {
	createPIXI
} from "./pixi.miniprogram";
const unsafeEval = require("common/unsafeEval");
const installSpine = require("common/pixi-spine");
const installAnimate = require("common/pixi-animate");
const TWEEN = require("common/Tween");
var coordinatesArray = [{resolution: {x: 812,y: 375}}, {resolution: {x: 375,y: 812}}];
var measurementsObj = {"min":{"portrait":{"width":375,"height":500},"landscape":{"width":500,"height":375}},"max":{"portrait":{"width":375,"height":812},"landscape":{"width":812,"height":375}}};

function pixiApp() {
	this.PIXI = {};
	// let selfThis;
	this.canvasObj;
	this.animationFrame;
	this.slotMachine;
	this.app = {}
	this.sw = 0;
	this.sh = 0;
	this.ratio = 1;
	this.zIndex = 20;
	this.coeff = 1;
	this.state = 1;
	this.Sprite;
	this.TWEEN = TWEEN;
}

pixiApp.prototype.defineRatio = function(){
	if (this.canvasObj.width > this.canvasObj.height) {
		this.state = 0;
		if (this.canvasObj.width / this.canvasObj.height > 2.165) {	//宽高大于 iphoneX
			this.slotMachine.scale.x = this.canvasObj.width / measurementsObj['max']['landscape']['width']; //812
			this.slotMachine.scale.y = this.canvasObj.height / measurementsObj['max']['landscape']['height'];//375
		} else if (this.canvasObj.width / this.canvasObj.height < 1.333) { //宽高比小于 ipad
			this.slotMachine.scale.x = this.canvasObj.width / measurementsObj['min']['landscape']['width']; //500
			this.slotMachine.scale.y = this.canvasObj.height / measurementsObj['min']['landscape']['height']; //375
		} else {
			var A = (2.165 - this.canvasObj.width / this.canvasObj.height) / 0.832 * (measurementsObj['max']['landscape']['width'] - measurementsObj['min']['landscape']['width']);
			this.slotMachine.scale.x = this.canvasObj.width / (measurementsObj['max']['landscape']['width'] - A);
			this.slotMachine.scale.y = this.slotMachine.scale.x;
		}
		this.slotMachine.y = this.canvasObj.height/2;
		this.slotMachine.x = this.canvasObj.width /2;
	} else {
		this.state = 1;
		if (this.canvasObj.height / this.canvasObj.width > 2.165) {
			this.slotMachine.scale.x = this.canvasObj.width / measurementsObj['max']['portrait']['width'];
			this.slotMachine.scale.y = this.canvasObj.height / measurementsObj['max']['portrait']['height'];
		} else if (this.canvasObj.height / this.canvasObj.width < 1.333) {
			this.slotMachine.scale.x = this.canvasObj.width / measurementsObj['min']['portrait']['width'];
			this.slotMachine.scale.y = this.canvasObj.height / measurementsObj['min']['portrait']['height'];
		} else {
			var t = (2.165 - this.canvasObj.height / this.canvasObj.width) / .832 * (measurementsObj['max']['portrait']['height'] - measurementsObj['min']['portrait']['height']);
			this.slotMachine.scale.y = this.canvasObj.height / (measurementsObj['max']['landscape']['width'] - t);
			this.slotMachine.scale.x = this.slotMachine.scale.y;
		}
		this.slotMachine.y = this.canvasObj.height/2;
		this.slotMachine.x = this.canvasObj.width/2;
	}
}

pixiApp.prototype.getCoeff = function(){
	var t = 0;
	if (0 === this.state) {
		t = (this.canvasObj.width / this.slotMachine.scale.x - coordinatesArray[this.state].resolution.x) / 2 * this.slotMachine.scale.x / ((measurementsObj['max']['landscape']['width'] - measurementsObj['min']['landscape']['width']) / 2),
		t > 1 && (t = 1),
		t < -1 && (t = -1),
		this.canvasObj.width / this.canvasObj.height > 2.165 && (t = 0);
	} else {
		t = (this.canvasObj.height / this.slotMachine.scale.y - coordinatesArray[this.state].resolution.y) / 2 * this.slotMachine.scale.y / ((measurementsObj['max']['portrait']['height'] - measurementsObj['min']['portrait']['height']) / 2),
		t > 1 && (t = 1),
		t < -1 && (t = -1),
		this.canvasObj.height / this.canvasObj.width > 2.165 && (t = 0)
	}
	return t;
}

pixiApp.prototype.init = function(canvasId, theme) {
	let info = wx.getSystemInfoSync();
	this.sw = info.screenWidth; //获取屏幕宽高
	this.sh = info.windowHeight; //获取屏幕宽高
	//this.ratio = info.devicePixelRatio;
		
	let that = this;
	// 获取 canvas
	wx.createSelectorQuery().select('#' + canvasId).fields({
		node: true,
		size: true
	}).exec((res) => {
		const canvas = res[0].node;
		that.canvasObj = canvas;
		// 设置canvas实际宽高
		canvas.width = that.sw ;
		canvas.height = that.sh ;
		// PIXI 初始化 -----start
		that.PIXI = createPIXI(canvas, that.sw);
		
		that.Sprite = function(url){
			let sprite = new that.PIXI.Sprite.from(url);
			sprite.anchor.set(0.5);
			return sprite;
		}
		
		this.Container = function(){
			let container = new that.PIXI.Container();
			return container;
		}

		unsafeEval(that.PIXI); //适配PIXI里面使用的eval函数
		installSpine(that.PIXI); //注入Spine库
		installAnimate(that.PIXI); //注入Animate库

		// 通过view把小程序的canvas传入
		that.app = that.PIXI.autoDetectRenderer({
			width: that.sw,
			height: that.sh,
			'view': canvas,
			antialias: true,
			autoDensity: true,
			//resolution: that.ratio,
			backgroundAlpha: 1
		});

		that.slotMachine = new that.PIXI.Container();
		that.slotMachine.sortableChildren = true;
		that.defineRatio();
		theme.init(that);
		function animate() {
			that.TWEEN.update();
			canvas.requestAnimationFrame(animate);
			that.app.render(that.slotMachine);
		}
		animate();
	})
}

//小程序事件绑定至pixi
pixiApp.prototype.touchEvent = function(e) {
	//console.log(e)
	this.PIXI.dispatchEvent(e)
}

export default pixiApp;