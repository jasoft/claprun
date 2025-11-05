(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function t(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=t(i);fetch(i.href,a)}})();class G{constructor(e={}){this.modelURL=e.modelURL||"https://teachablemachine.withgoogle.com/models/7xwSK62zg/",this.recognizer=null,this.isListening=!1,this.classLabels=[],this.onClapDetected=e.onClapDetected||(()=>{}),this.onStatusChange=e.onStatusChange||(()=>{}),this.onError=e.onError||(()=>{}),this.clapThreshold=e.clapThreshold||.8,this.clapLabel=e.clapLabel||"clap",this.lastClapTime=0,this.clapCooldown=e.clapCooldown||10}async init(){try{console.log("[AudioRecognizer] 开始初始化..."),console.log("[AudioRecognizer] 模型 URL:",this.modelURL),this.updateStatus("正在加载模型...","loading");const e=this.modelURL+"model.json",t=this.modelURL+"metadata.json";return console.log("[AudioRecognizer] Checkpoint URL:",e),console.log("[AudioRecognizer] Metadata URL:",t),this.recognizer=speechCommands.create("BROWSER_FFT",void 0,e,t),console.log("[AudioRecognizer] 识别器已创建，正在加载模型..."),await this.recognizer.ensureModelLoaded(),this.classLabels=this.recognizer.wordLabels(),console.log("[AudioRecognizer] 模型加载成功！"),console.log("[AudioRecognizer] 类别标签:",this.classLabels),console.log("[AudioRecognizer] 拍巴掌标签:",this.clapLabel),console.log("[AudioRecognizer] 置信度阈值:",this.clapThreshold),this.updateStatus("模型加载成功！","ready"),!0}catch(e){return console.error("[AudioRecognizer] 模型加载失败:",e),this.updateStatus("模型加载失败: "+e.message,"error"),this.onError(e),!1}}startListening(){if(!this.recognizer)return console.error("[AudioRecognizer] 识别器未初始化"),!1;try{return console.log("[AudioRecognizer] 开始监听音频..."),this.recognizer.listen(e=>{this.handleAudioResult(e)},{includeSpectrogram:!1,probabilityThreshold:.5,invokeCallbackOnNoiseAndUnknown:!0,overlapFactor:.8}),this.isListening=!0,console.log("[AudioRecognizer] 音频监听已启动"),this.updateStatus("正在监听音频...","ready"),!0}catch(e){return console.error("[AudioRecognizer] 启动监听失败:",e),this.updateStatus("启动监听失败: "+e.message,"error"),this.onError(e),!1}}stopListening(){this.recognizer&&this.isListening&&(this.recognizer.stopListening(),this.isListening=!1,this.updateStatus("已停止监听","ready"))}handleAudioResult(e){const t=e.scores,s=Date.now(),i={};let a=0,r="";for(let n=0;n<this.classLabels.length;n++)i[this.classLabels[n]]=(t[n]*100).toFixed(1)+"%",t[n]>a&&(a=t[n],r=this.classLabels[n]);if(a>.5&&console.log("[AudioRecognizer] 识别结果:",i,"| 最高分:",r,(a*100).toFixed(1)+"%"),s-this.lastClapTime<=this.clapCooldown||a<=this.clapThreshold)return;if(r.toLowerCase().includes("clap")||r.includes("掌声")){this.lastClapTime=s,this.onClapDetected({confidence:a,label:r,timestamp:s}),console.log(`[AudioRecognizer] ✅ 检测到拍巴掌: ${r} (${(a*100).toFixed(1)}%)`);return}for(let n=0;n<this.classLabels.length;n++){const h=this.classLabels[n],o=t[n];if((h.toLowerCase().includes(this.clapLabel.toLowerCase())||h.includes("掌声")||h.includes("clap"))&&o>this.clapThreshold){this.lastClapTime=s,this.onClapDetected({confidence:o,label:h,timestamp:s}),console.log(`[AudioRecognizer] ✅ 检测到拍巴掌: ${h} (${(o*100).toFixed(1)}%)`);return}}}updateStatus(e,t="ready"){this.onStatusChange({message:e,type:t})}getLabels(){return this.classLabels}destroy(){this.stopListening(),this.recognizer&&(this.recognizer=null)}}const d={BASE_SPEED:1,MAX_SPEED:10,MIN_SPEED:1,MUSIC_MAX_SPEED:2,MUSIC_SPEED_PROGRESS_THRESHOLD:.75},f={MAX_ACCELERATION:2,BASE_FRICTION:1,AIR_RESISTANCE_FACTOR:.15,ENGINE_BRAKE:.05,LOW_SPEED_FRICTION:.02,HIGH_SPEED_MULTIPLIER:.3,PHYSICS_UPDATE_INTERVAL:50,CLAP_FORCE_DURATION:10,FREQUENCY_WINDOW:1e3,CLAP_FORCE_MULTIPLIER:.5},C={LEVEL_MEDIUM:3,LEVEL_HIGH:5,LEVEL_EXTREME:8},x={CHEER_SOUND_URL:"./music/applause-cheer-236786.mp3",MIN_VOLUME:.3,MAX_VOLUME:1,MIN_SPEED_FOR_CHEER:2,BASE_INTERVAL:2e3,BASE_SPEED_FOR_INTERVAL:3,MAX_CONCURRENT_CHEERS:5},L={MUSIC_URL:"./music/legacy-of-brahms-hungarian-dance-no5-fun-background-dance-music-191255.mp3",VOLUME:.5};class k{constructor(e="gameContainer"){this.config={type:Phaser.AUTO,width:window.innerWidth,height:window.innerHeight,parent:e,backgroundColor:"#0a1026",scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},render:{pixelArt:!1,antialias:!0},physics:{default:"arcade",arcade:{gravity:{y:300},debug:!1}},scene:{preload:()=>this.preload(),create:()=>this.create(),update:()=>this.update()}},this.game=null,this.scene=null,this.dancers=[],this.activeDancerCount=1,this.danceSpeed=1,this.musicSpeed=1,this.isPlaying=!1,this.danceState="idle",this.danceTimer=0,this.danceIntensity=0,this.music=null,this.audioContext=null,this.analyser=null,this.dataArray=null,this.musicLoopTimer=null,this.speedDecayTimer=null,this.background=null,this.floorGlow=null,this.viewportWidth=window.innerWidth,this.viewportHeight=window.innerHeight,this.resizeHandler=null,this.progressRatio=0,this.celebrationParticles=null,this.celebrationEmitter=null,this.celebrationActive=!1}init(){this.game=new Phaser.Game(this.config)}preload(){const e=this.game&&this.game.scene&&this.game.scene.scenes&&this.game.scene.scenes[0];e&&(e.textures.exists("stage-bg")||e.load.image("stage-bg","images/bg.png"))}create(){const e=this.game.scene.scenes[0];this.scene=e,e.cameras.main.setBackgroundColor("#080d1d"),this.createDancers(e),this.createVisualization(e),this.createCelebration(e),this.initAudioContext(),this.applyLayout(e.scale.width,e.scale.height),this.resizeHandler=t=>{this.applyLayout(t.width,t.height)},e.scale.on("resize",this.resizeHandler,this)}createDancers(e){this.scene=e;const t=[{body:16352651,limb:15753591,leg:3096222},{body:8435711,limb:4749521,leg:2037045},{body:16765041,limb:16754255,leg:2907949}],s=this.viewportWidth,i=this.viewportHeight,a=s/2,r=Math.min(s*.16,220),u=i*.6,n=Phaser.Math.Clamp(s/1400,.9,1.4);this.dancers=[a-r,a,a+r].map((h,o)=>{const c=this.buildDancer(e,h,u,t[o%t.length],o);return c.container.visible=o===1,c.isActive=o===1,c.defaultScale=n,c.baseScale=n,c.container.setScale(n),c}),this.activeDancerCount=1}buildDancer(e,t,s,i,a){const r=e.add.container(t,s),u=e.add.circle(0,-130,26,16771028),n=e.add.rectangle(0,-110,34,110,i.body);n.setOrigin(.5,0);const h=e.add.rectangle(-22,-100,16,90,i.limb);h.setOrigin(.5,0);const o=e.add.rectangle(22,-100,16,90,i.limb);o.setOrigin(.5,0);const c=e.add.rectangle(-12,0,18,110,i.leg);c.setOrigin(.5,0);const p=e.add.rectangle(12,0,18,110,i.leg);p.setOrigin(.5,0);const g=e.add.ellipse(0,190,120,26,722194,.3);return h.baseRotation=Phaser.Math.DegToRad(-25),o.baseRotation=Phaser.Math.DegToRad(25),c.baseRotation=Phaser.Math.DegToRad(10),p.baseRotation=Phaser.Math.DegToRad(-10),h.setRotation(h.baseRotation),o.setRotation(o.baseRotation),c.setRotation(c.baseRotation),p.setRotation(p.baseRotation),h.baseY=h.y,o.baseY=o.y,u.baseY=u.y,n.baseY=n.y,r.add([g,c,p,n,h,o,u]),r.setDepth(10+a),{container:r,parts:{head:u,body:n,leftArm:h,rightArm:o,leftLeg:c,rightLeg:p,shadow:g},baseX:t,baseY:s,baseScale:1,defaultScale:1,phaseOffset:a*Math.PI*.5,isActive:!0}}createVisualization(e){this.visualBars=[],this.visualBarCount=36;for(let t=0;t<this.visualBarCount;t++){const s=e.add.rectangle(0,0,10,18,7306239,.85);s.setOrigin(.5,1),s.initialHeight=18,s.baseWidth=10,s.setDepth(-1),this.visualBars.push(s)}console.log("[Game] 音乐可视化条已创建:",this.visualBarCount,"个")}createCelebration(e){if(e){if(!e.textures.exists("confetti-pixel")){const t=e.make.graphics({x:0,y:0,add:!1});t.fillStyle(16777215,1),t.fillCircle(4,4,4),t.generateTexture("confetti-pixel",8,8),t.destroy()}this.celebrationParticles&&(this.celebrationParticles.destroy(),this.celebrationParticles=null,this.celebrationEmitter=null),this.celebrationParticles=e.add.particles("confetti-pixel").setDepth(-2),this.celebrationEmitter=this.celebrationParticles.createEmitter({on:!1,speedX:{min:-180,max:180},speedY:{min:-80,max:220},angle:{min:-15,max:195},gravityY:230,lifespan:{min:1400,max:2e3},quantity:22,frequency:70,alpha:{start:1,end:0},scale:{start:1.6,end:.3},rotate:{min:-260,max:260},tint:[16777215,16774084,16770173,16761593,10475775,12124062,16751493,13413375],blendMode:"SCREEN",emitZone:{type:"random",source:new Phaser.Geom.Rectangle(-e.scale.width*.6,0,e.scale.width*1.2,1)}}),this.celebrationEmitter.stop(),this.celebrationActive=!1}}applyLayout(e,t){if(!e||!t||(this.viewportWidth=e,this.viewportHeight=t,!this.scene))return;if(this.background&&(this.background.destroy(),this.background=null),this.scene.textures.exists("stage-bg")){this.background=this.scene.add.image(e/2,t/2,"stage-bg").setDepth(-40);const o=e/this.background.width,c=t/this.background.height,p=Math.max(o,c);this.background.setScale(p)}else{this.scene.textures.exists("stage-fallback")&&this.scene.textures.remove("stage-fallback");const o=this.scene.add.graphics({x:0,y:0});o.fillGradientStyle(1712723,2436975,790825,1251896,1,1,1,1),o.fillRect(0,0,e,t),o.generateTexture("stage-fallback",e,t),o.destroy(),this.background=this.scene.add.image(e/2,t/2,"stage-fallback").setDepth(-40)}const s=Math.max(e*.55,420),i=Math.max(t*.18,160),a=t*.78;this.floorGlow?this.floorGlow.setPosition(e/2,a):(this.floorGlow=this.scene.add.ellipse(e/2,a,s,i,5201407,.18),this.floorGlow.setDepth(-5)),this.floorGlow&&this.floorGlow.setDisplaySize(s,i);const r=e/2,u=Math.min(e*.16,220),n=t*.6,h=Phaser.Math.Clamp(e/1400,.9,1.4);if(this.dancers.forEach((o,c)=>{const p=(c-1)*u;o.baseX=r+p,o.baseY=n,o.defaultScale=h,o.baseScale=h,o.container.setPosition(o.baseX,o.baseY),o.container.setScale(o.baseScale),o.parts&&o.parts.shadow&&o.parts.shadow.setDisplaySize(s*.25,Math.max(i*.25,40))}),this.visualBars&&this.visualBars.length){const o=e*.75,c=(e-o)/2,p=o/this.visualBars.length,g=Math.max(16,t*.08);this.visualBars.forEach((m,v)=>{m.baseWidth=Math.max(10,p*.45),m.initialHeight=g,m.setPosition(c+p*v+p/2,t*.94),m.setDisplaySize(m.baseWidth,m.initialHeight)})}if(this.celebrationEmitter){const o=new Phaser.Geom.Rectangle(-e*.6,0,e*1.2,1);this.celebrationEmitter.setPosition(r,t*.08),this.celebrationEmitter.setEmitZone({type:"random",source:o})}this.setActiveDancerCount(this.activeDancerCount)}initAudioContext(){this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.dataArray=new Uint8Array(this.analyser.frequencyBinCount))}update(){this.isPlaying&&(this.updateDanceAnimation(),this.updateVisualization())}updateDanceAnimation(){if(!this.dancers.length)return;this.danceTimer+=this.danceSpeed*.6;const e=.025*this.danceSpeed,t=.12;this.dancers.forEach((s,i)=>{if(!s.isActive||!s.container.visible)return;const a=(this.danceTimer+i*25)*e+s.phaseOffset,r=Math.sin(a),u=Math.sin(a*.8+Math.PI/3),n=Math.abs(Math.sin(a*.55))*(.8+.4*this.danceIntensity),h=Math.sin(a*.5+s.phaseOffset*.5),o=Phaser.Math.Clamp((h+1)/2*this.danceIntensity,0,1),c=Phaser.Math.DegToRad(30+20*this.danceIntensity)*u,p=Phaser.Math.DegToRad(110)*o,g=Phaser.Math.DegToRad(10)*Math.sin(a*1.6),m=Phaser.Math.DegToRad(32+12*this.danceIntensity)*r*(.6+o*.4),v=Phaser.Math.DegToRad(8)*Math.sin(a*.6)*this.danceIntensity,A=Phaser.Math.Linear(0,-24,o)-n*10;s.parts.leftArm.setRotation(s.parts.leftArm.baseRotation-p+c+g),s.parts.rightArm.setRotation(s.parts.rightArm.baseRotation+p-c+g),s.parts.leftArm.y=s.parts.leftArm.baseY+Phaser.Math.Linear(0,-58,o),s.parts.rightArm.y=s.parts.rightArm.baseY+Phaser.Math.Linear(0,-58,o),s.parts.leftLeg.setRotation(s.parts.leftLeg.baseRotation-m),s.parts.rightLeg.setRotation(s.parts.rightLeg.baseRotation+m),s.parts.body.setRotation(v),s.parts.head.setRotation(v*.65),s.parts.body.y=s.parts.body.baseY+A,s.parts.head.y=s.parts.head.baseY+A*.7,s.container.setRotation(Math.sin(a*.4)*Phaser.Math.DegToRad(5)*this.danceIntensity);const _=Math.sin(a*.9+Math.PI/4);s.container.setScale(s.baseScale*(1+.16*this.danceIntensity*_-.05*o));const F=n*24+o*18;s.container.y=s.baseY-F-this.danceIntensity*4;const N=Math.sin(a*.4+s.phaseOffset)*this.danceIntensity*12;s.container.x=s.baseX+N,s.parts.shadow.setScale(1+.24*this.danceIntensity*(1-Math.abs(Math.sin(a))),1+.12*this.danceIntensity*Math.abs(Math.sin(a)))}),this.danceIntensity=Math.max(t,this.danceIntensity-.004)}updateCrowdMode(e=0){if(!this.dancers.length)return;this.progressRatio=e;const t=e>.5?3:1;t!==this.activeDancerCount&&this.setActiveDancerCount(t)}setActiveDancerCount(e){this.dancers.length&&(this.activeDancerCount=e,this.dancers.forEach((t,s)=>{if(e===3?!0:s===1){const a=e===3?s===1?1:.88:1;t.baseScale=t.defaultScale*a,t.isActive||(t.parts.leftArm.setRotation(t.parts.leftArm.baseRotation),t.parts.rightArm.setRotation(t.parts.rightArm.baseRotation),t.parts.leftLeg.setRotation(t.parts.leftLeg.baseRotation),t.parts.rightLeg.setRotation(t.parts.rightLeg.baseRotation),t.parts.leftArm.y=t.parts.leftArm.baseY,t.parts.rightArm.y=t.parts.rightArm.baseY,t.parts.body.y=t.parts.body.baseY,t.parts.head.y=t.parts.head.baseY,t.parts.shadow.setScale(1,1)),t.container.visible=!0,t.container.alpha=s===1?1:e===3?0:1,t.container.x=t.baseX,t.container.y=t.baseY,t.container.setScale(t.baseScale),t.container.setRotation(0),t.isActive=!0,e===3&&s!==1&&this.scene&&this.scene.tweens.add({targets:t.container,alpha:1,duration:280,ease:"Sine.easeOut"})}else t.container.visible&&this.scene?this.scene.tweens.add({targets:t.container,alpha:0,duration:200,ease:"Sine.easeIn",onComplete:()=>{t.container.visible=!1,t.container.alpha=1}}):(t.container.visible=!1,t.container.alpha=1),t.baseScale=t.defaultScale,t.isActive=!1}))}updateVisualization(){if(this.visualBars)for(let e=0;e<this.visualBars.length;e++){const t=this.visualBars[e],i=(Math.sin((this.danceTimer+e)*.12*this.danceSpeed)+1)*.5+this.danceIntensity*.6,a=t.initialHeight*i*(.8+this.musicSpeed*.2),r=Math.max(16,this.viewportHeight*.05),u=Math.max(50,this.viewportHeight*.14),n=Phaser.Math.Clamp(a,r,u);t.setDisplaySize(t.baseWidth,n)}}onClap(e){const t=Math.max(.3,e.confidence*1.2);this.danceIntensity=Math.min(1,this.danceIntensity+t),this.danceSpeed=Math.min(3,this.danceSpeed+.2);const s=this.musicSpeed;this.musicSpeed=Math.min(2,this.musicSpeed+.1),Math.abs(this.musicSpeed-s)>.01&&this.startBackgroundMusic(),this.resetSpeedDecay(),e.confidence>.85&&console.log("[Game] 拍巴掌事件:",{confidence:(e.confidence*100).toFixed(1)+"%",danceIntensity:this.danceIntensity.toFixed(2),danceSpeed:this.danceSpeed.toFixed(2),musicSpeed:this.musicSpeed.toFixed(2)})}resetSpeedDecay(){this.speedDecayTimer&&clearInterval(this.speedDecayTimer),this.speedDecayTimer=setInterval(()=>{this.danceSpeed=Math.max(1,this.danceSpeed-.01),this.musicSpeed=Math.max(1,this.musicSpeed-.005),this.danceSpeed<=1&&this.musicSpeed<=1&&clearInterval(this.speedDecayTimer)},100)}start(){this.isPlaying=!0,this.danceSpeed=1,this.musicSpeed=1,this.danceIntensity=.2,this.danceTimer=0,this.startBackgroundMusic(),console.log("[Game] 游戏开始，初始舞蹈强度:",this.danceIntensity)}stop(){this.isPlaying=!1,this.danceIntensity=0,this.danceSpeed=1,this.musicSpeed=1,this.speedDecayTimer&&clearInterval(this.speedDecayTimer),this.musicLoopTimer&&clearInterval(this.musicLoopTimer)}startBackgroundMusic(){this.musicLoopTimer&&clearInterval(this.musicLoopTimer);const e=1200/this.musicSpeed;this.musicLoopTimer=setInterval(()=>{this.isPlaying&&this.playBackgroundMusic()},e),this.playBackgroundMusic(),console.log("[Game] 背景音乐已启动，循环间隔:",e.toFixed(0),"ms")}playBackgroundMusic(){}getDanceSpeed(){return this.danceSpeed}getMusicSpeed(){return this.musicSpeed}setSpeedFromIntensity(e,t=0){this.danceSpeed=e,e<=5?this.musicSpeed=1+(e-1)/4:this.musicSpeed=2;const s=9,i=e-1;this.danceIntensity=.2+i/s*.8,this.updateCrowdMode(t),this.setCelebrationActive(t>=1)}setCelebrationActive(e){this.celebrationEmitter&&(e&&!this.celebrationActive?this.celebrationEmitter.start():!e&&this.celebrationActive&&this.celebrationEmitter.stop(),this.celebrationActive=e)}destroy(){this.scene&&this.resizeHandler&&(this.scene.scale.off("resize",this.resizeHandler,this),this.resizeHandler=null),this.background&&(this.background.destroy(),this.background=null),this.floorGlow&&(this.floorGlow.destroy(),this.floorGlow=null),this.celebrationParticles&&(this.celebrationParticles.destroy(),this.celebrationParticles=null,this.celebrationEmitter=null,this.celebrationActive=!1),this.game&&(this.game.destroy(!0),this.game=null),this.scene=null,this.speedDecayTimer&&clearInterval(this.speedDecayTimer)}}class z{constructor(e={}){this.baseSpeed=e.baseSpeed||d.BASE_SPEED,this.maxSpeed=e.maxSpeed||d.MAX_SPEED,this.minSpeed=e.minSpeed||d.MIN_SPEED,this.currentSpeed=this.baseSpeed,this.currentAcceleration=0,this.throttle=0,this.clapHistory=[],this.clapForces=[],this.maxAcceleration=e.maxAcceleration||f.MAX_ACCELERATION,this.baseFriction=e.baseFriction||f.BASE_FRICTION,this.airResistanceFactor=e.airResistanceFactor||f.AIR_RESISTANCE_FACTOR,this.engineBrake=e.engineBrake||f.ENGINE_BRAKE,this.lowSpeedFriction=e.lowSpeedFriction||f.LOW_SPEED_FRICTION,this.highSpeedMultiplier=e.highSpeedMultiplier||f.HIGH_SPEED_MULTIPLIER,this.physicsUpdateInterval=e.physicsUpdateInterval||f.PHYSICS_UPDATE_INTERVAL,this.clapForceDuration=e.clapForceDuration||f.CLAP_FORCE_DURATION,this.frequencyWindow=e.frequencyWindow||f.FREQUENCY_WINDOW,this.clapForceMultiplier=e.clapForceMultiplier||f.CLAP_FORCE_MULTIPLIER,this.physicsTimer=null,this.lastUpdateTime=Date.now(),this.onSpeedChange=e.onSpeedChange||(()=>{})}recordClap(e){const t=Date.now();this.clapHistory.push(t),this.clapHistory=this.clapHistory.filter(i=>t-i<this.frequencyWindow);const s=e.confidence*this.clapForceMultiplier;this.clapForces.push({timestamp:t,force:s,endTime:t+this.clapForceDuration}),this.startPhysicsSimulation(),console.log("[ClapIntensity] 鼓掌事件:",{force:s.toFixed(3),currentSpeed:this.currentSpeed.toFixed(2)+"x",activeForces:this.clapForces.length})}startPhysicsSimulation(){this.physicsTimer||(this.physicsTimer=setInterval(()=>{this.updatePhysics()},this.physicsUpdateInterval),console.log("[ClapIntensity] 物理引擎已启动"))}updatePhysics(){const e=Date.now(),t=(e-this.lastUpdateTime)/1e3;this.lastUpdateTime=e;const i=this.clapHistory.filter(c=>e-c<this.frequencyWindow).length/(this.frequencyWindow/1e3);this.throttle=Math.min(1,i/3);let a=0;this.clapForces=this.clapForces.filter(c=>e<c.endTime?(a+=c.force,!0):!1);let u=this.throttle*this.maxAcceleration+a,n=this.calculateNonLinearResistance(),h=this.throttle<.1?this.engineBrake:0;if(n+=h,this.currentAcceleration=u-n,this.currentSpeed+=this.currentAcceleration*t,this.currentSpeed=Math.max(this.minSpeed,Math.min(this.maxSpeed,this.currentSpeed)),Math.abs(this.currentSpeed-this.baseSpeed)<.01&&this.throttle<.01&&this.clapForces.length===0){this.currentSpeed=this.baseSpeed,this.stopPhysicsSimulation();return}const o=Math.min(1,(this.currentSpeed-this.baseSpeed)/(this.maxSpeed-this.baseSpeed));this.onSpeedChange({speed:this.currentSpeed,acceleration:this.currentAcceleration,clapFrequency:i,progressRatio:o,throttle:this.throttle})}stopPhysicsSimulation(){this.physicsTimer&&(clearInterval(this.physicsTimer),this.physicsTimer=null,console.log("[ClapIntensity] 物理引擎已停止"))}getSpeed(){return this.currentSpeed}getAcceleration(){return this.currentAcceleration}calculateNonLinearResistance(){const e=this.currentSpeed/this.maxSpeed;let t=this.baseFriction,s=this.airResistanceFactor*Math.pow(e,2),i;e>.7?i=this.lowSpeedFriction+(e-.7)*this.highSpeedMultiplier:i=this.lowSpeedFriction;let a=t+s+i;return a=Math.min(a,this.currentSpeed*.5),a}getThrottle(){return this.throttle}getClapFrequency(){const e=Date.now();return this.clapHistory.filter(s=>e-s<this.frequencyWindow).length/(this.frequencyWindow/1e3)}reset(){this.stopPhysicsSimulation(),this.currentSpeed=this.baseSpeed,this.currentAcceleration=0,this.throttle=0,this.clapHistory=[],this.clapForces=[],this.lastUpdateTime=Date.now(),console.log("[ClapIntensity] 状态已重置")}destroy(){this.stopPhysicsSimulation(),console.log("[ClapIntensity] 已销毁")}}class O{constructor(e={}){this.audioElement=null,this.audioContext=null,this.sourceNode=null,this.gainNode=null,this.musicUrl=e.musicUrl||L.MUSIC_URL,this.volume=e.volume||L.VOLUME,this.loop=e.loop!==!1,this.isPlaying=!1,this.currentSpeed=d.BASE_SPEED,this.minSpeed=e.minSpeed||d.MIN_SPEED,this.maxSpeed=e.maxSpeed||d.MAX_SPEED,this.onPlay=e.onPlay||(()=>{}),this.onPause=e.onPause||(()=>{}),this.onSpeedChange=e.onSpeedChange||(()=>{})}async init(){try{console.log("[MP3Player] 初始化播放器..."),this.audioElement=new Audio,this.audioElement.src=this.musicUrl,this.audioElement.loop=this.loop,this.audioElement.volume=this.volume,this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext)),this.audioContext.state==="suspended"&&await this.audioContext.resume(),this.gainNode=this.audioContext.createGain(),this.gainNode.gain.value=this.volume;try{this.sourceNode=this.audioContext.createMediaElementSource(this.audioElement),this.sourceNode.connect(this.gainNode),this.gainNode.connect(this.audioContext.destination)}catch(e){console.warn("[MP3Player] 源节点创建警告:",e.message)}return console.log("[MP3Player] 播放器初始化完成"),!0}catch(e){return console.error("[MP3Player] 初始化失败:",e),!1}}play(){try{this.audioElement&&!this.isPlaying&&(this.audioContext.state==="suspended"&&this.audioContext.resume(),this.audioElement.play(),this.isPlaying=!0,this.onPlay(),console.log("[MP3Player] 开始播放"))}catch(e){console.error("[MP3Player] 播放失败:",e)}}pause(){try{this.audioElement&&this.isPlaying&&(this.audioElement.pause(),this.isPlaying=!1,this.onPause(),console.log("[MP3Player] 暂停播放"))}catch(e){console.error("[MP3Player] 暂停失败:",e)}}stop(){try{this.audioElement&&(this.audioElement.pause(),this.audioElement.currentTime=0,this.isPlaying=!1,this.currentSpeed=1,this.onPause(),console.log("[MP3Player] 停止播放"))}catch(e){console.error("[MP3Player] 停止失败:",e)}}setSpeed(e){try{const t=Math.max(this.minSpeed,Math.min(this.maxSpeed,e));this.audioElement&&Math.abs(t-this.currentSpeed)>.01&&(this.audioElement.playbackRate=t,this.currentSpeed=t,this.onSpeedChange({speed:t}),console.log("[MP3Player] 播放速度已改变:",t.toFixed(2)+"x"))}catch(t){console.error("[MP3Player] 设置速度失败:",t)}}getSpeed(){return this.currentSpeed}setVolume(e){try{const t=Math.max(0,Math.min(1,e));this.audioElement&&(this.audioElement.volume=t),this.gainNode&&(this.gainNode.gain.value=t),this.volume=t,console.log("[MP3Player] 音量已改变:",(t*100).toFixed(0)+"%")}catch(t){console.error("[MP3Player] 设置音量失败:",t)}}getVolume(){return this.volume}getCurrentTime(){return this.audioElement?this.audioElement.currentTime:0}getDuration(){return this.audioElement?this.audioElement.duration:0}destroy(){try{this.audioElement&&(this.audioElement.pause(),this.audioElement.src="",this.audioElement=null),this.sourceNode&&(this.sourceNode.disconnect(),this.sourceNode=null),this.gainNode&&(this.gainNode.disconnect(),this.gainNode=null),this.audioContext&&(this.audioContext.close(),this.audioContext=null),console.log("[MP3Player] 播放器已销毁")}catch(e){console.error("[MP3Player] 销毁失败:",e)}}}class U{constructor(e={}){this.containerId=e.containerId||"intensityContainer",this.container=null,this.progressBar=null,this.speedDisplay=null,this.frequencyDisplay=null,this.motivationText=null,this.intensityLevel=null,this.progressBarBg=null,this.emotionBadge=null,this.highIntensityActive=!1,this.fullGlowActive=!1,this.progressBoostActive=!1,this.minSpeed=e.minSpeed||d.MIN_SPEED,this.maxSpeed=e.maxSpeed||d.MAX_SPEED,this.baseSpeed=e.baseSpeed||d.BASE_SPEED,this.motivations=["🎉 开始鼓掌吧！","👏 继续加油！","🔥 越来越快了！","⚡ 太棒了！","🚀 飞起来了！","💥 爆炸性的节奏！","🌟 你是明星！","🎵 节奏感十足！","🎊 太嗨了！","👑 鼓掌之王！"],this.currentMotivationIndex=0}init(){try{return console.log("[IntensityVisualizer] 初始化可视化..."),this.container=document.getElementById(this.containerId),this.container?(this.container.innerHTML=`
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
        `,document.head.appendChild(e)}handleProgressEffects(e){if(isNaN(e))return;const t=.75,s=.7,i=1,a=.98,r=e>=t;r!==this.progressBoostActive&&this.setProgressBoost(r),e>=t?this.highIntensityActive||this.activateHighIntensity():this.highIntensityActive&&e<s&&this.deactivateHighIntensity(),e>=i?this.fullGlowActive||this.activateFullGlow():this.fullGlowActive&&e<a&&this.deactivateFullGlow()}activateHighIntensity(){this.highIntensityActive=!0,document.body&&!document.body.classList.contains("shake-active")&&document.body.classList.add("shake-active")}deactivateHighIntensity(){this.highIntensityActive=!1,document.body&&document.body.classList.remove("shake-active")}activateFullGlow(){this.fullGlowActive=!0,this.progressBarBg&&this.progressBarBg.classList.add("power-mode"),this.progressBar&&this.progressBar.classList.add("power-mode"),this.progressGlow&&(this.progressGlow.style.opacity=.95)}deactivateFullGlow(){this.fullGlowActive=!1,this.progressBarBg&&this.progressBarBg.classList.remove("power-mode"),this.progressBar&&this.progressBar.classList.remove("power-mode"),this.progressGlow&&(this.progressGlow.style.opacity="")}setProgressBoost(e){this.progressBoostActive=e,this.progressBarBg&&this.progressBarBg.classList.toggle("boost-mode",e),this.progressBar&&this.progressBar.classList.toggle("boost-mode",e),this.progressGlow&&this.progressGlow.classList.toggle("boost-mode",e)}update(e){const{speed:t,acceleration:s,clapFrequency:i,musicSpeed:a,danceSpeed:r,progressRatio:u}=e,n=Number.isFinite(r)?r:Number.isFinite(t)?t:this.baseSpeed;let h=0;if(u!==void 0)h=Math.max(0,Math.min(100,u*100));else{const g=n-this.baseSpeed,m=this.maxSpeed-this.baseSpeed;h=Math.max(0,Math.min(100,g/m*100))}const o=h/100;if(this.progressBar&&(this.progressBar.style.width=h+"%"),this.progressGlow){const g=Math.max(0,h-4);this.progressGlow.style.width=g+"%";const m=o>.15?.85:o>0?.4:0,v=this.fullGlowActive?.95:m;this.progressGlow.style.opacity=v}if(this.danceSpeedDisplay&&(this.danceSpeedDisplay.textContent=n.toFixed(2)+"x"),this.musicSpeedDisplay){const g=Number.isFinite(a)?a:Math.min(2,Math.max(1,n*.3)),m=Number.isFinite(g)?g:1;this.musicSpeedDisplay.textContent=m.toFixed(2)+"x"}const c=Number.isFinite(i)?i:0;this.frequencyDisplay&&(this.frequencyDisplay.textContent=c.toFixed(1)+" 次/秒");const p=c>=3;if(this.handleProgressEffects(o),this.progressBarBg){const g=p||this.fullGlowActive;this.progressBarBg.classList.toggle("rhythm-surge",g)}if(this.progressBar){const g=p||this.fullGlowActive;this.progressBar.classList.toggle("rhythm-surge",g)}this.updateEmotionBadge(o),this.updateIntensityLevel(n),this.updateMotivation(n,i)}updateIntensityLevel(e){const t=Number.isFinite(e)?e:this.baseSpeed;let s="基础",i="linear-gradient(135deg, rgba(128, 255, 214, 0.85), rgba(64, 196, 255, 0.85))",a="#101327";t<=this.baseSpeed?(s="基础",i="linear-gradient(135deg, rgba(128, 255, 214, 0.85), rgba(64, 196, 255, 0.85))",a="#101327"):t>=C.LEVEL_EXTREME?(s="极限",i="linear-gradient(135deg, rgba(255, 120, 180, 0.9), rgba(255, 68, 131, 0.9))",a="#1b0c1d"):t>=C.LEVEL_HIGH?(s="高烈度",i="linear-gradient(135deg, rgba(255, 150, 92, 0.9), rgba(255, 82, 64, 0.9))",a="#1a0d12"):t>=C.LEVEL_MEDIUM&&(s="中等",i="linear-gradient(135deg, rgba(255, 220, 120, 0.9), rgba(255, 186, 90, 0.9))",a="#20130a"),this.intensityLevel&&(this.intensityLevel.textContent=s,this.intensityLevel.style.background=i,this.intensityLevel.style.color=a)}updateEmotionBadge(e){if(!this.emotionBadge)return;let t="🔥 热度待命",s="";e>=1?(t="💥 爆燃极限！",s="level-explode"):e>=.75?(t="🔥 火力全开！",s="level-burn"):e>=.45?(t="⚡ 节奏上升！",s="level-rise"):e>=.2&&(t="🎶 节奏渐起",s=""),this.emotionBadge.textContent=t,this.emotionBadge.classList.remove("level-rise","level-burn","level-explode"),s&&this.emotionBadge.classList.add(s)}updateMotivation(e,t){if(!this.motivationText)return;let s=this.motivations[0];e<=this.baseSpeed?s="🎉 开始鼓掌吧！":t>5?s=this.motivations[Math.floor(Math.random()*this.motivations.length)]:e>=C.LEVEL_EXTREME?s=this.motivations[Math.floor(Math.random()*(this.motivations.length-2))+2]:e>=C.LEVEL_HIGH&&(s=this.motivations[Math.floor(Math.random()*(this.motivations.length-4))+1]),this.motivationText.textContent!==s&&(this.motivationText.textContent=s,this.motivationText.style.animation="none",setTimeout(()=>{this.motivationText.style.animation="pulse 0.5s ease-out"},10))}reset(){this.setProgressBoost(!1),this.progressBar&&(this.progressBar.style.width="0%",this.progressBar.classList.remove("power-mode","rhythm-surge","boost-mode")),this.progressGlow&&(this.progressGlow.style.width="0%",this.progressGlow.style.opacity=0,this.progressGlow.classList.remove("boost-mode","rhythm-surge")),this.danceSpeedDisplay&&(this.danceSpeedDisplay.textContent=this.baseSpeed.toFixed(1)+"x"),this.musicSpeedDisplay&&(this.musicSpeedDisplay.textContent=this.baseSpeed.toFixed(1)+"x"),this.frequencyDisplay&&(this.frequencyDisplay.textContent="0 次/秒");const e=document.getElementById("clapCounterDisplay");e&&(e.textContent="0"),this.intensityLevel&&(this.intensityLevel.textContent="基础",this.intensityLevel.style.background="linear-gradient(135deg, rgba(128, 255, 214, 0.85), rgba(64, 196, 255, 0.85))",this.intensityLevel.style.color="#101327"),this.progressBarBg&&this.progressBarBg.classList.remove("power-mode","rhythm-surge","boost-mode"),this.emotionBadge&&(this.emotionBadge.textContent="🔥 热度待命",this.emotionBadge.classList.remove("level-rise","level-burn","level-explode")),this.motivationText&&(this.motivationText.textContent="🎉 开始鼓掌吧！"),this.deactivateFullGlow(),this.deactivateHighIntensity()}}class H{constructor(e={}){this.cheerSoundUrl=e.cheerSoundUrl||x.CHEER_SOUND_URL,this.minVolume=e.minVolume||x.MIN_VOLUME,this.maxVolume=e.maxVolume||x.MAX_VOLUME,this.minSpeedForCheer=e.minSpeedForCheer||x.MIN_SPEED_FOR_CHEER,this.baseInterval=e.baseInterval||x.BASE_INTERVAL,this.baseSpeedForInterval=e.baseSpeedForInterval||x.BASE_SPEED_FOR_INTERVAL,this.maxConcurrentCheers=e.maxConcurrentCheers||x.MAX_CONCURRENT_CHEERS,this.currentSpeed=d.BASE_SPEED,this.cheerAudioPool=[],this.lastCheerTime=0,this.cheerTimer=null,this.isEnabled=!0}init(){try{console.log("[CheerManager] 初始化欢呼声管理器...");for(let e=0;e<this.maxConcurrentCheers;e++){const t=new Audio;t.src=this.cheerSoundUrl,t.preload="auto",this.cheerAudioPool.push({audio:t,isPlaying:!1})}return console.log("[CheerManager] 欢呼声管理器初始化完成"),!0}catch(e){return console.error("[CheerManager] 初始化失败:",e),!1}}updateSpeed(e){this.currentSpeed=e,e<this.minSpeedForCheer?(this.stopAllCheers(),this.cheerTimer&&(clearInterval(this.cheerTimer),this.cheerTimer=null)):this.cheerTimer||this.startCheerTimer()}startCheerTimer(){this.cheerTimer=setInterval(()=>{this.currentSpeed>=this.minSpeedForCheer&&this.isEnabled&&this.playCheer()},this.calculateCheerInterval())}calculateCheerInterval(){const e=this.currentSpeed/this.baseSpeedForInterval,t=Math.max(300,this.baseInterval/e);return Math.round(t)}playCheer(){const e=Date.now(),t=this.cheerAudioPool.find(s=>!s.isPlaying);if(t)try{const s=this.calculateVolume();t.audio.volume=s,t.audio.currentTime=0,t.isPlaying=!0;const i=t.audio.play();i!==void 0&&i.then(()=>{}).catch(a=>{console.warn("[CheerManager] 播放欢呼声失败:",a),t.isPlaying=!1}),t.audio.onended=()=>{t.isPlaying=!1},this.lastCheerTime=e}catch(s){console.error("[CheerManager] 播放欢呼声出错:",s)}}calculateVolume(){const e=d.MAX_SPEED-this.minSpeedForCheer,s=Math.max(0,this.currentSpeed-this.minSpeedForCheer)/e,i=this.minVolume+(this.maxVolume-this.minVolume)*s;return Math.min(this.maxVolume,Math.max(this.minVolume,i))}stopAllCheers(){this.cheerAudioPool.forEach(e=>{try{e.audio.pause(),e.audio.currentTime=0,e.isPlaying=!1}catch(t){console.warn("[CheerManager] 停止欢呼声失败:",t)}})}setEnabled(e){this.isEnabled=e,e||this.stopAllCheers()}destroy(){this.stopAllCheers(),this.cheerTimer&&(clearInterval(this.cheerTimer),this.cheerTimer=null),this.cheerAudioPool=[]}}let M=null,b=null,E=null,S=null,w=null,I=null,P=0,R=!1;async function V(){try{if(console.log("[Main] 开始加载模型..."),y("正在加载模型...","loading"),M=new G({modelURL:"https://teachablemachine.withgoogle.com/models/7xwSK62zg/",clapThreshold:.8,clapLabel:"clap",clapCooldown:200,onClapDetected:s=>{console.log("[Main] 收到拍巴掌事件"),B(s)},onStatusChange:s=>{console.log("[Main] 状态变化:",s.message),y(s.message,s.type)},onError:s=>{console.error("[Main] 音频识别错误:",s),y("错误: "+s.message,"error")}}),console.log("[Main] 音频识别器已创建，开始初始化模型..."),!await M.init())throw new Error("模型加载失败");console.log("[Main] 模型加载成功！"),y("✅ 模型加载成功！点击【开始游戏】按钮开始","ready");const e=document.getElementById("startBtn");e&&(e.disabled=!1,e.onclick=X);const t=document.getElementById("clapTestBtn");t&&(t.disabled=!1,t.onclick=Y)}catch(l){console.error("[Main] 模型加载失败:",l),y("模型加载失败: "+l.message,"error")}}async function X(){if(R){D();return}try{console.log("[Main] 用户点击开始，初始化游戏组件..."),y("正在初始化游戏...","loading");const l=document.getElementById("startBtn");l&&(l.disabled=!0),console.log("[Main] 创建游戏..."),b=new k("gameContainer"),b.init(),console.log("[Main] 初始化鼓掌烈度计算..."),E=new z({baseSpeed:d.BASE_SPEED,maxSpeed:d.MAX_SPEED,minSpeed:d.MIN_SPEED,onSpeedChange:i=>{let a=1;if(i.progressRatio!==void 0){const r=d.MUSIC_SPEED_PROGRESS_THRESHOLD;i.progressRatio<=r?a=1+(d.MUSIC_MAX_SPEED-1)*(i.progressRatio/r):a=d.MUSIC_MAX_SPEED}else a=Math.min(d.MUSIC_MAX_SPEED,Math.max(1,i.speed*.3));b&&b.setSpeedFromIntensity(i.speed,i.progressRatio),S&&S.setSpeed(a),I&&I.updateSpeed(i.speed),w&&w.update({...i,musicSpeed:a,danceSpeed:i.speed}),console.log(`[Main] 速度更新 - 舞蹈: ${i.speed.toFixed(2)}x, 音乐: ${a.toFixed(2)}x, 进度: ${(i.progressRatio||0).toFixed(2)}`)}}),console.log("[Main] 初始化 MP3 播放器..."),S=new O({maxSpeed:d.MUSIC_MAX_SPEED}),await S.init()||console.warn("[Main] MP3 播放器初始化失败，将使用合成音乐"),console.log("[Main] 初始化烈度可视化..."),w=new U({containerId:"intensityContainer",baseSpeed:d.BASE_SPEED,maxSpeed:d.MAX_SPEED,minSpeed:d.MIN_SPEED}),w.init()||console.warn("[Main] 烈度可视化初始化失败"),console.log("[Main] 初始化欢呼声管理器..."),I=new H,I.init()||console.warn("[Main] 欢呼声管理器初始化失败"),console.log("[Main] 游戏组件初始化完成！"),R=!0,D()}catch(l){console.error("[Main] 初始化失败:",l),y("初始化失败: "+l.message,"error");const e=document.getElementById("startBtn");e&&(e.disabled=!1)}}async function D(){try{if(console.log("[Main] 开始游戏..."),!M||!b){console.error("[Main] 应用未初始化"),y("应用未初始化","error");return}if(P=0,T(),console.log("[Main] 启动游戏..."),b.start(),E&&E.reset(),w&&w.reset(),S&&S.play(),console.log("[Main] 启动音频监听..."),!M.startListening())throw new Error("无法启动音频监听");console.log("[Main] 游戏已启动，等待拍巴掌..."),y("🎉 游戏已开始！尽情拍巴掌吧！","ready");const e=document.getElementById("startBtn");e&&(e.textContent="🔄 重新开始",e.disabled=!1);const t=document.getElementById("clapTestBtn");t&&(t.style.display="inline-block")}catch(l){console.error("[Main] 启动游戏失败:",l),y("启动游戏失败: "+l.message,"error")}}function Y(){console.log("[Main] 模拟鼓掌调试");const l={confidence:.95,timestamp:Date.now(),isSimulated:!0};B(l);const e=document.getElementById("clapTestBtn");e&&(e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)"},150)),console.log("[Main] 模拟鼓掌完成")}function B(l){P++,console.log("[Main] 拍巴掌计数:",P,"置信度:",l.confidence.toFixed(2),l.isSimulated?"(模拟)":"(真实)"),E&&E.recordClap(l),b&&b.onClap(l),T()}function T(){const l=document.getElementById("clapCounterDisplay");l&&(l.textContent=P)}function y(l,e="ready"){const t=document.getElementById("status");t&&(t.textContent=l,t.className="status "+e)}document.addEventListener("DOMContentLoaded",()=>{V()});window.addEventListener("beforeunload",()=>{M&&M.destroy(),b&&b.destroy(),S&&S.destroy(),E&&E.destroy()});
