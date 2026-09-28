import {put,all} from "./storage.js";

const APP_ID_BASE="org.planetaryrestorationarchive.texas-learning-capacity.v4";
export const TRYSTERO_VERSION="0.25.3";
const STRATEGY_URLS={
  nostr:`https://esm.run/trystero@${TRYSTERO_VERSION}`,
  mqtt:`https://esm.run/@trystero-p2p/mqtt@${TRYSTERO_VERSION}`,
  torrent:`https://esm.run/@trystero-p2p/torrent@${TRYSTERO_VERSION}`,
  ipfs:`https://esm.run/@trystero-p2p/ipfs@${TRYSTERO_VERSION}`
};
function uuid(){return crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`}
function stamp(x){return Date.parse(x?.updated||x?.created||x?.ts||0)||0}
function deploymentId(){const base=location.pathname.replace(/\/[^/]*$/,'/');return `${APP_ID_BASE}:${location.host||'local'}:${base}`}
function mergeLww(local=[],incoming=[]){const map=new Map(local.map(x=>[x.id,x]));for(const x of incoming||[]){if(!x?.id)continue;const prev=map.get(x.id);if(!prev||stamp(x)>=stamp(prev))map.set(x.id,x)}return[...map.values()]}
function mergeLog(local=[],incoming=[]){const map=new Map(local.map(x=>[x.id,x]));for(const x of incoming||[])if(x?.id&&!map.has(x.id))map.set(x.id,x);return[...map.values()].sort((a,b)=>stamp(a)-stamp(b)).slice(-750)}

export class CollaborationClient extends EventTarget{
  constructor(){super();this.roomId=null;this.person=null;this.networkRoom=null;this.peerId=null;this.peerConnected=false;this.libraryReady=false;this.participants=[];this.items=[];this.log=[];this.actions={};this.channel=null;this.strategy='nostr';this.passwordProtected=false;this.lastSnapshot=null;this.networkError=''}
  get room(){return this.roomId}get visibleItems(){return this.items.filter(x=>!x.deleted)}get peerCount(){try{return Object.keys(this.networkRoom?.getPeers?.()||{}).length}catch{return 0}}
  async join({room,name,role,domain,supervised,strategy='nostr',password=''}){
    if(!room||!name)throw new Error('Room and display name are required.');
    if(!supervised)throw new Error('Confirm adult/approved-organization participation before joining.');
    this.leave();this.strategy=STRATEGY_URLS[strategy]?strategy:'nostr';this.passwordProtected=!!String(password).trim();
    this.roomId=String(room).trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,48);
    this.person={id:uuid(),name:String(name).trim().slice(0,60),role:String(role).slice(0,80),domain:String(domain).slice(0,80)};
    await this.#loadLocal();this.#startBroadcastChannel();this.#broadcastLocal({type:'presence',person:this.person,reply:false});this.#broadcastLocal({type:'state',items:this.items,log:this.log});
    let mod;try{mod=await import(STRATEGY_URLS[this.strategy]);this.libraryReady=true}catch(e){this.libraryReady=false;this.networkError='Trystero could not load; same-device collaboration remains active.';this.#emit('connection');this.#emit('state');return{network:false,error:e}}
    const {joinRoom,selfId}=mod;this.peerId=selfId;
    const cfg={appId:deploymentId()};if(this.passwordProtected)cfg.password=String(password);this.networkRoom=joinRoom(cfg,this.roomId,{onJoinError:d=>{this.networkError=d?.error?.message||String(d?.error||'Peer connection failed; TURN may be required on this network.');this.#emit('connection')}});
    this.#wireActions();
    this.networkRoom.onPeerJoin=async peerId=>{
      this.peerConnected=true;this.actions.presence.send(this.person,{target:peerId}).catch(()=>{});
      try{const snap=await this.actions.snapshot.request({want:'room-state',knownAt:this.lastSnapshot},{target:peerId,timeoutMs:4500});this.#acceptSnapshot(snap,peerId)}catch{this.actions.state.send(this.#snapshot(),{target:peerId}).catch(()=>{})}
      this.#emit('connection');
    };
    this.networkRoom.onPeerLeave=peerId=>{this.participants=this.participants.filter(x=>x.peerId!==peerId);this.peerConnected=this.peerCount>0;this.#emit('state');this.#emit('connection')};
    for(const peerId of Object.keys(this.networkRoom?.getPeers?.()||{})){this.peerConnected=true;this.actions.presence.send(this.person,{target:peerId}).catch(()=>{});try{const snap=await this.actions.snapshot.request({want:'room-state'},{target:peerId,timeoutMs:3500});this.#acceptSnapshot(snap,peerId)}catch{}}
    this.#emit('connection');this.#emit('state');return{network:true};
  }
  #snapshot(){return{items:this.items,log:this.log,updated:new Date().toISOString(),sender:this.person}}
  #acceptSnapshot(data,peerId){if(!data)return;this.items=mergeLww(this.items,data.items||[]);this.log=mergeLog(this.log,data.log||[]);this.lastSnapshot=new Date().toISOString();this.#persist();this.#emit('state')}
  async #loadLocal(){const rooms=await all('roomcache');const c=rooms.find(x=>x.id===`room:${this.roomId}`);this.items=c?.items||[];this.log=c?.log||[];this.lastSnapshot=c?.updated||null}
  async #persist(){if(!this.roomId)return;await put('roomcache',{id:`room:${this.roomId}`,room:this.roomId,items:this.items,log:this.log.slice(-750),updated:new Date().toISOString()})}
  #startBroadcastChannel(){if(!('BroadcastChannel'in window))return;this.channel?.close();this.channel=new BroadcastChannel(`txlo:${this.roomId}`);this.channel.onmessage=e=>{const m=e.data;if(!m||m.sender===this.person?.id)return;this.#applyLocalMessage(m)}}
  #wireActions(){
    this.actions.presence=this.networkRoom.makeAction('presence-v4');
    this.actions.state=this.networkRoom.makeAction('state-v4');
    this.actions.item=this.networkRoom.makeAction('item-v4');
    this.actions.feed=this.networkRoom.makeAction('feed-v4');
    this.actions.snapshot=this.networkRoom.makeAction('snapshot-v4',{kind:'request',onRequest:()=>this.#snapshot()});
    this.actions.presence.onMessage=(person,{peerId})=>{if(!person?.id)return;this.participants=this.participants.filter(x=>x.peerId!==peerId&&x.id!==person.id);this.participants.push({...person,peerId});this.#emit('state')};
    this.actions.state.onMessage=(data,{peerId})=>this.#acceptSnapshot(data,peerId);
    this.actions.item.onMessage=item=>this.#acceptItem(item,false,true);
    this.actions.feed.onMessage=entry=>this.#acceptFeed(entry,false,true);
  }
  #broadcastLocal(msg){this.channel?.postMessage({...msg,sender:this.person?.id,room:this.roomId})}
  #applyLocalMessage(m){if(m.room!==this.roomId)return;if(m.type==='item')this.#acceptItem(m.item,false,false);if(m.type==='feed')this.#acceptFeed(m.entry,false,false);if(m.type==='presence'&&m.person){this.participants=this.participants.filter(x=>x.id!==m.person.id);this.participants.push({...m.person,peerId:'local-tab'});this.#emit('state');if(!m.reply)this.#broadcastLocal({type:'presence',person:this.person,reply:true})}if(m.type==='state')this.#acceptSnapshot(m,'local-tab')}
  #acceptItem(item,network=true,local=true){if(!item?.id)return;this.items=mergeLww(this.items,[item]);this.#persist();this.#emit('state');if(network&&this.actions.item)this.actions.item.send(item).catch(()=>{});if(local)this.#broadcastLocal({type:'item',item})}
  #acceptFeed(entry,network=true,local=true){if(!entry?.id)return;this.log=mergeLog(this.log,[entry]);this.#persist();this.#emit('state');if(network&&this.actions.feed)this.actions.feed.send(entry).catch(()=>{});if(local)this.#broadcastLocal({type:'feed',entry})}
  createItem(data){if(!this.roomId)throw new Error('Join a room first.');const now=new Date().toISOString(),item={id:uuid(),room:this.roomId,created:now,updated:now,createdBy:this.person,...data};this.#acceptItem(item,true,true);return item}
  updateItem(id,patch){const old=this.items.find(x=>x.id===id);if(!old)return;this.#acceptItem({...old,...patch,updated:new Date().toISOString(),updatedBy:this.person},true,true)}
  deleteItem(id){this.updateItem(id,{deleted:true,deletedAt:new Date().toISOString()})}
  post(text,kind='note',domain='Education'){if(!this.roomId)throw new Error('Join a room first.');const entry={id:uuid(),text:String(text).slice(0,6000),kind,domain,person:this.person,ts:new Date().toISOString()};this.#acceptFeed(entry,true,true);return entry}
  shareState(){const s=this.#snapshot();this.#broadcastLocal({type:'state',...s});this.actions.state?.send(s).catch(()=>{})}
  #emit(type){this.dispatchEvent(new CustomEvent(type,{detail:this}))}
  leave(){try{this.networkRoom?.leave()}catch{}try{this.channel?.close()}catch{}this.networkRoom=null;this.channel=null;this.peerConnected=false;this.libraryReady=false;this.participants=[];this.actions={};this.roomId=null;this.person=null;this.peerId=null;this.networkError='';this.#emit('connection')}
}
