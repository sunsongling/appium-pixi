<template>
	<view class="content">
		<!-- #ifdef MP-WEIXIN -->
		<canvas type="webgl" @touchstart="touchEvent" @touchmove="touchEvent" @touchend="touchEvent"
			@touchcancel="touchEvent" id="croplandCanvas" class="cropland_canvas"></canvas>
		<!-- #endif -->
		<!-- #ifdef H5 -->
		<div ref="game"></div>
		<!-- #endif -->
		<div @click="reset">重置转盘数据</div>
	</view>
</template>
<script>
	//#ifdef MP-WEIXIN 
	import {
		createPIXI
	} from "../../../common/pixi.miniprogram";
	const unsafeEval = require("../../../common/unsafeEval");
	const installSpine = require("../../../common/pixi-spine");
	const installAnimate = require("../../../common/pixi-animate");
	//#endif 
	//#ifdef H5 
	import * as PIXI from 'pixi.js'
	//#endif 
	import {
		detailRes,
		getP
	} from './data';
	let detailData = JSON.parse(detailRes.content); //游戏活动
	let zpbg = '../../static/table/bg.png'; //大转盘背景图片
	let lipin = '../../static/table/gold0.png'; //礼品图片
	let btn = '../../static/table/spin.png'; //按钮图片
	let imgbg = '../../static/table/bg.jpg'; //背景图片
	let successPri = JSON.parse(getP.content); //获奖信息

	//#ifdef MP-WEIXIN 
	var PIXI = {};
	// let selfThis;
	let canvasObj;
	let animationFrame;
	//#endif 

	var app = {}
	var info = wx.getSystemInfoSync();
	var sw = info.screenWidth; //获取屏幕宽高
	var sh = info.windowHeight; //获取屏幕宽高
	var ratio = info.devicePixelRatio;
	var devicePixelRatio = sw / 375;
	let zIndex = 20;
	console.log(devicePixelRatio, "===devicePixelRatio")

	//#ifdef H5 
	app = new PIXI.Application({
		backgroundAlpha: 0,
		antialias: true,
		autoDensity: true,
		width: sw,
		height: sh,
		resolution: info.devicePixelRatio,
	});
	//#endif 

	/* 创建container */
	let containerObj = {
		container: {},
		container2: {},
		container3: {},
		container4: {},
	}

	function createContainerCom(
		con,
		x = app.screen.width / 2,
		y = app.screen.height / 2
	) {
		containerObj[con] = new PIXI.Container();
		containerObj[con].x = x;
		containerObj[con].y = y;
		containerObj[con].sortableChildren = true;
		//#ifdef H5
		app.stage.addChild(containerObj[con]);
		//#endif  
	}

	/* 创建背景 */
	function createBg() {
		// 创建背景精灵
		const background = PIXI.Sprite.from(imgbg);
		// 将背景精灵添加到舞台上
		containerObj['container2'].addChild(background);
		// 设置背景图片的宽高
		background.width = sw;
		background.height = sh;
	}
	/* 创建转盘 */
	function createZp() {
		const zpbgAprite = PIXI.Sprite.from(zpbg);
		containerObj['container3'].addChild(zpbgAprite);
		zpbgAprite.anchor.set(0.5);
		zpbgAprite.x = 0;
		zpbgAprite.y = 0;
		let ratio = (devicePixelRatio / 2);
		zpbgAprite.scale.x = ratio;
		zpbgAprite.scale.y = ratio;
		zpbgAprite.zIndex = zIndex;
	}
	/* 转盘转动数据 */
	let acceleration = 0.01; // 加速度
	let speed = 0.1; //初始速度
	let playStart = false; //转盘是否转动
	let angleSuccess = 0; //转动角度
	/* 重置转盘数据 */
	function reset() {
		acceleration = 0.01; // 加速度
		speed = 0.1;
		playStart = false;
		angleSuccess = 0;
		containerObj.container.angle = 0;
	}
	/* 放置按钮图片 */
	function createBtn() {
		const btnAprite = PIXI.Sprite.from(btn);
		btnAprite.interactive = true; // 启用交互
		btnAprite.eventMode = 'static';
		btnAprite.anchor.set(0.5);
		containerObj['container4'].addChild(btnAprite);
		btnAprite.x = 0; // sw / 2;
		btnAprite.y = 0; //sh / 2 -8*1/devicePixelRatio;
		console.log(btnAprite, "====btnAprite")
		let scale = (devicePixelRatio / 2);
		btnAprite.scale.x = scale;
		btnAprite.scale.y = scale;
		btnAprite.zIndex = 5000;
		btnAprite.on('tap', function(event) { //手机端用tap，pc用click
			console.log("按钮点击事件")
			if (playStart) {
				return;
			}
			event.stopPropagation(); // 阻止事件继续冒泡
			let findIndex = detailData.prizes.findIndex((item) => item.id == successPri.prizeId);
			let angle = (Math.PI * 2) / detailData.prizes.length;
			//转6圈
			angleSuccess = 360 * 6 - (findIndex * angle * 180 / Math.PI + 90 + angle * 90 / Math.PI);
			console.log(app, "====appp")
			// #ifdef H5
			app.ticker.add(animate2);
			//#endif
			//#ifdef MP-WEIXIN
			function test() {
				animate2();
				animationFrame = canvasObj.requestAnimationFrame(test);
				app.render(containerObj.container2);
			}
			test()
			//#endif

		})
	}
	/* 转动 */
	let mxSpeed = 0;

	function animate2() {
		// 可选：当速度达到一定阈值时，减小加速度，实现变速效果
		if (containerObj.container.angle > (angleSuccess / 2)) {
			mxSpeed = speed > mxSpeed ? speed : mxSpeed;
			acceleration = -0.015;
			if (speed < mxSpeed / 1.5) {
				acceleration = -0.007
			}
		}
		if (speed <= 0.01 && acceleration < 0) {
			acceleration = 0;
			speed = 0.01
		}
		speed = speed + acceleration;
		if ((containerObj.container.angle + speed) > angleSuccess) {
			playStart = false;
			//#ifdef MP-WEIXIN
			animationFrame && canvasObj.cancelAnimationFrame(animationFrame);
			//#endif
			//#ifdef H5
			app.ticker.remove(animate2);
			//#endif
			return;
		}
		containerObj.container.angle += speed;
	}
	/* 创建奖项 */
	let startAngle = 0,
		endAngle = 0;

	function createPrizes() {
		let prizes = detailData.prizes;
		let angle = (Math.PI * 2) / prizes.length; //弧度
		prizes.map((item, index) => {
			if (index < 10) {
				let name = item.name;
				let pic = item.pic;
				let id = item.id;

				startAngle = endAngle;
				endAngle = startAngle + angle;

				//扇形背景
				let ctx = new PIXI.Graphics();
				let color = (index % 2 === 0) ? '0xFFF4D6' : '0xFFFFFF';
				ctx.beginFill(color);
				console.log(280 * (devicePixelRatio / 2))
				ctx.arc(0, 0, 280 * (devicePixelRatio / 2), startAngle, endAngle);
				ctx.lineTo(0, 0);
				ctx.endFill();
				containerObj.container.addChild(ctx);
				ctx.zIndex = 20 + index;

				//文字
				const text = new PIXI.Text(name, {
					fontFamily: 'Arial',
					fontSize: 14,
					fill: 0xE5302F,
					autoDensity: true,
					antialias: true
				});
				text.anchor.set(0.5);
				text.angle = (180 * ((angle / 2) + startAngle)) / Math.PI + 90; //文字旋转角度
				containerObj.container.addChild(text);
				text.zIndex = 2 * zIndex + index; //文字层级
				//文字位置
				let centerX = (200 * (devicePixelRatio / 2)) * Math.cos(((endAngle - startAngle) / 2) +
					startAngle);
				let centerY = (200 * (devicePixelRatio / 2)) * Math.sin(((endAngle - startAngle) / 2) +
					startAngle);
				text.x = centerX;
				text.y = centerY;

				//礼物图片
				const liwuAprite = PIXI.Sprite.from(lipin);
				containerObj.container.addChild(liwuAprite);
				liwuAprite.anchor.set(0.5);
				liwuAprite.angle = (180 * ((angle / 2) + startAngle)) / Math.PI + 90
				let liwuX = (240 * (devicePixelRatio / 2)) * Math.cos((angle / 2) + startAngle);
				let liwuY = (240 * (devicePixelRatio / 2)) * Math.sin((angle / 2) + startAngle);
				liwuAprite.x = liwuX;
				liwuAprite.y = liwuY;
				liwuAprite.scale.x = devicePixelRatio / 2.5;
				liwuAprite.scale.y = devicePixelRatio / 2.5;
				liwuAprite.zIndex = 3 * zIndex + index;
			}
		})

	}

	export default {
		methods: {
			//#ifdef MP-WEIXIN
			initMp() {
				// 获取 canvas
				wx.createSelectorQuery().select('#croplandCanvas').fields({
					node: true,
					size: true
				}).exec((res) => {
					const canvas = res[0].node;
					canvasObj = canvas;
					// canvasInstance = canvas;
					// 设置canvas实际宽高
					canvas.width = sw / ratio;
					canvas.height = sh / ratio;
					// PIXI 初始化 -----start
					PIXI = createPIXI(canvas, sw)

					unsafeEval(PIXI); //适配PIXI里面使用的eval函数
					installSpine(PIXI); //注入Spine库
					installAnimate(PIXI); //注入Animate库

					// 通过view把小程序的canvas传入
					app = PIXI.autoDetectRenderer({
						width: sw,
						height: sh,
						'view': canvas,
						antialias: true,
						autoDensity: true,
						resolution: ratio,
						backgroundAlpha: 0
					});
					createContainerCom('container2', 0, 0);
					createContainerCom('container3')
					createContainerCom('container', sw / 2, sh / 2 - 8 * 1 / devicePixelRatio)
					createContainerCom('container4')
					createBg();
					createZp();
					createPrizes();
					createBtn();
					containerObj.container2.addChild(containerObj.container3);
					containerObj.container2.addChild(containerObj.container);
					containerObj.container2.addChild(containerObj.container4);

					function animate() {
						canvas.requestAnimationFrame(animate);
						app.render(containerObj.container2);
					}
					animate();
				})
			},
			//#endif
			//#ifdef H5
			initH5() {
				this.$nextTick(() => {
					//开始
					this.$refs.game.appendChild(app.view);
					createContainerCom('container2', 0, 0)
					createContainerCom('container3')
					createContainerCom('container', sw / 2, sh / 2 - 8 * 1 / devicePixelRatio)
					createContainerCom('container4')
					createBg();
					createZp();
					createPrizes();
					createBtn();
				})
			},
			//#endif
			//#ifdef MP-WEIXIN
			// 小程序事件绑定至pixi
			touchEvent(e) {
				PIXI.dispatchEvent(e)
			},
			//#endif
			/* 重置转盘数据 */
			reset() {
				acceleration = 0.01; // 加速度
				speed = 0.1;
				playStart = false;
				angleSuccess = 0;
				containerObj.container.angle = 0;
			}
		},
		mounted() {
			//#ifdef MP-WEIXIN
			this.initMp();
			//#endif
			//#ifdef H5
			this.initH5();
			//#endif
			// selfThis=this;
		}
	}
</script>


<style>
	#croplandCanvas {
		width: 100vw;
		height: 100vh;
		background: #fff;
	}
</style>