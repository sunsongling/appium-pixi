<template>
	<view class="content">
		<!-- #ifdef MP-WEIXIN -->
		<canvas type="webgl" @touchstart="touchEvent" @touchmove="touchEvent" @touchend="touchEvent"
			@touchcancel="touchEvent" id="croplandCanvas" class="cropland_canvas"></canvas>
		<!-- #endif -->
		<pop  
		    ref="pop" 
		    direction="below" 
		    :is_close="true" 
		    :is_mask="true" 
		    :width="100"  
		    height="fit-content" 
		    :maskFun="false" 
		    @watchOpen="watchOpen" 
		    @watchClose="watchClose"
		><div>这是我弹窗内的内容</div></pop>
		
		<liu-drag-button @clickBtn="clickBtn">按钮</liu-drag-button>
	</view>
</template>
<script>
	import layout from "./index.js";
	import PIXIApp from "../../common/pixi-app";
	import pop from "@/components/ming-pop/ming-pop.vue";
	let pixiApp = new PIXIApp();
	let layoutObj = new layout();
	
	export default {
		components: {pop},
		data() {
			return {
				showPopup: false // 控制弹出层显示的变量
			}
		},
		methods: {
			initMp() {
				pixiApp.init("croplandCanvas", layoutObj);
				//pixiApp.defineRatio();
			},

			// 小程序事件绑定至pixi
			touchEvent(e) {
				pixiApp.touchEvent(e);
			},
			
			watchOpen() {
				
			},
			watchClose() {
				
			},
			clickBtn() {
				console.log('按钮被点击了')
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
		background: #fff;
	}
</style>