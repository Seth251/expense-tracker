/* Khmer-aware offline PDF export. Renders system-font text to canvas and embeds each page as JPEG.
   No downloadable font files, network libraries, or server are required. */
(function () {
 'use strict';
 const FONT='"Noto Sans Khmer","Khmer OS Battambang","Khmer Sangam MN","Leelawadee UI",system-ui,sans-serif';
 const enc=new TextEncoder();
 const bytes=s=>enc.encode(s);
 const pretty=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n);
 function pdfFromJpegs(images,width,height){
  const objects=[null];
  const add=parts=>{objects.push(parts);return objects.length-1;};
  const catalog=add([]),pagesRoot=add([]);
  const pageIds=[];
  for(let i=0;i<images.length;i++){
   const jpg=images[i];
   const imageId=add([bytes('<< /Type /XObject /Subtype /Image /Width '+(width*2)+' /Height '+(height*2)+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n'),jpg,bytes('\nendstream')]);
   const instructions='q '+width+' 0 0 '+height+' 0 0 cm /Picture Do Q\n';
   const contentId=add([bytes('<< /Length '+bytes(instructions).length+' >>\nstream\n'+instructions+'endstream')]);
   const pageId=add([bytes('<< /Type /Page /Parent '+pagesRoot+' 0 R /MediaBox [0 0 '+width+' '+height+'] /Resources << /XObject << /Picture '+imageId+' 0 R >> >> /Contents '+contentId+' 0 R >>')]);
   pageIds.push(pageId);
  }
  objects[catalog]=[bytes('<< /Type /Catalog /Pages '+pagesRoot+' 0 R >>')];
  objects[pagesRoot]=[bytes('<< /Type /Pages /Count '+pageIds.length+' /Kids ['+pageIds.map(id=>id+' 0 R').join(' ')+'] >>')];
  const chunks=[bytes('%PDF-1.4\n%Khmer report created locally\n')];
  let offset=chunks[0].length;const offsets=[0];
  const push=chunk=>{chunks.push(chunk);offset+=chunk.length;};
  for(let i=1;i<objects.length;i++){
   offsets.push(offset);
   push(bytes(i+' 0 obj\n'));
   for(const part of objects[i])push(part);
   push(bytes('\nendobj\n'));
  }
  const xref=offset;
  push(bytes('xref\n0 '+objects.length+'\n0000000000 65535 f \n'));
  for(let i=1;i<offsets.length;i++)push(bytes(String(offsets[i]).padStart(10,'0')+' 00000 n \n'));
  push(bytes('trailer\n<< /Size '+objects.length+' /Root '+catalog+' 0 R >>\nstartxref\n'+xref+'\n%%EOF'));
  return new Blob(chunks,{type:'application/pdf'});
 }
 function createExporter(data){
  const lang=data.language==='en'?'en':'km';
  const labels={
   en:{
    continued:'Expense Report (continued)',defaultTitle:'Expense Report',allDates:'All dates',
    footer:'Pocketwise · Report generated on your device',page:'Page',
    summary:'Balances & summary',first:'FIRST BALANCE',expenses:'EXPENSES IN REPORT',
    remaining:'REMAINING BALANCE',unset:'Not set',unavailable:'Not available',
    budget:'Budget: ',moneyDate:' · Money received: ',income:'Income in period: ',
    unnamed:'Unnamed item',other:'Other',category:'Category: ',payment:'Payment: ',
    unspecified:'Not specified',notes:'Notes: ',tags:'Tags: ',
    budgetPerformance:'Budget performance',left:'Remaining: ',goals:'Savings goals',
    categories:'Expenses by category',transactionList:'Transaction details',
    itemList:'All purchases & expenses',noItems:'No entries in the selected period.',
    listTotal:'Total expenses in list: '
   },
   km:{
    continued:'របាយការណ៍ចំណាយ (បន្ត)',defaultTitle:'របាយការណ៍ចំណាយ',allDates:'គ្រប់កាលបរិច្ឆេទ',
    footer:'Pocketwise · របាយការណ៍បង្កើតលើឧបករណ៍',page:'ទំព័រ',
    summary:'សមតុល្យ និងសេចក្តីសង្ខេប',first:'សមតុល្យដើម',expenses:'ចំណាយក្នុងរបាយការណ៍',
    remaining:'សមតុល្យនៅសល់',unset:'មិនទាន់កំណត់',unavailable:'មិនមានទិន្នន័យ',
    budget:'ថវិកា៖ ',moneyDate:' · ថ្ងៃទទួលប្រាក់៖ ',income:'ចំណូលក្នុងរយៈពេល៖ ',
    unnamed:'មិនមានឈ្មោះទំនិញ',other:'ផ្សេងៗ',category:'ប្រភេទ៖ ',payment:'ទូទាត់តាម៖ ',
    unspecified:'មិនបានបញ្ជាក់',notes:'កំណត់ចំណាំ៖ ',tags:'ស្លាក៖ ',
    budgetPerformance:'លទ្ធផលថវិកា',left:'ប្រាក់នៅសល់៖ ',goals:'គោលដៅសន្សំប្រាក់',
    categories:'ចំណាយតាមប្រភេទ',transactionList:'ព័ត៌មានលម្អិតប្រតិបត្តិការ',
    itemList:'បញ្ជីទំនិញ និងចំណាយទាំងអស់',noItems:'មិនមានប្រតិបត្តិការក្នុងរយៈពេលដែលបានជ្រើសទេ។',
    listTotal:'ចំណាយសរុបក្នុងបញ្ជី៖ '
   }
  }[lang];
  if(!document.createElement('canvas').getContext)throw Error('Canvas not supported by this browser');
  const landscape=!!data.landscape,W=landscape?842:595,H=landscape?595:842;
  const margin=34,bottom=50,width=W-margin*2;
  let canvas,ctx,y,pageCount=0;
  const imagePages=[];
  function font(size=10,bold=false){ctx.font=(bold?'700 ':'400 ')+size+'px '+FONT;}
  function ink(color='#203344'){ctx.fillStyle=color;}
  function text(value,x,baseline,size=10,bold=false,color='#203344',align='left'){
   font(size,bold);ink(color);ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(String(value??''),x,baseline);ctx.textAlign='left';
  }
  function breakSegments(value){
   const s=String(value??'').replace(/[\t\r\n]+/g,' ').trim();
   if(!s)return [];
   if(typeof Intl.Segmenter==='function'){
    return Array.from(new Intl.Segmenter('km',{granularity:'word'}).segment(s),o=>o.segment);
   }
   return s.split(/(\s+)/u).filter(Boolean);
  }
  function splitLong(piece,maxWidth){
   if(ctx.measureText(piece).width<=maxWidth)return [piece];
   const units=typeof Intl.Segmenter==='function'?Array.from(new Intl.Segmenter('km',{granularity:'grapheme'}).segment(piece),a=>a.segment):Array.from(piece);
   const result=[];let current='';
   for(const unit of units){
    if(current&&ctx.measureText(current+unit).width>maxWidth){result.push(current);current=unit;}
    else current+=unit;
   }
   if(current)result.push(current);
   return result;
  }
  function wrap(value,maxWidth,size=10,bold=false){
   font(size,bold);
   const pieces=breakSegments(value);
   const lines=[];let current='';
   for(const piece of pieces){
    for(const part of splitLong(piece,maxWidth)){
     if(current&&ctx.measureText(current+part).width>maxWidth){
      lines.push(current.trimEnd());current=part.trimStart();
     }else current+=part;
    }
   }
   if(current.trim())lines.push(current.trimEnd());
   return lines.length?lines:[''];
  }
  function stroke(yPos){ctx.strokeStyle='#dce4e8';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(margin,yPos);ctx.lineTo(W-margin,yPos);ctx.stroke();}
  function header(continued){
   ctx.fillStyle='#128362';ctx.fillRect(0,0,W,7);
   text(data.brand||'Pocketwise',margin,30,12,true,'#147655');
   if(continued){
    text(labels.continued,margin,56,13,true);
    y=77;
   }else{
    const ttl=wrap(data.title||labels.defaultTitle,width,16,true);
    y=57;ttl.slice(0,4).forEach(line=>{text(line,margin,y,16,true);y+=22;});
    const dateLines=wrap((data.range||labels.allDates)+' · '+(data.currency||'USD'),width,9);
    dateLines.forEach(line=>{text(line,margin,y,9,false,'#627789');y+=14;});
    y+=8;
   }
  }
  function finish(){
   text(labels.footer,margin,H-19,8,false,'#627789');
   text(labels.page+' '+pageCount,W-margin,H-19,9,false,'#627789','right');
   const base64=canvas.toDataURL('image/jpeg',0.88).split(',')[1];
   if(!base64)throw Error('Could not encode the PDF page');
   const binary=atob(base64),raw=new Uint8Array(binary.length);
   for(let i=0;i<binary.length;i++)raw[i]=binary.charCodeAt(i);
   imagePages.push(raw);
   ctx=null;canvas=null;
  }
  function newPage(continued=false){
   canvas=document.createElement('canvas');
   canvas.width=W*2;canvas.height=H*2;
   ctx=canvas.getContext('2d',{alpha:false});
   if(!ctx)throw Error('Canvas drawing unavailable');
   ctx.scale(2,2);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);
   pageCount++;
   header(continued);
  }
  function reserve(minHeight){
   if(y+minHeight>H-bottom){
    finish();newPage(true);
   }
  }
  function paragraph(value,{size=10,bold=false,color='#203344',indent=0,lineHeight=17,gap=5}={}){
   const maxWidth=width-indent;
   for(const line of wrap(value,maxWidth,size,bold)){
    reserve(lineHeight+3);
    text(line,margin+indent,y+size,size,bold,color);
    y+=lineHeight;
   }
   y+=gap;
  }
  function heading(label){
   reserve(36);y+=5;stroke(y);y+=20;paragraph(label,{size:12,bold:true,color:'#147655',lineHeight:18,gap:4});
  }
  function summary(){
   reserve(118);
   heading(labels.summary);
   const cards=[
    [labels.first,data.firstBalance||labels.unset],
    [labels.expenses,data.expenses||'0'],
    [labels.remaining,data.remainingBalance||labels.unavailable]
   ];
   const gap=7,cw=(width-gap*2)/3,cardY=y;
   cards.forEach(([label,value],i)=>{
    const x=margin+i*(cw+gap);
    ctx.fillStyle=i===2?'#ebf7f0':'#f4f8f6';
    ctx.fillRect(x,cardY,cw,65);
    text(label,x+8,cardY+17,9,true,'#536c63');
    const lines=wrap(value,cw-16,11,true);
    for(let j=0;j<Math.min(2,lines.length);j++)text(lines[j],x+8,cardY+38+j*14,11,true,i===2?'#0b805b':'#203344');
   });
   y+=76;
   if(data.budgetName)paragraph(labels.budget+data.budgetName+(data.budgetDate?labels.moneyDate+data.budgetDate:''),{size:9,color:'#526d77',lineHeight:16});
   if(data.income)paragraph(labels.income+data.income,{size:9,color:'#526d77'});
  }
  function drawItem(item,index){
   reserve(82);
   y+=6;stroke(y);y+=16;
   const right=margin+width;
   const price=String(item.price||'');
   const date=String(item.date||'');
   text(String(index+1)+'. '+date,margin,y,9,true,'#627789');
   text(price,right,y,10,true,item.type==='income'?'#178665':'#c24f59','right');
   y+=12;
   paragraph(item.name||labels.unnamed,{size:11,bold:true,lineHeight:18,gap:0});
   const info=[labels.category+(item.category||labels.other),labels.payment+(item.method||labels.unspecified)];
   for(const detail of info)paragraph(detail,{size:9,color:'#516477',lineHeight:15,gap:0});
   if(item.notes)paragraph(labels.notes+item.notes,{size:9,color:'#516477',lineHeight:15,gap:0});
   if(item.tags)paragraph(labels.tags+item.tags,{size:9,color:'#516477',lineHeight:15,gap:0});
   y+=6;
  }
  function budgetSections(){
   if(data.mode==='budget'&&Array.isArray(data.budgets)&&data.budgets.length){
    heading(labels.budgetPerformance);
    for(const b of data.budgets){
     reserve(48);paragraph(b.name+' · '+b.spent+' / '+b.limit,{size:10,bold:true,gap:1});
     paragraph(labels.left+b.remaining,{size:9,color:'#627789',gap:2});
    }
   }
   if(data.mode==='savings'&&Array.isArray(data.goals)&&data.goals.length){
    heading(labels.goals);
    for(const g of data.goals){
     reserve(48);paragraph(g.name+' · '+g.saved+' / '+g.target,{size:10,bold:true,gap:1});
    }
   }
  }
  function categoryBreakdown(){
   if(!data.includeCategories||!data.categories?.length)return;
   heading(labels.categories);
   for(const cat of data.categories){
    reserve(26);
    text(cat.name,margin,y+10,9);
    text(cat.total,W-margin,y+10,9,true,'#127c58','right');
    y+=23;
   }
  }
  newPage();
  summary();
  budgetSections();
  categoryBreakdown();
  heading(data.mode==='finance'?labels.transactionList:labels.itemList);
  if(!data.items?.length)paragraph(labels.noItems);
  else data.items.forEach(drawItem);
  reserve(65);stroke(y+3);y+=22;
  paragraph(labels.listTotal+(data.itemListTotal||data.expenses||'0'),{bold:true,size:12,color:'#11734f'});
  finish();
  return pdfFromJpegs(imagePages,W,H);
 }
 async function download(data){
  // Use the same font stack used for the visible Khmer UI. Canvas rasterization preserves
  // shaping in downloaded PDFs even when the legacy PDF/Helvetica encoder cannot.
  if(document.fonts?.ready)await document.fonts.ready;
  const pdf=createExporter(data);
  return pdf;
 }
 window.PocketwiseKhmerPDF={download};
})();