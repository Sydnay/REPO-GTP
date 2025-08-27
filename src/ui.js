export function createSprite(color){
  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,size,size);
  ctx.fillStyle = color;
  for(let i=0;i<size;i++){
    for(let j=0;j<size/2;j++){
      if(Math.random()>0.5){
        ctx.fillRect(j,i,1,1);
        ctx.fillRect(size-1-j,i,1,1);
      }
    }
  }
  return canvas;
}

export function drawSprite(canvas, sprite){
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,32,32);
  ctx.drawImage(sprite,8,8);
}
