'use client'
import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'

type Product={id:number;name:string;description:string;price:number;image_url:string|null;stock:number;category_id:number|null}
export default function Home(){
 const [products,setProducts]=useState<Product[]>([]); const [q,setQ]=useState('')
 useEffect(()=>{supabase.from('products').select('*').eq('is_active',true).order('created_at',{ascending:false}).then(({data})=>setProducts(data||[]))},[])
 const filtered=products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase()))
 return <><nav className="nav"><b>JualBeli Online</b><a href="/admin/login">Admin</a></nav><main className="container"><h1>Produk</h1><input className="input" placeholder="Cari produk..." value={q} onChange={e=>setQ(e.target.value)}/><div className="grid">{filtered.map(p=><article className="card" key={p.id}>{p.image_url?<img src={p.image_url} alt={p.name}/>:<div style={{height:180,display:'grid',placeItems:'center'}}>Tanpa foto</div>}<div className="pad"><h3>{p.name}</h3><div className="price">Rp {Number(p.price).toLocaleString('id-ID')}</div><p className="muted">{p.description}</p><small>Stok: {p.stock}</small></div></article>)}</div>{!filtered.length&&<p className="muted">Belum ada produk.</p>}</main></>
}
