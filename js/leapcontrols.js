var options = {enableGesures:true};      //定义options,允许使用手势控制
var timeout;                             //倒计时
var processTime = null;
var hand1PositionX=0,                    //第一个感应手X坐标
    hand1PositionY=0,                    //第一个感应手Y坐标
    hand1PositionZ=0,                    //第一个感应手Z坐标
    hand2PositionX=0,                    //第二个感应手X坐标
    hand2PositionY=0,                    //第二个感应手Y坐标
    hand2PositionZ=0;                    //第二个感应手Z坐标
var thumbTipPositionX=0,                 //拇指指尖位置X坐标
    thumbTipPositionY=0,                 //拇指指尖位置Y坐标
    thumbTipPositionZ=0;                 //拇指指尖位置Z坐标
var indexTipPositionX=0,                 //拇指指尖位置X坐标
    indexTipPositionY=0,                 //拇指指尖位置Y坐标
    indexTipPositionZ=0;                 //拇指指尖位置Z坐标
var fingerTipDistance=0;
var isPinched = false;                   //是否捏住了
var rotateScale=2;                       //转动倍数
//定义是否监测到手，默认是false
var isHandDetected = false;
//定义是否完成手部指令
var isHandComplete = true;
//手和手指
var hand1,hand2,fingers;
//页面output的所需要参数
var data;
//初始缩放命令为放大
var action = "bigger";

//自转物体方法
var rotateModels = function(model,startRotation,deltaAngleX,deltaAngleY,speed){
  //物体围绕x轴转动deltaAngleY/speed的角度
  model.rotation.x = startRotation.x + deltaAngleX*speed;
  //将物体的围绕X轴的转动角度限制在Math.PI/2和-Math.PI/2之间
  if(model.rotation.x >= Math.PI/2){
    model.rotation.x = Math.PI/2;
  }else if(model.rotation.x <= -Math.PI/2){
    model.rotation.x = -Math.PI/2;
  }
  //物体围绕y轴转动deltaAngleY/speed的角度
  model.rotation.y = startRotation.y + deltaAngleY*speed;
};

var handsDetectedFunction = function(frame){
  var leftHand,rightHand;
  if(frame.hands.length>0){
    isHandDetected = true;                  //传感器探测到手    
    if(isHandComplete){
      //如果isComplete为true,则说明刚开始感应到手，则将isHandComplete改为false，且停止倒计时
      isHandComplete = false;
      if(timeout>0)
        clearTimeout(timeout);
      if(frame.hands.length===1){
        //初始化感应开始时，手掌的位置值
        hand1 = frame.hands[0];

        hand1PositionX = hand1.palmPosition[0];
        hand1PositionY = hand1.palmPosition[1];
        hand1PositionZ = hand1.palmPosition[2];
        //获取当前的围绕x轴y轴的角度
        for(var i = 0; i < rotateTypeArr.length; i++){
          rotateTypeArr[i] = model_arr[i].rotation;
        }   

        if(frame.hands.length>1){
          hand2 = frame.hands[1];

          hand2PositionX = hand2.palmPosition[0];
          hand2PositionY = hand2.palmPosition[1];
          hand2PositionZ = hand2.palmPosition[2];
        }
      }
    }else{
      //如果isHandComplete为false，说明检测到的手正在被追踪
      if(frame.hands.length==1){
        hand1 = frame.hands[0];
        hand2 = frame.hands[1];
        if(hand1.pinchStrength!==1&&!isPinched){
          //计算画布的宽和高
          var canvasWidth = window.outerWidth;
          var canvasHeight = window.outerHeight;
          //计算每次移动在x轴，y轴的角度差
          var deltaAngleX = (hand1.palmPosition[1] - hand1PositionY)/canvasHeight * Math.PI;
          var deltaAngleY = (hand1.palmPosition[0] - hand1PositionX)/canvasWidth * Math.PI;
          //转动物体
          model_arr.forEach(function(model,i){
            if(model===null)
              return;
            rotateModels(model,rotateTypeArr[i],deltaAngleX,deltaAngleY,rotateScale);
            rotateTypeArr[i] = model.rotation;
          });
          //覆盖当前触碰位置X/Y坐标，以备计算下次角度差
          hand1PositionX = hand1.palmPosition[0];
          hand1PositionY = hand1.palmPosition[1];
        }
        else{
          //判断是否是要放大，bigger代表要放大；smaller代表自动缩小
          action = model_arr[0].scale.x<=1.5?"bigger":"smaller";          
          //data.action = action;
          if(action==="bigger"){
            //锁住平移逻辑
            isPinched = true;
            if(hand1.pinchStrength!==1){   
              //开始放大         
              model_arr.forEach(function(model,i){
                if(model===null)
                  return;
                model.scale.x+=0.01;
                model.scale.y+=0.01;
                model.scale.z+=0.01;
              });    
            }                  
          }else{
            //完成发达，接触评议逻辑锁定
            isPinched = false;
            return;
          }          
        }        
      }      
    }    
  }else{
    if(isHandDetected){
      isHandDetected=!isHandDetected;
      if(isPinched)
        isPinched = !isPinched;
      timeout = setTimeout(function() {
        isHandComplete = true;
        //resetData();
      }, 3000);
    }
  }  
}

