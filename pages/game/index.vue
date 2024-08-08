<template>
	<view class="content">
		<!-- #ifdef MP-WEIXIN -->
		<canvas type="webgl" @touchstart="touchEvent" @touchmove="touchEvent" @touchend="touchEvent"
			@touchcancel="touchEvent" id="croplandCanvas" class="cropland_canvas"></canvas>
		<!-- #endif -->
	</view>
</template>
<script>
	import layout from "./index.js";
	import PIXIApp from "../../common/pixi-app";
	let pixiApp = new PIXIApp();
	let layoutObj = new layout();
	
	export default {
		data() {
			return {
				showPopup: false // 控制弹出层显示的变量
			}
		},
		methods: {
			//#ifdef MP-WEIXIN
			initMp() {
				pixiApp.init("croplandCanvas", layoutObj);
			},
			//#endif

			// 小程序事件绑定至pixi
			touchEvent(e) {
				pixiApp.touchEvent(e);
			}
		},
		mounted() {
			//#ifdef MP-WEIXIN
			this.initMp();
			//#endif
		}
	}
</script>


<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	#croplandCanvas {
		width: 100vw;
		height: 100vh;
		background: #ffffff;
	}
</style>