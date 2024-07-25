let zpbg = '../../static/table/bg.png'; //大转盘背景图片
let lipin = '../../static/table/gold0.png'; //礼品图片
let btn = '../../static/table/spin.png'; //按钮图片
let imgbg = '../../static/table/bg.png'; //背景图片
const scatterConfig = [{
		angle: 0,
		scatter: 7,
		bg: 2
	},
	{
		angle: 40,
		scatter: 5,
		bg: 3
	},
	{
		angle: 80,
		scatter: 1,
		bg: 1
	},
	{
		angle: 120,
		scatter: 8,
		bg: 2
	},
	{
		angle: 160,
		scatter: 4,
		bg: 3
	},
	{
		angle: 200,
		scatter: 2,
		bg: 1
	},
	{
		angle: 240,
		scatter: 6,
		bg: 2
	},
	{
		angle: 280,
		scatter: 0,
		bg: 3
	},
	{
		angle: 320,
		scatter: 3,
		bg: 1
	}
];
var soundEffects = {};
var compose = {
	lamps:[]
};

function layout() {
	this.pixiApp;
	
}

layout.prototype.init = function (pixiApp) {
	
	this.pixiApp = pixiApp;
	const bg = new pixiApp.Sprite(imgbg);
	pixiApp.slotMachine.addChild(bg);
	bg.anchor.set(0.5);
	bg.x = 0;
	bg.y = 0 + pixiApp.app.screen.height / 4 * pixiApp.coeff;

	const slotTrunk = new pixiApp.Container();
	slotTrunk.sortableChildren = true;
	slotTrunk.scale.x = 1 / pixiApp.devicePixelRatioX;
	slotTrunk.scale.y = 1 / pixiApp.devicePixelRatioX;
	pixiApp.slotMachine.addChild(slotTrunk);

	const turnTable = new pixiApp.Container();
	slotTrunk.addChild(turnTable);
	turnTable.y = 0;
	turnTable.visible = true;
	turnTable.angle = 0;
	compose.turnTable = turnTable;

	for (let config of scatterConfig) {
		let scatterBg = new pixiApp.Sprite('../../static/table/scatterBg' + config.bg + '.png');
		scatterBg.anchor.set(0.5, 1);
		scatterBg.angle = config.angle;
		turnTable.addChild(scatterBg);
	}

	for (let config of scatterConfig) {
		let line = new pixiApp.Sprite('../../static/table/line.png');
		line.anchor.set(0.5, 1);
		line.angle = config.angle + 20;
		turnTable.addChild(line);
	}

	const wheel = new pixiApp.Sprite('../../static/table/wheel.png');
	wheel.anchor.set(0.5);
	wheel.y = -8.25;
	slotTrunk.addChild(wheel);

	//灯泡
	for (let i = -4; i < 13; i++) {
		let lamp = new pixiApp.Sprite('../../static/table/lamp.png');
		lamp.anchor.set(0.5);
		lamp.x = Math.cos(20 * i * Math.PI / 180 + 10 * Math.PI / 180) * 219;
		lamp.y = Math.sin(20 * i * Math.PI / 180 + 10 * Math.PI / 180) * 219 + 8;
		lamp.angle = 20 * i + 100;
		//lamp.blendMode = PIXI.BLEND_MODES.ADD;
		wheel.addChild(lamp);
		compose.lamps.push(lamp);
		let lampDark = new pixiApp.Sprite('../../static/table/lampDark.png');
		lampDark.anchor.set(0.5);
		lamp.addChild(lampDark);
		lampDark.visible = true;
		lamp.dark = lampDark;
	}

	const core = new pixiApp.Sprite('../../static/table/core.png');
	core.anchor.set(0.5);
	slotTrunk.addChild(core);
	compose.core = core;

	const spin = new pixiApp.Sprite('../../static/table/spin.png');
	spin.anchor.set(0.5);
	slotTrunk.addChild(spin);
	spin.x = 0;
	spin.y = 280;
	spin.interactive = true;
	spin.scale.set(0.85);
	spin.on('pointertap', (event) => {
		this.turnTableTween();
		event.stopPropagation();
	});
}

layout.prototype.turnTableTween = function(){
		let winAngle = 360;
		let angle = 360*2 + winAngle + 10;
		let time = 5000;
		let that = this;
		let tween1 = new that.pixiApp.TWEEN.Tween({angle:0})
	    .to({angle:angle}, time)
		.onStart(function(){
			compose.turnTable.angle = 0;
			compose.core.angle = 0;
		})
	    .onUpdate(function(object){
			//console.log(this.angle)
	    	compose.turnTable.angle = this.angle;
	    	compose.core.angle = this.angle;
	    })
		.onComplete(function(){
			
		});
	
		let tween2 = new that.pixiApp.TWEEN.Tween({angle:winAngle+10,alpha:1})
	    .to({angle:[winAngle+9,winAngle+7,winAngle],alpha:[0,1,1,0,1,1,0,1,1,0,1,1]}, 700)
		.easing(that.pixiApp.TWEEN.Easing.Quadratic.Out)
		.onStart(function(){
			compose.turnTable.angle = 0;
			compose.core.angle = 0;
		})
	    .onUpdate(function(object){
	    	compose.turnTable.angle = this.angle;
	    	compose.core.angle = this.angle;
			for(let lamp of compose.lamps){
				lamp.alpha = this.alpha;
			}
	    })
		.onComplete(function(){
			that.pixiApp.TWEEN.remove(tween1);
			that.pixiApp.TWEEN.remove(tween2);
		});
	
		tween1.chain(tween2);
		tween1.start();
}

export default layout;