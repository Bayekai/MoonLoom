import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const cols = 16, rows = 16;
const points = [];
// Boundary vertices first, clockwise, for an editable mesh in Rive.
for (let c=0;c<=cols;c++) points.push([c,0]);
for (let r=1;r<=rows;r++) points.push([cols,r]);
for (let c=cols-1;c>=0;c--) points.push([c,rows]);
for (let r=rows-1;r>0;r--) points.push([0,r]);
const boundary = points.length;
for (let r=1;r<rows;r++) for (let c=1;c<cols;c++) points.push([c,r]);
const indices = new Map(points.map(([c,r],i)=>[`${c},${r}`,i]));
const triangleBytes = [];
function varuint(v) { do { const b=v&127; v>>>=7; triangleBytes.push(b|(v?128:0)); } while(v); }
for (let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
  const a=indices.get(`${c},${r}`),b=indices.get(`${c+1},${r}`),d=indices.get(`${c},${r+1}`),e=indices.get(`${c+1},${r+1}`);
  [a,b,e,a,e,d].forEach(varuint);
}
const bones = [
  {id:100,name:'Fixed body and paws',x:0,y:0},
  {id:101,name:'Left ear',x:345,y:250},
  {id:102,name:'Right ear',x:430,y:300},
  {id:103,name:'Tail',x:260,y:440},
  {id:104,name:'Chest breathing',x:365,y:540},
];
function influence(x,y) {
  const regions = [
    [2,260,155,105,110,.9], [3,500,200,85,105,.9],
    [4,160,435,120,110,.8], [5,365,470,90,55,.85],
  ];
  const options = regions.map(([index,cx,cy,rx,ry,strength])=>{
    const falloff=Math.max(0,1-((x-cx)/rx)**2-((y-cy)/ry)**2);
    return {index,weight:falloff*falloff*strength};
  }).sort((a,b)=>b.weight-a.weight);
  const {index,weight}=options[0];
  const w=Math.round(weight*255);
  return w ? {values:(255-w)|(w<<8),indices:1|(index<<8)} : {values:255,indices:1};
}
const mesh = points.map(([c,r],i)=>{
  const x=c*704/cols,y=r*576/rows;
  const weight=influence(x,y);
  const kind=i<boundary?'ContourMeshVertex':'MeshVertex';
  return `<${kind} x="${x-352}" y="${y-288}" u="${c/cols}" v="${r/rows}" name="V${i}"><Weight values="${weight.values}" indices="${weight.indices}"/></${kind}>`;
}).join('\n');
const tendons=bones.map(b=>`<Tendon boneId="0:${b.id}" tx="${b.x}" ty="${b.y}" name="${b.name}"/>`).join('\n');
const images=Array.from({length:5},(_,i)=>`<Image assetId="0:${200+i}" x="352" y="288" name="blink-0${i+1}" id="0:${300+i}"><Mesh triangleIndexBytes="${Buffer.from(triangleBytes).toString('base64')}" name="Shared character mesh">${mesh}<Skin tx="352" ty="288" name="Skin">${tendons}</Skin></Mesh></Image>`).join('\n');
const assets=Array.from({length:5},(_,i)=>`<ImageAsset file="../../animations/blink/blink-0${i+1}.png" name="blink-0${i+1}" id="0:${200+i}"/>`).join('\n');
function animation(boneId,key,values) {
  return `<KeyedObject objectId="0:${boneId}"><KeyedProperty propertyKey="${key}">${values.map(([frame,value])=>`<KeyFrameDouble frame="${frame}" value="${value}" interpolationType="linear"/>`).join('')}</KeyedProperty></KeyedObject>`;
}
function reducedCondition(value) {
  return `<TransitionViewModelCondition opValue="equal"><TransitionPropertyViewModelComparator><BindablePropertyBoolean><DataBindContext sourcePathIds="0:40-0:46" propertyKey="634"/></BindablePropertyBoolean></TransitionPropertyViewModelComparator><TransitionValueBooleanComparator value="${value}"/></TransitionViewModelCondition>`;
}
function layer(name, activeState, stillState, activeAnimation, stillAnimation) {
  return `<StateMachineLayer name="${name}"><EntryState x="0" y="0"><StateTransition stateToId="0:${stillState}">${reducedCondition(true)}</StateTransition><StateTransition stateToId="0:${activeState}"/></EntryState><AnimationState x="180" y="0" animationId="0:${activeAnimation}" id="0:${activeState}"><StateTransition stateToId="0:${stillState}">${reducedCondition(true)}</StateTransition></AnimationState><AnimationState x="180" y="180" animationId="0:${stillAnimation}" id="0:${stillState}"><StateTransition stateToId="0:${activeState}">${reducedCondition(false)}</StateTransition></AnimationState></StateMachineLayer>`;
}
const text=`<Rive version="1" kind="fragment">
<Artboard width="704" height="576" name="Nimbo" id="0:2" styleId="0:5" defaultStateMachineId="0:7" viewModelId="0:40" viewModelInstanceId="0:41">
<LayoutComponentStyle name="Nimbo Style" id="0:5"/>
${bones.map(b=>`<RootBone x="${b.x}" y="${b.y}" length="30" name="${b.name}" id="0:${b.id}"/>`).join('\n')}
<Solo name="Existing blink" id="0:20" activeComponentId="0:300">${images}</Solo>
<StateMachine name="NimboBehavior" id="0:7">
${layer('Preserved blink',12,14,6,9)}
${layer('Gentle mesh idle',13,15,8,10)}
</StateMachine>
<LinearAnimation name="Blink" id="0:6" fps="100" duration="520" loopValue="loop"><KeyedObject objectId="0:20"><KeyedProperty propertyKey="296">${[[0,300],[480,301],[489,302],[500,303],[509,304],[520,300]].map(([frame,id])=>`<KeyFrameId frame="${frame}" value="0:${id}"/>`).join('')}</KeyedProperty></KeyedObject></LinearAnimation>
<LinearAnimation name="Mesh idle" id="0:8" fps="60" duration="264" loopValue="loop">
${animation(101,15,[[0,0],[66,-.018],[132,0],[198,.012],[264,0]])}
${animation(102,15,[[0,0],[66,.014],[132,0],[198,-.01],[264,0]])}
${animation(103,15,[[0,0],[66,-.024],[132,0],[198,.024],[264,0]])}
${animation(104,17,[[0,1],[132,1.025],[264,1]])}
</LinearAnimation>
<LinearAnimation name="Still eyes" id="0:9" duration="1"><KeyedObject objectId="0:20"><KeyedProperty propertyKey="296"><KeyFrameId frame="0" value="0:300"/></KeyedProperty></KeyedObject></LinearAnimation>
<LinearAnimation name="Still mesh" id="0:10" duration="1">${[101,102,103].map(id=>animation(id,15,[[0,0]])).join('')}${animation(104,17,[[0,1]])}</LinearAnimation>
</Artboard>
<ViewModel name="NimboModel" id="0:40" defaultInstanceId="0:41">
<ViewModelPropertyNumber name="state" id="0:45"/><ViewModelPropertyBoolean name="reducedMotion" id="0:46"/><ViewModelPropertyTrigger name="tap" id="0:47"/>
<ViewModelInstance name="Default" exports="true" id="0:41"><ViewModelInstanceNumber viewModelPropertyId="0:45" propertyValue="0"/><ViewModelInstanceBoolean viewModelPropertyId="0:46" propertyValue="false"/><ViewModelInstanceTrigger viewModelPropertyId="0:47"/></ViewModelInstance>
</ViewModel>
${assets}
</Rive>`;
fs.writeFileSync(path.join(root,'scene.rml'),text+'\n');
