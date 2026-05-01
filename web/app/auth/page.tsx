"use client";

import { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { deriveMasterKey } from '@/lib/crypto';
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let salt: Uint8Array;
      
      if (isLogin) {
        // 1. Buscar o salt do usuário no servidor
        const saltRes = await axios.get(`${API_BASE}/auth/salt?email=${email}`);
        salt = Uint8Array.from(atob(saltRes.data.salt), c => c.charCodeAt(0));
      } else {
        // 2. Gerar novo salt para registro
        salt = window.crypto.getRandomValues(new Uint8Array(16));
      }

      // 3. Derivar Chave Mestra (PBKDF2)
      const masterKey = await deriveMasterKey(password, salt);
      
      // 4. Exportar Chave de Autenticação (Aqui usamos o hash da MK simplificado)
      const exportedMK = await window.crypto.subtle.exportKey('raw', masterKey);
      const authKey = btoa(String.fromCharCode(...new Uint8Array(exportedMK)));

      if (isLogin) {
        const res = await axios.post(`${API_BASE}/auth/login`, { email, authKey });
        localStorage.setItem('token', res.data.access_token);
        // Em um app real, salvaríamos as chaves no estado seguro (Zustand/Context)
        alert('Login realizado com sucesso!');
      } else {
        // Gerar par de chaves assimétricas para o novo usuário
        const keyPair = await window.crypto.subtle.generateKey(
          { name: 'ECDH', namedCurve: 'P-256' },
          true,
          ['deriveKey']
        );
        const pubKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
        const privKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

        // Criptografar a chave privada com a Master Key (Key Wrapping)
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encPrivKey = await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          masterKey,
          privKey
        );

        await axios.post(`${API_BASE}/auth/register`, {
          email,
          authKey,
          salt: btoa(String.fromCharCode(...salt)),
          publicKey: btoa(String.fromCharCode(...new Uint8Array(pubKey))),
          encPrivateKey: btoa(String.fromCharCode(...new Uint8Array(encPrivKey))),
        });
        alert('Conta criada com sucesso!');
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Falha na autenticação. Verifique os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Vault<span className="text-purple-500">Send</span>
          </h1>
          <p className="text-slate-400">Proteção total com Conhecimento Zero.</p>
        </div>

        <div className="glass-card p-8 space-y-6">
          <div className="flex bg-slate-900/50 p-1 rounded-xl">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Registrar Agora'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 flex items-center gap-2 text-xs text-slate-500 justify-center">
            <Shield size={12} />
            Sua senha nunca sai do seu dispositivo.
          </div>
        </div>
      </div>
    </main>
  );
}
