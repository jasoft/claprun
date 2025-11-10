(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function t(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=t(i);fetch(i.href,a)}})();class q{constructor(e={}){this.modelURL=e.modelURL,this.recognizer=null,this.isListening=!1,this.classLabels=[],this.onClapDetected=e.onClapDetected||(()=>{}),this.onStatusChange=e.onStatusChange||(()=>{}),this.onError=e.onError||(()=>{}),this.clapThreshold=e.clapThreshold||.8,this.defaultClapThreshold=this.clapThreshold,this.clapLabel=e.clapLabel||"clap",this.lastClapTime=0,this.clapCooldown=e.clapCooldown||10}async init(){try{console.log("[AudioRecognizer] 开始初始化..."),console.log("[AudioRecognizer] 模型 URL:",this.modelURL),this.updateStatus("正在加载模型...","loading");const e=this.modelURL+"model.json",t=this.modelURL+"metadata.json";return console.log("[AudioRecognizer] Checkpoint URL:",e),console.log("[AudioRecognizer] Metadata URL:",t),this.recognizer=speechCommands.create("BROWSER_FFT",void 0,e,t),console.log("[AudioRecognizer] 识别器已创建，正在加载模型..."),await this.recognizer.ensureModelLoaded(),this.classLabels=this.recognizer.wordLabels(),console.log("[AudioRecognizer] 模型加载成功！"),console.log("[AudioRecognizer] 类别标签:",this.classLabels),console.log("[AudioRecognizer] 拍巴掌标签:",this.clapLabel),console.log("[AudioRecognizer] 置信度阈值:",this.clapThreshold),this.updateStatus("模型加载成功！","ready"),!0}catch(e){return console.error("[AudioRecognizer] 模型加载失败:",e),this.updateStatus("模型加载失败: "+e.message,"error"),this.onError(e),!1}}startListening(){if(!this.recognizer)return console.error("[AudioRecognizer] 识别器未初始化"),!1;try{return console.log("[AudioRecognizer] 开始监听音频..."),this.recognizer.listen(e=>{this.handleAudioResult(e)},{includeSpectrogram:!1,probabilityThreshold:.5,invokeCallbackOnNoiseAndUnknown:!0,overlapFactor:.9}),this.isListening=!0,console.log("[AudioRecognizer] 音频监听已启动"),this.updateStatus("正在监听音频...","ready"),!0}catch(e){return console.error("[AudioRecognizer] 启动监听失败:",e),this.updateStatus("启动监听失败: "+e.message,"error"),this.onError(e),!1}}stopListening(){this.recognizer&&this.isListening&&(this.recognizer.stopListening(),this.isListening=!1,this.updateStatus("已停止监听","ready"))}handleAudioResult(e){const t=e.scores,s=Date.now(),i={};let a=0,l="";for(let r=0;r<this.classLabels.length;r++)i[this.classLabels[r]]=(t[r]*100).toFixed(1)+"%",t[r]>a&&(a=t[r],l=this.classLabels[r]);if(a>.5&&console.log("[AudioRecognizer] 识别结果:",i,"| 最高分:",l,(a*100).toFixed(1)+"%"),s-this.lastClapTime<=this.clapCooldown||a<=this.clapThreshold)return;if(l.toLowerCase().includes("clap")||l.includes("掌声")){this.lastClapTime=s,this.onClapDetected({confidence:a,label:l,timestamp:s}),console.log(`[AudioRecognizer] ✅ 检测到拍巴掌: ${l} (${(a*100).toFixed(1)}%)`);return}for(let r=0;r<this.classLabels.length;r++){const h=this.classLabels[r],n=t[r];if((h.toLowerCase().includes(this.clapLabel.toLowerCase())||h.includes("掌声")||h.includes("clap"))&&n>this.clapThreshold){this.lastClapTime=s,this.onClapDetected({confidence:n,label:h,timestamp:s}),console.log(`[AudioRecognizer] ✅ 检测到拍巴掌: ${h} (${(n*100).toFixed(1)}%)`);return}}}setClapThreshold(e){if(typeof e!="number"||Number.isNaN(e)){console.warn("[AudioRecognizer] 无效的阈值:",e);return}const t=Math.max(0,Math.min(1,e));Math.abs(this.clapThreshold-t)<1e-4||(this.clapThreshold=t,console.log(`[AudioRecognizer] 更新拍巴掌阈值: ${this.clapThreshold.toFixed(2)}`))}resetClapThreshold(){this.setClapThreshold(this.defaultClapThreshold)}updateStatus(e,t="ready"){this.onStatusChange({message:e,type:t})}getLabels(){return this.classLabels}destroy(){this.stopListening(),this.recognizer&&(this.recognizer=null)}}const g={BASE_SPEED:1,MAX_SPEED:10,MIN_SPEED:1,MUSIC_MAX_SPEED:2,MUSIC_SPEED_PROGRESS_THRESHOLD:.75},b={MAX_ACCELERATION:1.3,BASE_FRICTION:.5,AIR_RESISTANCE_FACTOR:.15,ENGINE_BRAKE:.05,LOW_SPEED_FRICTION:.02,HIGH_SPEED_MULTIPLIER:.3,PHYSICS_UPDATE_INTERVAL:50,CLAP_FORCE_DURATION:10,FREQUENCY_WINDOW:1500,CLAP_FORCE_MULTIPLIER:.35,SPEED_HOLD_DURATION:5e3,SPEED_HOLD_ACTIVATION_THRESHOLD:.25},D={LEVEL_MEDIUM:3,LEVEL_HIGH:5,LEVEL_EXTREME:8},C={CHEER_SOUND_URL:"./music/applause-cheer-236786.mp3",MIN_VOLUME:.3,MAX_VOLUME:1,MIN_SPEED_FOR_CHEER:2,BASE_INTERVAL:2e3,BASE_SPEED_FOR_INTERVAL:3,MAX_CONCURRENT_CHEERS:5},N={MUSIC_URL:"./music/legacy-of-brahms-hungarian-dance-no5-fun-background-dance-music-191255.mp3",VOLUME:1},w={ENABLED:!0,PEAK_THRESHOLD:.75,SAMPLES_PER_SECOND:10,FFT_SIZE:1024,SMOOTHING_TIME_CONSTANT:.05,SAMPLE_COOLDOWN_MS:80};class ${constructor(e="gameContainer"){this.config={type:Phaser.AUTO,width:window.innerWidth,height:window.innerHeight,parent:e,backgroundColor:"#0a1026",scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},render:{pixelArt:!1,antialias:!0},physics:{default:"arcade",arcade:{gravity:{y:300},debug:!1}},scene:{preload:()=>this.preload(),create:()=>this.create(),update:()=>this.update()}},this.game=null,this.scene=null,this.dancers=[],this.activeDancerCount=1,this.danceSpeed=1,this.musicSpeed=1,this.isPlaying=!1,this.danceState="idle",this.danceTimer=0,this.danceIntensity=0,this.music=null,this.audioContext=null,this.analyser=null,this.dataArray=null,this.musicLoopTimer=null,this.speedDecayTimer=null,this.background=null,this.floorGlow=null,this.viewportWidth=window.innerWidth,this.viewportHeight=window.innerHeight,this.resizeHandler=null,this.progressRatio=0,this.celebrationParticles=null,this.celebrationEmitter=null,this.celebrationActive=!1,this.shineOverlay=null,this.shineFx=null,this.shineAlphaTween=null,this.shineScanTween=null,this.shineScanBounds={left:0,right:0,y:0}}init(){this.game=new Phaser.Game(this.config)}preload(){const e=this.game&&this.game.scene&&this.game.scene.scenes&&this.game.scene.scenes[0];e&&(e.textures.exists("stage-bg")||e.load.image("stage-bg","images/bg.png"))}create(){const e=this.game.scene.scenes[0];this.scene=e,e.cameras.main.setBackgroundColor("#080d1d"),this.createDancers(e),this.createVisualization(e),this.createCelebration(e),this.createShineEffect(e),this.initAudioContext(),this.applyLayout(e.scale.width,e.scale.height),this.resizeHandler=t=>{this.applyLayout(t.width,t.height)},e.scale.on("resize",this.resizeHandler,this)}createDancers(e){this.scene=e;const t=[{body:16352651,limb:15753591,leg:3096222},{body:8435711,limb:4749521,leg:2037045},{body:16765041,limb:16754255,leg:2907949}],s=this.viewportWidth,i=this.viewportHeight,a=s/2,l=Math.min(s*.16,220),c=i*.6,r=Phaser.Math.Clamp(s/1400,.9,1.4);this.dancers=[a-l,a,a+l].map((h,n)=>{const d=this.buildDancer(e,h,c,t[n%t.length],n);return d.container.visible=n===1,d.isActive=n===1,d.defaultScale=r,d.baseScale=r,d.container.setScale(r),d}),this.activeDancerCount=1}buildDancer(e,t,s,i,a){const l=e.add.container(t,s),c=e.add.circle(0,-130,26,16771028),r=e.add.rectangle(0,-110,34,110,i.body);r.setOrigin(.5,0);const h=e.add.rectangle(-22,-100,16,90,i.limb);h.setOrigin(.5,0);const n=e.add.rectangle(22,-100,16,90,i.limb);n.setOrigin(.5,0);const d=e.add.rectangle(-12,0,18,110,i.leg);d.setOrigin(.5,0);const p=e.add.rectangle(12,0,18,110,i.leg);p.setOrigin(.5,0);const u=e.add.ellipse(0,190,120,26,722194,.3);return h.baseRotation=Phaser.Math.DegToRad(-25),n.baseRotation=Phaser.Math.DegToRad(25),d.baseRotation=Phaser.Math.DegToRad(10),p.baseRotation=Phaser.Math.DegToRad(-10),h.setRotation(h.baseRotation),n.setRotation(n.baseRotation),d.setRotation(d.baseRotation),p.setRotation(p.baseRotation),h.baseY=h.y,n.baseY=n.y,c.baseY=c.y,r.baseY=r.y,l.add([u,d,p,r,h,n,c]),l.setDepth(10+a),{container:l,parts:{head:c,body:r,leftArm:h,rightArm:n,leftLeg:d,rightLeg:p,shadow:u},baseX:t,baseY:s,baseScale:1,defaultScale:1,phaseOffset:a*Math.PI*.5,isActive:!0}}createVisualization(e){this.visualBars=[],this.visualBarCount=36;for(let t=0;t<this.visualBarCount;t++){const s=e.add.rectangle(0,0,10,18,7306239,.85);s.setOrigin(.5,1),s.initialHeight=18,s.baseWidth=10,s.setDepth(-1),this.visualBars.push(s)}console.log("[Game] 音乐可视化条已创建:",this.visualBarCount,"个")}createCelebration(e){if(e){if(!e.textures.exists("confetti-pixel")){const t=e.make.graphics({x:0,y:0,add:!1});t.fillStyle(16777215,1),t.fillCircle(4,4,4),t.generateTexture("confetti-pixel",8,8),t.destroy()}this.celebrationParticles&&(this.celebrationParticles.destroy(),this.celebrationParticles=null,this.celebrationEmitter=null),this.celebrationParticles=e.add.particles("confetti-pixel").setDepth(-2),this.celebrationEmitter=this.celebrationParticles.createEmitter({on:!1,speedX:{min:-180,max:180},speedY:{min:-80,max:220},angle:{min:-15,max:195},gravityY:230,lifespan:{min:2600,max:3400},quantity:32,frequency:70,alpha:{start:1,end:0},scale:{start:6.4,end:1.2},rotate:{min:-260,max:260},tint:[16777215,16774084,16770173,16761593,10475775,12124062,16751493,13413375],blendMode:"SCREEN",emitZone:{type:"random",source:new Phaser.Geom.Rectangle(-e.scale.width*.6,-e.scale.height*.2,e.scale.width*1.2,e.scale.height*1.4)}}),this.celebrationEmitter.stop(),this.celebrationActive=!1}}createShineEffect(e){if(!e)return;const t="celebration-shine",s=e.scale.width,i=e.scale.height;if(!e.textures.exists(t)){const c=e.make.graphics({x:0,y:0,add:!1}),r=512;c.fillStyle(16777215,.9),c.fillRect(0,0,64,r),c.generateTexture(t,64,r),c.destroy()}const a=Math.max(s*.32,220),l=i*1.35;this.shineScanBounds={left:s*.25,right:s*.75,y:i*.46},this.shineOverlay=e.add.image(this.shineScanBounds.left,this.shineScanBounds.y,t),this.shineOverlay.setDepth(80),this.shineOverlay.setBlendMode(Phaser.BlendModes.ADD),this.shineOverlay.setVisible(!1),this.shineOverlay.setAlpha(0),this.shineOverlay.setScrollFactor(0),this.shineOverlay.setDisplaySize(a,l),this.shineOverlay.setAngle(-12),this.shineOverlay.preFX?(this.shineFx=this.shineOverlay.preFX.addShine(.55,.35,3.5,!1),this.shineFx.speed=1.1,this.shineFx.lineWidth=.28,this.shineFx.gradient=4.5,this.shineFx.setActive(!1)):this.shineFx=null}applyLayout(e,t){if(!e||!t||(this.viewportWidth=e,this.viewportHeight=t,!this.scene))return;if(this.background&&(this.background.destroy(),this.background=null),this.scene.textures.exists("stage-bg")){this.background=this.scene.add.image(e/2,t/2,"stage-bg").setDepth(-40);const n=e/this.background.width,d=t/this.background.height,p=Math.max(n,d);this.background.setScale(p)}else{this.scene.textures.exists("stage-fallback")&&this.scene.textures.remove("stage-fallback");const n=this.scene.add.graphics({x:0,y:0});n.fillGradientStyle(1712723,2436975,790825,1251896,1,1,1,1),n.fillRect(0,0,e,t),n.generateTexture("stage-fallback",e,t),n.destroy(),this.background=this.scene.add.image(e/2,t/2,"stage-fallback").setDepth(-40)}const s=Math.max(e*.55,420),i=Math.max(t*.18,160),a=t*.78;this.floorGlow?this.floorGlow.setPosition(e/2,a):(this.floorGlow=this.scene.add.ellipse(e/2,a,s,i,5201407,.18),this.floorGlow.setDepth(-5)),this.floorGlow&&this.floorGlow.setDisplaySize(s,i);const l=e/2,c=Math.min(e*.16,220),r=t*.6,h=Phaser.Math.Clamp(e/1400,.9,1.4);if(this.dancers.forEach((n,d)=>{const p=(d-1)*c;n.baseX=l+p,n.baseY=r,n.defaultScale=h,n.baseScale=h,n.container.setPosition(n.baseX,n.baseY),n.container.setScale(n.baseScale),n.parts&&n.parts.shadow&&n.parts.shadow.setDisplaySize(s*.25,Math.max(i*.25,40))}),this.visualBars&&this.visualBars.length){const n=e*.75,d=(e-n)/2,p=n/this.visualBars.length,u=Math.max(16,t*.08);this.visualBars.forEach((f,A)=>{f.baseWidth=Math.max(10,p*.45),f.initialHeight=u,f.setPosition(d+p*A+p/2,t*.94),f.setDisplaySize(f.baseWidth,f.initialHeight)})}if(this.celebrationEmitter){const n=new Phaser.Geom.Rectangle(-e*.6,-t*.2,e*1.2,t*1.4);this.celebrationEmitter.setPosition(l,t*.08),this.celebrationEmitter.setEmitZone({type:"random",source:n})}if(this.shineOverlay){const n=Math.max(e*.32,220),d=t*1.35;this.shineScanBounds={left:e*.25,right:e*.75,y:t*.46},this.shineOverlay.setDisplaySize(n,d),this.shineOverlay.setPosition(this.shineScanBounds.left,this.shineScanBounds.y),this.shineOverlay.setAngle(-12),this.shineScanTween&&(this.stopShineScanTween(),this.celebrationActive&&this.startShineScanTween())}this.setActiveDancerCount(this.activeDancerCount)}initAudioContext(){this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.dataArray=new Uint8Array(this.analyser.frequencyBinCount))}update(){this.isPlaying&&(this.updateDanceAnimation(),this.updateVisualization())}updateDanceAnimation(){if(!this.dancers.length)return;this.danceTimer+=this.danceSpeed*.6;const e=.025*this.danceSpeed,t=.12;this.dancers.forEach((s,i)=>{if(!s.isActive||!s.container.visible)return;const a=(this.danceTimer+i*25)*e+s.phaseOffset,l=Math.sin(a),c=Math.sin(a*.8+Math.PI/3),r=Math.abs(Math.sin(a*.55))*(.8+.4*this.danceIntensity),h=Math.sin(a*.5+s.phaseOffset*.5),n=Phaser.Math.Clamp((h+1)/2*this.danceIntensity,0,1),d=Phaser.Math.DegToRad(30+20*this.danceIntensity)*c,p=Phaser.Math.DegToRad(110)*n,u=Phaser.Math.DegToRad(10)*Math.sin(a*1.6),f=Phaser.Math.DegToRad(32+12*this.danceIntensity)*l*(.6+n*.4),A=Phaser.Math.DegToRad(8)*Math.sin(a*.6)*this.danceIntensity,O=Phaser.Math.Linear(0,-24,n)-r*10;s.parts.leftArm.setRotation(s.parts.leftArm.baseRotation-p+d+u),s.parts.rightArm.setRotation(s.parts.rightArm.baseRotation+p-d+u),s.parts.leftArm.y=s.parts.leftArm.baseY+Phaser.Math.Linear(0,-58,n),s.parts.rightArm.y=s.parts.rightArm.baseY+Phaser.Math.Linear(0,-58,n),s.parts.leftLeg.setRotation(s.parts.leftLeg.baseRotation-f),s.parts.rightLeg.setRotation(s.parts.rightLeg.baseRotation+f),s.parts.body.setRotation(A),s.parts.head.setRotation(A*.65),s.parts.body.y=s.parts.body.baseY+O,s.parts.head.y=s.parts.head.baseY+O*.7,s.container.setRotation(Math.sin(a*.4)*Phaser.Math.DegToRad(5)*this.danceIntensity);const X=Math.sin(a*.9+Math.PI/4);s.container.setScale(s.baseScale*(1+.16*this.danceIntensity*X-.05*n));const W=r*24+n*18;s.container.y=s.baseY-W-this.danceIntensity*4;const Y=Math.sin(a*.4+s.phaseOffset)*this.danceIntensity*12;s.container.x=s.baseX+Y,s.parts.shadow.setScale(1+.24*this.danceIntensity*(1-Math.abs(Math.sin(a))),1+.12*this.danceIntensity*Math.abs(Math.sin(a)))}),this.danceIntensity=Math.max(t,this.danceIntensity-.004)}updateCrowdMode(e=0){if(!this.dancers.length)return;this.progressRatio=e;const t=e>.5?3:1;t!==this.activeDancerCount&&this.setActiveDancerCount(t)}setActiveDancerCount(e){this.dancers.length&&(this.activeDancerCount=e,this.dancers.forEach((t,s)=>{if(e===3?!0:s===1){const a=e===3?s===1?1:.88:1;t.baseScale=t.defaultScale*a,t.isActive||(t.parts.leftArm.setRotation(t.parts.leftArm.baseRotation),t.parts.rightArm.setRotation(t.parts.rightArm.baseRotation),t.parts.leftLeg.setRotation(t.parts.leftLeg.baseRotation),t.parts.rightLeg.setRotation(t.parts.rightLeg.baseRotation),t.parts.leftArm.y=t.parts.leftArm.baseY,t.parts.rightArm.y=t.parts.rightArm.baseY,t.parts.body.y=t.parts.body.baseY,t.parts.head.y=t.parts.head.baseY,t.parts.shadow.setScale(1,1)),t.container.visible=!0,t.container.alpha=s===1?1:e===3?0:1,t.container.x=t.baseX,t.container.y=t.baseY,t.container.setScale(t.baseScale),t.container.setRotation(0),t.isActive=!0,e===3&&s!==1&&this.scene&&this.scene.tweens.add({targets:t.container,alpha:1,duration:280,ease:"Sine.easeOut"})}else t.container.visible&&this.scene?this.scene.tweens.add({targets:t.container,alpha:0,duration:200,ease:"Sine.easeIn",onComplete:()=>{t.container.visible=!1,t.container.alpha=1}}):(t.container.visible=!1,t.container.alpha=1),t.baseScale=t.defaultScale,t.isActive=!1}))}updateVisualization(){if(this.visualBars)for(let e=0;e<this.visualBars.length;e++){const t=this.visualBars[e],i=(Math.sin((this.danceTimer+e)*.12*this.danceSpeed)+1)*.5+this.danceIntensity*.6,a=t.initialHeight*i*(.8+this.musicSpeed*.2),l=Math.max(16,this.viewportHeight*.05),c=Math.max(50,this.viewportHeight*.14),r=Phaser.Math.Clamp(a,l,c);t.setDisplaySize(t.baseWidth,r)}}onClap(e){const t=Math.max(.3,e.confidence*1.2);this.danceIntensity=Math.min(1,this.danceIntensity+t),this.danceSpeed=Math.min(3,this.danceSpeed+.2);const s=this.musicSpeed;this.musicSpeed=Math.min(2,this.musicSpeed+.1),Math.abs(this.musicSpeed-s)>.01&&this.startBackgroundMusic(),this.resetSpeedDecay(),e.confidence>.85&&console.log("[Game] 拍巴掌事件:",{confidence:(e.confidence*100).toFixed(1)+"%",danceIntensity:this.danceIntensity.toFixed(2),danceSpeed:this.danceSpeed.toFixed(2),musicSpeed:this.musicSpeed.toFixed(2)})}resetSpeedDecay(){this.speedDecayTimer&&clearInterval(this.speedDecayTimer),this.speedDecayTimer=setInterval(()=>{this.danceSpeed=Math.max(1,this.danceSpeed-.01),this.musicSpeed=Math.max(1,this.musicSpeed-.005),this.danceSpeed<=1&&this.musicSpeed<=1&&clearInterval(this.speedDecayTimer)},100)}start(){this.isPlaying=!0,this.danceSpeed=1,this.musicSpeed=1,this.danceIntensity=.2,this.danceTimer=0,this.startBackgroundMusic(),console.log("[Game] 游戏开始，初始舞蹈强度:",this.danceIntensity)}stop(){this.isPlaying=!1,this.danceIntensity=0,this.danceSpeed=1,this.musicSpeed=1,this.speedDecayTimer&&clearInterval(this.speedDecayTimer),this.musicLoopTimer&&clearInterval(this.musicLoopTimer)}startBackgroundMusic(){this.musicLoopTimer&&clearInterval(this.musicLoopTimer);const e=1200/this.musicSpeed;this.musicLoopTimer=setInterval(()=>{this.isPlaying&&this.playBackgroundMusic()},e),this.playBackgroundMusic(),console.log("[Game] 背景音乐已启动，循环间隔:",e.toFixed(0),"ms")}playBackgroundMusic(){}getDanceSpeed(){return this.danceSpeed}getMusicSpeed(){return this.musicSpeed}setSpeedFromIntensity(e,t=0){this.danceSpeed=e,e<=5?this.musicSpeed=1+(e-1)/4:this.musicSpeed=2;const s=9,i=e-1;this.danceIntensity=.2+i/s*.8,this.updateCrowdMode(t),this.setCelebrationActive(t>=1)}setCelebrationActive(e){e&&!this.celebrationActive?(this.celebrationEmitter&&this.celebrationEmitter.start(),this.enableShineEffect()):!e&&this.celebrationActive&&(this.celebrationEmitter&&this.celebrationEmitter.stop(),this.disableShineEffect()),this.celebrationActive=e}startShineScanTween(){!this.scene||!this.shineOverlay||(this.stopShineScanTween(),this.shineOverlay.setPosition(this.shineScanBounds.left,this.shineScanBounds.y),this.shineOverlay.setAngle(-12),this.shineScanTween=this.scene.tweens.timeline({targets:this.shineOverlay,loop:-1,tweens:[{x:this.shineScanBounds.right,angle:18,duration:2e3,ease:"Sine.easeInOut"},{x:this.shineScanBounds.left,angle:-18,duration:2e3,ease:"Sine.easeInOut"}]}))}stopShineScanTween(){this.shineScanTween&&(this.shineScanTween.stop(),this.shineScanTween.destroy(),this.shineScanTween=null)}enableShineEffect(){!this.shineOverlay||!this.scene||(this.shineAlphaTween&&this.shineAlphaTween.stop(),this.shineOverlay.setVisible(!0),this.startShineScanTween(),this.shineFx&&this.shineFx.setActive(!0),this.shineAlphaTween=this.scene.tweens.add({targets:this.shineOverlay,alpha:.55,duration:420,ease:"Sine.easeOut"}))}disableShineEffect(){!this.shineOverlay||!this.scene||(this.shineAlphaTween&&this.shineAlphaTween.stop(),this.shineFx&&this.shineFx.setActive(!1),this.stopShineScanTween(),this.shineAlphaTween=this.scene.tweens.add({targets:this.shineOverlay,alpha:0,duration:480,ease:"Sine.easeIn",onComplete:()=>{this.shineOverlay&&(this.shineOverlay.setVisible(!1),this.shineOverlay.setPosition(this.shineScanBounds.left,this.shineScanBounds.y),this.shineOverlay.setAngle(-12))}}))}destroy(){this.scene&&this.resizeHandler&&(this.scene.scale.off("resize",this.resizeHandler,this),this.resizeHandler=null),this.background&&(this.background.destroy(),this.background=null),this.floorGlow&&(this.floorGlow.destroy(),this.floorGlow=null),this.celebrationParticles&&(this.celebrationParticles.destroy(),this.celebrationParticles=null,this.celebrationEmitter=null,this.celebrationActive=!1),this.shineAlphaTween&&(this.shineAlphaTween.stop(),this.shineAlphaTween=null),this.stopShineScanTween(),this.shineOverlay&&(this.shineOverlay.destroy(),this.shineOverlay=null,this.shineFx=null),this.game&&(this.game.destroy(!0),this.game=null),this.scene=null,this.speedDecayTimer&&clearInterval(this.speedDecayTimer)}}class K{constructor(e={}){this.baseSpeed=e.baseSpeed||g.BASE_SPEED,this.maxSpeed=e.maxSpeed||g.MAX_SPEED,this.minSpeed=e.minSpeed||g.MIN_SPEED,this.currentSpeed=this.baseSpeed,this.currentAcceleration=0,this.throttle=0,this.clapHistory=[],this.clapForces=[],this.maxAcceleration=e.maxAcceleration||b.MAX_ACCELERATION,this.baseFriction=e.baseFriction||b.BASE_FRICTION,this.airResistanceFactor=e.airResistanceFactor||b.AIR_RESISTANCE_FACTOR,this.engineBrake=e.engineBrake||b.ENGINE_BRAKE,this.lowSpeedFriction=e.lowSpeedFriction||b.LOW_SPEED_FRICTION,this.highSpeedMultiplier=e.highSpeedMultiplier||b.HIGH_SPEED_MULTIPLIER,this.physicsUpdateInterval=e.physicsUpdateInterval||b.PHYSICS_UPDATE_INTERVAL,this.clapForceDuration=e.clapForceDuration||b.CLAP_FORCE_DURATION,this.frequencyWindow=e.frequencyWindow||b.FREQUENCY_WINDOW,this.clapForceMultiplier=e.clapForceMultiplier||b.CLAP_FORCE_MULTIPLIER,this.speedHoldDuration=e.speedHoldDuration||b.SPEED_HOLD_DURATION,this.speedHoldActivationThreshold=e.speedHoldActivationThreshold||b.SPEED_HOLD_ACTIVATION_THRESHOLD,this.physicsTimer=null,this.lastUpdateTime=Date.now(),this.onSpeedChange=e.onSpeedChange||(()=>{}),this.speedHoldActive=!1,this.speedHoldUntil=0,this.lastSpeed=this.currentSpeed}recordClap(e){const t=Date.now();this.clapHistory.push(t),this.clapHistory=this.clapHistory.filter(i=>t-i<this.frequencyWindow);const s=e.confidence*this.clapForceMultiplier;this.clapForces.push({timestamp:t,force:s,endTime:t+this.clapForceDuration}),this.startPhysicsSimulation(),console.log("[ClapIntensity] 鼓掌事件:",{force:s.toFixed(3),currentSpeed:this.currentSpeed.toFixed(2)+"x",activeForces:this.clapForces.length})}startPhysicsSimulation(){this.physicsTimer||(this.physicsTimer=setInterval(()=>{this.updatePhysics()},this.physicsUpdateInterval),console.log("[ClapIntensity] 物理引擎已启动"))}updatePhysics(){const e=Date.now(),t=(e-this.lastUpdateTime)/1e3;this.lastUpdateTime=e,this.speedHoldActive&&e>=this.speedHoldUntil&&(this.speedHoldActive=!1);const i=this.clapHistory.filter(u=>e-u<this.frequencyWindow).length/(this.frequencyWindow/1e3);this.throttle=Math.min(1,i/3);let a=0;this.clapForces=this.clapForces.filter(u=>e<u.endTime?(a+=u.force,!0):!1);let c=this.throttle*this.maxAcceleration+a,r=this.calculateNonLinearResistance(),h=this.throttle<.1?this.engineBrake:0;this.speedHoldActive&&(h=0),r+=h,this.speedHoldActive&&(r=0),this.currentAcceleration=c-r,this.currentSpeed+=this.currentAcceleration*t,this.currentSpeed=Math.max(this.minSpeed,Math.min(this.maxSpeed,this.currentSpeed)),this.speedHoldActive&&(this.currentSpeed=this.maxSpeed);const n=Math.max(0,this.maxSpeed-this.speedHoldActivationThreshold);if(!this.speedHoldActive&&this.lastSpeed<n&&this.currentSpeed>=n&&this.activateSpeedHold(e),Math.abs(this.currentSpeed-this.baseSpeed)<.01&&this.throttle<.01&&this.clapForces.length===0){this.currentSpeed=this.baseSpeed,this.stopPhysicsSimulation();return}const p=Math.min(1,(this.currentSpeed-this.baseSpeed)/(this.maxSpeed-this.baseSpeed));this.onSpeedChange({speed:this.currentSpeed,acceleration:this.currentAcceleration,clapFrequency:i,progressRatio:p,throttle:this.throttle,isSpeedHoldActive:this.speedHoldActive}),this.lastSpeed=this.currentSpeed}stopPhysicsSimulation(){this.physicsTimer&&(clearInterval(this.physicsTimer),this.physicsTimer=null,console.log("[ClapIntensity] 物理引擎已停止"))}getSpeed(){return this.currentSpeed}getAcceleration(){return this.currentAcceleration}calculateNonLinearResistance(){const e=this.currentSpeed/this.maxSpeed;let t=this.baseFriction,s=this.airResistanceFactor*Math.pow(e,2),i;e>.7?i=this.lowSpeedFriction+(e-.7)*this.highSpeedMultiplier:i=this.lowSpeedFriction;let a=t+s+i;return a=Math.min(a,this.currentSpeed*.5),a}getThrottle(){return this.throttle}getClapFrequency(){const e=Date.now();return this.clapHistory.filter(s=>e-s<this.frequencyWindow).length/(this.frequencyWindow/1e3)}reset(){this.stopPhysicsSimulation(),this.currentSpeed=this.baseSpeed,this.currentAcceleration=0,this.throttle=0,this.clapHistory=[],this.clapForces=[],this.lastUpdateTime=Date.now(),this.speedHoldActive=!1,this.speedHoldUntil=0,this.lastSpeed=this.currentSpeed,console.log("[ClapIntensity] 状态已重置")}activateSpeedHold(e){this.speedHoldActive=!0,this.speedHoldUntil=e+this.speedHoldDuration,this.currentSpeed=this.maxSpeed}destroy(){this.stopPhysicsSimulation(),console.log("[ClapIntensity] 已销毁")}}class Z{constructor(e={}){this.audioElement=null,this.audioContext=null,this.sourceNode=null,this.gainNode=null,this.musicUrl=e.musicUrl||N.MUSIC_URL,this.volume=e.volume||N.VOLUME,this.loop=e.loop!==!1,this.isPlaying=!1,this.currentSpeed=g.BASE_SPEED,this.minSpeed=e.minSpeed||g.MIN_SPEED,this.maxSpeed=e.maxSpeed||g.MAX_SPEED,this.onPlay=e.onPlay||(()=>{}),this.onPause=e.onPause||(()=>{}),this.onSpeedChange=e.onSpeedChange||(()=>{})}async init(){try{console.log("[MP3Player] 初始化播放器..."),this.audioElement=new Audio,this.audioElement.src=this.musicUrl,this.audioElement.loop=this.loop,this.audioElement.volume=this.volume,this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext)),this.audioContext.state==="suspended"&&await this.audioContext.resume(),this.gainNode=this.audioContext.createGain(),this.gainNode.gain.value=this.volume;try{this.sourceNode=this.audioContext.createMediaElementSource(this.audioElement),this.sourceNode.connect(this.gainNode),this.gainNode.connect(this.audioContext.destination)}catch(e){console.warn("[MP3Player] 源节点创建警告:",e.message)}return console.log("[MP3Player] 播放器初始化完成"),!0}catch(e){return console.error("[MP3Player] 初始化失败:",e),!1}}play(){try{this.audioElement&&!this.isPlaying&&(this.audioContext.state==="suspended"&&this.audioContext.resume(),this.audioElement.play(),this.isPlaying=!0,this.onPlay(),console.log("[MP3Player] 开始播放"))}catch(e){console.error("[MP3Player] 播放失败:",e)}}pause(){try{this.audioElement&&this.isPlaying&&(this.audioElement.pause(),this.isPlaying=!1,this.onPause(),console.log("[MP3Player] 暂停播放"))}catch(e){console.error("[MP3Player] 暂停失败:",e)}}stop(){try{this.audioElement&&(this.audioElement.pause(),this.audioElement.currentTime=0,this.isPlaying=!1,this.currentSpeed=1,this.onPause(),console.log("[MP3Player] 停止播放"))}catch(e){console.error("[MP3Player] 停止失败:",e)}}setSpeed(e){try{const t=Math.max(this.minSpeed,Math.min(this.maxSpeed,e));this.audioElement&&Math.abs(t-this.currentSpeed)>.01&&(this.audioElement.playbackRate=t,this.currentSpeed=t,this.onSpeedChange({speed:t}),console.log("[MP3Player] 播放速度已改变:",t.toFixed(2)+"x"))}catch(t){console.error("[MP3Player] 设置速度失败:",t)}}getSpeed(){return this.currentSpeed}setVolume(e){try{const t=Math.max(0,Math.min(1,e));this.audioElement&&(this.audioElement.volume=t),this.gainNode&&(this.gainNode.gain.value=t),this.volume=t,console.log("[MP3Player] 音量已改变:",(t*100).toFixed(0)+"%")}catch(t){console.error("[MP3Player] 设置音量失败:",t)}}getVolume(){return this.volume}getCurrentTime(){return this.audioElement?this.audioElement.currentTime:0}getDuration(){return this.audioElement?this.audioElement.duration:0}destroy(){try{this.audioElement&&(this.audioElement.pause(),this.audioElement.src="",this.audioElement=null),this.sourceNode&&(this.sourceNode.disconnect(),this.sourceNode=null),this.gainNode&&(this.gainNode.disconnect(),this.gainNode=null),this.audioContext&&(this.audioContext.close(),this.audioContext=null),console.log("[MP3Player] 播放器已销毁")}catch(e){console.error("[MP3Player] 销毁失败:",e)}}}class j{constructor(e={}){this.containerId=e.containerId||"intensityContainer",this.container=null,this.progressBar=null,this.speedDisplay=null,this.frequencyDisplay=null,this.motivationText=null,this.intensityLevel=null,this.progressBarBg=null,this.emotionBadge=null,this.highIntensityActive=!1,this.fullGlowActive=!1,this.progressBoostActive=!1,this.minSpeed=e.minSpeed||g.MIN_SPEED,this.maxSpeed=e.maxSpeed||g.MAX_SPEED,this.baseSpeed=e.baseSpeed||g.BASE_SPEED,this.motivations=["🎉 开始鼓掌吧！","👏 继续加油！","🔥 越来越快了！","⚡ 太棒了！","🚀 飞起来了！","💥 爆炸性的节奏！","🌟 你是明星！","🎵 节奏感十足！","🎊 太嗨了！","👑 鼓掌之王！"],this.currentMotivationIndex=0}init(){try{return console.log("[IntensityVisualizer] 初始化可视化..."),this.container=document.getElementById(this.containerId),this.container?(this.container.innerHTML=`
                <div class="intensity-overlay">
                    <div class="progress-wrapper">
                        <div class="progress-track">
                            <div class="progress-bar-fill" id="progressBar"></div>
                            <div class="progress-bar-glow" id="progressGlow"></div>
                        </div>
                        <div class="emotion-row">
                            <span class="level-badge" id="intensityLevel">基础</span>
                            <span class="intensity-emotion" id="intensityEmotion">🔥 热度待命</span>
                        </div>
                    </div>

                    <div class="overlay-top">
                        <div class="stat-panel">
                            <span class="panel-title">舞台状态</span>
                            <div class="stat-grid">
                                <div class="stat-row">
                                    <span class="label">舞蹈速度</span>
                                    <span class="value" id="danceSpeedDisplay">1.00x</span>
                                </div>
                                <div class="stat-row">
                                    <span class="label">音乐速度</span>
                                    <span class="value" id="musicSpeedDisplay">1.00x</span>
                                </div>
                                <div class="stat-row">
                                    <span class="label">鼓掌频率</span>
                                    <span class="value" id="frequencyDisplay">0.0 次/秒</span>
                                </div>
                                <div class="stat-row">
                                    <span class="label">鼓掌次数</span>
                                    <span class="value" id="clapCounterDisplay">0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="overlay-bottom">
                        <div class="motivation-text" id="motivationText">🎉 开始鼓掌吧！</div>
                    </div>
                </div>
            `,this.progressBar=document.getElementById("progressBar"),this.progressGlow=document.getElementById("progressGlow"),this.danceSpeedDisplay=document.getElementById("danceSpeedDisplay"),this.musicSpeedDisplay=document.getElementById("musicSpeedDisplay"),this.frequencyDisplay=document.getElementById("frequencyDisplay"),this.motivationText=document.getElementById("motivationText"),this.intensityLevel=document.getElementById("intensityLevel"),this.progressBarBg=this.container.querySelector(".progress-track"),this.emotionBadge=document.getElementById("intensityEmotion"),this.addStyles(),this.intensityLevel&&(this.intensityLevel.style.background="linear-gradient(135deg, rgba(128, 255, 214, 0.85), rgba(64, 196, 255, 0.85))",this.intensityLevel.style.color="#101327"),this.progressBar&&(this.progressBar.style.width="0%"),this.progressGlow&&(this.progressGlow.style.width="0%",this.progressGlow.style.opacity=0),console.log("[IntensityVisualizer] 可视化初始化完成"),!0):(console.error("[IntensityVisualizer] 容器不存在:",this.containerId),!1)}catch(e){return console.error("[IntensityVisualizer] 初始化失败:",e),!1}}addStyles(){const e=document.createElement("style");e.textContent=`
            .intensity-overlay {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: clamp(24px, 5vw, 80px);
                pointer-events: none;
                color: #f4f6ff;
                font-family: "Orbitron", "Arial", sans-serif;
            }

            .progress-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                margin-top: clamp(32px, 8vh, 80px);
            }

            .overlay-top {
                display: flex;
                align-items: flex-start;
                gap: 24px;
                margin-top: clamp(16px, 4vh, 48px);
            }

            .progress-track {
                position: relative;
                width: min(80vw, 1100px);
                height: 52px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 999px;
                overflow: hidden;
                box-shadow: 0 24px 56px rgba(12, 16, 48, 0.55);
                border: 1px solid rgba(255, 255, 255, 0.1);
                --scale-x: 1;
                --scale-y: 1;
                transform: scale(var(--scale-x), var(--scale-y));
                transition: transform 0.28s ease, box-shadow 0.3s ease, border-color 0.3s ease;
            }

            .progress-bar-fill {
                position: absolute;
                inset: 0;
                width: 0%;
                background: linear-gradient(90deg,
                    #42f1ff 0%,
                    #42ffb6 18%,
                    #ffe66b 48%,
                    #ff934a 70%,
                    #ff3370 100%);
                border-radius: inherit;
                transition: width 0.12s ease-out, filter 0.3s ease;
                box-shadow: 0 20px 46px rgba(255, 133, 142, 0.45);
            }

            .progress-bar-glow {
                position: absolute;
                inset: 0;
                width: 0%;
                background: radial-gradient(circle at center, rgba(255, 255, 255, 0.6), transparent 70%);
                filter: blur(18px);
                opacity: 0.65;
                transition: width 0.12s ease-out, opacity 0.12s ease-out;
            }

            .progress-track.power-mode {
                --scale-x: 1.08;
                --scale-y: 1.3;
                box-shadow: 0 36px 76px rgba(255, 120, 90, 0.65);
                border-color: rgba(255, 240, 200, 0.65);
            }

            .progress-bar-fill.power-mode {
                filter: brightness(1.2) saturate(1.18);
            }

            .progress-track.boost-mode {
                --scale-x: 1.06;
                --scale-y: 1.28;
                box-shadow: 0 32px 72px rgba(250, 242, 220, 0.6);
                border-color: rgba(255, 248, 230, 0.65);
            }

            .progress-track.power-mode.boost-mode,
            .progress-track.power-mode.rhythm-surge {
                --scale-x: 1.1;
                --scale-y: 1.36;
            }

            .progress-bar-fill.boost-mode {
                filter: brightness(1.45) saturate(1.35);
                box-shadow: 0 28px 64px rgba(255, 255, 255, 0.55), 0 24px 52px rgba(255, 173, 102, 0.45);
            }

            .progress-bar-glow.boost-mode {
                opacity: 0.85;
            }

            .progress-bar-fill.power-mode.boost-mode,
            .progress-bar-fill.power-mode.rhythm-surge {
                filter: brightness(1.8) saturate(1.45);
                box-shadow: 0 36px 74px rgba(255, 255, 255, 0.7), 0 28px 64px rgba(255, 173, 102, 0.6);
            }

            .progress-track.rhythm-surge {
                --scale-x: 1.08;
                --scale-y: 1.32;
                box-shadow: 0 34px 90px rgba(66, 241, 255, 0.75);
                border-color: rgba(66, 241, 255, 0.85);
                animation: surgePulse 0.9s ease-in-out infinite;
            }

            .progress-bar-fill.rhythm-surge {
                filter: brightness(1.75) saturate(1.4);
                box-shadow: 0 34px 64px rgba(255, 255, 255, 0.65), 0 28px 58px rgba(66, 241, 255, 0.7);
                animation: surgeFlow 1.2s linear infinite;
            }

            .progress-bar-glow.rhythm-surge {
                opacity: 0.95 !important;
                animation: surgeGlow 0.9s ease-in-out infinite;
            }

            .emotion-row {
                display: flex;
                align-items: center;
                gap: 18px;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                font-size: 0.95em;
            }

            .level-badge {
                padding: 10px 18px;
                border-radius: 999px;
                background: linear-gradient(135deg, rgba(255, 194, 82, 0.8), rgba(255, 87, 51, 0.8));
                color: #1b1025;
                font-weight: 800;
                box-shadow: 0 12px 26px rgba(255, 136, 77, 0.45);
            }

            .intensity-emotion {
                font-size: 1.1em;
                font-weight: 700;
                color: #ffe48b;
                text-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
                transition: transform 0.25s ease, color 0.25s ease;
            }

            .intensity-emotion.level-rise {
                color: #ffd95a;
            }

            .intensity-emotion.level-burn {
                color: #ffb74d;
                transform: scale(1.04);
            }

            .intensity-emotion.level-explode {
                color: #ffe066;
                transform: scale(1.12);
                animation: emotionSwell 0.8s ease-in-out infinite;
            }

            .stat-panel {
                background: linear-gradient(145deg, rgba(10, 14, 40, 0.7), rgba(24, 28, 68, 0.55));
                padding: 18px 22px;
                border-radius: 20px;
                box-shadow: 0 18px 38px rgba(7, 9, 32, 0.55);
                backdrop-filter: blur(16px);
                min-width: 220px;
            }

            .panel-title {
                font-size: 0.7em;
                letter-spacing: 0.4em;
                text-transform: uppercase;
                color: rgba(196, 201, 255, 0.75);
                display: block;
                margin-bottom: 14px;
            }

            .stat-grid {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .stat-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 24px;
            }

            .stat-row .label {
                font-size: 0.68em;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: rgba(198, 204, 255, 0.6);
            }

            .stat-row .value {
                font-size: 1.05em;
                font-weight: 700;
                letter-spacing: 0.05em;
                color: #f9fbff;
                text-shadow: 0 2px 8px rgba(11, 16, 48, 0.5);
            }

            .overlay-bottom {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                margin-bottom: clamp(24px, 6vh, 60px);
            }

            .motivation-text {
                text-align: center;
                font-size: 1.05em;
                font-weight: 600;
                color: #ffe082;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
                animation: pulse 0.5s ease-out;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            @keyframes pulse {
                0% { transform: scale(0.85); opacity: 0; }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); opacity: 1; }
            }

            @keyframes emotionSwell {
                0% { transform: scale(1.05); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1.05); }
            }

            body.shake-active {
                animation: screenShake 0.54s ease-in-out infinite;
                overflow: hidden;
            }

            @keyframes screenShake {
                0% { transform: translate(0px, 0px) rotate(0deg); }
                20% { transform: translate(-5px, 3px) rotate(-0.6deg); }
                40% { transform: translate(5px, -3px) rotate(0.7deg); }
                60% { transform: translate(-3px, -5px) rotate(-0.4deg); }
                80% { transform: translate(4px, 2px) rotate(0.5deg); }
                100% { transform: translate(0px, 0px) rotate(0deg); }
            }

            @keyframes surgeFlow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            @keyframes surgePulse {
                0% { box-shadow: 0 24px 48px rgba(66, 241, 255, 0.35); }
                50% { box-shadow: 0 30px 60px rgba(66, 241, 255, 0.6); }
                100% { box-shadow: 0 24px 48px rgba(66, 241, 255, 0.35); }
            }

            @keyframes surgeGlow {
                0% { opacity: 0.65; }
                40% { opacity: 0.95; }
                100% { opacity: 0.7; }
            }

            @media (max-width: 640px) {
                .intensity-overlay {
                    padding: 24px;
                    gap: 16px;
                }

                .overlay-top {
                    margin-top: 72px;
                }

                .progress-track {
                    width: 92vw;
                }

                .emotion-row {
                    flex-direction: column;
                    gap: 12px;
                }
            }
        `,document.head.appendChild(e)}handleProgressEffects(e){if(isNaN(e))return;const t=.75,s=.7,i=1,a=.98,l=e>=t;l!==this.progressBoostActive&&this.setProgressBoost(l),e>=t?this.highIntensityActive||this.activateHighIntensity():this.highIntensityActive&&e<s&&this.deactivateHighIntensity(),e>=i?this.fullGlowActive||this.activateFullGlow():this.fullGlowActive&&e<a&&this.deactivateFullGlow()}activateHighIntensity(){this.highIntensityActive=!0,document.body&&!document.body.classList.contains("shake-active")&&document.body.classList.add("shake-active")}deactivateHighIntensity(){this.highIntensityActive=!1,document.body&&document.body.classList.remove("shake-active")}activateFullGlow(){this.fullGlowActive=!0,this.progressBarBg&&this.progressBarBg.classList.add("power-mode"),this.progressBar&&this.progressBar.classList.add("power-mode"),this.progressGlow&&(this.progressGlow.style.opacity=.95)}deactivateFullGlow(){this.fullGlowActive=!1,this.progressBarBg&&this.progressBarBg.classList.remove("power-mode"),this.progressBar&&this.progressBar.classList.remove("power-mode"),this.progressGlow&&(this.progressGlow.style.opacity="")}setProgressBoost(e){this.progressBoostActive=e,this.progressBarBg&&this.progressBarBg.classList.toggle("boost-mode",e),this.progressBar&&this.progressBar.classList.toggle("boost-mode",e),this.progressGlow&&this.progressGlow.classList.toggle("boost-mode",e)}update(e){const{speed:t,acceleration:s,clapFrequency:i,musicSpeed:a,danceSpeed:l,progressRatio:c}=e,r=Number.isFinite(l)?l:Number.isFinite(t)?t:this.baseSpeed;let h=0;if(c!==void 0)h=Math.max(0,Math.min(100,c*100));else{const u=r-this.baseSpeed,f=this.maxSpeed-this.baseSpeed;h=Math.max(0,Math.min(100,u/f*100))}const n=h/100;if(this.progressBar&&(this.progressBar.style.width=h+"%"),this.progressGlow){const u=Math.max(0,h-4);this.progressGlow.style.width=u+"%";const f=n>.15?.85:n>0?.4:0,A=this.fullGlowActive?.95:f;this.progressGlow.style.opacity=A}if(this.danceSpeedDisplay&&(this.danceSpeedDisplay.textContent=r.toFixed(2)+"x"),this.musicSpeedDisplay){const u=Number.isFinite(a)?a:Math.min(2,Math.max(1,r*.3)),f=Number.isFinite(u)?u:1;this.musicSpeedDisplay.textContent=f.toFixed(2)+"x"}const d=Number.isFinite(i)?i:0;this.frequencyDisplay&&(this.frequencyDisplay.textContent=d.toFixed(1)+" 次/秒");const p=d>=3;if(this.handleProgressEffects(n),this.progressBarBg){const u=p||this.fullGlowActive;this.progressBarBg.classList.toggle("rhythm-surge",u)}if(this.progressBar){const u=p||this.fullGlowActive;this.progressBar.classList.toggle("rhythm-surge",u)}this.updateEmotionBadge(n),this.updateIntensityLevel(r),this.updateMotivation(r,i)}updateIntensityLevel(e){const t=Number.isFinite(e)?e:this.baseSpeed;let s="基础",i="linear-gradient(135deg, rgba(128, 255, 214, 0.85), rgba(64, 196, 255, 0.85))",a="#101327";t<=this.baseSpeed?(s="基础",i="linear-gradient(135deg, rgba(128, 255, 214, 0.85), rgba(64, 196, 255, 0.85))",a="#101327"):t>=D.LEVEL_EXTREME?(s="极限",i="linear-gradient(135deg, rgba(255, 120, 180, 0.9), rgba(255, 68, 131, 0.9))",a="#1b0c1d"):t>=D.LEVEL_HIGH?(s="高烈度",i="linear-gradient(135deg, rgba(255, 150, 92, 0.9), rgba(255, 82, 64, 0.9))",a="#1a0d12"):t>=D.LEVEL_MEDIUM&&(s="中等",i="linear-gradient(135deg, rgba(255, 220, 120, 0.9), rgba(255, 186, 90, 0.9))",a="#20130a"),this.intensityLevel&&(this.intensityLevel.textContent=s,this.intensityLevel.style.background=i,this.intensityLevel.style.color=a)}updateEmotionBadge(e){if(!this.emotionBadge)return;let t="🔥 热度待命",s="";e>=1?(t="💥 爆燃极限！",s="level-explode"):e>=.75?(t="🔥 火力全开！",s="level-burn"):e>=.45?(t="⚡ 节奏上升！",s="level-rise"):e>=.2&&(t="🎶 节奏渐起",s=""),this.emotionBadge.textContent=t,this.emotionBadge.classList.remove("level-rise","level-burn","level-explode"),s&&this.emotionBadge.classList.add(s)}updateMotivation(e,t){if(!this.motivationText)return;let s=this.motivations[0];e<=this.baseSpeed?s="🎉 开始鼓掌吧！":t>5?s=this.motivations[Math.floor(Math.random()*this.motivations.length)]:e>=D.LEVEL_EXTREME?s=this.motivations[Math.floor(Math.random()*(this.motivations.length-2))+2]:e>=D.LEVEL_HIGH&&(s=this.motivations[Math.floor(Math.random()*(this.motivations.length-4))+1]),this.motivationText.textContent!==s&&(this.motivationText.textContent=s,this.motivationText.style.animation="none",setTimeout(()=>{this.motivationText.style.animation="pulse 0.5s ease-out"},10))}reset(){this.setProgressBoost(!1),this.progressBar&&(this.progressBar.style.width="0%",this.progressBar.classList.remove("power-mode","rhythm-surge","boost-mode")),this.progressGlow&&(this.progressGlow.style.width="0%",this.progressGlow.style.opacity=0,this.progressGlow.classList.remove("boost-mode","rhythm-surge")),this.danceSpeedDisplay&&(this.danceSpeedDisplay.textContent=this.baseSpeed.toFixed(1)+"x"),this.musicSpeedDisplay&&(this.musicSpeedDisplay.textContent=this.baseSpeed.toFixed(1)+"x"),this.frequencyDisplay&&(this.frequencyDisplay.textContent="0 次/秒");const e=document.getElementById("clapCounterDisplay");e&&(e.textContent="0"),this.intensityLevel&&(this.intensityLevel.textContent="基础",this.intensityLevel.style.background="linear-gradient(135deg, rgba(128, 255, 214, 0.85), rgba(64, 196, 255, 0.85))",this.intensityLevel.style.color="#101327"),this.progressBarBg&&this.progressBarBg.classList.remove("power-mode","rhythm-surge","boost-mode"),this.emotionBadge&&(this.emotionBadge.textContent="🔥 热度待命",this.emotionBadge.classList.remove("level-rise","level-burn","level-explode")),this.motivationText&&(this.motivationText.textContent="🎉 开始鼓掌吧！"),this.deactivateFullGlow(),this.deactivateHighIntensity()}}class Q{constructor(e={}){this.cheerSoundUrl=e.cheerSoundUrl||C.CHEER_SOUND_URL,this.minVolume=e.minVolume||C.MIN_VOLUME,this.maxVolume=e.maxVolume||C.MAX_VOLUME,this.minSpeedForCheer=e.minSpeedForCheer||C.MIN_SPEED_FOR_CHEER,this.baseInterval=e.baseInterval||C.BASE_INTERVAL,this.baseSpeedForInterval=e.baseSpeedForInterval||C.BASE_SPEED_FOR_INTERVAL,this.maxConcurrentCheers=e.maxConcurrentCheers||C.MAX_CONCURRENT_CHEERS,this.currentSpeed=g.BASE_SPEED,this.cheerAudioPool=[],this.lastCheerTime=0,this.cheerTimer=null,this.isEnabled=!0}init(){try{console.log("[CheerManager] 初始化欢呼声管理器...");for(let e=0;e<this.maxConcurrentCheers;e++){const t=new Audio;t.src=this.cheerSoundUrl,t.preload="auto",this.cheerAudioPool.push({audio:t,isPlaying:!1})}return console.log("[CheerManager] 欢呼声管理器初始化完成"),!0}catch(e){return console.error("[CheerManager] 初始化失败:",e),!1}}updateSpeed(e){this.currentSpeed=e,e<this.minSpeedForCheer?(this.stopAllCheers(),this.cheerTimer&&(clearInterval(this.cheerTimer),this.cheerTimer=null)):this.cheerTimer||this.startCheerTimer()}startCheerTimer(){this.cheerTimer=setInterval(()=>{this.currentSpeed>=this.minSpeedForCheer&&this.isEnabled&&this.playCheer()},this.calculateCheerInterval())}calculateCheerInterval(){const e=this.currentSpeed/this.baseSpeedForInterval,t=Math.max(300,this.baseInterval/e);return Math.round(t)}playCheer(){const e=Date.now(),t=this.cheerAudioPool.find(s=>!s.isPlaying);if(t)try{const s=this.calculateVolume();t.audio.volume=s,t.audio.currentTime=0,t.isPlaying=!0;const i=t.audio.play();i!==void 0&&i.then(()=>{}).catch(a=>{console.warn("[CheerManager] 播放欢呼声失败:",a),t.isPlaying=!1}),t.audio.onended=()=>{t.isPlaying=!1},this.lastCheerTime=e}catch(s){console.error("[CheerManager] 播放欢呼声出错:",s)}}calculateVolume(){const e=g.MAX_SPEED-this.minSpeedForCheer,s=Math.max(0,this.currentSpeed-this.minSpeedForCheer)/e,i=this.minVolume+(this.maxVolume-this.minVolume)*s;return Math.min(this.maxVolume,Math.max(this.minVolume,i))}stopAllCheers(){this.cheerAudioPool.forEach(e=>{try{e.audio.pause(),e.audio.currentTime=0,e.isPlaying=!1}catch(t){console.warn("[CheerManager] 停止欢呼声失败:",t)}})}setEnabled(e){this.isEnabled=e,e||this.stopAllCheers()}destroy(){this.stopAllCheers(),this.cheerTimer&&(clearInterval(this.cheerTimer),this.cheerTimer=null),this.cheerAudioPool=[]}}class J{constructor(e={}){this.enabled=e.enabled??w.ENABLED,this.onLoudClap=e.onLoudClap||(()=>{}),this.peakThreshold=e.peakThreshold??w.PEAK_THRESHOLD;const t=e.samplesPerSecond??w.SAMPLES_PER_SECOND;this.samplesPerSecond=t,this.sampleInterval=1e3/this.samplesPerSecond,this.cooldown=e.cooldown??w.SAMPLE_COOLDOWN_MS,this.fftSize=e.fftSize??w.FFT_SIZE,this.smoothing=e.smoothing??w.SMOOTHING_TIME_CONSTANT,this.audioContext=null,this.mediaStream=null,this.mediaSource=null,this.analyserNode=null,this.timeDomainData=null,this.intervalId=null,this.lastTriggerTime=0,this.initialized=!1,this.sampleCount=0,this.lastDebugLogTime=0,this.debugLogInterval=e.debugLogInterval??1e3}async init(){if(!this.enabled)return console.warn("[LoudnessDetector] 响度检测未启用"),!1;if(this.initialized)return!0;if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return console.warn("[LoudnessDetector] 当前浏览器不支持 getUserMedia"),!1;try{return this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.mediaStream=await navigator.mediaDevices.getUserMedia({audio:!0}),this.mediaSource=this.audioContext.createMediaStreamSource(this.mediaStream),this.analyserNode=this.audioContext.createAnalyser(),this.analyserNode.fftSize=this.fftSize,this.analyserNode.smoothingTimeConstant=this.smoothing,this.timeDomainData=new Uint8Array(this.analyserNode.fftSize),this.mediaSource.connect(this.analyserNode),this.initialized=!0,console.log("[LoudnessDetector] 初始化完成，采样间隔",this.sampleInterval,"ms"),!0}catch(e){return console.error("[LoudnessDetector] 初始化失败:",e),this.destroy(),!1}}async start(){return this.enabled?await this.init()?this.intervalId?(console.log("[LoudnessDetector] 检测已在运行，跳过重复启动"),!0):(this.sampleCount=0,this.lastDebugLogTime=0,this.intervalId=setInterval(()=>this.checkLoudness(),this.sampleInterval),console.log(`[LoudnessDetector] 已开始响度检测，峰值阈值 ${(this.peakThreshold*100).toFixed(0)}%，采样间隔 ${this.sampleInterval.toFixed(0)}ms`),!0):(console.warn("[LoudnessDetector] start 初始化失败，无法进入检测循环"),!1):(console.warn("[LoudnessDetector] start 被调用但未启用"),!1)}stop(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=null,console.log("[LoudnessDetector] 已停止响度检测"))}checkLoudness(){if(!this.analyserNode||!this.timeDomainData){console.warn("[LoudnessDetector] 检测节点未准备好，跳过本次采样");return}this.analyserNode.getByteTimeDomainData(this.timeDomainData);let e=0,t=0;for(let c=0;c<this.timeDomainData.length;c++){const r=this.timeDomainData[c]-128;e+=r*r,Math.abs(r)>t&&(t=Math.abs(r))}const s=Math.sqrt(e/this.timeDomainData.length)/128,i=t/128,a=Date.now();this.sampleCount++;const l=i>=this.peakThreshold;if((!this.lastDebugLogTime||a-this.lastDebugLogTime>=this.debugLogInterval)&&(this.lastDebugLogTime=a,console.log(`[LoudnessDetector] 采样#${this.sampleCount} RMS ${(s*100).toFixed(1)}%，峰值 ${(i*100).toFixed(1)}%`)),l&&a-this.lastTriggerTime>=this.cooldown){this.lastTriggerTime=a;const c=Math.max(i,s);this.onLoudClap({confidence:Math.min(1,c),timestamp:a,source:"loudness",label:"loudness",peakRatio:i}),console.log(`[LoudnessDetector] ✅ 峰值触发: RMS ${(s*100).toFixed(1)}%，峰值 ${(i*100).toFixed(1)}%`)}}destroy(){this.stop(),this.mediaStream&&(this.mediaStream.getTracks().forEach(e=>e.stop()),this.mediaStream=null),this.audioContext&&(this.audioContext.close(),this.audioContext=null),this.mediaSource=null,this.analyserNode=null,this.timeDomainData=null,this.initialized=!1,console.log("[LoudnessDetector] 资源已释放")}}let S=null,x=null,M=null,E=null,L=null,I=null,P=0,H=!1,T=null,R=!1;const y={clap:!0,loudness:w.ENABLED};let B=!1,m={panel:null,button:null,clapToggle:null,loudnessToggle:null,clapStatus:null,loudnessStatus:null};async function ee(){try{if(console.log("[Main] 开始加载模型..."),v("正在加载模型...","loading"),S=new q({modelURL:"https://teachablemachine.withgoogle.com/models/Z4siyrF6g/",clapThreshold:.8,clapLabel:"clap",clapCooldown:200,onClapDetected:s=>{console.log("[Main] 收到拍巴掌事件"),F(s)},onStatusChange:s=>{console.log("[Main] 状态变化:",s.message),v(s.message,s.type)},onError:s=>{console.error("[Main] 音频识别错误:",s),v("错误: "+s.message,"error")}}),console.log("[Main] 音频识别器已创建，开始初始化模型..."),!await S.init())throw new Error("模型加载失败");console.log("[Main] 模型加载成功！"),v("✅ 模型加载成功！点击【开始游戏】按钮开始","ready");const e=document.getElementById("startBtn");e&&(e.disabled=!1,e.onclick=te);const t=document.getElementById("clapTestBtn");t&&(t.disabled=!1,t.onclick=se)}catch(o){console.error("[Main] 模型加载失败:",o),v("模型加载失败: "+o.message,"error")}}async function te(){if(H){k();return}try{console.log("[Main] 用户点击开始，初始化游戏组件..."),v("正在初始化游戏...","loading");const o=document.getElementById("startBtn");o&&(o.disabled=!0),console.log("[Main] 创建游戏..."),x=new $("gameContainer"),x.init(),console.log("[Main] 初始化鼓掌烈度计算..."),M=new K({baseSpeed:g.BASE_SPEED,maxSpeed:g.MAX_SPEED,minSpeed:g.MIN_SPEED,onSpeedChange:i=>{let a=1;if(i.progressRatio!==void 0){const l=g.MUSIC_SPEED_PROGRESS_THRESHOLD;i.progressRatio<=l?a=1+(g.MUSIC_MAX_SPEED-1)*(i.progressRatio/l):a=g.MUSIC_MAX_SPEED}else a=Math.min(g.MUSIC_MAX_SPEED,Math.max(1,i.speed*.3));S&&(typeof i.progressRatio=="number"&&i.progressRatio>.5?S.setClapThreshold(.7):S.resetClapThreshold()),x&&x.setSpeedFromIntensity(i.speed,i.progressRatio),E&&E.setSpeed(a),I&&I.updateSpeed(i.speed),L&&L.update({...i,musicSpeed:a,danceSpeed:i.speed}),console.log(`[Main] 速度更新 - 舞蹈: ${i.speed.toFixed(2)}x, 音乐: ${a.toFixed(2)}x, 进度: ${(i.progressRatio||0).toFixed(2)}`)}}),console.log("[Main] 初始化 MP3 播放器..."),E=new Z({maxSpeed:g.MUSIC_MAX_SPEED}),await E.init()||console.warn("[Main] MP3 播放器初始化失败，将使用合成音乐"),console.log("[Main] 初始化烈度可视化..."),L=new j({containerId:"intensityContainer",baseSpeed:g.BASE_SPEED,maxSpeed:g.MAX_SPEED,minSpeed:g.MIN_SPEED}),L.init()||console.warn("[Main] 烈度可视化初始化失败"),console.log("[Main] 初始化欢呼声管理器..."),I=new Q,I.init()||console.warn("[Main] 欢呼声管理器初始化失败"),console.log("[Main] 初始化响度检测器，配置:",w),T=new J({enabled:!0,onLoudClap:i=>{F({...i,isLoudnessDetection:!0})}}),console.log("[Main] 响度检测器实例创建完成"),console.log("[Main] 游戏组件初始化完成！"),H=!0,k()}catch(o){console.error("[Main] 初始化失败:",o),v("初始化失败: "+o.message,"error");const e=document.getElementById("startBtn");e&&(e.disabled=!1)}}async function k(){try{if(console.log("[Main] 开始游戏..."),!S||!x){console.error("[Main] 应用未初始化"),v("应用未初始化","error");return}P=0,U(),console.log("[Main] 启动游戏..."),x.start(),R=!0,M&&M.reset(),L&&L.reset(),E&&E.play(),await _({strict:!0}),console.log("[Main] 游戏已启动，等待拍巴掌..."),v("🎉 游戏已开始！尽情拍巴掌吧！","ready");const o=document.getElementById("startBtn");o&&(o.textContent="🔄 重新开始",o.disabled=!1);const e=document.getElementById("clapTestBtn");e&&(e.style.display="inline-block")}catch(o){R=!1,x&&x.stop(),E&&E.stop(),I&&I.stopAllCheers(),await _(),console.error("[Main] 启动游戏失败:",o),v("启动游戏失败: "+o.message,"error")}}function se(){console.log("[Main] 模拟鼓掌调试");const o={confidence:.95,timestamp:Date.now(),isSimulated:!0};F(o);const e=document.getElementById("clapTestBtn");e&&(e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)"},150)),console.log("[Main] 模拟鼓掌完成")}function F(o){const e=typeof o.confidence=="number"?o.confidence:1;o.confidence=e;const t=o.isLoudnessDetection?"(响度)":"(识别)";P++,console.log("[Main] 拍巴掌计数:",P,"置信度:",o.confidence.toFixed(2),o.isSimulated?"(模拟)":"(真实)",t),M&&M.recordClap(o),x&&x.onClap(o),U()}function U(){const o=document.getElementById("clapCounterDisplay");o&&(o.textContent=P)}function v(o,e="ready"){const t=document.getElementById("status");t&&(t.textContent=o,t.className="status "+e)}function z(o){B=o,m.panel&&m.panel.classList.toggle("visible",o)}function V(){m.clapStatus&&(m.clapStatus.textContent=y.clap?"已启用":"已关闭",m.clapStatus.classList.toggle("active",y.clap)),m.loudnessStatus&&(m.loudnessStatus.textContent=y.loudness?"已启用":"已关闭",m.loudnessStatus.classList.toggle("active",y.loudness)),m.clapToggle&&m.clapToggle.checked!==y.clap&&(m.clapToggle.checked=y.clap),m.loudnessToggle&&m.loudnessToggle.checked!==y.loudness&&(m.loudnessToggle.checked=y.loudness)}async function G(o,e){y[o]=e,V(),console.log(`[Main] ${o==="clap"?"掌声识别":"响度识别"}${e?"已启用":"已关闭"}`),await _()}async function _(o={}){const{strict:e=!1}=o;if(!R){S&&S.stopListening(),T&&T.stop();return}if(S)if(y.clap)if(S.startListening())console.log("[Main] 掌声识别已启用并开始监听");else{const s="无法启动音频监听";if(e)throw new Error(s);console.warn("[Main] "+s)}else S.stopListening(),console.log("[Main] 掌声识别已关闭，停止监听");if(T)if(y.loudness)if(console.log("[Main] 尝试启动响度检测..."),await T.start())console.log("[Main] 响度检测器运行中");else{if(e)throw new Error("无法启动响度检测器");console.warn("[Main] 响度检测器启动失败")}else T.stop(),console.log("[Main] 响度识别已关闭")}function ie(){m={panel:document.getElementById("configPanel"),button:document.getElementById("configBtn"),clapToggle:document.getElementById("clapDetectionToggle"),loudnessToggle:document.getElementById("loudnessDetectionToggle"),clapStatus:document.getElementById("clapDetectionStatus"),loudnessStatus:document.getElementById("loudnessDetectionStatus")};const{panel:o,button:e,clapToggle:t,loudnessToggle:s}=m;if(!o||!e||!t||!s){console.warn("[Main] 侦测配置 UI 初始化失败，缺少必要元素");return}t.checked=y.clap,s.checked=y.loudness,V(),e.addEventListener("click",i=>{i.stopPropagation(),z(!B)}),o.addEventListener("click",i=>{i.stopPropagation()}),document.addEventListener("click",()=>{B&&z(!1)}),t.addEventListener("change",async i=>{await G("clap",i.target.checked)}),s.addEventListener("change",async i=>{await G("loudness",i.target.checked)})}document.addEventListener("DOMContentLoaded",()=>{ie(),ee()});window.addEventListener("beforeunload",()=>{S&&S.destroy(),x&&x.destroy(),E&&E.destroy(),M&&M.destroy()});
