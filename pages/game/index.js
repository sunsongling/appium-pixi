import assets from "./assets.js";
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
var sharedTickerCount = 0;
var soundEffects = {};
var compose = {
	purpleStars: [],
	lastAngle:0,
	purpleStarsStep :5, //一次跳动角度
	stepTimes :0,
	stepInterval:40, //时间间隔
	hide:false
};

function layout() {
	this.pixiApp;
	this.compose = compose;
	this.soundEffects = soundEffects;
}

layout.prototype.init = async function (pixiApp) {
	let coeff = pixiApp.getCoeff();
	this.pixiApp = pixiApp;

	pixiApp.gameLoops.push(this.gameLoop);
	
	const bgContainer = new pixiApp.Container();
	bgContainer.y = 10 - coeff * 30;
	pixiApp.stage.addChild(bgContainer);

	const bg = new pixiApp.PIXI.TilingSprite(pixiApp.PIXI.Texture.from(assets['bg.jpg']), 152 * 6, 422);
	console.log(bg)
	bg.anchor.set(0.5);
	bg.x = 152 / 2;
	bg.scale.y = 2.5;
	bg.clampMargin = -0.5;
	bgContainer.addChild(bg);

	//帘
	const leftCurtain = new pixiApp.Sprite(assets['curtain.png']);
	leftCurtain.scale.x = -1;
	leftCurtain.x = -160;
	leftCurtain.y = -40;
	leftCurtain.anchor.set(0.5);
	bgContainer.addChild(leftCurtain);

	const rightCurtain = new pixiApp.Sprite(assets['curtain.png']);
	rightCurtain.x = 160;
	rightCurtain.y = -40;
	rightCurtain.anchor.set(0.5);
	bgContainer.addChild(rightCurtain);

	//灯
	const light = new pixiApp.Sprite(assets['light.png']);
	light.anchor.set(0.5);
	light.y = -270;
	bgContainer.addChild(light);


	//灯下星星
	let bgStars = [];
	for (let i = 0; i < 40; i++) {
		let star = new pixiApp.Sprite(assets['star0.png']);
		star.x = Math.random() * 60 - 60 * (5 - i % 10);
		star.y = Math.random() * 80 - 80 * Math.floor(i / 10) - 330;
		star.scale.set(Math.random() * 0.6 + 0.2);
		star.angle = Math.random() * 360;
		star.visible = false;
		star.alpha = 0;
		star.blendMode = pixiApp.PIXI.BLEND_MODES.ADD;
		bgContainer.addChild(star);
		bgStars.push(star);
	}

	const bgStarsTween = new pixiApp.TWEEN.Tween({ alpha: 0 })
		.to({ alpha: Math.PI * 2 }, 5000)
		.repeat(Infinity)
		.onStart(function () {
			for (let star of bgStars) {
				star.visible = true;
			}
		})
		.onUpdate(function () {
			for (let i = 0; i < bgStars.length; i++) {
				let star = bgStars[i];
				if (i % 2 == 0) {
					star.alpha = Math.sin(this.alpha) > 0 ? Math.sin(this.alpha) : 0;
				} else {
					star.alpha = Math.sin(this.alpha) > 0 ? 0 : Math.abs(Math.sin(this.alpha));
				}
			}
		})
		.start();

	//底座
	const lampstandContainer = new pixiApp.Container();
	lampstandContainer.y = 277 + 30*coeff;
	lampstandContainer.scale.set(0.9 - coeff * 0.1);
	pixiApp.stage.addChild(lampstandContainer);

	const lampstandL = new pixiApp.Sprite(assets['lampstand.png']);
	lampstandContainer.addChild(lampstandL);
	lampstandL.anchor.set(0.5);
	lampstandL.x = -287.5 / 2;
	lampstandL.scale.x = -1;
	lampstandL.visible = true;

	const lampstandR = new pixiApp.Sprite(assets['lampstand.png']);
	lampstandContainer.addChild(lampstandR);
	lampstandR.anchor.set(0.5);
	lampstandR.x = 287.5 / 2;
	lampstandR.visible = true;

	//底座灯
	let starConfig = [
		{ x: -210, y: -25 },
		{ x: -159, y: -17 },
		{ x: -85, y: -12 },
		{ x: 0, y: -12 },
		{ x: 84, y: -12 },
		{ x: 159, y: -17 },
		{ x: 210, y: -25 },
	];
	let stars = [];
	let starDarks = [];
	for (let config of starConfig) {
		let star = new pixiApp.Sprite(assets['lampstandStar.png']);
		star.anchor.set(0.5);
		star.x = config.x;
		star.y = config.y;
		star.blendMode = pixiApp.PIXI.BLEND_MODES.ADD;
		star.visible = false;
		lampstandContainer.addChild(star);
		stars.push(star);

		let starDark = new pixiApp.Sprite(assets['lampstandStarDark.png']);
		starDark.anchor.set(0.5);
		starDark.x = config.x;
		starDark.y = config.y;
		starDark.alpha = 0.5;
		starDark.blendMode = pixiApp.PIXI.BLEND_MODES.ADD;
		starDark.visible = false;
		lampstandContainer.addChild(starDark);
		starDarks.push(starDark);
	}

	const starsTween = new pixiApp.TWEEN.Tween({ visible: 0 })
	.to({ visible: 1 }, 5000)
	.repeat(Infinity)
	.onUpdate(function () {
		for (let i = 0; i < stars.length; i++) {
			stars[i].visible = i % 2 == 0 ? Math.round(this.visible) : !Math.round(this.visible);
			starDarks[i].visible = i % 2 == 0 ? !Math.round(this.visible) : Math.round(this.visible);
		}
	})
	.start();

	//大转盘
	const turnContainer = new pixiApp.Container();
	pixiApp.stage.addChild(turnContainer);
	turnContainer.y = -10 + coeff * 10;
	turnContainer.visible = true;
	turnContainer.scale.set(0.9 + coeff * 0.1);

	//黄色框
	const turntableBg = new pixiApp.Sprite(assets['turntableBg.png']);
	turntableBg.visible = true;
	turnContainer.addChild(turntableBg);

	const tableContainer = new pixiApp.Container();
	tableContainer.y = 11.5;
	tableContainer.visible = true;
	turnContainer.addChild(tableContainer);

	//紫色光圈
	let circlePurple = new pixiApp.Container();
	circlePurple.visible = true;
	tableContainer.addChild(circlePurple);

	let purpleLT = new pixiApp.Sprite(assets['circlePurple.png']);
	purpleLT.x = -230.5 / 2;
	purpleLT.y = -230.5 / 2;
	circlePurple.addChild(purpleLT);
	let purpleLB = new pixiApp.Sprite(assets['circlePurple.png']);
	purpleLB.x = -230.5 / 2;
	purpleLB.y = 230.5 / 2;
	purpleLB.scale.y = -1;
	circlePurple.addChild(purpleLB);
	let purpleRT = new pixiApp.Sprite(assets['circlePurple.png']);
	purpleRT.x = 230.5 / 2;
	purpleRT.y = -230.5 / 2;
	purpleRT.scale.x = -1;
	circlePurple.addChild(purpleRT);
	let purpleRB = new pixiApp.Sprite(assets['circlePurple.png']);
	purpleRB.x = 230.5 / 2;
	purpleRB.y = 230.5 / 2;
	purpleRB.scale.set(-1);
	circlePurple.addChild(purpleRB);

	//光圈灯
	let starContainer = new pixiApp.Container();
	starContainer.visible = true;
	starContainer.angle = 45 / 2;
	tableContainer.addChild(starContainer);

	//点光
	for (let i = 0; i < 8; i++) {
		let star = new pixiApp.Sprite(assets['circlePurpleStar.png']);
		star.x = Math.cos(45 * i * Math.PI / 180) * 197;
		star.y = Math.sin(45 * i * Math.PI / 180) * 197;
		star.angle = 45 * i + 105;
		star.alpha = 0.6;
		star.blendMode = pixiApp.PIXI.BLEND_MODES.ADD;
		starContainer.addChild(star);
		compose.purpleStars.push(star);
	}


	const turnTable = new pixiApp.Container();
	tableContainer.addChild(turnTable);
	turnTable.y = 0;
	turnTable.visible = true;
	turnTable.angle = 0;
	compose.turnTable = turnTable;

	for (let config of scatterConfig) {
		let scatterBg = new pixiApp.Sprite(assets['scatterBg' + config.bg + '.png']);
		scatterBg.anchor.set(0.5, 1);
		scatterBg.angle = config.angle;
		turnTable.addChild(scatterBg);
	}

	for (let config of scatterConfig) {
		let line = new pixiApp.Sprite(assets['line.png']);
		line.anchor.set(0.5, 1);
		line.angle = config.angle + 20;
		turnTable.addChild(line);
	}

	const circleGoldL = new pixiApp.Sprite(assets['circleGold.png']);
	circleGoldL.x = -229 / 2;
	circleGoldL.y = 3;
	circleGoldL.visible = true;
	tableContainer.addChild(circleGoldL);

	const circleGoldR = new pixiApp.Sprite(assets['circleGold.png']);
	circleGoldR.x = 229 / 2;
	circleGoldR.scale.x = -1;
	circleGoldR.y = 3;
	circleGoldR.visible = true;
	tableContainer.addChild(circleGoldR);

	const circleGoldSmallL = new pixiApp.Sprite(assets['circleGold.png']);
	circleGoldSmallL.x = -229 / 2 * 0.87;
	circleGoldSmallL.y = 3;
	circleGoldSmallL.visible = true;
	circleGoldSmallL.scale.set(0.87);
	tableContainer.addChild(circleGoldSmallL);

	const circleGoldSmallR = new pixiApp.Sprite(assets['circleGold.png']);
	circleGoldSmallR.x = 229 / 2 * 0.87;
	circleGoldSmallR.scale.x = -0.87;
	circleGoldSmallR.scale.y = 0.87;
	circleGoldSmallR.y = 3;
	circleGoldSmallR.visible = true;
	tableContainer.addChild(circleGoldSmallR);

	const arrow = new pixiApp.Sprite(assets['arrow.png']);
	tableContainer.addChild(arrow);
	arrow.anchor.set(0.5, 0.1);
	arrow.y = -232;
	arrow.visible = true;
	arrow.scale.set(1);
	compose.arrow = arrow;

	const coreContainer = new pixiApp.Container();
	tableContainer.addChild(coreContainer);
	coreContainer.interactive = true;
	coreContainer.addListener('pointertap', (event) => {
		if(compose.hide) {
			return false;
		}
		this.turnTableTween();
		event.stopPropagation();
	});

	const coreL = new pixiApp.Sprite(assets['core.png']);
	coreContainer.addChild(coreL);
	coreL.x = -72 / 2;
	coreL.visible = true;
	coreL.scale.set(1);
	const coreR = new pixiApp.Sprite(assets['core.png']);
	coreContainer.addChild(coreR);

	coreR.x = 72 / 2;
	coreR.visible = true;
	coreR.scale.set(-1, 1);

	const coreDark = new pixiApp.Sprite(assets['coreDark.png']);
	coreContainer.addChild(coreDark);
	coreDark.x = 0;
	coreDark.visible = false;
	coreDark.scale.set(-1, 1);
	compose.coreDark = coreDark;

	//结算容器
	const winContainer = new pixiApp.Container();
	pixiApp.stage.addChild(winContainer);
	winContainer.y = 0;
	//winContainer.scale.set(0.5);
	winContainer.visible = false;
	compose.winContainer = winContainer;

	//赢钱遮罩
	let winMark = new pixiApp.PIXI.NineSlicePlane(pixiApp.PIXI.Texture.from(assets['mark.png']), 1, 1, 1, 1);
	winMark.alpha = 1;
	winMark.width = 800;
	winMark.height = 500;
	winMark.x = -winMark.width / 2;
	winContainer.addChild(winMark);

	const winBox = new pixiApp.Container();
	winBox.visible = true;
	winBox.scale.set(1);
	winBox.y = 150;
	winContainer.addChild(winBox);
	compose.winBox = winBox;

	const winBoxContainer = new pixiApp.Container();
	winBoxContainer.visible = true;
	winBoxContainer.scale.set(1-coeff*0.07,1+coeff*0.07);
	compose.winBoxContainer = winBoxContainer;
	winBox.addChild(winBoxContainer);
	//赢钱框
	let winBoxBg = new pixiApp.PIXI.NineSlicePlane(pixiApp.PIXI.Texture.from(assets['winBox.png']), 1, 2, 1, 2);
	winBoxBg.height = 110;
	winBoxBg.width = 243 * 2;
	winBoxBg.x = -winBoxBg.width / 2;
	winBoxBg.y = -55;
	winBoxContainer.addChild(winBoxBg);

	let winBoxLightTop = new pixiApp.Sprite(assets['winBoxLight.png']);
	winBoxLightTop.y = -50 / 2 + 1;
	winBoxLightTop.blendMode = pixiApp.PIXI.BLEND_MODES.ADD;
	winBoxContainer.addChild(winBoxLightTop);

	let winBoxLightBottom = new pixiApp.Sprite(assets['winBoxLight.png']);
	winBoxLightBottom.y = 50 / 2 - 0.5;
	winBoxLightBottom.scale.y = -1;
	winBoxLightBottom.blendMode = pixiApp.PIXI.BLEND_MODES.ADD;
	winBoxContainer.addChild(winBoxLightBottom);

	//光效粒子
	const winStarTop = new pixiApp.Container();
	winStarTop.y = -55;
	winBoxContainer.addChild(winStarTop);
	const winTopEmitter = new pixiApp.PIXI.Particles.Emitter(
		winStarTop,
		[{
			framerate: 1,
			loop: true,
			textures: [
				assets["star0.png"]
			]
		}],
		{
			//范围 粒子从开始到结束的大小设置
			scale: {
				list: [
					{ value: 0.2, time: 0 },
					{ value: 0.5, time: 0.2 },
					{ value: 0.3, time: 0.8 },
					{ value: 0.3, time: 1 }
				],
				//是否跨步
				isStepped: false,
				minimumScaleMultiplier: 0.5
			},
			alpha: {
				list: [
					{ value: 0.5, time: 0 },
					{ value: 1, time: 0.2 },
					{ value: 0.8, time: 0.8 },
					{ value: 0, time: 1 }
				]
			},
			//速度设置
			speed: {
				start: 20, //开始速度
				end: 10, //结束速度
				minimumSpeedMultiplier: 0.8 //最小速度倍增器
			},
			//加速度
			acceleration: {
				x: 0,
				y: 0
			},
			//喷射角度 0 - 360
			startRotation: {
				min: 0,
				max: 180
			},
			//旋转角速度
			rotationSpeed: {
				min: 0,
				max: 90
			},
			/*
			*缓动生成 用于计算以下位置的变化百分比给定的时间点（包括0-1）
			*没搞明白可以打开下面网站了解
			*https://greensock.com/docs/v3/Eases
			*/
			ease: [
				{
					"s": 0,
					"cp": 0.329,
					"e": 0.548
				},
				{
					"s": 0.548,
					"cp": 0.767,
					"e": 0.876
				},
				{
					"s": 0.876,
					"cp": 0.985,
					"e": 1
				}
			],
			//生存时长 秒
			lifetime: {
				min: 2.5,
				max: 2.5
			},
			//产生粒子频率 秒/个
			frequency: 1 / 10,
			//每次有机会产生一个粒子时，都有可能产生一个粒子。0是0%，1是100%。
			spawnChance: 1,
			//发射机寿命 （秒） -1 无限
			emitterLifetime: -1,
			//同时存在最大粒子数量
			maxParticles: 200,

			//粒子发射原点坐标
			pos: {
				x: 0,
				y: 0
			},
			//是否在显示列表的后面而不是前面添加粒子。
			addAtBack: false,
			//生成粒子类型。有效类型为 "point"“点”，"rectangle"“矩形”，"circle"“圆”，"burst"“爆发”，"ring"“环”
			spawnType: "rect",
			//生成类型圆的大小 要与spawnType对应
			spawnRect: {
				x: -300 / 2,
				y: 0,
				w: 300,
				h: 2
			},
			blendMode: "add",
		}
	);
	//粒子格式
	winTopEmitter.particleConstructor = pixiApp.PIXI.Particles.AnimatedParticle;
	//是否共享的ticker自动调用
	winTopEmitter.autoUpdate = true;
	winTopEmitter.emit = false;
	compose.winTopEmitter = winTopEmitter;

	const winStarBottom = new pixiApp.Container();
	winStarBottom.y = 54;
	winBoxContainer.addChild(winStarBottom);
	const winBottomEmitter = new pixiApp.PIXI.Particles.Emitter(
		winStarBottom,
		[{
			framerate: 1,
			loop: true,
			textures: [
				assets["star0.png"]
			]
		}],
		{
			//范围 粒子从开始到结束的大小设置
			scale: {
				list: [
					{ value: 0.2, time: 0 },
					{ value: 0.5, time: 0.2 },
					{ value: 0.3, time: 0.8 },
					{ value: 0.3, time: 1 }
				],
				//是否跨步
				isStepped: false,
				minimumScaleMultiplier: 0.5
			},
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 0.5, time: 0.2 },
					{ value: 1, time: 0.8 },
					{ value: 0, time: 1 }
				]
			},
			//速度设置
			speed: {
				start: 20, //开始速度
				end: 10, //结束速度
				minimumSpeedMultiplier: 0.8 //最小速度倍增器
			},
			//加速度
			acceleration: {
				x: 0,
				y: 0
			},
			//喷射角度 0 - 360
			startRotation: {
				min: 180,
				max: 360
			},
			//旋转角速度
			rotationSpeed: {
				min: 0,
				max: 90
			},
			/*
			*缓动生成 用于计算以下位置的变化百分比给定的时间点（包括0-1）
			*没搞明白可以打开下面网站了解
			*https://greensock.com/docs/v3/Eases
			*/
			ease: [
				{
					"s": 0,
					"cp": 0.329,
					"e": 0.548
				},
				{
					"s": 0.548,
					"cp": 0.767,
					"e": 0.876
				},
				{
					"s": 0.876,
					"cp": 0.985,
					"e": 1
				}
			],
			//生存时长 秒
			lifetime: {
				min: 2.5,
				max: 2.5
			},
			//产生粒子频率 秒/个
			frequency: 1 / 10,
			//每次有机会产生一个粒子时，都有可能产生一个粒子。0是0%，1是100%。
			spawnChance: 1,
			//发射机寿命 （秒） -1 无限
			emitterLifetime: -1,
			//同时存在最大粒子数量
			maxParticles: 200,

			//粒子发射原点坐标
			pos: {
				x: 0,
				y: 0
			},
			//是否在显示列表的后面而不是前面添加粒子。
			addAtBack: false,
			//生成粒子类型。有效类型为 "point"“点”，"rectangle"“矩形”，"circle"“圆”，"burst"“爆发”，"ring"“环”
			spawnType: "rect",
			//生成类型圆的大小 要与spawnType对应
			spawnRect: {
				x: -300 / 2,
				y: 0,
				w: 300,
				h: 2
			},
			blendMode: "add",
		}
	);
	//粒子格式
	winBottomEmitter.particleConstructor = pixiApp.PIXI.Particles.AnimatedParticle;
	//是否共享的ticker自动调用
	winBottomEmitter.autoUpdate = true;
	winBottomEmitter.emit = false;
	compose.winBottomEmitter = winBottomEmitter;

	//标题
	const title = new pixiApp.Text('旋转抽奖', {
		fontFamily: 'Arial',
		fontSize: 30,
		//fontStyle: 'italic',
		fontWeight: 'Bold',
		fill: '0x000000'
	});
	title.y = -300 - coeff * 70;
	pixiApp.stage.addChild(title);
	compose.title = title;

	const setting = new pixiApp.Sprite(assets["setting.png"]);
	setting.x = 200 - coeff * 40;
	setting.y = -300 - coeff * 70;
	setting.interactive = true;
	setting.on('pointerdown', (event) => {
		if(compose.hide) {
			return false;
		}
		this.hideTween();
		event.stopPropagation();
	});
}

layout.prototype.turnTableTween = function () {
	if (compose.spinlock) {
		return false;
	}
	compose.spinlock = true;
	let winAngle = 360;
	let angle = 360 * 2 + winAngle + 10;
	let time = 3200;
	let that = this;
	that.winBoxHide();
	let tween1 = new that.pixiApp.TWEEN.Tween({angle:0,angle2:0,step:5,angle3:20,speed:800})
    .to({angle:angle,angle2:360,step:[15,5],angle3:[20,20,0],speed:[1200,200]}, time)
	.easing(that.pixiApp.TWEEN.Easing.Quadratic.Out)
	.onStart(function(){
		compose.stepInterval = 2;
		compose.purpleStarsStep = 5;
		compose.turnTable.angle = compose.lastAngle;
		compose.arrow.angle = 0;
		for (let i = 0; i < compose.purpleStars.length; i++) {
			compose.purpleStars[i].alpha = 1;
		}
	})
    .onUpdate(function(){
		let object = this;
    	compose.turnTable.angle = object.angle + compose.lastAngle;
		compose.arrow.angle = Math.sin(object.angle2*Math.PI/10)*10 - object.angle3;
		compose.purpleStarsStep = Math.round(object.step);
    })
	.onComplete(function(){
		compose.stepInterval = 40;
		compose.arrow.angle = 0;
		compose.winTopEmitter.emit = true;
		compose.winBottomEmitter.emit = true;
	});

	let tween2 = new that.pixiApp.TWEEN.Tween({angle:winAngle+10,step:0})
    .to({angle:[winAngle+9,winAngle+7,winAngle],step:360}, 700)
	//.repeat(Infinity)
	.onStart(function(){
		compose.turnTable.angle = compose.lastAngle;
	})
    .onUpdate(function(){
		let object = this;
    	compose.turnTable.angle = object.angle + compose.lastAngle;
    })
	.onComplete(function(){
		compose.stepInterval = 40;
		if(compose.playBgmFinished){
			compose.turnstopMP3.play();
			compose.turnstopMP3.muted = false;
		}
		for (let i = 0; i < compose.purpleStars.length; i++) {
			compose.purpleStars[i].alpha = 0.6;
		}
		that.winBoxShow();
	});
	compose.lastAngle = winAngle%360;
	tween1.chain(tween2);
	tween1.start();
}

//显示结果
layout.prototype.winBoxShow = function(){
	let that = this;
	//跳钱
	let winBoxTween =  new that.pixiApp.TWEEN.Tween({scale:0,alpha:0.5})
	.to({scale:[1.1,1],alpha:1}, 1000)
	.easing(that.pixiApp.TWEEN.Easing.Quadratic.Out)
	.onStart(function(){
		compose.winContainer.visible = true;
		compose.winBox.visible = true;
		compose.winBox.alpha = 0;
		compose.winBox.scale.set(0);
	})
	.onUpdate(function(){
		let object = this;
		compose.winBox.alpha = object.alpha;
		compose.winBox.scale.set(object.scale);
	})
	.onComplete(function(){
		compose.spinlock = false;
	})
	.start();
}


layout.prototype.winBoxHide = function(){
	if(compose.winContainer.visible){
		let that = this;
		//赢钱框消失
		let winBoxHideTween = new that.pixiApp.TWEEN.Tween({scale:1,alpha:1})
		.to({scale:0,alpha:[1,0]}, 500)
		.easing(that.pixiApp.TWEEN.Easing.Quadratic.Out)
		.onUpdate(function(){
			let object = this;
			compose.winBox.scale.set(object.scale);
			compose.winBox.alpha = object.alpha;
		})
		.onComplete(function(){
			compose.winContainer.visible = false;
			compose.winTopEmitter.emit = false;
			compose.winBottomEmitter.emit = false;
		}).start();
	}
}

layout.prototype.gameLoop = function () {
	sharedTickerCount++;
	//走马灯动画
	if(sharedTickerCount%compose.stepInterval == 0){
		compose.stepTimes++;
		for (let i = 0; i < compose.purpleStars.length; i++) {
			let StarSprite = compose.purpleStars[i];
			StarSprite.x = Math.cos(45*i*Math.PI / 180 + compose.stepTimes*compose.purpleStarsStep*Math.PI / 180) * 197;
			StarSprite.y = Math.sin(45*i*Math.PI / 180 + compose.stepTimes*compose.purpleStarsStep*Math.PI / 180) * 197;
			StarSprite.angle = 45*i + compose.stepTimes*compose.purpleStarsStep + 105;
		}
		if((compose.stepTimes*compose.purpleStarsStep)%360 == 0){
			compose.stepTimes = 0;
		}
	}
}

layout.prototype.hideTween = function () {
	let that = this;
	let tween = new that.pixiApp.TWEEN.Tween({alpha:1})
	.to({alpha:0}, 300)
	.easing(that.pixiApp.TWEEN.Easing.Quadratic.InOut)
	.onStart(function(){
		compose.hide = true;
	})
	.onUpdate(function(){
		that.pixiApp.app.alpha = this.alpha;
	})
	.onComplete(function(){
		that.pixiApp.app.visible = true;
	}).start();
}

layout.prototype.showTween = function () {
	let that = this;
	let tween = new that.pixiApp.TWEEN.Tween({alpha:0})
	.to({alpha:1}, 300)
	.easing(that.pixiApp.TWEEN.Easing.Quadratic.InOut)
	.onStart(function(){
		that.pixiApp.app.visible = true;
	})
	.onUpdate(function(){
		that.pixiApp.app.alpha = this.alpha;
	})
	.onComplete(function(){
		compose.hide = false;
		that.pixiApp.app.alpha = 1;
		that.pixiApp.app.visible = true;
	}).start();
}


export default layout;