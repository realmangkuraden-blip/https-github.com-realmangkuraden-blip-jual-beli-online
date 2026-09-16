'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type Product = { id: number; name: string; description: string; price: number; image_url: string | null; stock: number; category_id: number | null }
type CartItem = Product & { quantity: number }

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [q, setQ] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [openCheckout, setOpenCheckout] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_address: '', notes: '' })

  useEffect(() => {
    supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).then(({ data }) => setProducts(data || []))
  }, [])

  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [cart])

  function addToCart(product: Product) {
    setMessage('')
    setCart(current => {
      const existing = current.find(item => item.id === product.id)
      if (existing) return current.map(item => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item)
      return [...current, { ...product, quantity: 1 }]
    })
  }

  function changeQuantity(id: number, quantity: number) {
    setCart(current => current.flatMap(item => item.id === id ? (quantity > 0 ? [{ ...item, quantity: Math.min(quantity, item.stock) }] : []) : [item]))
  }

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Pesanan gagal.')
      setMessage(`Pesanan #${data.order.id} berhasil dibuat. Total Rp ${Number(data.order.total).toLocaleString('id-ID')}.`)
      setCart([])
      setForm({ customer_name: '', customer_phone: '', customer_address: '', notes: '' })
      setOpenCheckout(false)
      const { data: refreshed } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
      setProducts(refreshed || [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Pesanan gagal.')
    } finally {
      setSubmitting(false)
    }
  }

  return <>
    <nav className="nav"><b>JualBeli Online</b><span className="row"><button className="btn" onClick={() => setOpenCheckout(true)}>Keranjang ({cart.reduce((n, item) => n + item.quantity, 0)})</button><a href="/admin/login">Admin</a></span></nav>
    <main className="container">
      <h1>Produk</h1>
      <input className="input" placeholder="Cari produk..." value={q} onChange={e => setQ(e.target.value)} />
      {message && <div className="panel">{message}</div>}
      <div className="grid">
        {filtered.map(p => <article className="card" key={p.id}>
          {p.image_url ? <img src={p.image_url} alt={p.name} /> : <div style={{ height: 180, display: 'grid', placeItems: 'center' }}>Tanpa foto</div>}
          <div className="pad"><h3>{p.name}</h3><div className="price">Rp {Number(p.price).toLocaleString('id-ID')}</div><p className="muted">{p.description}</p><small>Stok: {p.stock}</small><br /><button className="btn" style={{ marginTop: 10 }} disabled={p.stock <= 0} onClick={() => addToCart(p)}>{p.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}</button></div>
        </article>)}
      </div>
      {!filtered.length && <p className="muted">Belum ada produk.</p>}
    </main>

    {openCheckout && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <div className="panel" style={{ width: 'min(620px, 100%)', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}><h2>Checkout</h2><button className="btn secondary" onClick={() => setOpenCheckout(false)}>Tutup</button></div>
        {cart.length === 0 ? <p className="muted">Keranjang masih kosong.</p> : <>
          {cart.map(item => <div key={item.id} className="row" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}><span>{item.name} · Rp {Number(item.price).toLocaleString('id-ID')}</span><span><button className="btn secondary" onClick={() => changeQuantity(item.id, item.quantity - 1)}>-</button> {item.quantity} <button className="btn secondary" onClick={() => changeQuantity(item.id, item.quantity + 1)}>+</button></span></div>)}
          <h3>Total: Rp {total.toLocaleString('id-ID')}</h3>
          <form onSubmit={submitOrder}><input className="input" required placeholder="Nama" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} /><input className="input" required placeholder="No. WhatsApp / Telepon" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} /><textarea className="input" required rows={3} placeholder="Alamat pengiriman" value={form.customer_address} onChange={e => setForm({ ...form, customer_address: e.target.value })} /><textarea className="input" rows={2} placeholder="Catatan (opsional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /><button className="btn" disabled={submitting}>{submitting ? 'Memproses...' : 'Buat Pesanan'}</button></form>
        </>}
      </div>
    </div>}
  </>
}
