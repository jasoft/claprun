(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function t(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(s){if(s.ep)return;s.ep=!0;const n=t(s);fetch(s.href,n)}})();class R{constructor(e={}){this.modelURL=e.modelURL||"https://teachablemachine.withgoogle.com/models/7xwSK62zg/",this.recognizer=null,this.isListening=!1,this.classLabels=[],this.onClapDetected=e.onClapDetected||(()=>{}),this.onStatusChange=e.onStatusChange||(()=>{}),this.onError=e.onError||(()=>{}),this.clapThreshold=e.clapThreshold||.8,this.clapLabel=e.clapLabel||"clap",this.lastClapTime=0,this.clapCooldown=e.clapCooldown||10}async init(){try{console.log("[AudioRecognizer] 开始初始化..."),console.log("[AudioRecognizer] 模型 URL:",this.modelURL),this.updateStatus("正在加载模型...","loading");const e=this.modelURL+"model.json",t=this.modelURL+"metadata.json";return console.log("[AudioRecognizer] Checkpoint URL:",e),console.log("[AudioRecognizer] Metadata URL:",t),this.recognizer=speechCommands.create("BROWSER_FFT",void 0,e,t),console.log("[AudioRecognizer] 识别器已创建，正在加载模型..."),await this.recognizer.ensureModelLoaded(),this.classLabels=this.recognizer.wordLabels(),console.log("[AudioRecognizer] 模型加载成功！"),console.log("[AudioRecognizer] 类别标签:",this.classLabels),console.log("[AudioRecognizer] 拍巴掌标签:",this.clapLabel),console.log("[AudioRecognizer] 置信度阈值:",this.clapThreshold),this.updateStatus("模型加载成功！","ready"),!0}catch(e){return console.error("[AudioRecognizer] 模型加载失败:",e),this.updateStatus("模型加载失败: "+e.message,"error"),this.onError(e),!1}}startListening(){if(!this.recognizer)return console.error("[AudioRecognizer] 识别器未初始化"),!1;try{return console.log("[AudioRecognizer] 开始监听音频..."),this.recognizer.listen(e=>{this.handleAudioResult(e)},{includeSpectrogram:!1,probabilityThreshold:.5,invokeCallbackOnNoiseAndUnknown:!0,overlapFactor:.8}),this.isListening=!0,console.log("[AudioRecognizer] 音频监听已启动"),this.updateStatus("正在监听音频...","ready"),!0}catch(e){return console.error("[AudioRecognizer] 启动监听失败:",e),this.updateStatus("启动监听失败: "+e.message,"error"),this.onError(e),!1}}stopListening(){this.recognizer&&this.isListening&&(this.recognizer.stopListening(),this.isListening=!1,this.updateStatus("已停止监听","ready"))}handleAudioResult(e){const t=e.scores,i=Date.now(),s={};let n=0,l="";for(let r=0;r<this.classLabels.length;r++)s[this.classLabels[r]]=(t[r]*100).toFixed(1)+"%",t[r]>n&&(n=t[r],l=this.classLabels[r]);if(n>.5&&console.log("[AudioRecognizer] 识别结果:",s,"| 最高分:",l,(n*100).toFixed(1)+"%"),i-this.lastClapTime<=this.clapCooldown||n<=this.clapThreshold)return;if(l.toLowerCase().includes("clap")||l.includes("掌声")){this.lastClapTime=i,this.onClapDetected({confidence:n,label:l,timestamp:i}),console.log(`[AudioRecognizer] ✅ 检测到拍巴掌: ${l} (${(n*100).toFixed(1)}%)`);return}for(let r=0;r<this.classLabels.length;r++){const c=this.classLabels[r],p=t[r];if((c.toLowerCase().includes(this.clapLabel.toLowerCase())||c.includes("掌声")||c.includes("clap"))&&p>this.clapThreshold){this.lastClapTime=i,this.onClapDetected({confidence:p,label:c,timestamp:i}),console.log(`[AudioRecognizer] ✅ 检测到拍巴掌: ${c} (${(p*100).toFixed(1)}%)`);return}}}updateStatus(e,t="ready"){this.onStatusChange({message:e,type:t})}getLabels(){return this.classLabels}destroy(){this.stopListening(),this.recognizer&&(this.recognizer=null)}}const o={BASE_SPEED:1,MAX_SPEED:10,MIN_SPEED:1,MUSIC_MAX_SPEED:2,MUSIC_SPEED_PROGRESS_THRESHOLD:.75},d={MAX_ACCELERATION:2,BASE_FRICTION:.88,AIR_RESISTANCE_FACTOR:.15,ENGINE_BRAKE:.05,LOW_SPEED_FRICTION:.02,HIGH_SPEED_MULTIPLIER:.3,PHYSICS_UPDATE_INTERVAL:50,CLAP_FORCE_DURATION:10,FREQUENCY_WINDOW:1e3,CLAP_FORCE_MULTIPLIER:.5},x={LEVEL_MEDIUM:3,LEVEL_HIGH:5,LEVEL_EXTREME:8},y={CHEER_SOUND_URL:"./music/applause-cheer-236786.mp3",MIN_VOLUME:.3,MAX_VOLUME:1,MIN_SPEED_FOR_CHEER:2,BASE_INTERVAL:2e3,BASE_SPEED_FOR_INTERVAL:3,MAX_CONCURRENT_CHEERS:5},b={MUSIC_URL:"./music/legacy-of-brahms-hungarian-dance-no5-fun-background-dance-music-191255.mp3",VOLUME:.5};class T{constructor(e="gameContainer"){this.config={type:Phaser.CANVAS,width:800,height:600,parent:e,render:{canvas:{willReadFrequently:!0}},physics:{default:"arcade",arcade:{gravity:{y:300},debug:!1}},scene:{preload:()=>this.preload(),create:()=>this.create(),update:()=>this.update()}},this.game=null,this.dancer=null,this.danceSpeed=1,this.musicSpeed=1,this.isPlaying=!1,this.danceState="idle",this.danceTimer=0,this.danceIntensity=0,this.music=null,this.audioContext=null,this.analyser=null,this.dataArray=null,this.musicLoopTimer=null,this.speedDecayTimer=null}init(){this.game=new Phaser.Game(this.config)}preload(){}create(){const e=this.game.scene.scenes[0],t=e.make.graphics({x:0,y:0,add:!1});t.fillStyle(6717162,1),t.fillRect(0,0,800,600),t.generateTexture("background",800,600),t.destroy(),e.add.image(400,300,"background"),this.createDancer(e),this.createVisualization(e),this.initAudioContext()}createDancer(e){const t=e.make.graphics({x:0,y:0,add:!1});t.fillStyle(16767916,1),t.fillCircle(400,150,30),t.fillRect(385,185,30,60),t.fillRect(370,245,15,80),t.fillRect(415,245,15,80),t.fillRect(360,190,15,50),t.fillRect(425,190,15,50),t.generateTexture("dancer",800,400),t.destroy(),this.dancer=e.add.sprite(400,300,"dancer"),this.dancer.setScale(1)}createVisualization(e){this.visualBars=[];const t=32,i=800/t;for(let s=0;s<t;s++){const n=e.add.rectangle(s*i+i/2,550,i-2,10,7752610);n.initialHeight=10,this.visualBars.push(n)}console.log("[Game] 音乐可视化条已创建:",t,"个")}initAudioContext(){this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.dataArray=new Uint8Array(this.analyser.frequencyBinCount))}update(){this.isPlaying&&(this.updateDanceAnimation(),this.updateVisualization())}updateDanceAnimation(){this.danceTimer+=1;const e=1+this.danceIntensity*.3,t=Math.sin(this.danceTimer*.05*this.danceSpeed)*this.danceIntensity*.5;this.dancer.setScale(e),this.dancer.setRotation(t);const i=.15;this.danceIntensity=Math.max(i,this.danceIntensity-.005)}updateVisualization(){if(this.visualBars)for(let e=0;e<this.visualBars.length;e++){const i=(Math.sin((this.danceTimer+e)*.1*this.danceSpeed)*50+50)*this.danceIntensity*this.musicSpeed,n=Math.max(10,Math.min(150,i))/this.visualBars[e].initialHeight;this.visualBars[e].setScale(1,n)}}onClap(e){const t=Math.max(.3,e.confidence*1.2);this.danceIntensity=Math.min(1,this.danceIntensity+t),this.danceSpeed=Math.min(3,this.danceSpeed+.2);const i=this.musicSpeed;this.musicSpeed=Math.min(2,this.musicSpeed+.1),Math.abs(this.musicSpeed-i)>.01&&this.startBackgroundMusic(),this.resetSpeedDecay(),e.confidence>.85&&console.log("[Game] 拍巴掌事件:",{confidence:(e.confidence*100).toFixed(1)+"%",danceIntensity:this.danceIntensity.toFixed(2),danceSpeed:this.danceSpeed.toFixed(2),musicSpeed:this.musicSpeed.toFixed(2)})}resetSpeedDecay(){this.speedDecayTimer&&clearInterval(this.speedDecayTimer),this.speedDecayTimer=setInterval(()=>{this.danceSpeed=Math.max(1,this.danceSpeed-.01),this.musicSpeed=Math.max(1,this.musicSpeed-.005),this.danceSpeed<=1&&this.musicSpeed<=1&&clearInterval(this.speedDecayTimer)},100)}start(){this.isPlaying=!0,this.danceSpeed=1,this.musicSpeed=1,this.danceIntensity=.2,this.danceTimer=0,this.startBackgroundMusic(),console.log("[Game] 游戏开始，初始舞蹈强度:",this.danceIntensity)}stop(){this.isPlaying=!1,this.danceIntensity=0,this.danceSpeed=1,this.musicSpeed=1,this.speedDecayTimer&&clearInterval(this.speedDecayTimer),this.musicLoopTimer&&clearInterval(this.musicLoopTimer)}startBackgroundMusic(){this.musicLoopTimer&&clearInterval(this.musicLoopTimer);const e=1200/this.musicSpeed;this.musicLoopTimer=setInterval(()=>{this.isPlaying&&this.playBackgroundMusic()},e),this.playBackgroundMusic(),console.log("[Game] 背景音乐已启动，循环间隔:",e.toFixed(0),"ms")}playBackgroundMusic(){}getDanceSpeed(){return this.danceSpeed}getMusicSpeed(){return this.musicSpeed}setSpeedFromIntensity(e){this.danceSpeed=e,e<=5?this.musicSpeed=1+(e-1)/4:this.musicSpeed=2;const t=9,i=e-1;this.danceIntensity=.2+i/t*.8}destroy(){this.game&&(this.game.destroy(!0),this.game=null),this.speedDecayTimer&&clearInterval(this.speedDecayTimer)}}class w{constructor(e={}){this.baseSpeed=e.baseSpeed||o.BASE_SPEED,this.maxSpeed=e.maxSpeed||o.MAX_SPEED,this.minSpeed=e.minSpeed||o.MIN_SPEED,this.currentSpeed=this.baseSpeed,this.currentAcceleration=0,this.throttle=0,this.clapHistory=[],this.clapForces=[],this.maxAcceleration=e.maxAcceleration||d.MAX_ACCELERATION,this.baseFriction=e.baseFriction||d.BASE_FRICTION,this.airResistanceFactor=e.airResistanceFactor||d.AIR_RESISTANCE_FACTOR,this.engineBrake=e.engineBrake||d.ENGINE_BRAKE,this.lowSpeedFriction=e.lowSpeedFriction||d.LOW_SPEED_FRICTION,this.highSpeedMultiplier=e.highSpeedMultiplier||d.HIGH_SPEED_MULTIPLIER,this.physicsUpdateInterval=e.physicsUpdateInterval||d.PHYSICS_UPDATE_INTERVAL,this.clapForceDuration=e.clapForceDuration||d.CLAP_FORCE_DURATION,this.frequencyWindow=e.frequencyWindow||d.FREQUENCY_WINDOW,this.clapForceMultiplier=e.clapForceMultiplier||d.CLAP_FORCE_MULTIPLIER,this.physicsTimer=null,this.lastUpdateTime=Date.now(),this.onSpeedChange=e.onSpeedChange||(()=>{})}recordClap(e){const t=Date.now();this.clapHistory.push(t),this.clapHistory=this.clapHistory.filter(s=>t-s<this.frequencyWindow);const i=e.confidence*this.clapForceMultiplier;this.clapForces.push({timestamp:t,force:i,endTime:t+this.clapForceDuration}),this.startPhysicsSimulation(),console.log("[ClapIntensity] 鼓掌事件:",{force:i.toFixed(3),currentSpeed:this.currentSpeed.toFixed(2)+"x",activeForces:this.clapForces.length})}startPhysicsSimulation(){this.physicsTimer||(this.physicsTimer=setInterval(()=>{this.updatePhysics()},this.physicsUpdateInterval),console.log("[ClapIntensity] 物理引擎已启动"))}updatePhysics(){const e=Date.now(),t=(e-this.lastUpdateTime)/1e3;this.lastUpdateTime=e;const s=this.clapHistory.filter(g=>e-g<this.frequencyWindow).length/(this.frequencyWindow/1e3);this.throttle=Math.min(1,s/3);let n=0;this.clapForces=this.clapForces.filter(g=>e<g.endTime?(n+=g.force,!0):!1);let C=this.throttle*this.maxAcceleration+n,r=this.calculateNonLinearResistance(),c=this.throttle<.1?this.engineBrake:0;if(r+=c,this.currentAcceleration=C-r,this.currentSpeed+=this.currentAcceleration*t,this.currentSpeed=Math.max(this.minSpeed,Math.min(this.maxSpeed,this.currentSpeed)),Math.abs(this.currentSpeed-this.baseSpeed)<.01&&this.throttle<.01&&this.clapForces.length===0){this.currentSpeed=this.baseSpeed,this.stopPhysicsSimulation();return}const p=Math.min(1,(this.currentSpeed-this.baseSpeed)/(this.maxSpeed-this.baseSpeed));this.onSpeedChange({speed:this.currentSpeed,acceleration:this.currentAcceleration,clapFrequency:s,progressRatio:p,throttle:this.throttle})}stopPhysicsSimulation(){this.physicsTimer&&(clearInterval(this.physicsTimer),this.physicsTimer=null,console.log("[ClapIntensity] 物理引擎已停止"))}getSpeed(){return this.currentSpeed}getAcceleration(){return this.currentAcceleration}calculateNonLinearResistance(){const e=this.currentSpeed/this.maxSpeed;let t=this.baseFriction,i=this.airResistanceFactor*Math.pow(e,2),s;e>.7?s=this.lowSpeedFriction+(e-.7)*this.highSpeedMultiplier:s=this.lowSpeedFriction;let n=t+i+s;return n=Math.min(n,this.currentSpeed*.5),n}getThrottle(){return this.throttle}getClapFrequency(){const e=Date.now();return this.clapHistory.filter(i=>e-i<this.frequencyWindow).length/(this.frequencyWindow/1e3)}reset(){this.stopPhysicsSimulation(),this.currentSpeed=this.baseSpeed,this.currentAcceleration=0,this.throttle=0,this.clapHistory=[],this.clapForces=[],this.lastUpdateTime=Date.now(),console.log("[ClapIntensity] 状态已重置")}destroy(){this.stopPhysicsSimulation(),console.log("[ClapIntensity] 已销毁")}}class F{constructor(e={}){this.audioElement=null,this.audioContext=null,this.sourceNode=null,this.gainNode=null,this.musicUrl=e.musicUrl||b.MUSIC_URL,this.volume=e.volume||b.VOLUME,this.loop=e.loop!==!1,this.isPlaying=!1,this.currentSpeed=o.BASE_SPEED,this.minSpeed=e.minSpeed||o.MIN_SPEED,this.maxSpeed=e.maxSpeed||o.MAX_SPEED,this.onPlay=e.onPlay||(()=>{}),this.onPause=e.onPause||(()=>{}),this.onSpeedChange=e.onSpeedChange||(()=>{})}async init(){try{console.log("[MP3Player] 初始化播放器..."),this.audioElement=new Audio,this.audioElement.src=this.musicUrl,this.audioElement.loop=this.loop,this.audioElement.volume=this.volume,this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext)),this.audioContext.state==="suspended"&&await this.audioContext.resume(),this.gainNode=this.audioContext.createGain(),this.gainNode.gain.value=this.volume;try{this.sourceNode=this.audioContext.createMediaElementSource(this.audioElement),this.sourceNode.connect(this.gainNode),this.gainNode.connect(this.audioContext.destination)}catch(e){console.warn("[MP3Player] 源节点创建警告:",e.message)}return console.log("[MP3Player] 播放器初始化完成"),!0}catch(e){return console.error("[MP3Player] 初始化失败:",e),!1}}play(){try{this.audioElement&&!this.isPlaying&&(this.audioContext.state==="suspended"&&this.audioContext.resume(),this.audioElement.play(),this.isPlaying=!0,this.onPlay(),console.log("[MP3Player] 开始播放"))}catch(e){console.error("[MP3Player] 播放失败:",e)}}pause(){try{this.audioElement&&this.isPlaying&&(this.audioElement.pause(),this.isPlaying=!1,this.onPause(),console.log("[MP3Player] 暂停播放"))}catch(e){console.error("[MP3Player] 暂停失败:",e)}}stop(){try{this.audioElement&&(this.audioElement.pause(),this.audioElement.currentTime=0,this.isPlaying=!1,this.currentSpeed=1,this.onPause(),console.log("[MP3Player] 停止播放"))}catch(e){console.error("[MP3Player] 停止失败:",e)}}setSpeed(e){try{const t=Math.max(this.minSpeed,Math.min(this.maxSpeed,e));this.audioElement&&Math.abs(t-this.currentSpeed)>.01&&(this.audioElement.playbackRate=t,this.currentSpeed=t,this.onSpeedChange({speed:t}),console.log("[MP3Player] 播放速度已改变:",t.toFixed(2)+"x"))}catch(t){console.error("[MP3Player] 设置速度失败:",t)}}getSpeed(){return this.currentSpeed}setVolume(e){try{const t=Math.max(0,Math.min(1,e));this.audioElement&&(this.audioElement.volume=t),this.gainNode&&(this.gainNode.gain.value=t),this.volume=t,console.log("[MP3Player] 音量已改变:",(t*100).toFixed(0)+"%")}catch(t){console.error("[MP3Player] 设置音量失败:",t)}}getVolume(){return this.volume}getCurrentTime(){return this.audioElement?this.audioElement.currentTime:0}getDuration(){return this.audioElement?this.audioElement.duration:0}destroy(){try{this.audioElement&&(this.audioElement.pause(),this.audioElement.src="",this.audioElement=null),this.sourceNode&&(this.sourceNode.disconnect(),this.sourceNode=null),this.gainNode&&(this.gainNode.disconnect(),this.gainNode=null),this.audioContext&&(this.audioContext.close(),this.audioContext=null),console.log("[MP3Player] 播放器已销毁")}catch(e){console.error("[MP3Player] 销毁失败:",e)}}}class _{constructor(e={}){this.containerId=e.containerId||"intensityContainer",this.container=null,this.progressBar=null,this.speedDisplay=null,this.frequencyDisplay=null,this.motivationText=null,this.intensityLevel=null,this.minSpeed=e.minSpeed||o.MIN_SPEED,this.maxSpeed=e.maxSpeed||o.MAX_SPEED,this.baseSpeed=e.baseSpeed||o.BASE_SPEED,this.motivations=["🎉 开始鼓掌吧！","👏 继续加油！","🔥 越来越快了！","⚡ 太棒了！","🚀 飞起来了！","💥 爆炸性的节奏！","🌟 你是明星！","🎵 节奏感十足！","🎊 太嗨了！","👑 鼓掌之王！"],this.currentMotivationIndex=0}init(){try{return console.log("[IntensityVisualizer] 初始化可视化..."),this.container=document.getElementById(this.containerId),this.container?(this.container.innerHTML=`
                <div class="intensity-wrapper">
                    <div class="intensity-header">
                        <h3>🎵 鼓掌烈度</h3>
                        <div class="intensity-stats">
                            <div class="stat">
                                <span class="label">舞蹈速度:</span>
                                <span class="value" id="danceSpeedDisplay">1.0x</span>
                            </div>
                            <div class="stat">
                                <span class="label">音乐速度:</span>
                                <span class="value" id="musicSpeedDisplay">1.0x</span>
                            </div>
                            <div class="stat">
                                <span class="label">频率:</span>
                                <span class="value" id="frequencyDisplay">0 次/秒</span>
                            </div>
                        </div>
                    </div>

                    <div class="progress-container">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" id="progressBar"></div>
                            <div class="progress-bar-glow" id="progressGlow"></div>
                        </div>
                        <div class="intensity-level" id="intensityLevel">基础</div>
                    </div>

                    <div class="motivation-text" id="motivationText">🎉 开始鼓掌吧！</div>

                    <div class="intensity-info">
                        <div class="info-item">
                            <span class="level-badge" style="background: #4CAF50;">基础</span>
                            <span>0.5x - 1.0x</span>
                        </div>
                        <div class="info-item">
                            <span class="level-badge" style="background: #FFC107;">中等</span>
                            <span>1.0x - 1.5x</span>
                        </div>
                        <div class="info-item">
                            <span class="level-badge" style="background: #FF5722;">高烈度</span>
                            <span>1.5x - 2.0x</span>
                        </div>
                        <div class="info-item">
                            <span class="level-badge" style="background: #E91E63;">极限</span>
                            <span>2.0x - 3.0x</span>
                        </div>
                    </div>
                </div>
            `,this.progressBar=document.getElementById("progressBar"),this.progressGlow=document.getElementById("progressGlow"),this.danceSpeedDisplay=document.getElementById("danceSpeedDisplay"),this.musicSpeedDisplay=document.getElementById("musicSpeedDisplay"),this.frequencyDisplay=document.getElementById("frequencyDisplay"),this.motivationText=document.getElementById("motivationText"),this.intensityLevel=document.getElementById("intensityLevel"),this.addStyles(),console.log("[IntensityVisualizer] 可视化初始化完成"),!0):(console.error("[IntensityVisualizer] 容器不存在:",this.containerId),!1)}catch(e){return console.error("[IntensityVisualizer] 初始化失败:",e),!1}}addStyles(){const e=document.createElement("style");e.textContent=`
            .intensity-wrapper {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
                backdrop-filter: blur(10px);
            }

            .intensity-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }

            .intensity-header h3 {
                margin: 0;
                font-size: 1.3em;
                color: #fff;
            }

            .intensity-stats {
                display: flex;
                gap: 20px;
                font-size: 0.9em;
            }

            .stat {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .stat .label {
                opacity: 0.7;
            }

            .stat .value {
                font-weight: bold;
                color: #FFD700;
                font-size: 1.1em;
            }

            .progress-container {
                position: relative;
                margin: 20px 0;
            }

            .progress-bar-bg {
                position: relative;
                width: 100%;
                height: 40px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 20px;
                overflow: hidden;
                border: 2px solid rgba(255, 255, 255, 0.1);
            }

            .progress-bar-fill {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg,
                    #4CAF50 0%,
                    #8BC34A 25%,
                    #FFC107 50%,
                    #FF5722 75%,
                    #E91E63 100%);
                transition: width 0.1s ease-out;
                border-radius: 18px;
            }

            .progress-bar-glow {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 0%;
                background: radial-gradient(ellipse at right, rgba(255, 255, 255, 0.5), transparent);
                transition: width 0.1s ease-out;
                border-radius: 18px;
                filter: blur(2px);
            }

            .intensity-level {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                font-weight: bold;
                color: white;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                font-size: 0.9em;
                z-index: 10;
            }

            .motivation-text {
                text-align: center;
                font-size: 1.3em;
                font-weight: bold;
                color: #FFD700;
                margin: 15px 0;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                animation: pulse 0.5s ease-out;
            }

            @keyframes pulse {
                0% {
                    transform: scale(0.8);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            .intensity-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 10px;
                margin-top: 15px;
                font-size: 0.85em;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border-left: 3px solid rgba(255, 255, 255, 0.2);
            }

            .level-badge {
                display: inline-block;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                font-size: 0.7em;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }

            @media (max-width: 600px) {
                .intensity-header {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .intensity-stats {
                    width: 100%;
                    justify-content: space-between;
                }

                .intensity-info {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `,document.head.appendChild(e)}update(e){const{speed:t,acceleration:i,clapFrequency:s,musicSpeed:n,danceSpeed:l,progressRatio:C}=e,r=l||t;let c=0;if(C!==void 0)c=Math.max(0,Math.min(100,C*100));else{const p=r-this.baseSpeed,g=this.maxSpeed-this.baseSpeed;c=Math.max(0,Math.min(100,p/g*100))}if(this.progressBar&&(this.progressBar.style.width=c+"%"),this.progressGlow&&(this.progressGlow.style.width=c+"%"),this.danceSpeedDisplay&&(this.danceSpeedDisplay.textContent=r.toFixed(2)+"x"),this.musicSpeedDisplay){const p=n||Math.min(2,Math.max(1,r*.3));this.musicSpeedDisplay.textContent=p.toFixed(2)+"x"}this.frequencyDisplay&&(this.frequencyDisplay.textContent=s.toFixed(1)+" 次/秒"),this.updateIntensityLevel(r),this.updateMotivation(r,s)}updateIntensityLevel(e){let t="基础",i="#4CAF50";e<=this.baseSpeed?(t="基础",i="#4CAF50"):e>=x.LEVEL_EXTREME?(t="极限",i="#E91E63"):e>=x.LEVEL_HIGH?(t="高烈度",i="#FF5722"):e>=x.LEVEL_MEDIUM&&(t="中等",i="#FFC107"),this.intensityLevel&&(this.intensityLevel.textContent=t,this.intensityLevel.style.color=i)}updateMotivation(e,t){if(!this.motivationText)return;let i=this.motivations[0];e<=this.baseSpeed?i="🎉 开始鼓掌吧！":t>5?i=this.motivations[Math.floor(Math.random()*this.motivations.length)]:e>=x.LEVEL_EXTREME?i=this.motivations[Math.floor(Math.random()*(this.motivations.length-2))+2]:e>=x.LEVEL_HIGH&&(i=this.motivations[Math.floor(Math.random()*(this.motivations.length-4))+1]),this.motivationText.textContent!==i&&(this.motivationText.textContent=i,this.motivationText.style.animation="none",setTimeout(()=>{this.motivationText.style.animation="pulse 0.5s ease-out"},10))}reset(){this.progressBar&&(this.progressBar.style.width="0%"),this.progressGlow&&(this.progressGlow.style.width="0%"),this.danceSpeedDisplay&&(this.danceSpeedDisplay.textContent=this.baseSpeed.toFixed(1)+"x"),this.musicSpeedDisplay&&(this.musicSpeedDisplay.textContent=this.baseSpeed.toFixed(1)+"x"),this.frequencyDisplay&&(this.frequencyDisplay.textContent="0 次/秒"),this.intensityLevel&&(this.intensityLevel.textContent="基础",this.intensityLevel.style.color="#4CAF50"),this.motivationText&&(this.motivationText.textContent="🎉 开始鼓掌吧！")}}class D{constructor(e={}){this.cheerSoundUrl=e.cheerSoundUrl||y.CHEER_SOUND_URL,this.minVolume=e.minVolume||y.MIN_VOLUME,this.maxVolume=e.maxVolume||y.MAX_VOLUME,this.minSpeedForCheer=e.minSpeedForCheer||y.MIN_SPEED_FOR_CHEER,this.baseInterval=e.baseInterval||y.BASE_INTERVAL,this.baseSpeedForInterval=e.baseSpeedForInterval||y.BASE_SPEED_FOR_INTERVAL,this.maxConcurrentCheers=e.maxConcurrentCheers||y.MAX_CONCURRENT_CHEERS,this.currentSpeed=o.BASE_SPEED,this.cheerAudioPool=[],this.lastCheerTime=0,this.cheerTimer=null,this.isEnabled=!0}init(){try{console.log("[CheerManager] 初始化欢呼声管理器...");for(let e=0;e<this.maxConcurrentCheers;e++){const t=new Audio;t.src=this.cheerSoundUrl,t.preload="auto",this.cheerAudioPool.push({audio:t,isPlaying:!1})}return console.log("[CheerManager] 欢呼声管理器初始化完成"),!0}catch(e){return console.error("[CheerManager] 初始化失败:",e),!1}}updateSpeed(e){this.currentSpeed=e,e<this.minSpeedForCheer?(this.stopAllCheers(),this.cheerTimer&&(clearInterval(this.cheerTimer),this.cheerTimer=null)):this.cheerTimer||this.startCheerTimer()}startCheerTimer(){this.cheerTimer=setInterval(()=>{this.currentSpeed>=this.minSpeedForCheer&&this.isEnabled&&this.playCheer()},this.calculateCheerInterval())}calculateCheerInterval(){const e=this.currentSpeed/this.baseSpeedForInterval,t=Math.max(300,this.baseInterval/e);return Math.round(t)}playCheer(){const e=Date.now(),t=this.cheerAudioPool.find(i=>!i.isPlaying);if(t)try{const i=this.calculateVolume();t.audio.volume=i,t.audio.currentTime=0,t.isPlaying=!0;const s=t.audio.play();s!==void 0&&s.then(()=>{}).catch(n=>{console.warn("[CheerManager] 播放欢呼声失败:",n),t.isPlaying=!1}),t.audio.onended=()=>{t.isPlaying=!1},this.lastCheerTime=e}catch(i){console.error("[CheerManager] 播放欢呼声出错:",i)}}calculateVolume(){const e=o.MAX_SPEED-this.minSpeedForCheer,i=Math.max(0,this.currentSpeed-this.minSpeedForCheer)/e,s=this.minVolume+(this.maxVolume-this.minVolume)*i;return Math.min(this.maxVolume,Math.max(this.minVolume,s))}stopAllCheers(){this.cheerAudioPool.forEach(e=>{try{e.audio.pause(),e.audio.currentTime=0,e.isPlaying=!1}catch(t){console.warn("[CheerManager] 停止欢呼声失败:",t)}})}setEnabled(e){this.isEnabled=e,e||this.stopAllCheers()}destroy(){this.stopAllCheers(),this.cheerTimer&&(clearInterval(this.cheerTimer),this.cheerTimer=null),this.cheerAudioPool=[]}}let E=null,u=null,f=null,m=null,S=null,M=null,I=0,v=!1;async function B(){try{if(console.log("[Main] 开始加载模型..."),h("正在加载模型...","loading"),E=new R({modelURL:"https://teachablemachine.withgoogle.com/models/7xwSK62zg/",clapThreshold:.8,clapLabel:"clap",clapCooldown:200,onClapDetected:i=>{console.log("[Main] 收到拍巴掌事件"),L(i)},onStatusChange:i=>{console.log("[Main] 状态变化:",i.message),h(i.message,i.type)},onError:i=>{console.error("[Main] 音频识别错误:",i),h("错误: "+i.message,"error")}}),console.log("[Main] 音频识别器已创建，开始初始化模型..."),!await E.init())throw new Error("模型加载失败");console.log("[Main] 模型加载成功！"),h("✅ 模型加载成功！点击【开始游戏】按钮开始","ready");const e=document.getElementById("startBtn");e&&(e.disabled=!1,e.onclick=N);const t=document.getElementById("clapTestBtn");t&&(t.disabled=!1,t.onclick=U)}catch(a){console.error("[Main] 模型加载失败:",a),h("模型加载失败: "+a.message,"error")}}async function N(){if(v){P();return}try{console.log("[Main] 用户点击开始，初始化游戏组件..."),h("正在初始化游戏...","loading");const a=document.getElementById("startBtn");a&&(a.disabled=!0),console.log("[Main] 创建游戏..."),u=new T("gameContainer"),u.init(),console.log("[Main] 初始化鼓掌烈度计算..."),f=new w({baseSpeed:o.BASE_SPEED,maxSpeed:o.MAX_SPEED,minSpeed:o.MIN_SPEED,onSpeedChange:s=>{let n=1;if(s.progressRatio!==void 0){const l=o.MUSIC_SPEED_PROGRESS_THRESHOLD;s.progressRatio<=l?n=1+(o.MUSIC_MAX_SPEED-1)*(s.progressRatio/l):n=o.MUSIC_MAX_SPEED}else n=Math.min(o.MUSIC_MAX_SPEED,Math.max(1,s.speed*.3));u&&u.setSpeedFromIntensity(s.speed),m&&m.setSpeed(n),M&&M.updateSpeed(s.speed),S&&S.update({...s,musicSpeed:n,danceSpeed:s.speed}),console.log(`[Main] 速度更新 - 舞蹈: ${s.speed.toFixed(2)}x, 音乐: ${n.toFixed(2)}x, 进度: ${(s.progressRatio||0).toFixed(2)}`)}}),console.log("[Main] 初始化 MP3 播放器..."),m=new F({maxSpeed:o.MUSIC_MAX_SPEED}),await m.init()||console.warn("[Main] MP3 播放器初始化失败，将使用合成音乐"),console.log("[Main] 初始化烈度可视化..."),S=new _({containerId:"intensityContainer",baseSpeed:o.BASE_SPEED,maxSpeed:o.MAX_SPEED,minSpeed:o.MIN_SPEED}),S.init()||console.warn("[Main] 烈度可视化初始化失败"),console.log("[Main] 初始化欢呼声管理器..."),M=new D,M.init()||console.warn("[Main] 欢呼声管理器初始化失败"),console.log("[Main] 游戏组件初始化完成！"),v=!0,P()}catch(a){console.error("[Main] 初始化失败:",a),h("初始化失败: "+a.message,"error");const e=document.getElementById("startBtn");e&&(e.disabled=!1)}}async function P(){try{if(console.log("[Main] 开始游戏..."),!E||!u){console.error("[Main] 应用未初始化"),h("应用未初始化","error");return}if(I=0,A(),console.log("[Main] 启动游戏..."),u.start(),f&&f.reset(),S&&S.reset(),m&&m.play(),console.log("[Main] 启动音频监听..."),!E.startListening())throw new Error("无法启动音频监听");console.log("[Main] 游戏已启动，等待拍巴掌..."),h("🎉 游戏已开始！尽情拍巴掌吧！","ready");const e=document.getElementById("startBtn");e&&(e.textContent="🔄 重新开始",e.disabled=!1);const t=document.getElementById("clapTestBtn");t&&(t.style.display="inline-block")}catch(a){console.error("[Main] 启动游戏失败:",a),h("启动游戏失败: "+a.message,"error")}}function U(){console.log("[Main] 模拟鼓掌调试");const a={confidence:.95,timestamp:Date.now(),isSimulated:!0};L(a);const e=document.getElementById("clapTestBtn");e&&(e.style.transform="scale(0.95)",setTimeout(()=>{e.style.transform="scale(1)"},150)),console.log("[Main] 模拟鼓掌完成")}function L(a){I++,console.log("[Main] 拍巴掌计数:",I,"置信度:",a.confidence.toFixed(2),a.isSimulated?"(模拟)":"(真实)"),f&&f.recordClap(a),u&&u.onClap(a),A()}function A(){const a=document.getElementById("clapCounterDisplay");a&&(a.textContent=I)}function h(a,e="ready"){const t=document.getElementById("status");t&&(t.textContent=a,t.className="status "+e)}document.addEventListener("DOMContentLoaded",()=>{B()});window.addEventListener("beforeunload",()=>{E&&E.destroy(),u&&u.destroy(),m&&m.destroy(),f&&f.destroy()});
