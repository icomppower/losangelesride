// ============================================================================
//  CITY: Los Angeles — "City of Angels"
//  A flat downtown grid + palm boulevards + Hollywood hills & sign, with 9
//  signature LA landmarks. All controls/camera/minimap/tour come from the
//  shared engine; this file only builds LA's world. Load via ?city=los_angeles
// ============================================================================
export const CITY = {
  id:'los_angeles',
  name:'CITY OF ANGELS',
  subtitle:'LOS ANGELES · GOLDEN HOUR',
  tagline:'3D LOS ANGELES · FREE DRIVE',
  seed:1337,
  // golden-hour theme == engine defaults; carColor is LA red
  theme:{ carColor:0xff4d3d },
  start:{ x:(-(13*64)/2-15/2+6*(64+15))-3.5, z:(13*64)/2-18, heading:Math.PI },
  bounds:{ x0:-471, x1:471, z0:-1191, z1:471 },

  districts(x,z){
    const HALF=(13*64)/2, dc=Math.hypot(x,z)/HALF;
    if(z<-HALF*0.6)return'HOLLYWOOD HILLS';
    if(dc<0.32)return'DOWNTOWN';
    if(dc<0.62)return'MID-CITY';
    return'THE BOULEVARDS';
  },

  build(api){
    const {THREE,scene,rand,rr,pick,clamp,buildCar,windowTex,palm,registerBeacon}=api;

    const BLOCK=64, ROAD=15, GRID=13, HALF=(GRID*BLOCK)/2, cell=BLOCK+ROAD, worldSize=GRID*cell;
    const HOLLY_POS=new THREE.Vector3(0,0,-HALF-620);
    const buildings=[];               // {x,z,hw,hd,h}
    const landmarks=[];               // {x,z,name,short}
    const landmarkCells=new Set();
    const bldgGroup=new THREE.Group();scene.add(bldgGroup);
    const palmGroup=new THREE.Group();scene.add(palmGroup);

    // ---------- streets: asphalt base + sidewalk pads + lane dashes ----------
    const roadMat=new THREE.MeshStandardMaterial({color:0x33343a,roughness:0.95});
    const walkMat=new THREE.MeshStandardMaterial({color:0x9a958c,roughness:1});
    const laneMat=new THREE.MeshStandardMaterial({color:0xd9c26a,emissive:0x3a3010,roughness:0.7});
    (function streets(){
      const base=new THREE.Mesh(new THREE.PlaneGeometry(worldSize,worldSize),roadMat);
      base.rotation.x=-Math.PI/2;base.position.y=0;base.receiveShadow=true;scene.add(base);
      const im=new THREE.InstancedMesh(new THREE.BoxGeometry(BLOCK,0.5,BLOCK),walkMat,GRID*GRID);
      const d=new THREE.Object3D();let i=0;
      for(let gx=0;gx<GRID;gx++)for(let gz=0;gz<GRID;gz++){
        const x=-HALF+BLOCK/2+gx*cell, z=-HALF+BLOCK/2+gz*cell;
        d.position.set(x,0.25,z);d.updateMatrix();im.setMatrixAt(i++,d.matrix);}
      im.receiveShadow=true;im.castShadow=true;scene.add(im);
      const dashGeo=new THREE.PlaneGeometry(1.1,5);
      const roadCenters=[];for(let k=0;k<=GRID;k++)roadCenters.push(-HALF-ROAD/2+k*cell);
      const dashCount=roadCenters.length*((worldSize/12)|0)*2;
      const dim=new THREE.InstancedMesh(dashGeo,laneMat,dashCount);let di=0;
      for(const rc of roadCenters)for(let s=-worldSize/2;s<worldSize/2;s+=12){
        d.position.set(rc,0.06,s);d.rotation.set(-Math.PI/2,0,0);d.scale.set(1,1,1);d.updateMatrix();if(di<dashCount)dim.setMatrixAt(di++,d.matrix);
        d.position.set(s,0.06,rc);d.rotation.set(-Math.PI/2,0,Math.PI/2);d.updateMatrix();if(di<dashCount)dim.setMatrixAt(di++,d.matrix);}
      dim.count=di;scene.add(dim);
    })();

    // ---------- window textures + buildings ----------
    const winTexPool=[];for(let i=0;i<6;i++)winTexPool.push(windowTex(6,16,pick(['#5a5f6e','#6b5e58','#585a62','#4e5566']),pick(['#ffe6a0','#ffd27a','#fff0c8','#ffcf88'])));
    const roofMat=new THREE.MeshStandardMaterial({color:0x3a3a42,roughness:0.9});
    const towerMats=['#2e3340','#3a3630','#333a40','#2b2f38'];
    function makeBuilding(x,z,footprint,h,downtownness){
      const hw=footprint*0.5, hd=footprint*0.5;
      const tex=pick(winTexPool).clone();tex.needsUpdate=true;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
      tex.repeat.set(Math.max(1,footprint/10),Math.max(2,h/10));
      const mat=new THREE.MeshStandardMaterial({map:tex,color:new THREE.Color(pick(towerMats)),roughness:0.55,metalness:0.18,emissive:0xffe6b0,emissiveMap:tex,emissiveIntensity:0.9});
      const m=new THREE.Mesh(new THREE.BoxGeometry(footprint,h,footprint),mat);m.position.set(x,h/2,z);m.castShadow=true;m.receiveShadow=true;bldgGroup.add(m);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(footprint*0.96,1.4,footprint*0.96),roofMat);cap.position.set(x,h+0.7,z);cap.castShadow=true;bldgGroup.add(cap);
      if(downtownness>0.55&&h>70){
        const antH=rr(8,22);const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.8,antH,6),roofMat);
        ant.position.set(x+rr(-hw*0.4,hw*0.4),h+antH/2,z+rr(-hd*0.4,hd*0.4));bldgGroup.add(ant);
        const beacon=new THREE.Mesh(new THREE.SphereGeometry(1.2,8,8),new THREE.MeshBasicMaterial({color:0xff3a2a}));
        beacon.position.set(ant.position.x,h+antH,ant.position.z);bldgGroup.add(beacon);registerBeacon(beacon);}
      buildings.push({x,z,hw,hd,h});
    }
    function makePlaza(x,z){
      const pad=new THREE.Mesh(new THREE.CylinderGeometry(BLOCK*0.42,BLOCK*0.42,0.6,32),new THREE.MeshStandardMaterial({color:0x8a8478,roughness:1}));pad.position.set(x,0.3,z);pad.receiveShadow=true;bldgGroup.add(pad);
      const grass=new THREE.Mesh(new THREE.CylinderGeometry(BLOCK*0.3,BLOCK*0.3,0.7,28),new THREE.MeshStandardMaterial({color:0x4b7a3a,roughness:1}));grass.position.set(x,0.35,z);grass.receiveShadow=true;bldgGroup.add(grass);
      const fount=new THREE.Mesh(new THREE.CylinderGeometry(5,6,1.4,20),new THREE.MeshStandardMaterial({color:0x6c95c4,roughness:0.3,metalness:0.2}));fount.position.set(x,0.9,z);fount.castShadow=true;bldgGroup.add(fount);
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2;palm(x+Math.cos(a)*BLOCK*0.34,z+Math.sin(a)*BLOCK*0.34,rr(0.9,1.2));}
      buildings.push({x,z,hw:6,hd:6,h:2});
    }

    // ---------- landmarks ----------
    function blockCenter(gx,gz){return[-HALF+BLOCK/2+gx*cell,-HALF+BLOCK/2+gz*cell];}
    function reg(x,z,name,short,hw,hd,h){landmarks.push({x,z,name,short});buildings.push({x,z,hw,hd,h});}
    function lmUSBank(x,z){
      const h=310,R=17;const tex=pick(winTexPool).clone();tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(6,h/9);
      const body=new THREE.Mesh(new THREE.CylinderGeometry(R,R*1.15,h,28,1,true),new THREE.MeshStandardMaterial({map:tex,color:0x6a7488,roughness:0.4,metalness:0.35,emissive:0xffe6b0,emissiveMap:tex,emissiveIntensity:0.8,side:THREE.DoubleSide}));
      body.position.set(x,h/2,z);body.castShadow=true;bldgGroup.add(body);
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(R*0.7,R,10,28),roofMat);cap.position.set(x,h+5,z);bldgGroup.add(cap);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(R*0.95,1.4,8,28),new THREE.MeshBasicMaterial({color:0x9fd0ff}));ring.rotation.x=Math.PI/2;ring.position.set(x,h+1,z);bldgGroup.add(ring);
      const spire=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.8,30,6),roofMat);spire.position.set(x,h+25,z);bldgGroup.add(spire);
      const beacon=new THREE.Mesh(new THREE.SphereGeometry(1.4,8,8),new THREE.MeshBasicMaterial({color:0xff3a2a}));beacon.position.set(x,h+40,z);bldgGroup.add(beacon);registerBeacon(beacon);
      reg(x,z,'U.S. BANK TOWER','USB',R+2,R+2,h);
    }
    function lmCityHall(x,z){
      const wm=new THREE.MeshStandardMaterial({color:0xe9e3d2,roughness:0.85});
      const base=new THREE.Mesh(new THREE.BoxGeometry(46,14,46),wm);base.position.set(x,7,z);base.castShadow=true;base.receiveShadow=true;bldgGroup.add(base);
      const h=120;const tex=pick(winTexPool).clone();tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(3,h/10);
      const tower=new THREE.Mesh(new THREE.BoxGeometry(20,h,20),new THREE.MeshStandardMaterial({color:0xeee7d6,roughness:0.8,emissive:0xffedc0,emissiveMap:tex,emissiveIntensity:0.4}));tower.position.set(x,14+h/2,z);tower.castShadow=true;bldgGroup.add(tower);
      const step=new THREE.Mesh(new THREE.BoxGeometry(26,8,26),wm);step.position.set(x,14+h+4,z);bldgGroup.add(step);
      const pyr=new THREE.Mesh(new THREE.ConeGeometry(15,20,4),wm);pyr.rotation.y=Math.PI/4;pyr.position.set(x,14+h+18,z);pyr.castShadow=true;bldgGroup.add(pyr);
      const lant=new THREE.Mesh(new THREE.SphereGeometry(2,10,10),new THREE.MeshBasicMaterial({color:0xfff2c0}));lant.position.set(x,14+h+30,z);bldgGroup.add(lant);
      reg(x,z,'LOS ANGELES CITY HALL','CH',24,24,h);
    }
    function lmCapitol(x,z){
      const R=13,h=64;const core=new THREE.Mesh(new THREE.CylinderGeometry(R,R,h,24),new THREE.MeshStandardMaterial({color:0xd8cbb0,roughness:0.7,emissive:0x2a2418,emissiveIntensity:0.4}));core.position.set(x,h/2+4,z);core.castShadow=true;bldgGroup.add(core);
      const ledgeM=new THREE.MeshStandardMaterial({color:0x3a3a42,roughness:0.6});
      for(let i=0;i<6;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(R+2.2,R+2.2,1.6,24),ledgeM);l.position.set(x,12+i*10,z);l.castShadow=true;bldgGroup.add(l);}
      const roof=new THREE.Mesh(new THREE.CylinderGeometry(R,R,4,24),new THREE.MeshStandardMaterial({color:0xe7ddc4,roughness:0.7}));roof.position.set(x,h+6,z);bldgGroup.add(roof);
      const needle=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.5,34,6),roofMat);needle.position.set(x,h+23,z);bldgGroup.add(needle);
      const beacon=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,8),new THREE.MeshBasicMaterial({color:0xff2a1a}));beacon.position.set(x,h+40,z);bldgGroup.add(beacon);registerBeacon(beacon);
      reg(x,z,'CAPITOL RECORDS','CAP',R+2,R+2,h);
    }
    function lmDisney(x,z){
      const steel=new THREE.MeshStandardMaterial({color:0xcfd6dd,roughness:0.22,metalness:0.95,side:THREE.DoubleSide});
      const podium=new THREE.Mesh(new THREE.BoxGeometry(48,10,48),new THREE.MeshStandardMaterial({color:0xb9bfc6,roughness:0.4,metalness:0.7}));podium.position.set(x,5,z);podium.castShadow=true;podium.receiveShadow=true;bldgGroup.add(podium);
      const sails=[[-12,10,26,0.5,-0.3],[10,10,34,-0.4,0.4],[0,14,40,0.2,0.1],[-4,8,22,0.7,0.6],[14,10,28,-0.6,-0.2]];
      for(const[sx,sz,sh,rx,rz]of sails){const sail=new THREE.Mesh(new THREE.CylinderGeometry(sh*0.6,sh*0.6,sh,20,1,true,0,Math.PI*1.1),steel);sail.position.set(x+sx,10+sh*0.4,z+sz);sail.rotation.set(rx,rr(0,Math.PI*2),rz);sail.scale.set(1,1,0.55);sail.castShadow=true;bldgGroup.add(sail);}
      reg(x,z,'WALT DISNEY CONCERT HALL','WDCH',26,26,20);
    }
    function lmRandys(x,z){
      const shop=new THREE.Mesh(new THREE.BoxGeometry(28,10,20),new THREE.MeshStandardMaterial({color:0xece4d6,roughness:0.85}));shop.position.set(x,5,z);shop.castShadow=true;shop.receiveShadow=true;bldgGroup.add(shop);
      const donut=new THREE.Mesh(new THREE.TorusGeometry(9,3.6,16,30),new THREE.MeshStandardMaterial({color:0xcaa15e,roughness:0.75}));donut.position.set(x,23,z);donut.castShadow=true;bldgGroup.add(donut);
      const frost=new THREE.Mesh(new THREE.TorusGeometry(9,3.9,16,30,Math.PI*1.3),new THREE.MeshStandardMaterial({color:0xf3d9b0,roughness:0.5}));frost.position.set(x,23.4,z);frost.rotation.z=0.4;bldgGroup.add(frost);
      reg(x,z,"RANDY'S DONUTS",'DONUT',15,11,26);
    }
    function lmTheme(x,z){
      const wm=new THREE.MeshStandardMaterial({color:0xeeeae0,roughness:0.45,metalness:0.25});
      for(let a=0;a<2;a++){const arch=new THREE.Mesh(new THREE.TorusGeometry(20,1.7,10,22,Math.PI),wm);arch.position.set(x,0,z);arch.rotation.y=a*Math.PI/2;arch.castShadow=true;bldgGroup.add(arch);}
      const col=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,20,12),wm);col.position.set(x,10,z);bldgGroup.add(col);
      const disc=new THREE.Mesh(new THREE.CylinderGeometry(11,11,3,24),new THREE.MeshStandardMaterial({color:0xdfe3e6,roughness:0.3,metalness:0.6}));disc.position.set(x,20,z);disc.castShadow=true;bldgGroup.add(disc);
      const dome=new THREE.Mesh(new THREE.SphereGeometry(6,18,10,0,Math.PI*2,0,Math.PI/2),wm);dome.position.set(x,21.5,z);bldgGroup.add(dome);
      reg(x,z,'LAX THEME BUILDING','LAX',22,22,24);
    }
    function lmDodger(x,z){
      const field=new THREE.Mesh(new THREE.CylinderGeometry(13,13,0.6,28),new THREE.MeshStandardMaterial({color:0x4f8a3e,roughness:1}));field.position.set(x,0.3,z);field.receiveShadow=true;bldgGroup.add(field);
      const infield=new THREE.Mesh(new THREE.CylinderGeometry(5,5,0.7,20),new THREE.MeshStandardMaterial({color:0xb98a52,roughness:1}));infield.position.set(x,0.4,z);bldgGroup.add(infield);
      const standM=new THREE.MeshStandardMaterial({color:0xdad3c4,roughness:0.85});
      for(let i=0;i<4;i++){const ri=15+i*4.2,ro=ri+4.4;const ring=new THREE.Mesh(new THREE.CylinderGeometry(ro,ri,3.4,32,1,true),standM);ring.position.set(x,2+i*2.6,z);ring.castShadow=true;ring.receiveShadow=true;bldgGroup.add(ring);}
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,10,6),standM);pole.position.set(x+Math.cos(a)*30,7,z+Math.sin(a)*30);bldgGroup.add(pole);
        const flag=new THREE.Mesh(new THREE.PlaneGeometry(3,2),new THREE.MeshStandardMaterial({color:pick([0x2f6fd0,0xffffff]),side:THREE.DoubleSide}));flag.position.set(x+Math.cos(a)*30+1.6,11,z+Math.sin(a)*30);bldgGroup.add(flag);}
      reg(x,z,'DODGER STADIUM','DODGERS',31,31,14);
    }
    (function placeLandmarks(){
      const spots=[[6,5,lmUSBank],[5,6,lmDisney],[7,6,lmCityHall],[6,2,lmCapitol],[2,10,lmRandys],[10,11,lmTheme],[10,2,lmDodger]];
      for(const[gx,gz,fn]of spots){landmarkCells.add(gx+','+gz);const[bx,bz]=blockCenter(gx,gz);fn(bx,bz);}
    })();

    // ---------- fill the grid with buildings (skipping plaza + landmark cells) ----------
    (function placeCity(){
      const cx=(GRID-1)/2, cyz=(GRID-1)/2;
      for(let gx=0;gx<GRID;gx++)for(let gz=0;gz<GRID;gz++){
        if(landmarkCells.has(gx+','+gz))continue;
        const bx=-HALF+BLOCK/2+gx*cell, bz=-HALF+BLOCK/2+gz*cell;
        const dc=Math.hypot(gx-cx,gz-cyz)/(GRID*0.5);
        const downtownness=clamp(1-dc,0,1);
        if(gx===((GRID-1)/2|0)&&gz===((GRID-1)/2|0)){makePlaza(bx,bz);continue;}
        const lots=downtownness>0.5?1:(rand()<0.5?1:(rand()<0.6?2:4));
        if(lots===1){const fp=BLOCK*rr(0.6,0.82);const h=downtownness>0.6?rr(90,240)*(0.6+downtownness*0.7):rr(10,40)+downtownness*60;makeBuilding(bx,bz,fp,clamp(h,8,320),downtownness);}
        else{const grid2=2,sub=BLOCK/grid2;
          for(let a=0;a<grid2;a++)for(let b=0;b<grid2;b++){if(lots===2&&(a+b)%2===0)continue;const lx=bx-BLOCK/2+sub/2+a*sub,lz=bz-BLOCK/2+sub/2+b*sub;const fp=sub*rr(0.62,0.82);const h=rr(8,26)+downtownness*45;makeBuilding(lx,lz,fp,clamp(h,7,90),downtownness);}}
      }
    })();

    // ---------- palms along avenues ----------
    (function palmLines(){
      const roadCenters=[];for(let k=0;k<=GRID;k++)roadCenters.push(-HALF-ROAD/2+k*cell);
      for(const rc of roadCenters)for(let s=-HALF;s<=HALF;s+=cell){
        if(rand()<0.5)palm(rc+ROAD*0.55,s+rr(-6,6),rr(0.85,1.15));
        if(rand()<0.5)palm(s+rr(-6,6),rc+ROAD*0.55,rr(0.85,1.15));}
    })();

    // ---------- Hollywood hills + sign ----------
    function hillH(x,z){
      const y=(z-(-HALF-560));
      let h=Math.max(0,220-Math.abs(x)*0.02)*(0.4+0.6*Math.exp(-((-y+300)*(-y+300))/90000));
      h+=Math.sin(x*0.012)*30+Math.cos(x*0.03-y*0.02)*22;return Math.max(0,h-2);
    }
    (function hills(){
      const g=new THREE.PlaneGeometry(3600,1400,80,32);const p=g.attributes.position;
      for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);
        let h=Math.max(0,220-Math.abs(x)*0.02)*(0.4+0.6*Math.exp(-((y+300)*(y+300))/90000));
        h+=Math.sin(x*0.012)*30+Math.cos(x*0.03+y*0.02)*22;h=Math.max(0,h);p.setZ(i,h);}
      g.computeVertexNormals();
      const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x93743e,roughness:1}));mesh.rotation.x=-Math.PI/2;mesh.position.set(0,-2,-HALF-560);mesh.receiveShadow=true;scene.add(mesh);
    })();
    function letterTex(ch){
      const c=document.createElement('canvas');c.width=128;c.height=180;const x=c.getContext('2d');
      x.clearRect(0,0,128,180);x.fillStyle='#f6f2ea';x.font='bold 150px Arial';x.textAlign='center';x.textBaseline='middle';
      x.fillText(ch,64,96);x.strokeStyle='#c9c2b4';x.lineWidth=4;x.strokeText(ch,64,96);return new THREE.CanvasTexture(c);
    }
    (function hollywoodSign(){
      const letters="HOLLYWOOD".split("");const grp=new THREE.Group();const lw=17,gap=6,total=letters.length*(lw+gap);
      const trunkMat=new THREE.MeshStandardMaterial({color:0x8a6a44,roughness:1});
      letters.forEach((ch,i)=>{const tex=letterTex(ch);
        const m=new THREE.Mesh(new THREE.PlaneGeometry(lw,24),new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:0.8,side:THREE.DoubleSide,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:0.12}));
        const x=-total/2+i*(lw+gap)+lw/2, z=HOLLY_POS.z+Math.sin(i*0.6)*24, y=hillH(x,z)+13;m.position.set(x,y,z);grp.add(m);
        const post=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,20,6),trunkMat);post.position.set(x,y-11,z-1);grp.add(post);});
      scene.add(grp);landmarks.push({x:HOLLY_POS.x,z:-HALF-40,name:'HOLLYWOOD SIGN',short:'★'});
    })();
    (function griffith(){
      const gx=360,gz=-HALF-470,gy=hillH(gx,gz);const grp=new THREE.Group();grp.position.set(gx,gy,gz);
      const wm=new THREE.MeshStandardMaterial({color:0xeae3d0,roughness:0.8});
      const body=new THREE.Mesh(new THREE.BoxGeometry(46,12,16),wm);body.position.y=6;body.castShadow=true;grp.add(body);
      const dm=new THREE.MeshStandardMaterial({color:0xbfc4c2,roughness:0.5,metalness:0.3});
      const cDome=new THREE.Mesh(new THREE.SphereGeometry(8,18,12),dm);cDome.position.set(0,12,0);cDome.castShadow=true;grp.add(cDome);
      for(const sx of[-18,18]){const dd=new THREE.Mesh(new THREE.SphereGeometry(5,16,10),dm);dd.position.set(sx,12,0);dd.castShadow=true;grp.add(dd);
        const drum=new THREE.Mesh(new THREE.CylinderGeometry(5,5,4,16),wm);drum.position.set(sx,9,0);grp.add(drum);}
      scene.add(grp);landmarks.push({x:gx,z:gz,name:'GRIFFITH OBSERVATORY',short:'GO'});
      buildings.push({x:gx,z:gz,hw:24,hd:9,h:20});
    })();

    // ---------- distant mountains ----------
    (function mountains(){
      const mk=(dist,col,h,seg)=>{const g=new THREE.PlaneGeometry(6000,h,seg,1);const p=g.attributes.position;
        for(let i=0;i<p.count;i++){const x=p.getX(i);if(p.getY(i)>0)p.setY(i,h/2*(0.4+0.6*Math.abs(Math.sin(x*0.004+dist)+Math.cos(x*0.0016))));}
        g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,fog:false}));m.position.set(0,h*0.2,-2000-dist*260);scene.add(m);};
      mk(0,0x9a6a5a,420,60);mk(1,0x7a5560,520,50);mk(2,0x5f4a66,640,40);
    })();

    // ---------- traffic ----------
    const carPalette=[0xd23b3b,0x2f6fd0,0xe8c23a,0xdedede,0x2b2b2b,0x3aa564,0xe07b2f,0x7a4bd0];
    const roads=[];
    (function makeRoads(){
      const roadCenters=[];for(let k=0;k<=GRID;k++)roadCenters.push(-HALF-ROAD/2+k*cell);
      for(const rc of roadCenters){
        roads.push({axis:'z',fixed:rc-3.5,a:-HALF,b:HALF});roads.push({axis:'z',fixed:rc+3.5,a:-HALF,b:HALF});
        roads.push({axis:'x',fixed:rc-3.5,a:-HALF,b:HALF});roads.push({axis:'x',fixed:rc+3.5,a:-HALF,b:HALF});}
    })();
    const traffic=[];
    for(let i=0;i<46;i++){const r=pick(roads);const car=buildCar(pick(carPalette));scene.add(car.group);traffic.push({car,road:r,dir:rand()<0.5?1:-1,speed:rr(9,17),s:rr(r.a,r.b)});}

    // ---------- world contract back to the engine ----------
    return {
      collide(nx,nz){for(const b of buildings)if(Math.abs(nx-b.x)<b.hw+1.4&&Math.abs(nz-b.z)<b.hd+1.4)return b;return null;},
      groundH:()=>0,
      landmarks,
      minimapBlocks:buildings.filter(b=>b.h>=6).map(b=>({x:b.x,z:b.z})),
      trafficPoints:()=>traffic.map(t=>({x:t.road.axis==='z'?t.road.fixed:t.s, z:t.road.axis==='z'?t.s:t.road.fixed})),
      size:worldSize,
      update(dt){
        for(const t of traffic){t.s+=t.dir*t.speed*dt;
          if(t.s>t.road.b)t.s=t.road.a;if(t.s<t.road.a)t.s=t.road.b;
          const px=t.road.axis==='z'?t.road.fixed:t.s, pz=t.road.axis==='z'?t.s:t.road.fixed;
          t.car.group.position.set(px,0,pz);
          t.car.group.rotation.y=t.road.axis==='z'?(t.dir>0?0:Math.PI):(t.dir>0?Math.PI/2:-Math.PI/2);}
      },
    };
  }
};
export default CITY;
