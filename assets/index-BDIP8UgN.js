(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(s){if(s.ep)return;s.ep=!0;const n=t(s);fetch(s.href,n)}})();class I{constructor(e={}){this.modelURL=e.modelURL||"https://teachablemachine.withgoogle.com/models/7xwSK62zg/",this.recognizer=null,this.isListening=!1,this.classLabels=[],this.onClapDetected=e.onClapDetected||(()=>{}),this.onStatusChange=e.onStatusChange||(()=>{}),this.onError=e.onError||(()=>{}),this.clapThreshold=e.clapThreshold||.8,this.clapLabel=e.clapLabel||"clap",this.lastClapTime=0,this.clapCooldown=e.clapCooldown||10}async init(){try{console.log("[AudioRecognizer] 开始初始化..."),console.log("[AudioRecognizer] 模型 URL:",this.modelURL),this.updateStatus("正在加载模型...","loading");const e=this.modelURL+"model.json",t=this.modelURL+"metadata.json";return console.log("[AudioRecognizer] Checkpoint URL:",e),console.log("[AudioRecognizer] Metadata URL:",t),this.recognizer=speechCommands.create("BROWSER_FFT",void 0,e,t),console.log("[AudioRecognizer] 识别器已创建，正在加载模型..."),await this.recognizer.ensureModelLoaded(),this.classLabels=this.recognizer.wordLabels(),console.log("[AudioRecognizer] 模型加载成功！"),console.log("[AudioRecognizer] 类别标签:",this.classLabels),console.log("[AudioRecognizer] 拍巴掌标签:",this.clapLabel),console.log("[AudioRecognizer] 置信度阈值:",this.clapThreshold),this.updateStatus("模型加载成功！","ready"),!0}catch(e){return console.error("[AudioRecognizer] 模型加载失败:",e),this.updateStatus("模型加载失败: "+e.message,"error"),this.onError(e),!1}}startListening(){if(!this.recognizer)return console.error("[AudioRecognizer] 识别器未初始化"),!1;try{return console.log("[AudioRecognizer] 开始监听音频..."),this.recognizer.listen(e=>{this.handleAudioResult(e)},{includeSpectrogram:!1,probabilityThreshold:.5,invokeCallbackOnNoiseAndUnknown:!0,overlapFactor:.8}),this.isListening=!0,console.log("[AudioRecognizer] 音频监听已启动"),this.updateStatus("正在监听音频...","ready"),!0}catch(e){return console.error("[AudioRecognizer] 启动监听失败:",e),this.updateStatus("启动监听失败: "+e.message,"error"),this.onError(e),!1}}stopListening(){this.recognizer&&this.isListening&&(this.recognizer.stopListening(),this.isListening=!1,this.updateStatus("已停止监听","ready"))}handleAudioResult(e){const t=e.scores,i=Date.now(),s={};let n=0,r="";for(let l=0;l<this.classLabels.length;l++)s[this.classLabels[l]]=(t[l]*100).toFixed(1)+"%",t[l]>n&&(n=t[l],r=this.classLabels[l]);if(n>.5&&console.log("[AudioRecognizer] 识别结果:",s,"| 最高分:",r,(n*100).toFixed(1)+"%"),i-this.lastClapTime<=this.clapCooldown||n<=this.clapThreshold)return;if(r.toLowerCase().includes("clap")||r.includes("掌声")){this.lastClapTime=i,this.onClapDetected({confidence:n,label:r,timestamp:i}),console.log(`[AudioRecognizer] ✅ 检测到拍巴掌: ${r} (${(n*100).toFixed(1)}%)`);return}for(let l=0;l<this.classLabels.length;l++){const E=this.classLabels[l],M=t[l];if((E.toLowerCase().includes(this.clapLabel.toLowerCase())||E.includes("掌声")||E.includes("clap"))&&M>this.clapThreshold){this.lastClapTime=i,this.onClapDetected({confidence:M,label:E,timestamp:i}),console.log(`[AudioRecognizer] ✅ 检测到拍巴掌: ${E} (${(M*100).toFixed(1)}%)`);return}}}updateStatus(e,t="ready"){this.onStatusChange({message:e,type:t})}getLabels(){return this.classLabels}destroy(){this.stopListening(),this.recognizer&&(this.recognizer=null)}}const o={BASE_SPEED:1,MAX_SPEED:10,MIN_SPEED:1},m={ACCELERATION_PER_CLAP:.15,ACCELERATION_FROM_FREQUENCY:.05,DECAY_RATE:.02,DECAY_INTERVAL:100,DECAY_DELAY:500,CLAP_HISTORY_WINDOW:2e3},S={LEVEL_MEDIUM:3,LEVEL_HIGH:5,LEVEL_EXTREME:8},u={CHEER_SOUND_URL:"/music/applause-cheer-236786.mp3",MIN_VOLUME:.3,MAX_VOLUME:1,MIN_SPEED_FOR_CHEER:2,BASE_INTERVAL:2e3,BASE_SPEED_FOR_INTERVAL:3,MAX_CONCURRENT_CHEERS:5},v={MUSIC_URL:"/music/1762243276279213039-330481002180723.mp3",VOLUME:.5};class P{constructor(e="gameContainer"){this.config={type:Phaser.CANVAS,width:800,height:600,parent:e,render:{canvas:{willReadFrequently:!0}},physics:{default:"arcade",arcade:{gravity:{y:300},debug:!1}},scene:{preload:()=>this.preload(),create:()=>this.create(),update:()=>this.update()}},this.game=null,this.dancer=null,this.danceSpeed=1,this.musicSpeed=1,this.isPlaying=!1,this.danceState="idle",this.danceTimer=0,this.danceIntensity=0,this.music=null,this.audioContext=null,this.analyser=null,this.dataArray=null,this.musicLoopTimer=null,this.speedDecayTimer=null}init(){this.game=new Phaser.Game(this.config)}preload(){}create(){const e=this.game.scene.scenes[0],t=e.make.graphics({x:0,y:0,add:!1});t.fillStyle(6717162,1),t.fillRect(0,0,800,600),t.generateTexture("background",800,600),t.destroy(),e.add.image(400,300,"background"),this.createDancer(e),this.createVisualization(e),this.initAudioContext()}createDancer(e){const t=e.make.graphics({x:0,y:0,add:!1});t.fillStyle(16767916,1),t.fillCircle(400,150,30),t.fillRect(385,185,30,60),t.fillRect(370,245,15,80),t.fillRect(415,245,15,80),t.fillRect(360,190,15,50),t.fillRect(425,190,15,50),t.generateTexture("dancer",800,400),t.destroy(),this.dancer=e.add.sprite(400,300,"dancer"),this.dancer.setScale(1)}createVisualization(e){this.visualBars=[];const t=32,i=800/t;for(let s=0;s<t;s++){const n=e.add.rectangle(s*i+i/2,550,i-2,10,7752610);n.initialHeight=10,this.visualBars.push(n)}console.log("[Game] 音乐可视化条已创建:",t,"个")}initAudioContext(){this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.dataArray=new Uint8Array(this.analyser.frequencyBinCount))}update(){this.isPlaying&&(this.updateDanceAnimation(),this.updateVisualization())}updateDanceAnimation(){this.danceTimer+=1;const e=1+this.danceIntensity*.3,t=Math.sin(this.danceTimer*.05*this.danceSpeed)*this.danceIntensity*.5;this.dancer.setScale(e),this.dancer.setRotation(t);const i=.15;this.danceIntensity=Math.max(i,this.danceIntensity-.005)}updateVisualization(){if(this.visualBars)for(let e=0;e<this.visualBars.length;e++){const i=(Math.sin((this.danceTimer+e)*.1*this.danceSpeed)*50+50)*this.danceIntensity*this.musicSpeed,n=Math.max(10,Math.min(150,i))/this.visualBars[e].initialHeight;this.visualBars[e].setScale(1,n)}}onClap(e){const t=Math.max(.3,e.confidence*1.2);this.danceIntensity=Math.min(1,this.danceIntensity+t),this.danceSpeed=Math.min(3,this.danceSpeed+.2);const i=this.musicSpeed;this.musicSpeed=Math.min(2,this.musicSpeed+.1),Math.abs(this.musicSpeed-i)>.01&&this.startBackgroundMusic(),this.resetSpeedDecay(),e.confidence>.85&&console.log("[Game] 拍巴掌事件:",{confidence:(e.confidence*100).toFixed(1)+"%",danceIntensity:this.danceIntensity.toFixed(2),danceSpeed:this.danceSpeed.toFixed(2),musicSpeed:this.musicSpeed.toFixed(2)})}resetSpeedDecay(){this.speedDecayTimer&&clearInterval(this.speedDecayTimer),this.speedDecayTimer=setInterval(()=>{this.danceSpeed=Math.max(1,this.danceSpeed-.01),this.musicSpeed=Math.max(1,this.musicSpeed-.005),this.danceSpeed<=1&&this.musicSpeed<=1&&clearInterval(this.speedDecayTimer)},100)}start(){this.isPlaying=!0,this.danceSpeed=1,this.musicSpeed=1,this.danceIntensity=.2,this.danceTimer=0,this.startBackgroundMusic(),console.log("[Game] 游戏开始，初始舞蹈强度:",this.danceIntensity)}stop(){this.isPlaying=!1,this.danceIntensity=0,this.danceSpeed=1,this.musicSpeed=1,this.speedDecayTimer&&clearInterval(this.speedDecayTimer),this.musicLoopTimer&&clearInterval(this.musicLoopTimer)}startBackgroundMusic(){this.musicLoopTimer&&clearInterval(this.musicLoopTimer);const e=1200/this.musicSpeed;this.musicLoopTimer=setInterval(()=>{this.isPlaying&&this.playBackgroundMusic()},e),this.playBackgroundMusic(),console.log("[Game] 背景音乐已启动，循环间隔:",e.toFixed(0),"ms")}playBackgroundMusic(){}getDanceSpeed(){return this.danceSpeed}getMusicSpeed(){return this.musicSpeed}setSpeedFromIntensity(e){this.danceSpeed=e,e<=5?this.musicSpeed=1+(e-1)/4:this.musicSpeed=2;const t=9,i=e-1;this.danceIntensity=.2+i/t*.8}destroy(){this.game&&(this.game.destroy(!0),this.game=null),this.speedDecayTimer&&clearInterval(this.speedDecayTimer)}}class w{constructor(e={}){this.baseSpeed=e.baseSpeed||o.BASE_SPEED,this.maxSpeed=e.maxSpeed||o.MAX_SPEED,this.minSpeed=e.minSpeed||o.MIN_SPEED,this.currentSpeed=this.baseSpeed,this.currentAcceleration=0,this.clapHistory=[],this.clapHistoryWindow=e.clapHistoryWindow||m.CLAP_HISTORY_WINDOW,this.accelerationPerClap=e.accelerationPerClap||m.ACCELERATION_PER_CLAP,this.accelerationFromFrequency=e.accelerationFromFrequency||m.ACCELERATION_FROM_FREQUENCY,this.decayRate=e.decayRate||m.DECAY_RATE,this.decayInterval=e.decayInterval||m.DECAY_INTERVAL,this.decayDelay=e.decayDelay||m.DECAY_DELAY,this.decayTimer=null,this.lastClapTime=0,this.onSpeedChange=e.onSpeedChange||(()=>{})}recordClap(e){const t=Date.now();this.lastClapTime=t,this.clapHistory.push(t),this.clapHistory=this.clapHistory.filter(f=>t-f<this.clapHistoryWindow);const i=this.clapHistory.length/this.clapHistoryWindow*1e3;let s=this.accelerationPerClap;const n=Math.min(.5,i/10*this.accelerationFromFrequency);s+=n;const r=e.confidence*.1;s+=r,this.currentAcceleration=s,this.updateSpeed(),console.log("[ClapIntensity] 鼓掌事件:",{frequency:i.toFixed(2)+" 次/秒",acceleration:s.toFixed(3),currentSpeed:this.currentSpeed.toFixed(2)+"x",clapCount:this.clapHistory.length}),this.startDecayTimer()}updateSpeed(){this.currentSpeed=Math.min(this.maxSpeed,Math.max(this.minSpeed,this.currentSpeed+this.currentAcceleration)),this.onSpeedChange({speed:this.currentSpeed,acceleration:this.currentAcceleration,clapFrequency:this.clapHistory.length/this.clapHistoryWindow*1e3})}startDecayTimer(){this.decayTimer||(this.decayTimer=setInterval(()=>{const e=Date.now();if(e-this.lastClapTime>500){this.currentAcceleration=Math.max(0,this.currentAcceleration-this.decayRate);const i=this.currentSpeed-this.baseSpeed;Math.abs(i)>.01?this.currentSpeed-=i*.05:this.currentSpeed=this.baseSpeed,this.clapHistory=this.clapHistory.filter(s=>e-s<this.clapHistoryWindow),this.onSpeedChange({speed:this.currentSpeed,acceleration:this.currentAcceleration,clapFrequency:this.clapHistory.length/this.clapHistoryWindow*1e3}),this.currentSpeed===this.baseSpeed&&this.currentAcceleration===0&&(clearInterval(this.decayTimer),this.decayTimer=null)}},this.decayInterval))}getSpeed(){return this.currentSpeed}getAcceleration(){return this.currentAcceleration}getClapFrequency(){return this.clapHistory.length/this.clapHistoryWindow*1e3}reset(){this.currentSpeed=this.baseSpeed,this.currentAcceleration=0,this.clapHistory=[],this.lastClapTime=0,this.decayTimer&&(clearInterval(this.decayTimer),this.decayTimer=null)}destroy(){this.decayTimer&&(clearInterval(this.decayTimer),this.decayTimer=null)}}class T{constructor(e={}){this.audioElement=null,this.audioContext=null,this.sourceNode=null,this.gainNode=null,this.musicUrl=e.musicUrl||v.MUSIC_URL,this.volume=e.volume||v.VOLUME,this.loop=e.loop!==!1,this.isPlaying=!1,this.currentSpeed=o.BASE_SPEED,this.minSpeed=e.minSpeed||o.MIN_SPEED,this.maxSpeed=e.maxSpeed||o.MAX_SPEED,this.onPlay=e.onPlay||(()=>{}),this.onPause=e.onPause||(()=>{}),this.onSpeedChange=e.onSpeedChange||(()=>{})}async init(){try{console.log("[MP3Player] 初始化播放器..."),this.audioElement=new Audio,this.audioElement.src=this.musicUrl,this.audioElement.loop=this.loop,this.audioElement.volume=this.volume,this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext)),this.audioContext.state==="suspended"&&await this.audioContext.resume(),this.gainNode=this.audioContext.createGain(),this.gainNode.gain.value=this.volume;try{this.sourceNode=this.audioContext.createMediaElementSource(this.audioElement),this.sourceNode.connect(this.gainNode),this.gainNode.connect(this.audioContext.destination)}catch(e){console.warn("[MP3Player] 源节点创建警告:",e.message)}return console.log("[MP3Player] 播放器初始化完成"),!0}catch(e){return console.error("[MP3Player] 初始化失败:",e),!1}}play(){try{this.audioElement&&!this.isPlaying&&(this.audioContext.state==="suspended"&&this.audioContext.resume(),this.audioElement.play(),this.isPlaying=!0,this.onPlay(),console.log("[MP3Player] 开始播放"))}catch(e){console.error("[MP3Player] 播放失败:",e)}}pause(){try{this.audioElement&&this.isPlaying&&(this.audioElement.pause(),this.isPlaying=!1,this.onPause(),console.log("[MP3Player] 暂停播放"))}catch(e){console.error("[MP3Player] 暂停失败:",e)}}stop(){try{this.audioElement&&(this.audioElement.pause(),this.audioElement.currentTime=0,this.isPlaying=!1,this.currentSpeed=1,this.onPause(),console.log("[MP3Player] 停止播放"))}catch(e){console.error("[MP3Player] 停止失败:",e)}}setSpeed(e){try{const t=Math.max(this.minSpeed,Math.min(this.maxSpeed,e));this.audioElement&&Math.abs(t-this.currentSpeed)>.01&&(this.audioElement.playbackRate=t,this.currentSpeed=t,this.onSpeedChange({speed:t}),console.log("[MP3Player] 播放速度已改变:",t.toFixed(2)+"x"))}catch(t){console.error("[MP3Player] 设置速度失败:",t)}}getSpeed(){return this.currentSpeed}setVolume(e){try{const t=Math.max(0,Math.min(1,e));this.audioElement&&(this.audioElement.volume=t),this.gainNode&&(this.gainNode.gain.value=t),this.volume=t,console.log("[MP3Player] 音量已改变:",(t*100).toFixed(0)+"%")}catch(t){console.error("[MP3Player] 设置音量失败:",t)}}getVolume(){return this.volume}getCurrentTime(){return this.audioElement?this.audioElement.currentTime:0}getDuration(){return this.audioElement?this.audioElement.duration:0}destroy(){try{this.audioElement&&(this.audioElement.pause(),this.audioElement.src="",this.audioElement=null),this.sourceNode&&(this.sourceNode.disconnect(),this.sourceNode=null),this.gainNode&&(this.gainNode.disconnect(),this.gainNode=null),this.audioContext&&(this.audioContext.close(),this.audioContext=null),console.log("[MP3Player] 播放器已销毁")}catch(e){console.error("[MP3Player] 销毁失败:",e)}}}class R{constructor(e={}){this.containerId=e.containerId||"intensityContainer",this.container=null,this.progressBar=null,this.speedDisplay=null,this.frequencyDisplay=null,this.motivationText=null,this.intensityLevel=null,this.minSpeed=e.minSpeed||o.MIN_SPEED,this.maxSpeed=e.maxSpeed||o.MAX_SPEED,this.baseSpeed=e.baseSpeed||o.BASE_SPEED,this.motivations=["🎉 开始鼓掌吧！","👏 继续加油！","🔥 越来越快了！","⚡ 太棒了！","🚀 飞起来了！","💥 爆炸性的节奏！","🌟 你是明星！","🎵 节奏感十足！","🎊 太嗨了！","👑 鼓掌之王！"],this.currentMotivationIndex=0}init(){try{return console.log("[IntensityVisualizer] 初始化可视化..."),this.container=document.getElementById(this.containerId),this.container?(this.container.innerHTML=`
                <div class="intensity-wrapper">
                    <div class="intensity-header">
                        <h3>🎵 鼓掌烈度</h3>
                        <div class="intensity-stats">
                            <div class="stat">
                                <span class="label">速度:</span>
                                <span class="value" id="speedDisplay">1.0x</span>
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
            `,this.progressBar=document.getElementById("progressBar"),this.progressGlow=document.getElementById("progressGlow"),this.speedDisplay=document.getElementById("speedDisplay"),this.frequencyDisplay=document.getElementById("frequencyDisplay"),this.motivationText=document.getElementById("motivationText"),this.intensityLevel=document.getElementById("intensityLevel"),this.addStyles(),console.log("[IntensityVisualizer] 可视化初始化完成"),!0):(console.error("[IntensityVisualizer] 容器不存在:",this.containerId),!1)}catch(e){return console.error("[IntensityVisualizer] 初始化失败:",e),!1}}addStyles(){const e=document.createElement("style");e.textContent=`
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
        `,document.head.appendChild(e)}update(e){const{speed:t,acceleration:i,clapFrequency:s}=e,n=t-this.baseSpeed,r=this.maxSpeed-this.baseSpeed,f=Math.max(0,Math.min(100,n/r*100));this.progressBar&&(this.progressBar.style.width=f+"%"),this.progressGlow&&(this.progressGlow.style.width=f+"%"),this.speedDisplay&&(this.speedDisplay.textContent=t.toFixed(2)+"x"),this.frequencyDisplay&&(this.frequencyDisplay.textContent=s.toFixed(1)+" 次/秒"),this.updateIntensityLevel(t),this.updateMotivation(t,s)}updateIntensityLevel(e){let t="基础",i="#4CAF50";e<=this.baseSpeed?(t="基础",i="#4CAF50"):e>=S.LEVEL_EXTREME?(t="极限",i="#E91E63"):e>=S.LEVEL_HIGH?(t="高烈度",i="#FF5722"):e>=S.LEVEL_MEDIUM&&(t="中等",i="#FFC107"),this.intensityLevel&&(this.intensityLevel.textContent=t,this.intensityLevel.style.color=i)}updateMotivation(e,t){if(!this.motivationText)return;let i=this.motivations[0];e<=this.baseSpeed?i="🎉 开始鼓掌吧！":t>5?i=this.motivations[Math.floor(Math.random()*this.motivations.length)]:e>=S.LEVEL_EXTREME?i=this.motivations[Math.floor(Math.random()*(this.motivations.length-2))+2]:e>=S.LEVEL_HIGH&&(i=this.motivations[Math.floor(Math.random()*(this.motivations.length-4))+1]),this.motivationText.textContent!==i&&(this.motivationText.textContent=i,this.motivationText.style.animation="none",setTimeout(()=>{this.motivationText.style.animation="pulse 0.5s ease-out"},10))}reset(){this.progressBar&&(this.progressBar.style.width="0%"),this.progressGlow&&(this.progressGlow.style.width="0%"),this.speedDisplay&&(this.speedDisplay.textContent=this.baseSpeed.toFixed(1)+"x"),this.frequencyDisplay&&(this.frequencyDisplay.textContent="0 次/秒"),this.intensityLevel&&(this.intensityLevel.textContent="基础",this.intensityLevel.style.color="#4CAF50"),this.motivationText&&(this.motivationText.textContent="🎉 开始鼓掌吧！")}}class D{constructor(e={}){this.cheerSoundUrl=e.cheerSoundUrl||u.CHEER_SOUND_URL,this.minVolume=e.minVolume||u.MIN_VOLUME,this.maxVolume=e.maxVolume||u.MAX_VOLUME,this.minSpeedForCheer=e.minSpeedForCheer||u.MIN_SPEED_FOR_CHEER,this.baseInterval=e.baseInterval||u.BASE_INTERVAL,this.baseSpeedForInterval=e.baseSpeedForInterval||u.BASE_SPEED_FOR_INTERVAL,this.maxConcurrentCheers=e.maxConcurrentCheers||u.MAX_CONCURRENT_CHEERS,this.currentSpeed=o.BASE_SPEED,this.cheerAudioPool=[],this.lastCheerTime=0,this.cheerTimer=null,this.isEnabled=!0}init(){try{console.log("[CheerManager] 初始化欢呼声管理器...");for(let e=0;e<this.maxConcurrentCheers;e++){const t=new Audio;t.src=this.cheerSoundUrl,t.preload="auto",this.cheerAudioPool.push({audio:t,isPlaying:!1})}return console.log("[CheerManager] 欢呼声管理器初始化完成"),!0}catch(e){return console.error("[CheerManager] 初始化失败:",e),!1}}updateSpeed(e){this.currentSpeed=e,e<this.minSpeedForCheer?(this.stopAllCheers(),this.cheerTimer&&(clearInterval(this.cheerTimer),this.cheerTimer=null)):this.cheerTimer||this.startCheerTimer()}startCheerTimer(){this.cheerTimer=setInterval(()=>{this.currentSpeed>=this.minSpeedForCheer&&this.isEnabled&&this.playCheer()},this.calculateCheerInterval())}calculateCheerInterval(){const e=this.currentSpeed/this.baseSpeedForInterval,t=Math.max(300,this.baseInterval/e);return Math.round(t)}playCheer(){const e=Date.now(),t=this.cheerAudioPool.find(i=>!i.isPlaying);if(t)try{const i=this.calculateVolume();t.audio.volume=i,t.audio.currentTime=0,t.isPlaying=!0;const s=t.audio.play();s!==void 0&&s.then(()=>{}).catch(n=>{console.warn("[CheerManager] 播放欢呼声失败:",n),t.isPlaying=!1}),t.audio.onended=()=>{t.isPlaying=!1},this.lastCheerTime=e}catch(i){console.error("[CheerManager] 播放欢呼声出错:",i)}}calculateVolume(){const e=o.MAX_SPEED-this.minSpeedForCheer,i=Math.max(0,this.currentSpeed-this.minSpeedForCheer)/e,s=this.minVolume+(this.maxVolume-this.minVolume)*i;return Math.min(this.maxVolume,Math.max(this.minVolume,s))}stopAllCheers(){this.cheerAudioPool.forEach(e=>{try{e.audio.pause(),e.audio.currentTime=0,e.isPlaying=!1}catch(t){console.warn("[CheerManager] 停止欢呼声失败:",t)}})}setEnabled(e){this.isEnabled=e,e||this.stopAllCheers()}destroy(){this.stopAllCheers(),this.cheerTimer&&(clearInterval(this.cheerTimer),this.cheerTimer=null),this.cheerAudioPool=[]}}let y=null,d=null,p=null,h=null,g=null,C=null,x=0,b=!1;async function _(){try{if(console.log("[Main] 开始加载模型..."),c("正在加载模型...","loading"),y=new I({modelURL:"https://teachablemachine.withgoogle.com/models/7xwSK62zg/",clapThreshold:.8,clapLabel:"clap",clapCooldown:200,onClapDetected:t=>{console.log("[Main] 收到拍巴掌事件"),N(t)},onStatusChange:t=>{console.log("[Main] 状态变化:",t.message),c(t.message,t.type)},onError:t=>{console.error("[Main] 音频识别错误:",t),c("错误: "+t.message,"error")}}),console.log("[Main] 音频识别器已创建，开始初始化模型..."),!await y.init())throw new Error("模型加载失败");console.log("[Main] 模型加载成功！"),c("✅ 模型加载成功！点击【开始游戏】按钮开始","ready");const e=document.getElementById("startBtn");e&&(e.disabled=!1,e.onclick=F)}catch(a){console.error("[Main] 模型加载失败:",a),c("模型加载失败: "+a.message,"error")}}async function F(){if(b){A();return}try{console.log("[Main] 用户点击开始，初始化游戏组件..."),c("正在初始化游戏...","loading");const a=document.getElementById("startBtn");a&&(a.disabled=!0),console.log("[Main] 创建游戏..."),d=new P("gameContainer"),d.init(),console.log("[Main] 初始化鼓掌烈度计算..."),p=new w({baseSpeed:o.BASE_SPEED,maxSpeed:o.MAX_SPEED,minSpeed:o.MIN_SPEED,onSpeedChange:s=>{d&&d.setSpeedFromIntensity(s.speed),h&&h.setSpeed(s.speed),C&&C.updateSpeed(s.speed),g&&g.update(s)}}),console.log("[Main] 初始化 MP3 播放器..."),h=new T({maxSpeed:2}),await h.init()||console.warn("[Main] MP3 播放器初始化失败，将使用合成音乐"),console.log("[Main] 初始化烈度可视化..."),g=new R({containerId:"intensityContainer",baseSpeed:o.BASE_SPEED,maxSpeed:o.MAX_SPEED,minSpeed:o.MIN_SPEED}),g.init()||console.warn("[Main] 烈度可视化初始化失败"),console.log("[Main] 初始化欢呼声管理器..."),C=new D,C.init()||console.warn("[Main] 欢呼声管理器初始化失败"),console.log("[Main] 游戏组件初始化完成！"),b=!0,A()}catch(a){console.error("[Main] 初始化失败:",a),c("初始化失败: "+a.message,"error");const e=document.getElementById("startBtn");e&&(e.disabled=!1)}}async function A(){try{if(console.log("[Main] 开始游戏..."),!y||!d){console.error("[Main] 应用未初始化"),c("应用未初始化","error");return}if(x=0,L(),console.log("[Main] 启动游戏..."),d.start(),p&&p.reset(),g&&g.reset(),h&&h.play(),console.log("[Main] 启动音频监听..."),!y.startListening())throw new Error("无法启动音频监听");console.log("[Main] 游戏已启动，等待拍巴掌..."),c("🎉 游戏已开始！尽情拍巴掌吧！","ready");const e=document.getElementById("startBtn");e&&(e.textContent="🔄 重新开始",e.disabled=!1)}catch(a){console.error("[Main] 启动游戏失败:",a),c("启动游戏失败: "+a.message,"error")}}function N(a){x++,console.log("[Main] 拍巴掌计数:",x,"置信度:",a.confidence.toFixed(2)),p&&p.recordClap(a),d&&d.onClap(a),L()}function L(){const a=document.getElementById("clapCounterDisplay");a&&(a.textContent=x)}function c(a,e="ready"){const t=document.getElementById("status");t&&(t.textContent=a,t.className="status "+e)}document.addEventListener("DOMContentLoaded",()=>{_()});window.addEventListener("beforeunload",()=>{y&&y.destroy(),d&&d.destroy(),h&&h.destroy(),p&&p.destroy()});
