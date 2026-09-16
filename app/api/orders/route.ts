import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
type ItemInput={product_id:number;quantity:number}

export async function POST(request:Request){
 try{
  const body=await request.json(); const customer_name=String(body.customer_name||'').trim(); const customer_phone=String(body.customer_phone||'').trim(); const customer_address=String(body.customer_address||'').trim(); const notes=String(body.notes||'').trim(); const items=Array.isArray(body.items)?body.items as ItemInput[]:[]
  if(!customer_name||!customer_phone||!customer_address||items.length===0)return NextResponse.json({error:'Data pelanggan dan minimal satu produk wajib diisi.'},{status:400})
  const normalized=items.map(i=>({product_id:Number(i.product_id),quantity:Math.floor(Number(i.quantity))})); if(normalized.some(i=>!Number.isInteger(i.product_id)||i.product_id<=0||i.quantity<=0))return NextResponse.json({error:'Data produk tidak valid.'},{status:400})
  const quantities=new Map<number,number>(); for(const item of normalized)quantities.set(item.product_id,(quantities.get(item.product_id)||0)+item.quantity)
  const ids=[...quantities.keys()]; const {data:products,error:productError}=await admin.from('products').select('id,name,price,stock,is_active').in('id',ids); if(productError)throw productError
  if(!products||products.length!==ids.length)return NextResponse.json({error:'Ada produk yang sudah tidak tersedia.'},{status:400})
  const map=new Map(products.map(p=>[p.id,p])); let total=0
  for(const [id,qty] of quantities){const p=map.get(id)!;if(!p.is_active)return NextResponse.json({error:`Produk ${p.name} sudah tidak aktif.`},{status:400});if(p.stock<qty)return NextResponse.json({error:`Stok ${p.name} tidak mencukupi.`},{status:400});total+=Number(p.price)*qty}
  const {data:order,error:orderError}=await admin.from('orders').insert({customer_name,customer_phone,customer_address,total,notes,status:'pending'}).select('id,total,status').single(); if(orderError)throw orderError
  const orderItems=[...quantities.entries()].map(([id,qty])=>{const p=map.get(id)!;return {order_id:order.id,product_id:p.id,product_name:p.name,price:p.price,quantity:qty}})
  const {error:itemError}=await admin.from('order_items').insert(orderItems); if(itemError){await admin.from('orders').delete().eq('id',order.id);throw itemError}
  for(const [id,qty] of quantities){const p=map.get(id)!;const {error:stockError}=await admin.from('products').update({stock:p.stock-qty}).eq('id',id);if(stockError)throw stockError}
  return NextResponse.json({order},{status:201})
 }catch(error){console.error(error);return NextResponse.json({error:'Pesanan gagal diproses.'},{status:500})}
}
