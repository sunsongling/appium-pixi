import {
	createPIXI
} from "./pixi.miniprogram";
const unsafeEval = require("common/unsafeEval");
const installSpine = require("common/pixi-spine");
const installAnimate = require("common/pixi-animate");
const TWEEN = require("common/Tween");

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
	this.devicePixelRatio = 0;
	this.zIndex = 20;
	this.coeff = 1;
	this.Sprite;
	this.TWEEN = TWEEN;
}


pixiApp.prototype.init = function(canvasId, theme) {
	let info = wx.getSystemInfoSync();
	this.sw = info.screenWidth; //获取屏幕宽高
	this.sh = info.windowHeight; //获取屏幕宽高
	this.ratio = info.devicePixelRatio;
	this.devicePixelRatioX = this.sw / 375;
	this.devicePixelRatioY = this.sh / 812;
	this.coeff = 1 - this.devicePixelRatioX/this.devicePixelRatioY;
	
	console.log(info.screenWidth,info.windowHeight,info.devicePixelRatio, this.devicePixelRatioX,this.coeff);
	let that = this;
	// 获取 canvas
	wx.createSelectorQuery().select('#' + canvasId).fields({
		node: true,
		size: true
	}).exec((res) => {
		const canvas = res[0].node;
		that.canvasObj = canvas;
		// canvasInstance = canvas;
		// 设置canvas实际宽高
		canvas.width = that.sw / that.ratio;
		canvas.height = that.sh / that.ratio;
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
			resolution: that.ratio,
			backgroundAlpha: 1
		});


		that.slotMachine = new that.PIXI.Container();
		that.slotMachine.sortableChildren = true;
		that.slotMachine.x = that.app.screen.width / 2;
		that.slotMachine.y = that.app.screen.height / 2; 
		that.slotMachine.scale.x = that.devicePixelRatioX ;
		that.slotMachine.scale.y = that.devicePixelRatioX ;
		
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
	console.log(e)
	this.PIXI.dispatchEvent(e)
}

export default pixiApp;