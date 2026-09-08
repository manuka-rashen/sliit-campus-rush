import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const landmarks = [
  { id: 'new-building-1', name: 'New building · 1', color: '#b0c9b9', description: 'The front tower of the New building complex, with its pale-green end wall and white floor bands. The two towers are aligned one behind the other according to your corrected map.', position: [-54, 35, -85] },
  { id: 'new-building-2', name: 'New building · 2', color: '#a5bbd1', description: 'The rear tower of the New building complex, directly behind the front tower and south of CAHM.', position: [-54, 35, -121] },
  { id: 'main', name: 'Main academic block', color: '#ef9457', description: 'The stepped white-and-orange academic building, with its red cylindrical accent, open rooftop canopy, and raised yellow SLIIT sign structure.', position: [21, 25, -15] },
  { id: 'blue', name: 'Faculty of Computing', color: '#277bc4', description: 'The blue faculty building in front of the main block, with a pale green canopy, darker side wall, and repeated white-framed windows.', position: [-7, 14, 23] },
  { id: 'west', name: 'Faculty of Engineering', color: '#dabf65', description: 'The western academic building shown on the labelled reference, with its narrow coloured façade panels, recessed entrance, and solar-panel roof.', position: [-98, 20, -18] },
  { id: 'cahm', name: 'CAHM', color: '#e3a347', description: 'The white-and-orange CAHM building, moved to the north-west extension behind the New building towers and turned to follow the position marked on your map.', position: [-58, 9, -178] },
  { id: 'hall', name: 'Main auditorium', color: '#52a99e', description: 'The large curved-roof auditorium at the front-right of the campus, with its turquoise service tower, blue lower walls, curved orange foyer, and red entrance wall.', position: [77, 12, 46] },
  { id: 'field', name: 'Sports ground', color: '#76a257', description: 'The broad open playing field behind the main academic building. The ground is shown with its worn central pitch, as visible in the photographs.', position: [85, 1, -75] },
  { id: 'business-school', name: 'Business school', color: '#456f98', description: 'The building beside the sports ground, recreated from your façade photo with tall blue fins, white window bays, a glazed stairwell, an orange side wing, and a covered entrance.', position: [94, 12, -23] },
  { id: 'recreation', name: 'Student recreation area', color: '#95a66a', description: 'The long pitched-roof pavilion beside the central access road, surrounded by the wooded student recreation area.', position: [-59, 5, 43] },
  { id: 'tennis', name: 'Tennis court', color: '#83999e', description: 'The court immediately in front and to the west of the engineering building, with boundary lines, a central net, and perimeter fencing.', position: [-108, 1, 26] },
  { id: 'basketball', name: 'Basketball & volleyball', color: '#bd9e7e', description: 'The front-left sports courts shown in the supplied labelled map and aerial photograph.', position: [-80, 1, 86] },
  { id: 'entrance', name: 'Entrance & courtyard', color: '#cc7c59', description: 'The terracotta courtyard with wide pale paving bands, square tree planters, tapered orange piers, a red SLIIT beam, and the circular glazed entrance canopy.', position: [28, 5, 43] },
] as const;

export function createCampus() {
  const root = new T.Group(); root.name = 'The SLIIT UNI, in 3d';
  root.userData = { creator: 'Manuka Rashen', description: 'Photo-based interpretation of SLIIT Malabe campus' };
  const groups: Record<string,T.Group> = {};
  const mats = new Map<string,T.MeshStandardMaterial>();
  function material(color: string) { if(!mats.has(color)) mats.set(color,new T.MeshStandardMaterial({color,roughness:0.84})); return mats.get(color)!; }
  function group(name:string) { const g=new T.Group();g.name=name;root.add(g);groups[name]=g;return g; }
  function mesh(g:T.Group,geo:T.BufferGeometry,color:string,x:number,y:number,z:number) { const m=new T.Mesh(geo,material(color));m.position.set(x,y,z);g.add(m);return m; }
  function box(g:T.Group,x:number,y:number,z:number,w:number,h:number,d:number,c:string) {return mesh(g,new T.BoxGeometry(w,h,d),c,x,y,z);}
  const white='#e8eee9', frame='#f7f6e9', glass='#466475', concrete='#bfc8c1';
  function block(g:T.Group,x:number,z:number,w:number,d:number,h:number,floors:number,c:string) {
    box(g,x,h/2,z,w,h,d,c);box(g,x,h+.6,z,w+1.5,1.2,d+1.5,frame);
    const n=Math.floor((w-4)/4.4), side=Math.floor((d-4)/4.4), fh=(h-3)/floors;
    for(let f=0;f<floors;f++) {const y=3+f*fh;
      for(const s of [-1,1]) {
        for(let k=0;k<n;k++){ const xx=x+(k-(n-1)/2)*4.4;
          box(g,xx,y,z+s*(d/2+.12),3.05,2.2,.18,glass);
          box(g,xx,y,z+s*(d/2+.24),.13,2.3,.13,frame);
          box(g,xx,y-.45,z+s*(d/2+.24),3.1,.1,.13,frame);
        }
        for(let k=0;k<side;k++) {const zz=z+(k-(side-1)/2)*4.4;
          box(g,x+s*(w/2+.12),y,zz,.18,2.2,2.7,glass);
          box(g,x+s*(w/2+.24),y,zz,.13,2.3,.12,frame);
        }
        box(g,x,y+1.5,z+s*(d/2+.18),w,.22,.35,frame);
      }
    }
  }
  const terrain=group('Landscape');
  box(terrain,0,-3.2,-13,314,6,292,'#a5b694');
  box(terrain,0,-.2,-13,312,.5,290,'#91ac77');
  box(terrain,0,-5,-13,310,1,288,'#62796b');
  // Front and side roads, curbs, and center markings.
  box(terrain,0,.08,121,312,.18,17,'#657074');
  box(terrain,-146,.08,-14,17,.18,254,'#657074');
  box(terrain,140,.08,-10,10,.18,249,'#8a9490');
  box(terrain,0,.21,110.8,281,.4,2.2,concrete);
  box(terrain,-135,.21,-8,2,.4,237,concrete);
  for(let x=-150;x<155;x+=13) box(terrain,x,.2,121,6,.06,.5,frame);
  for(let z=-132;z<115;z+=13) box(terrain,-146,.2,z,.5,.06,6,frame);
  // Access roads and the long tiled entrance axis follow the supplied aerial views.
  box(terrain,34,.3,81,53,.6,64,'#be704e');
  box(terrain,23,.3,47,70,.6,28,'#bd7358');
  box(terrain,30,.3,30,20,.6,8,'#bd7358');
  // Fine terracotta joints sit inside the wide pale paving grid in the reference.
  for(let x=-11;x<58;x+=2)box(terrain,x,.62,47,.075,.025,28,'#975d49');
  for(let z=34;z<=61;z+=2.1)box(terrain,23,.63,z,70,.025,.075,'#975d49');
  for(let x=8;x<60;x+=2)box(terrain,x,.62,85,.075,.025,55,'#975d49');
  for(let z=62;z<=112;z+=2.1)box(terrain,34,.63,z,53,.025,.075,'#975d49');
  for(const x of [-10,7,24,41,58])box(terrain,x,.68,47,.8,.08,28,'#e7e3ce');
  for(const z of [34,43,52,61])box(terrain,23,.68,z,70,.08,.8,'#e7e3ce');
  for(const x of [9,24,41,59])box(terrain,x,.68,87,.8,.08,51,'#e7e3ce');
  for(let z=62;z<=110;z+=8)box(terrain,34,.68,z,53,.08,.85,'#e7e3ce');
  box(terrain,31,.73,87,4,.16,51,'#e7e3ce');
  box(terrain,-95,.15,7,65,.3,10,'#a8afaa');
  box(terrain,-69,.15,-4.5,8,.3,65,'#b7beb3');
  box(terrain,-79,.15,-79,8,.3,64,'#b7beb3');
  const northDriveBend=box(terrain,-74,.15,-42,8,.3,14.15,'#b7beb3');northDriveBend.rotation.y=Math.PI/4;
  const drive=box(terrain,-53,.15,17,8,.3,83,'#b7beb3');drive.rotation.y=.38;
  box(terrain,-75,.15,61,112,.3,8,'#b7beb3');
  box(terrain,104,.15,89,62,.3,9,'#a2aba6');
  const main=group('main');
  block(main,19,-17,53,24,42,8,white);
  box(main,-7,23,-14,12,46,26,'#efa16b');
  box(main,50,20,-13,11,40,25,'#e99b65');
  // Small slit windows in the otherwise plain orange service walls.
  for(let y=7;y<39;y+=7){box(main,51,y,.05,2.1,.85,.2,glass);box(main,-9,y,-.85,2.2,.8,.2,glass);}
  for(let y=3;y<43;y+=5)box(main,20,y,-4.7,41,.2,.5,'#c8d0ca');
  for(const x of [-17,42])box(main,x,24,-16,1.4,48,28,'#599b9d');
  for(const x of [-17,4,24,42])box(main,x,46.5,-5,.5,6,.5,white);
  box(main,12,49.8,-16,63,1,30,'#c3d7c7');
  box(main,20,54,-24,24,10,2,'#f0d84d');
  box(main,31.5,53,-24,1,8,8,'#328ece');
  mesh(main,new T.CylinderGeometry(1.4,1.4,48,20),'#de594a',1,26,-.5);
  for(let y=7;y<45;y+=7)box(main,3.7,y,1.2,5,.7,2.7,'#378ea5');
  // Open roof pergola on the lower eastern wing.
  for(const x of [39,47,55])for(const z of [-23,-8])box(main,x,43,z,.3,5,.3,'#899e9b');
  for(let x=38;x<57;x+=2.2)box(main,x,45.5,-15.5,.2,.25,16,'#9baaa3');
  const blue=group('blue');block(blue,-7,23,40,23,26,5,'#248ccb');
  box(blue,-28,13,23,3,26,24,'#1a769e');
  box(blue,-7,27.2,23,43,1.1,27,'#b8d5c3');
  for(const x of [-24,11])box(blue,x,27,35,.4,4,.4,'#56969f');
  // User-corrected layout: towers share one axis, with CAHM farther north.
  function whiteTower(id:string,x:number,z:number,h:number,green:boolean){
    const g=group(id);block(g,x,z,26,26,h,13,'#edf2ee');
    for(let y=5;y<h-2;y+=4.5){
      box(g,x,y,z+13.6,26.8,.48,2.3,'#f6f6ec');
      box(g,x+13.6,y,z,2.3,.48,26.8,'#f6f6ec');
      for(let k=0;k<6;k++)box(g,x-11+k*4.4,y+1.2,z+13.3,.4,2.9,1.1,'#497eaf');
      for(let k=0;k<6;k++)box(g,x+13.3,y+1.2,z-11+k*4.4,1.1,2.9,.4,'#497eaf');
    }
    // Large white end frame and the pale green service-wall panel.
    if(green){box(g,x-8,h/2,z+13.9,8.5,h-5,1.6,'#a9c8ae');for(let y=5;y<h-3;y+=2.4)box(g,x-3.2,y,z+14,.22,.2,1.3,'#f4f5ec');}
    box(g,x-12,h/2,z+14,2.2,h,1.8,'#f3f6ef');
    box(g,x,h+1.6,z,28,3.3,28,'#f4f7f1');
    box(g,x,h+3.35,z,24,.2,24,'#a5b5b1');
    box(g,x-5,h+4.2,z-4,6,1.6,5,white);
    for(const xx of [x-10,x,x+10])box(g,xx,2,z+14,1,4,1,'#d7c4a3');
    return g;
  }
  whiteTower('new-building-1',-54,-85,65,true);
  whiteTower('new-building-2',-54,-121,67,false);
  const connector=group('New building connection');block(connector,-54,-103,9,10,58,12,'#d6e1dc');
  const west=group('west');block(west,-98,-18,45,20,37,7,'#e5e0cb');
  const colors=['#d6bb64','#73a8c4','#f2e8d3','#aec2ba'];
  for(let k=0;k<14;k++)for(let f=0;f<7;f++)box(west,-118+k*3.1,4+f*4.6,-7.4,.9,3.7,.7,colors[(k+f*3)%4]);
  box(west,-122,20,-17,4,40,23,'#e4dec7');
  box(west,-109,4,-3,8,8,7,glass);
  for(const x of [-112,-106])box(west,x,4,1,1,8,1,'#818e81');
  for(let x=-118;x<-78;x+=3.2)for(let z=-26;z<-10;z+=3.1){const panel=box(west,x,38.65,z,3,.2,2.7,'#57738a');panel.rotation.x=-.08;}
  // The marked CAHM position lies beyond the old model tile; extend that corner.
  box(terrain,-58,-3.2,-180,65,6,54,'#a5b694');
  box(terrain,-58,-.2,-180,65,.5,54,'#91ac77');
  box(terrain,-58,-5,-180,63,1,52,'#62796b');
  box(terrain,-79,.15,-157,6,.3,92,'#b7beb3');
  box(terrain,-60,.15,-203,44,.3,6,'#b7beb3');
  const cahm=group('cahm');block(cahm,0,0,41,17,16,3,'#eeeee2');
  box(cahm,-18,8,9.1,8,16,1.2,'#e4a043');
  for(let x=-10;x<20;x+=3.3){box(cahm,x,9,9.2,2.5,10,.4,'#516570');box(cahm,x+1.5,9,9.6,.22,10,.5,frame);}
  box(cahm,0,17,0,44,1,19,white);
  cahm.rotation.y=Math.PI/2;cahm.position.set(-58,0,-178);
  const hall=group('hall');box(hall,77,6,47,51,12,40,'#86a795');
  box(hall,77,4.5,69,54,9,5,'#258bc1');
  const roof=new T.BufferGeometry(),v:number[]=[];
  for(let i=0;i<28;i++){const x1=-27+i*54/28,x2=x1+54/28,y1=12+8*Math.sqrt(Math.max(0,1-(x1/27)**2)),y2=12+8*Math.sqrt(Math.max(0,1-(x2/27)**2));v.push(x1,y1,-22,x1,y1,22,x2,y2,22,x1,y1,-22,x2,y2,22,x2,y2,-22);}
  roof.setAttribute('position',new T.Float32BufferAttribute(v,3));roof.computeVertexNormals();
  material('#bad8c1').side=T.DoubleSide;const roofMesh=new T.Mesh(roof,material('#bad8c1'));roofMesh.position.set(77,0,47);hall.add(roofMesh);
  // Closed curved end wall and roof seams make the auditorium a solid volume.
  const capShape=new T.Shape();capShape.moveTo(-27,12);for(let i=0;i<=28;i++){const x=-27+i*54/28;capShape.lineTo(x,12+8*Math.sqrt(Math.max(0,1-(x/27)**2)));}capShape.lineTo(27,12);capShape.closePath();
  for(const z of [25,69])mesh(hall,new T.ShapeGeometry(capShape),'#8bb7a0',77,0,z);
  for(let i=1;i<27;i++){const x=-27+i*2,y=12+8*Math.sqrt(Math.max(0,1-(x/27)**2));box(hall,77+x,y+.08,47,.12,.1,44,'#d2e0c9');}
  box(hall,54,15,31,10,19,13,'#64b7ae');box(hall,54,24.6,31,10.6,.3,13.6,'#b6c6b7');
  box(hall,103,6,64,3,12,17,'#d95341');
  // Curved front foyer: a segment of the wall projects into the plaza.
  const foyer=mesh(hall,new T.CylinderGeometry(12,12,8,28,1,false,-Math.PI/2,Math.PI),'#da8c5d',68,4,74);foyer.rotation.y=Math.PI/2;
  box(hall,69,8.3,74,24,.6,12,'#e6e8d4');
  for(let x=55;x<88;x+=4.2)box(hall,x,4.5,72.2,.55,9,.7,'#e4c85d');
  const field=group('field');box(field,86,.18,-76,92,.35,74,'#8fae68');
  // Worn grass and a cricket-like central strip are visible; omit invented football stripes.
  mesh(field,new T.CircleGeometry(14,24),'#b5b07d',83,.39,-75).rotation.x=-Math.PI/2;
  box(field,84,.42,-75,4,.08,19,'#c4b28a');
  // Business school: four storeys, blue blade walls, glazed stair bay, orange wing.
  const school=group('business-school');
  const sx=94,sz=-23;
  box(school,sx-7,10.5,sz,33,21,18,'#e5e2d8');
  box(school,sx+20,9,sz+1,15,18,20,'#e7a067');
  box(school,sx+10,11,sz+2,6,22,19,'#637e86');
  // Broad front windows, vertical mullions, and projecting sunshades.
  for(let floor=0;floor<4;floor++){
    const y=3.2+floor*5;
    for(const x of [sx-17,sx-10,sx-1]){
      box(school,x,y,sz+9.15,4.8,2.9,.28,'#82928f');
      for(const offset of [-1.65,0,1.65])box(school,x+offset,y,sz+9.4,.15,3.1,.18,'#d7d7c8');
      box(school,x,y-1.5,sz+9.7,5.3,.28,1.25,'#f2f0e4');
    }
    for(const x of [sx+16,sx+22]){
      box(school,x,2.8+floor*4.2,sz+11.15,3.25,2.4,.25,'#6a7e7f');
      box(school,x,2.8+floor*4.2,sz+11.35,.13,2.5,.2,'#e4dcca');
    }
    for(const z of [-6,0,6])box(school,sx+27.65,2.8+floor*4.2,sz+z,.25,2.4,2.5,'#718485');
  }
  // Recessed glass stairwell with a visible grid and diagonal stair flights.
  box(school,sx+10,11,sz+11.7,5.5,20,.3,'#759298');
  for(let y=1.5;y<22;y+=2.4)box(school,sx+10,y,sz+12,5.7,.13,.18,'#b6bdae');
  for(const x of [sx+7.3,sx+10,sx+12.7])box(school,x,11,sz+12,.14,21,.18,'#c9c9b8');
  for(let y=3;y<20;y+=4.8){const flight=box(school,sx+10,y,sz+12.1,5.3,.22,.2,'#d0cabc');flight.rotation.z=.41;}
  // Four tall blue fins have sloped tops and project in front of the window bays.
  for(const x of [sx-25,sx-5,sx+14,sx+29]){
    const shape=new T.Shape();shape.moveTo(-10,0);shape.lineTo(12.5,0);shape.lineTo(15,24.5);shape.lineTo(-10,22);shape.closePath();
    const geometry=new T.ExtrudeGeometry(shape,{depth:1.05,bevelEnabled:false});geometry.rotateY(-Math.PI/2);
    mesh(school,geometry,'#476c95',x+.5,0,sz);
  }
  // Separately shaded roof bays follow the blade-wall profile.
  for(const [offset,width] of [[-15,19],[4,17],[22,13]]){const roofBay=box(school,sx+offset,22.4,sz+1,width,.55,24,'#92998e');roofBay.rotation.x=-.09;}
  box(school,sx+19,18.2,sz+12,15,.5,2,'#f0c88b');
  for(const x of [sx+13,sx+20,sx+27])box(school,x,19.5,sz+11.4,.35,3.4,.35,'#e3ae6d');
  // Entrance canopy, recessed double doors, steps, and railings.
  box(school,sx+11,3.1,sz+12.4,5.5,5.7,.35,'#354e59');
  box(school,sx+15,6.5,sz+15,13,.7,8,'#c3c7bf');
  for(const x of [sx+9,sx+21])box(school,x,3.2,sz+18,.35,6.3,.35,'#a6b7b4');
  for(let i=0;i<5;i++)box(school,sx+15,.2+i*.22,sz+23-i,12,.4+i*.44,1.3,'#b8bcb1');
  for(const x of [sx+8.5,sx+21.5]){box(school,x,1.5,sz+20,.13,2.5,.13,'#5d7072');box(school,x,2.7,sz+18,.13,.13,7,'#5d7072');}
  box(terrain,sx,.14,sz+20,59,.28,15,'#b1b6ac');
  const recreation=group('recreation');box(recreation,-59,2.4,42,15,4.8,35,'#69857a');
  for(const x of [-67,-51])for(let z=25;z<61;z+=6)box(recreation,x,3,z,.45,6,.45,'#e4dfb7');
  for(const side of [-1,1]){const roofPart=box(recreation,-59+side*4.3,7.2,42,10.5,.5,38,'#a3bf93');roofPart.rotation.z=side*-.64;}
  const entrance=group('entrance');
  // Tall orange blade piers, tapered and leaning slightly like the courtyard photo.
  for(const x of [-3,20,57]){
    const pier=new T.BoxGeometry(3.5,13,2.1),positions=pier.getAttribute('position');
    for(let i=0;i<positions.count;i++){const t=(positions.getY(i)+6.5)/13;positions.setX(i,positions.getX(i)*(1-.38*t)+1.1*t);}
    pier.computeVertexNormals();mesh(entrance,pier,'#df7a43',x,7.1,42);
    box(entrance,x,.78,42,4,.25,2.8,'#d58a61');
  }
  box(entrance,27,13.7,42,63,1.7,1.9,'#a92e40');
  box(entrance,58,13.7,48,1.9,1.7,12,'#a92e40');
  box(entrance,58,6.4,54,1.7,12,1.7,'#d98547');
  // Glazed entrance rotunda and broad circular canopy behind the red beam.
  mesh(main,new T.CylinderGeometry(7.2,7.2,9,32),'#608c97',30,4.8,18);
  for(let i=0;i<13;i++){const a=i*Math.PI/12;box(main,30+7.35*Math.cos(a),4.8,18+7.35*Math.sin(a),.18,9.2,.18,'#d6dfd8');}
  mesh(main,new T.CylinderGeometry(9.2,9.2,.7,40),'#d0d7c8',30,9.7,18);
  mesh(main,new T.CylinderGeometry(8.8,9.2,.65,40),'#878c77',30,10.3,18);
  box(main,30,3.5,25.35,4.2,6.2,.3,'#375c64');
  box(main,30,3.5,25.6,.14,6.2,.16,'#e4e4d2');
  for(let i=0;i<4;i++)box(entrance,30,.28+i*.14,30-i*1.1,18,.4+i*.28,1.2,'#dedbca');
  for(let z=44;z<108;z+=7)box(entrance,58,.85,z,1.4,.4,1.4,'#e9d4ae');
  // Stepped landscaping on the auditorium side of the front plaza.
  for(let i=0;i<6;i++){box(entrance,80+i*3.5,.5+i*.26,100-i*3.3,34,.65,1.2,'#dcdac5');box(entrance,80+i*3.5,.5+i*.26,97.7-i*3.3,32,.6,3.2,'#8daa67');}
  box(entrance,113,.15,62,35,.3,34,'#949f99');
  for(let x=100;x<130;x+=4.5)box(entrance,x,.36,70,.13,.07,8,frame);
  block(entrance,123,94,6,5,3,1,'#e5e2c9');box(entrance,123,3.8,94,8,.7,7,'#788c7d');
  for(let x=66;x<130;x+=3)box(entrance,x,1.6,110,.14,3.2,.14,'#c4d0c3');
  box(entrance,98,2.9,110,65,.15,.15,'#c4d0c3');
  // Courts occupy the west frontage rather than being hidden beneath trees.
  function court(id:string,x:number,z:number,w:number,d:number,color:string){const g=group(id);box(g,x,.18,z,w+4,.35,d+4,'#b3b4a0');box(g,x,.4,z,w,.14,d,color);for(const xx of [x-w/2+1,x+w/2-1])box(g,xx,.5,z,.16,.05,d-2,frame);for(const zz of [z-d/2+1,z+d/2-1])box(g,x,.5,zz,w-2,.05,.16,frame);return g;}
  const tennis=court('tennis',-110,28,29,17,'#80908c');
  for(const z of [23,33])box(tennis,-110,.52,z,27,.05,.13,frame);
  box(tennis,-110,.52,28,.15,.05,15,frame);
  for(const z of [19,37])box(tennis,-110,1.2,z,.14,2.1,.14,'#697a70');
  for(let z=20;z<37;z+=.7)box(tennis,-110,1.2,z,.05,1.6,.05,'#d0d7cd');
  for(const z of [17,39])for(let x=-127;x<-91;x+=4)box(tennis,x,2,z,.15,4,.15,'#90a294');
  for(const x of [-127,-93])box(tennis,x,3.8,28,.14,.15,22,'#90a294');
  const basketball=court('basketball',-91,84,32,19,'#a69c87');
  box(basketball,-91,.52,84,.16,.05,17,frame);
  const circle=mesh(basketball,new T.RingGeometry(2.65,2.8,48),frame,-91,.54,84);circle.rotation.x=-Math.PI/2;
  for(const x of [-105,-77]){box(basketball,x,1.9,84,.18,3.7,.18,'#798e80');box(basketball,x,3.7,84,.15,1.1,1.7,frame);for(const z of [80.8,87.2])box(basketball,x+(x<-90?2.5:-2.5),.53,z,5,.06,.14,frame);}
  // Volleyball uses the same selectable court group but has its own surface and net.
  box(basketball,-56,.2,91,22,.4,15,'#c0aa87');
  for(const x of [-65,-47])box(basketball,x,.46,91,.15,.05,11,frame);
  for(const z of [85.5,96.5])box(basketball,-56,.46,z,18,.05,.15,frame);
  for(const z of [85,97])box(basketball,-56,1.4,z,.15,2.8,.15,'#7d8b75');
  box(basketball,-56,2.7,91,.08,.13,12,frame);
  // Geometry lettering keeps the model texture-free and exportable.
  const glyphs:Record<string,string[]>= {S:['111','100','111','001','111'],L:['100','100','100','100','111'],I:['111','010','010','010','111'],T:['111','010','010','010','010']};
  function sign(g:T.Group,x:number,y:number,z:number,scale:number,color=frame) { for(let n=0;n<5;n++)glyphs['SLIIT'[n]].forEach((row,j)=>[...row].forEach((p,k)=>{if(p==='1')box(g,x+(n*4+k)*scale,y-j*scale,z,scale*.87,scale*.87,.2,color);})); }
  sign(main,9,63,-22.8,.95);sign(blue,-13,25,34.65,.48);sign(entrance,23,14.7,43.06,.6,'#82c8df');
  const plants=group('Trees');let seed=81;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function tree(x:number,z:number,s=1) {
    mesh(plants,new T.CylinderGeometry(.35*s,.55*s,5*s,6),'#786b4e',x,2.5*s,z);
    const col=['#4c7950','#5d8d54','#739751','#3d7250'][Math.floor(rand()*4)];
    const crown=mesh(plants,new T.IcosahedronGeometry(4.2*s,1),col,x,7*s,z);crown.scale.set(1,1.1,.9);
    mesh(plants,new T.IcosahedronGeometry(3*s,0),col,x+2*s,6*s,z+1*s);
  }
  const occupied=[[-72,-35,-139,-67],[-75,-40,-204,-152],[-20,59,-34,4],[-33,17,6,39],[19,41,8,34],[-127,-71,-32,14],[34,135,-115,-35],[65,127,-37,6],[46,109,20,83],[-72,-46,20,63],[-130,-89,14,42],[-111,-71,70,98],[-69,-43,80,103],[-14,66,31,113],[92,135,39,107],[-135,-19,56,67],[-86,-73,-159,-41],[-75,-63,-40,27]];
  for(let i=0;i<470;i++){const x=-130+rand()*264,z=-146+rand()*252;
    const clear=occupied.some(([a,b,c,d])=>x>a&&x<b&&z>c&&z<d);
    if(!clear)tree(x,z,.55+rand()*.6);
  }
  function planter(x:number,z:number,s=.62){
    box(entrance,x,.79,z,6.3,.2,6.3,'#eee9d8');
    box(entrance,x,1.03,z,4.9,.38,4.9,'#c5c6b6');
    box(entrance,x,1.24,z,3.5,.06,3.5,'#8b8a5c');
    tree(x,z,s);
  }
  for(const x of [8,45])for(const z of [38,53])planter(x,z,.72);
  for(const x of [9,57])for(let z=69;z<=105;z+=12)planter(x,z,.58);
  for(let z=-115;z<110;z+=14)tree(-133,z,.68);
  // Cars and parking bays give the approximate architecture a readable scale.
  const cars=group('Street details');
  function car(x:number,z:number,c:string,rot=0){ const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;cars.add(g);box(g,0,1,0,2,1.2,4,c);box(g,0,1.8,-.2,1.7,.8,2,glass);for(const xx of [-1,1])for(const zz of [-1.25,1.25]){const w=mesh(g,new T.CylinderGeometry(.45,.45,.3,8),'#303c3e',xx,.6,zz);w.rotation.z=Math.PI/2;} }
  for(let i=0;i<11;i++){box(terrain,-121+i*4.5,.35,7,.12,.06,6,frame);if(i%3!==0)car(-119+i*4.5,7,['#e5e8e3','#2f535d','#cb614b'][i%3]);}
  for(let i=0;i<7;i++)car(-110+i*34,125,i%2?'#e1e5dc':'#3e7686',Math.PI/2);
  for(let i=0;i<6;i++)car(102+i*4.5,69,i%2?'#e5e8df':'#526b71');
  // Merge by material within each landmark: detailed façades, few draw calls.
  for(const g of Object.values(groups)) {
    g.updateMatrixWorld(true);const buckets=new Map<T.Material,T.BufferGeometry[]>();
    g.traverse(o=>{if(o instanceof T.Mesh){const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);if(!geo.getAttribute('uv'))geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geo.getAttribute('position').count*2),2));const list=buckets.get(o.material)||[];list.push(geo.index?geo.toNonIndexed():geo);buckets.set(o.material,list);o.geometry.dispose();}});
    g.clear();g.position.set(0,0,0);g.rotation.set(0,0,0);g.scale.set(1,1,1);for(const [mat,geos] of buckets){const merged=mergeGeometries(geos);geos.forEach(a=>a.dispose());if(merged){const m=new T.Mesh(merged,mat);m.castShadow=true;m.receiveShadow=true;g.add(m);}}
  }
  return {root,groups};
}
