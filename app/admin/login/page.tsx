'use client'
import {FormEvent,useState} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '../../../lib/supabase'
export default function Login(){
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const router=useRouter()
 async function submit(e:FormEvent){e.preventDefault();setError('');const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);else router.push('/admin')}
 return <main className="container"><div className="panel" style={{maxWidth:420,margin:'60px auto'}}><h1>Login Admin</h1><form onSubmit={submit}><label>Email</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/><label>Password</label><input className="input" type="password" required value={password} onChange={e=>setPassword(e.target.value)}/>{error&&<p style={{color:'crimson'}}>{error}</p>}<button className="btn">Masuk</button></form></div></main>
}
